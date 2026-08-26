import { z } from 'zod';

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.literal('api'),
  timestamp: z.string().datetime(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const participantRoleSchema = z.enum(['BUYER', 'SELLER', 'ADMIN']);
export type ParticipantRole = z.infer<typeof participantRoleSchema>;

export const verificationStatusSchema = z.enum(['UNVERIFIED', 'PENDING', 'APPROVED', 'DECLINED']);
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;
