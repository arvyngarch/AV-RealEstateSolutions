import { ConflictException, Injectable } from '@nestjs/common';
import { ParticipantRole, VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';

export interface Auth0Identity {
  subject: string;
  email: string;
  emailVerified: boolean;
}

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async provision(identity: Auth0Identity, role: 'BUYER' | 'SELLER') {
    const existingBySubject = await this.prisma.account.findUnique({
      where: { auth0Subject: identity.subject },
    });
    if (existingBySubject) {
      if (existingBySubject.role !== role) {
        throw new ConflictException('This account already has a different role.');
      }
      return existingBySubject;
    }

    const existingByEmail = await this.prisma.account.findUnique({ where: { email: identity.email } });
    if (existingByEmail) {
      throw new ConflictException('This email address is already associated with an account.');
    }

    return this.prisma.account.create({
      data: {
        auth0Subject: identity.subject,
        email: identity.email,
        emailVerified: identity.emailVerified,
        role: role as ParticipantRole,
        verificationStatus: VerificationStatus.UNVERIFIED,
      },
    });
  }
}
