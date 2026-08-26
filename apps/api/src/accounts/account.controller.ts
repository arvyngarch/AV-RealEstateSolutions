import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { Auth0EnabledGuard } from '../auth/auth0-enabled.guard';
import { RequireMfaGuard } from '../auth/require-mfa.guard';
import { AccountService } from './account.service';
import { CreateAccountDto } from './create-account.dto';

@Controller('accounts')
@UseGuards(Auth0EnabledGuard, RequireMfaGuard)
export class AccountController {
  constructor(private readonly accounts: AccountService) {}

  @Post('provision')
  provision(@Req() request: AuthenticatedRequest, @Body() body: CreateAccountDto) {
    const claims = request.auth!.payload!;
    return this.accounts.provision(
      {
        subject: claims.sub!,
        email: claims.email!,
        emailVerified: claims.email_verified === true,
      },
      body.role,
    );
  }
}
