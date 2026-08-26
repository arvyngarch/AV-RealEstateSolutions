import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AgreementStatus,
  ListingStatus,
  MilestoneStatus,
  OfferStatus,
  ParticipantRole,
  RepairRequestStatus,
  VerificationStatus,
} from '@prisma/client';
import type { Actor } from '../auth/actor';
import { PrismaService } from '../prisma.service';

const milestones = [
  'Purchase agreement signing',
  'Inspection scheduling',
  'Inspection completion',
  'Financing approval',
  'Closing scheduling',
];

const actionableOfferStatuses: OfferStatus[] = [
  OfferStatus.SUBMITTED,
  OfferStatus.COUNTERED,
];


@Injectable()
export class WorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async account(actor: Actor) {
    return this.prisma.account.upsert({
      where: { auth0Subject: actor.subject },
      update: {
        email: actor.email,
        role: actor.role as ParticipantRole,
        emailVerified: actor.emailVerified,
      },
      create: {
        auth0Subject: actor.subject,
        email: actor.email,
        role: actor.role as ParticipantRole,
        emailVerified: actor.emailVerified,
        verificationStatus: VerificationStatus.APPROVED,
      },
    });
  }

  async profile(actor: Actor, input?: Record<string, string>) {
    const account = await this.account(actor);
    if (!input) {
      return this.prisma.profile.findUnique({ where: { accountId: account.id } });
    }

    const required = ['firstName', 'lastName', 'phone', 'address'];
    const missing = required.filter((key) => !input[key]?.trim());
    if (missing.length) {
      throw new BadRequestException(
        `Required profile information is missing: ${missing.join(', ')}.`,
      );
    }

    return this.prisma.profile.upsert({
      where: { accountId: account.id },
      update: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        address: input.address,
      },
      create: {
        accountId: account.id,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        address: input.address,
      },
    });
  }

  async submitIdentity(actor: Actor, fileName: string) {
    const account = await this.account(actor);
    if (!account.emailVerified) {
      throw new ForbiddenException('Verify your email before submitting identification.');
    }
    return this.prisma.identitySubmission.create({
      data: { accountId: account.id, fileName },
    });
  }

  
async reviewIdentity(actor: Actor, submissionId: string, approved: boolean) {
    if (actor.role !== 'ADMIN') {
      throw new ForbiddenException('Only an administrator may review identification.');
    }
    const submission = await this.prisma.identitySubmission.findUnique({
      where: { id: submissionId },
    });
    if (!submission) throw new NotFoundException('Identity submission was not found.');

    const status = approved ? VerificationStatus.APPROVED : VerificationStatus.DECLINED;
    await this.prisma.account.update({
      where: { id: submission.accountId },
      data: { verificationStatus: status },
    });
    return this.prisma.identitySubmission.update({
      where: { id: submissionId },
      data: { status },
    });
  }

  async createListing(actor: Actor, data: any) {
    const seller = await this.account(actor);
    if (seller.role !== 'SELLER' || seller.verificationStatus !== 'APPROVED') {
      throw new ForbiddenException('Only verified sellers may create listings.');
    }
    this.validateListing(data);
    return this.prisma.listing.create({
      data: { sellerId: seller.id, ...data, askingPrice: data.askingPrice },
    });
  }

  async updateListing(actor: Actor, id: string, data: any) {
    const listing = await this.ownedListing(actor, id);
    this.validateListing({ ...listing, ...data });
    return this.prisma.listing.update({ where: { id }, data });
  }

  async publishListing(actor: Actor, id: string, active: boolean) {
    await this.ownedListing(actor, id);
    return this.prisma.listing.update({
      where: { id },
      data: { status: active ? ListingStatus.ACTIVE : ListingStatus.REMOVED },
    });
  }

  async addPhoto(actor: Actor, id: string, data: { fileName: string; mimeType: string }) {
    await this.ownedListing(actor, id);
    if (!data.mimeType.startsWith('image/')) {
      throw new BadRequestException('Only image files may be added as listing photos.');
    }
    return this.prisma.listingPhoto.create({
      data: { listingId: id, ...data, storageKey: `local/listings/${id}/${data.fileName}` },
    });
  }

  async search(query: string | undefined) {
    return this.prisma.listing.findMany({
      where: {
        status: ListingStatus.ACTIVE,
        ...(query ? { address: { contains: query, mode: 'insensitive' } } : {}),
      },
      include: { photos: true },
    });
  }

  async listing(id: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id, status: ListingStatus.ACTIVE },
      include: { photos: true },
    });
    if (!listing) throw new NotFoundException('Active listing was not found.');
    return listing;
  }

  async favorite(actor: Actor, listingId: string) {
    const buyer = await this.account(actor);
    if (buyer.role !== 'BUYER') throw new ForbiddenException('Only buyers may save favorites.');
    await this.listing(listingId);
    return this.prisma.savedFavorite.upsert({
      where: { buyerId_listingId: { buyerId: buyer.id, listingId } },
      update: {},
      create: { buyerId: buyer.id, listingId },
    });
  }

  async favorites(actor: Actor) {
    const buyer = await this.account(actor);
    return this.prisma.savedFavorite.findMany({
      where: { buyerId: buyer.id, listing: { status: ListingStatus.ACTIVE } },
      include: { listing: { include: { photos: true } } },
    });
  }

  async removeFavorite(actor: Actor, listingId: string) {
    const buyer = await this.account(actor);
    return this.prisma.savedFavorite.delete({
      where: { buyerId_listingId: { buyerId: buyer.id, listingId } },
    });
  }

  async submitOffer(actor: Actor, listingId: string, terms: any, expiresAt: string) {
    const buyer = await this.account(actor);
    if (buyer.role !== 'BUYER' || buyer.verificationStatus !== 'APPROVED') {
      throw new ForbiddenException('Only verified buyers may submit offers.');
    }
    await this.listing(listingId);
    const expiry = new Date(expiresAt);
    if (Number.isNaN(+expiry) || expiry <= new Date()) {
      throw new BadRequestException('Offer expiration must be in the future.');
    }
    if (!terms || Object.keys(terms).length === 0) {
      throw new BadRequestException('Proposed terms are required.');
    }
    const offer = await this.prisma.offer.create({
      data: { listingId, buyerId: buyer.id, terms, expiresAt: expiry },
    });
    await this.event(offer.id, buyer.id, 'SUBMITTED', terms);
    return offer;
  }

  async offers(actor: Actor, listingId: string) {
    const listing = await this.ownedListing(actor, listingId);
    return this.prisma.offer.findMany({
      where: {
        listingId: listing.id,
        status: { in: actionableOfferStatuses },
      },
      include: { history: { orderBy: { createdAt: 'asc' } } },
    });
  }

  
