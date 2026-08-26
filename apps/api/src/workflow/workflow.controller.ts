import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { actorFrom } from '../auth/actor';
import { WorkflowService } from './workflow.service';

@Controller()
export class WorkflowController {
  constructor(private readonly workflow: WorkflowService) {}

  private actor(request: Request) {
    return actorFrom(request);
  }

  @Get('profile')
  profile(@Req() request: Request) {
    return this.workflow.profile(this.actor(request));
  }

  @Patch('profile')
  saveProfile(@Req() request: Request, @Body() body: any) {
    return this.workflow.profile(this.actor(request), body);
  }

  @Post('identity-submissions')
  identity(@Req() request: Request, @Body() body: { fileName: string }) {
    return this.workflow.submitIdentity(this.actor(request), body.fileName);
  }

  @Post('identity-submissions/:id/review')
  reviewIdentity(@Req() request: Request, @Param('id') id: string, @Body() body: { approved: boolean }) {
    return this.workflow.reviewIdentity(this.actor(request), id, body.approved);
  }

  @Post('listings')
  createListing(@Req() request: Request, @Body() body: any) {
    return this.workflow.createListing(this.actor(request), body);
  }

  @Patch('listings/:id')
  updateListing(@Req() request: Request, @Param('id') id: string, @Body() body: any) {
    return this.workflow.updateListing(this.actor(request), id, body);
  }

  @Post('listings/:id/publication')
  publish(@Req() request: Request, @Param('id') id: string, @Body() body: { active: boolean }) {
    return this.workflow.publishListing(this.actor(request), id, body.active);
  }

  @Post('listings/:id/photos')
  photo(@Req() request: Request, @Param('id') id: string, @Body() body: any) {
    return this.workflow.addPhoto(this.actor(request), id, body);
  }

  @Get('listings')
  search(@Query('query') query?: string) {
    return this.workflow.search(query);
  }

  @Get('listings/:id')
  listing(@Param('id') id: string) {
    return this.workflow.listing(id);
  }

  @Post('favorites/:listingId')
  favorite(@Req() request: Request, @Param('listingId') id: string) {
    return this.workflow.favorite(this.actor(request), id);
  }

  @Get('favorites')
  favorites(@Req() request: Request) {
    return this.workflow.favorites(this.actor(request));
  }

  @Delete('favorites/:listingId')
  unfavorite(@Req() request: Request, @Param('listingId') id: string) {
    return this.workflow.removeFavorite(this.actor(request), id);
  }

  @Post('listings/:listingId/offers')
  offer(@Req() request: Request, @Param('listingId') id: string, @Body() body: any) {
    return this.workflow.submitOffer(this.actor(request), id, body.terms, body.expiresAt);
  }

  @Get('listings/:listingId/offers')
  offers(@Req() request: Request, @Param('listingId') id: string) {
    return this.workflow.offers(this.actor(request), id);
  }

  @Post('offers/:id/respond')
  respond(@Req() request: Request, @Param('id') id: string, @Body() body: any) {
    return this.workflow.respondOffer(this.actor(request), id, body.action, body.terms);
  }

  @Post('offers/:id/counter-response')
  counterResponse(@Req() request: Request, @Param('id') id: string, @Body() body: { accept: boolean }) {
    return this.workflow.buyerCounterResponse(this.actor(request), id, body.accept);
  }

  @Get('offers/:id/history')
  history(@Req() request: Request, @Param('id') id: string) {
    return this.workflow.history(this.actor(request), id);
  }

  @Get('transactions/:id')
  transaction(@Req() request: Request, @Param('id') id: string) {
    return this.workflow.transaction(this.actor(request), id);
  }

  @Patch('transactions/:id/closing-date')
  closing(@Req() request: Request, @Param('id') id: string, @Body() body: { closingDate: string }) {
    return this.workflow.setClosing(this.actor(request), id, body.closingDate);
  }

  @Get('transactions/:id/questionnaire')
  questionnaire(@Req() request: Request, @Param('id') id: string) {
    return this.workflow.questionnaire(this.actor(request), id);
  }

  @Patch('transactions/:id/questionnaire')
  saveQuestionnaire(@Req() request: Request, @Param('id') id: string, @Body() body: any) {
    return this.workflow.questionnaire(this.actor(request), id, body);
  }

  @Post('transactions/:id/agreement/generate')
  generate(@Req() request: Request, @Param('id') id: string) {
    return this.workflow.generateAgreement(this.actor(request), id);
  }

  @Post('transactions/:id/agreement/approve')
  approve(@Req() request: Request, @Param('id') id: string) {
    return this.workflow.approveAgreement(this.actor(request), id);
  }

  @Post('transactions/:id/agreement/sign')
  sign(@Req() request: Request, @Param('id') id: string) {
    return this.workflow.startSigning(this.actor(request), id);
  }

  @Post('transactions/:id/agreement/complete-local-signing')
  complete(@Param('id') id: string) {
    return this.workflow.completeSigning(id);
  }

  @Get('transactions/:id/inspection')
  inspection(@Req() request: Request, @Param('id') id: string) {
    return this.workflow.inspection(this.actor(request), id);
  }

  @Patch('transactions/:id/inspection')
  saveInspection(@Req() request: Request, @Param('id') id: string, @Body() body: any) {
    return this.workflow.inspection(this.actor(request), id, body);
  }

  @Post('transactions/:id/inspection/report')
  report(@Req() request: Request, @Param('id') id: string, @Body() body: any) {
    return this.workflow.uploadReport(this.actor(request), id, body.fileName, body.mimeType);
  }

  @Post('transactions/:id/repair-requests')
  repair(@Req() request: Request, @Param('id') id: string, @Body() body: { finding: string; requestedAction: string }) {
    return this.workflow.addRepairRequest(this.actor(request), id, {
      description: body.finding,
      proposedTerms: body.requestedAction,
    });
  }

  @Post('repair-requests/:id/respond')
  respondRepair(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() body: { action: 'accept' | 'reject' | 'counter'; terms?: unknown },
  ) {
    return this.workflow.respondRepair(this.actor(request), id, body.action, body.terms);
  }
}
