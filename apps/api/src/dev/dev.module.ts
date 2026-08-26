import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DevAccountMiddleware } from './dev-account.middleware';

@Module({ providers: [DevAccountMiddleware] })
export class DevModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(DevAccountMiddleware).forRoutes('*');
  }
}
