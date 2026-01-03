import Image from 'next/image';
import { ComponentProps } from 'react';

interface OptimizedImageProps extends Omit<ComponentProps<typeof Image>, 'style'> {
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  maintainAspectRatio?: boolean;
}

export function OptimizedImage({ 
  maintainAspectRatio = true, 
  priority = false,
  loading = 'lazy',
  className,
  ...props 
}: OptimizedImageProps) {
  const style = maintainAspectRatio ? { width: 'auto', height: 'auto' } : undefined;
  
  return (
    <Image
      {...props}
      className={className}
      style={style}
      priority={priority}
      loading={priority ? 'eager' : loading}
    />
  );
}