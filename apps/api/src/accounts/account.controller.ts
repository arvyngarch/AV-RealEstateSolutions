import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { actorFrom } from '../auth/actor';
import { Auth0EnabledGuard } from '../auth/auth0-enabled.guard';
import { RequireMfaGuard } from '../auth/require-mfa.guard';
import { AccountService } from './account.service';
import { CreateAccountDto } from './create-account.dto';

@Controller('accounts')
@UseGuards(Auth0EnabledGuard, RequireMfaGuard)
export class AccountController {
  constructor(private readonly accounts: AccountService) {}
  @Post('provision')
  provision(@Req() request: Request, @Body() body: CreateAccountDto) {
    const actor = actorFrom(request);
    return this.accounts.provision({ subject: actor.subject, email: actor.email, emailVerified: actor.emailVerified }, body.role);
  }
}
