-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('BUYER', 'SELLER', 'ADMIN');
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'APPROVED', 'DECLINED');
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'REMOVED');
CREATE TYPE "OfferStatus" AS ENUM ('SUBMITTED', 'COUNTERED', 'ACCEPTED', 'REJECTED');
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETE');
CREATE TYPE "AgreementStatus" AS ENUM ('QUESTIONNAIRE', 'AWAITING_APPROVAL', 'AWAITING_SIGNATURE', 'SIGNED');
CREATE TYPE "RepairRequestStatus" AS ENUM ('OPEN', 'RESPONDED', 'ACCEPTED', 'REJECTED', 'COUNTERED');

-- CreateTable
CREATE TABLE "Account" (
  "id" TEXT NOT NULL,
  "auth0Subject" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "role" "ParticipantRole" NOT NULL,
  "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Profile" (
  "id" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IdentitySubmission" (
  "id" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IdentitySubmission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Listing" (
  "id" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "bedrooms" INTEGER NOT NULL,
  "bathrooms" DOUBLE PRECISION NOT NULL,
  "squareFeet" INTEGER NOT NULL,
  "askingPrice" DECIMAL(14,2) NOT NULL,
  "description" TEXT NOT NULL,
  "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ListingPhoto" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "storageKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ListingPhoto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SavedFavorite" (
  "id" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SavedFavorite_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Offer" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "terms" JSONB NOT NULL,
  "status" "OfferStatus" NOT NULL DEFAULT 'SUBMITTED',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OfferEvent" (
  "id" TEXT NOT NULL,
  "offerId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "status" "OfferStatus" NOT NULL,
  "terms" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OfferEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Transaction" (
  "id" TEXT NOT NULL,
  "offerId" TEXT NOT NULL,
  "listingId" TEXT,
  "buyerId" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "closingDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TransactionMilestone" (
  "id" TEXT NOT NULL,
  "transactionId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
  "actionRequired" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TransactionMilestone_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PurchaseAgreement" (
  "id" TEXT NOT NULL,
  "transactionId" TEXT NOT NULL,
  "questionnaire" JSONB,
  "templateName" TEXT,
  "content" TEXT,
  "status" "AgreementStatus" NOT NULL DEFAULT 'QUESTIONNAIRE',
  "buyerApproved" BOOLEAN NOT NULL DEFAULT false,
  "sellerApproved" BOOLEAN NOT NULL DEFAULT false,
  "signatureEnvelopeId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PurchaseAgreement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InspectionRequest" (
  "id" TEXT NOT NULL,
  "transactionId" TEXT NOT NULL,
  "appointmentAt" TIMESTAMP(3),
  "reportFileName" TEXT,
  "reportMimeType" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InspectionRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RepairRequest" (
  "id" TEXT NOT NULL,
  "transactionId" TEXT NOT NULL,
  "inspectionId" TEXT,
  "description" TEXT NOT NULL,
  "proposedTerms" JSONB,
  "sellerResponse" TEXT,
  "counterTerms" JSONB,
  "status" "RepairRequestStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RepairRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Account_auth0Subject_key" ON "Account"("auth0Subject");
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
CREATE UNIQUE INDEX "Profile_accountId_key" ON "Profile"("accountId");
CREATE UNIQUE INDEX "SavedFavorite_buyerId_listingId_key" ON "SavedFavorite"("buyerId", "listingId");
CREATE UNIQUE INDEX "Transaction_offerId_key" ON "Transaction"("offerId");
CREATE UNIQUE INDEX "TransactionMilestone_transactionId_name_key" ON "TransactionMilestone"("transactionId", "name");
CREATE UNIQUE INDEX "PurchaseAgreement_transactionId_key" ON "PurchaseAgreement"("transactionId");
CREATE UNIQUE INDEX "InspectionRequest_transactionId_key" ON "InspectionRequest"("transactionId");

ALTER TABLE "Profile" ADD CONSTRAINT "Profile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IdentitySubmission" ADD CONSTRAINT "IdentitySubmission_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ListingPhoto" ADD CONSTRAINT "ListingPhoto_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedFavorite" ADD CONSTRAINT "SavedFavorite_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedFavorite" ADD CONSTRAINT "SavedFavorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfferEvent" ADD CONSTRAINT "OfferEvent_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfferEvent" ADD CONSTRAINT "OfferEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TransactionMilestone" ADD CONSTRAINT "TransactionMilestone_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PurchaseAgreement" ADD CONSTRAINT "PurchaseAgreement_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InspectionRequest" ADD CONSTRAINT "InspectionRequest_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RepairRequest" ADD CONSTRAINT "RepairRequest_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RepairRequest" ADD CONSTRAINT "RepairRequest_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "InspectionRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
