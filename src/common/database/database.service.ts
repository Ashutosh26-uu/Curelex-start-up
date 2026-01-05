import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private encryptionKey: Buffer;

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'pretty',
    });

    this.encryptionKey = Buffer.from(
      configService.get<string>('ENCRYPTION_KEY') || crypto.randomBytes(32).toString('hex'),
      'hex'
    );
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully');
      
      // Test connection health
      await this.healthCheck();
    } catch (error) {
      this.logger.error('Failed to connect to database:', error.message);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Database disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error.message);
    }
  }

  encryptSensitiveData(data: string): string {
    if (!data) return null;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  decryptSensitiveData(encryptedData: string): string {
    if (!encryptedData) return null;
    try {
      const [ivHex, encrypted] = encryptedData.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipher('aes-256-gcm', this.encryptionKey);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed:', error);
      throw new Error('Failed to decrypt sensitive data');
    }
  }
}
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error.message);
      return false;
    }
  }

  async safeTransaction<T>(fn: (tx: any) => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.$transaction(async (tx) => {
          try {
            return await fn(tx);
          } catch (error) {
            this.logger.error(`Transaction error (attempt ${attempt}):`, error.message);
            throw error;
          }
        }, {
          maxWait: 5000,
          timeout: 10000,
          isolationLevel: 'ReadCommitted',
        });
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          this.logger.error(`Transaction failed after ${maxRetries} attempts:`, error.message);
          throw error;
        }
        
        // Exponential backoff retry
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        this.logger.warn(`Retrying transaction (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms`);
      }
    }
    
    throw lastError;
  }

  async getConnectionInfo() {
    try {
      const result = await this.$queryRaw`
        SELECT 
          current_database() as database_name,
          current_user as current_user,
          version() as version
      `;
      return result;
    } catch (error) {
      this.logger.error('Failed to get connection info:', error.message);
      throw error;
    }
  }