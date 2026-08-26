import { describe, expect, it, vi } from 'vitest';
import { AccountService } from './account.service';

const identity = { subject: 'auth0|buyer-1', email: 'buyer@example.test', emailVerified: false };

describe('AccountService', () => {
  it('creates an unverified buyer account from an Auth0 identity', async () => {
    const account = {
      id: 'account-1',
      auth0Subject: identity.subject,
      email: identity.email,
      emailVerified: false,
      role: 'BUYER',
      verificationStatus: 'UNVERIFIED',
    };
    const prisma = {
      account: {
        findUnique: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null),
        create: vi.fn().mockResolvedValue(account),
      },
    };
    const service = new AccountService(prisma as never);

    await expect(service.provision(identity, 'BUYER')).resolves.toEqual(account);
    expect(prisma.account.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ role: 'BUYER', verificationStatus: 'UNVERIFIED' }),
    });
  });

  it('rejects an email that already belongs to another account', async () => {
    const prisma = {
      account: {
        findUnique: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'account-2' }),
        create: vi.fn(),
      },
    };
    const service = new AccountService(prisma as never);

    await expect(service.provision(identity, 'BUYER')).rejects.toThrow(
      'This email address is already associated with an account.',
    );
  });
});
