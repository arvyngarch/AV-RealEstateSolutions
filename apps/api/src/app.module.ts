import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountController } from './accounts/account.controller';
import { AccountService } from './accounts/account.service';
import { Auth0EnabledGuard } from './auth/auth0-enabled.guard';
import { RequireMfaGuard } from './auth/require-mfa.guard';
import { DevModule } from './dev/dev.module';
import { HealthController } from './health.controller';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
    DevModule,
  ],
  controllers: [HealthController, AccountController],
  providers: [PrismaService, AccountService, Auth0EnabledGuard, RequireMfaGuard],
})
export class AppModule {}