async respondOffer(
    actor: Actor,
    offerId: string,
    action: 'accept' | 'reject' | 'counter',
    terms?: any,
  ) {
    const offer = await this.prisma.offer.findUnique({
      include: { listing: true },
      where: { id: offerId },
    });
    if (!offer) throw new NotFoundException('Offer was not found.');
    const seller = await this.account(actor);
    if (seller.id !== offer.listing.sellerId) {
      throw new ForbiddenException('Only the listing seller may respond.');
    }
    if (
      offer.expiresAt <= new Date() ||
      !actionableOfferStatuses.includes(offer.status)
    ) {
      throw new BadRequestException('This offer cannot be changed.');
    }
    if (action === 'counter' && (!terms || Object.keys(terms).length === 0)) {
      throw new BadRequestException('Counteroffer terms are required.');
    }
    const status =
      action === 'accept'
        ? OfferStatus.ACCEPTED
        : action === 'reject'
          ? OfferStatus.REJECTED
          : OfferStatus.COUNTERED;
    const updated = await this.prisma.offer.update({
      where: { id: offerId },
      data: { status, ...(action === 'counter' ? { terms } : {}) },
    });
    await this.event(offerId, seller.id, status, terms);
    if (status === OfferStatus.ACCEPTED) await this.createTransaction(updated, seller.id);
    return updated;
  }

  async buyerCounterResponse(actor: Actor, offerId: string, accept: boolean) {
    const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
    const buyer = await this.account(actor);
    if (!offer || offer.buyerId !== buyer.id) {
      throw new ForbiddenException('Only the offer buyer may respond.');
    }
    if (offer.status !== OfferStatus.COUNTERED || offer.expiresAt <= new Date()) {
      throw new BadRequestException('This counteroffer cannot be accepted.');
    }
    const status = accept ? OfferStatus.ACCEPTED : OfferStatus.REJECTED;
    const updated = await this.prisma.offer.update({ where: { id: offerId }, data: { status } });
    await this.event(offerId, buyer.id, status);
    if (accept) {
      const listing = await this.prisma.listing.findUniqueOrThrow({ where: { id: offer.listingId } });
      await this.createTransaction(updated, listing.sellerId);
    }
    return updated;
  }

  async history(actor: Actor, offerId: string) {
    const offer = await this.prisma.offer.findUnique({
      include: { listing: true, history: { orderBy: { createdAt: 'asc' } } },
      where: { id: offerId },
    });
    const account = await this.account(actor);
    if (
      !offer ||
      (offer.buyerId !== account.id && offer.listing.sellerId !== account.id && actor.role !== 'ADMIN')
    ) {
      throw new ForbiddenException('You may not view this negotiation.');
    }
    return offer.history;
  }

  async transaction(actor: Actor, id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      include: {
        milestones: true,
        agreement: true,
        inspection: { include: { repairRequests: true } },
      },
      where: { id },
    });
    const account = await this.account(actor);
    if (
      !transaction ||
      (transaction.buyerId !== account.id &&
        transaction.sellerId !== account.id &&
        actor.role !== 'ADMIN')
    ) {
      throw new ForbiddenException('You may not view this transaction.');
    }
    return transaction;
  }

  async setClosing(actor: Actor, id: string, closingDate: string) {
    await this.transaction(actor, id);
    const date = new Date(closingDate);
    if (Number.isNaN(+date)) throw new BadRequestException('A valid closing date is required.');
    return this.prisma.transaction.update({ where: { id }, data: { closingDate: date } });
  }

  async questionnaire(actor: Actor, transactionId: string, response?: any) {
    const transaction = await this.transaction(actor, transactionId);
    if (!transaction.agreement) throw new NotFoundException('Agreement workflow was not found.');
    if (!response) return transaction.agreement;
    if (!response.propertyAddress || !response.closingDate) {
      throw new BadRequestException('Property address and closing date are required.');
    }
    return this.prisma.purchaseAgreement.update({
      where: { transactionId },
      data: { questionnaire: response, status: AgreementStatus.QUESTIONNAIRE },
    });
  }

  async generateAgreement(actor: Actor, transactionId: string) {
    const transaction = await this.transaction(actor, transactionId);
    const agreement = transaction.agreement;
    if (!agreement?.questionnaire) {
      throw new BadRequestException('Complete the questionnaire before generating an agreement.');
    }
    const offer = await this.prisma.offer.findUniqueOrThrow({ where: { id: transaction.offerId } });
    const content = `Attorney-reviewed template. This document does not provide legal advice.\n\nAccepted offer terms:\n${JSON.stringify(offer.terms, null, 2)}\n\nQuestionnaire:\n${JSON.stringify(agreement.questionnaire, null, 2)}`;
    return this.prisma.purchaseAgreement.update({
      where: { transactionId },
      data: {
        templateName: 'Attorney-reviewed residential purchase agreement',
        content,
        status: AgreementStatus.AWAITING_APPROVAL,
        buyerApproved: false,
        sellerApproved: false,
      },
    });
  }

  async approveAgreement(actor: Actor, transactionId: string) {
    const transaction = await this.transaction(actor, transactionId);
    const account = await this.account(actor);
    if (!transaction.agreement?.content) {
      throw new BadRequestException('Generate the agreement before approval.');
    }
    const approval =
      account.id === transaction.buyerId
        ? { buyerApproved: true }
        : account.id === transaction.sellerId
          ? { sellerApproved: true }
          : null;
    if (!approval) throw new ForbiddenException('Only transaction participants may approve.');
    const updated = await this.prisma.purchaseAgreement.update({
      where: { transactionId },
      data: approval,
    });
    if (updated.buyerApproved && updated.sellerApproved) {
      return this.prisma.purchaseAgreement.update({
        where: { transactionId },
        data: { status: AgreementStatus.AWAITING_SIGNATURE },
      });
    }
    return updated;
  }

  async startSigning(actor: Actor, transactionId: string) {
    const transaction = await this.transaction(actor, transactionId);
    const agreement = transaction.agreement;
    if (!agreement || agreement.status !== AgreementStatus.AWAITING_SIGNATURE) {
      throw new BadRequestException('Both participants must approve before signing.');
    }
    await this.milestone(
      transactionId,
      'Purchase agreement signing',
      MilestoneStatus.IN_PROGRESS,
      'Complete electronic signatures.',
    );
    return this.prisma.purchaseAgreement.update({
      where: { transactionId },
      data: { signatureEnvelopeId: `local-envelope-${transactionId}` },
    });
  }

  async completeSigning(transactionId: string) {
    const agreement = await this.prisma.purchaseAgreement.update({
      where: { transactionId },
      data: { status: AgreementStatus.SIGNED },
    });
    await this.milestone(transactionId, 'Purchase agreement signing', MilestoneStatus.COMPLETE, null);
    return agreement;
  }

  async inspection(actor: Actor, transactionId: string, data?: any) {
    const transaction = await this.transaction(actor, transactionId);
    const account = await this.account(actor);
    if (account.id !== transaction.buyerId) {
      throw new ForbiddenException('Only the buyer may manage inspections.');
    }
    if (transaction.agreement?.status !== AgreementStatus.SIGNED) {
      throw new BadRequestException(
        'An accepted purchase agreement is required before inspection coordination.',
      );
    }
    if (!data) return transaction.inspection;
    if (data.appointmentAt && new Date(data.appointmentAt) <= new Date()) {
      throw new BadRequestException('Inspection appointment must be in the future.');
    }
    const inspection = await this.prisma.inspectionRequest.upsert({
      where: { transactionId },
      update: data,
      create: { transactionId, ...data },
    });
    await this.milestone(
      transactionId,
      'Inspection scheduling',
      MilestoneStatus.IN_PROGRESS,
      'Attend the inspection appointment.',
    );
    return inspection;
  }

  async uploadReport(actor: Actor, transactionId: string, fileName: string, mimeType: string) {
    if (mimeType !== 'application/pdf') {
      throw new BadRequestException('Inspection reports must be PDF documents.');
    }
    const inspection = await this.inspection(actor, transactionId);
    if (!inspection) throw new NotFoundException('Inspection workflow was not found.');
    return this.prisma.inspectionRequest.update({
      where: { transactionId },
      data: { reportFileName: fileName },
    });
  }

  async addRepairRequest(actor: Actor, transactionId: string, input: any) {
    const transaction = await this.transaction(actor, transactionId);
    const account = await this.account(actor);
    if (account.id !== transaction.buyerId) {
      throw new ForbiddenException('Only the buyer may submit repair requests.');
    }
    if (!transaction.inspection?.reportFileName) {
      throw new BadRequestException('Upload the inspection report before proposing repairs.');
    }
    if (!input.description?.trim()) {
      throw new BadRequestException('A repair request description is required.');
    }
    const request = await this.prisma.repairRequest.create({
      data: { transactionId, description: input.description, proposedTerms: input.proposedTerms },
    });
    await this.milestone(
      transactionId,
      'Inspection completion',
      MilestoneStatus.IN_PROGRESS,
      'Review and negotiate repair requests.',
    );
    return request;
  }

  async respondRepair(actor: Actor, requestId: string, action: 'accept' | 'reject' | 'counter', terms?: any) {
    const request = await this.prisma.repairRequest.findUnique({
      include: { transaction: true },
      where: { id: requestId },
    });
    const account = await this.account(actor);
    if (!request || request.transaction.sellerId !== account.id) {
      throw new ForbiddenException('Only the seller may respond to repair requests.');
    }
    if (action === 'counter' && !terms) {
      throw new BadRequestException('Counterproposal terms are required.');
    }
    const status =
      action === 'accept'
        ? RepairRequestStatus.ACCEPTED
        : action === 'reject'
          ? RepairRequestStatus.REJECTED
          : RepairRequestStatus.COUNTERED;
    return this.prisma.repairRequest.update({
      where: { id: requestId },
      data: { status, ...(action === 'counter' ? { counterTerms: terms } : {}) },
    });
  }

  async scheduleClosing(actor: Actor, transactionId: string, closingDate: string) {
    const transaction = await this.transaction(actor, transactionId);
    const account = await this.account(actor);
    if (account.id !== transaction.sellerId) {
      throw new ForbiddenException('Only the seller may schedule closing.');
    }
    const date = new Date(closingDate);
    if (Number.isNaN(+date) || date <= new Date()) {
      throw new BadRequestException('Closing date must be in the future.');
    }
    await this.milestone(
      transactionId,
      'Closing scheduling',
      MilestoneStatus.IN_PROGRESS,
      'Confirm the closing appointment.',
    );
    return this.prisma.transaction.update({ where: { id: transactionId }, data: { closingDate: date } });
  }

  private async ownedListing(actor: Actor, listingId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    const account = await this.account(actor);
    if (!listing || listing.sellerId !== account.id) {
      throw new ForbiddenException('You may not manage this listing.');
    }
    return listing;
  }

  private validateListing(data: any) {
    const required = ['address', 'propertyType', 'bedrooms', 'bathrooms', 'squareFeet', 'askingPrice'];
    const missing = required.filter(
      (key) => data[key] === undefined || data[key] === null || data[key] === '',
    );
    if (missing.length) {
      throw new BadRequestException(`Required listing information is missing: ${missing.join(', ')}.`);
    }
    if (Number(data.askingPrice) <= 0) {
      throw new BadRequestException('Asking price must be greater than zero.');
    }
  }

  private async event(offerId: string, actorId: string, status: OfferStatus, terms?: any) {
    return this.prisma.offerEvent.create({
      data: { offerId, actorId, status, terms },
    });
  }

  private async createTransaction(offer: any, sellerId: string) {
    const transaction = await this.prisma.transaction.create({
      data: { offerId: offer.id, buyerId: offer.buyerId, sellerId },
    });
    await this.prisma.purchaseAgreement.create({ data: { transactionId: transaction.id } });
    await this.prisma.transactionMilestone.createMany({
      data: milestones.map((name) => ({ transactionId: transaction.id, name })),
    });
    return transaction;
  }

  private async milestone(
    transactionId: string,
    name: string,
    status: MilestoneStatus,
    actionRequired: string | null,
  ) {
    return this.prisma.transactionMilestone.update({
      where: { transactionId_name: { transactionId, name } },
      data: { status, actionRequired },
    });
  }
}
