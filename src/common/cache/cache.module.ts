import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [
    NestCacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutes
      max: 1000,   // maximum number of items in cache
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}