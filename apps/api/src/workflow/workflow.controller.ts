import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { actorFrom } from '../auth/actor';
import { WorkflowService } from './workflow.service';

@Controller()
export class WorkflowController {
  constructor(private readonly workflow: WorkflowService) {}
  private actor(request: Request) { return actorFrom(request); }
  @Get('profile') profile(@Req() r: Request) { return this.workflow.profile(this.actor(r)); }
  @Patch('profile') saveProfile(@Req() r: Request, @Body() body: any) { return this.workflow.profile(this.actor(r), body); }
  @Post('identity-submissions') identity(@Req() r: Request, @Body() b: { fileName: string }) { return this.workflow.submitIdentity(this.actor(r), b.fileName); }
  @Post('identity-submissions/:id/review') reviewIdentity(@Req() r: Request, @Param('id') id: string, @Body() b: { approved: boolean }) { return this.workflow.reviewIdentity(this.actor(r), id, b.approved); }
  @Post('listings') createListing(@Req() r: Request, @Body() b: any) { return this.workflow.createListing(this.actor(r), b); }
  @Patch('listings/:id') updateListing(@Req() r: Request, @Param('id') id: string, @Body() b: any) { return this.workflow.updateListing(this.actor(r), id, b); }
  @Post('listings/:id/publication') publish(@Req() r: Request, @Param('id') id: string, @Body() b: { active: boolean }) { return this.workflow.publishListing(this.actor(r), id, b.active); }
  @Post('listings/:id/photos') photo(@Req() r: Request, @Param('id') id: string, @Body() b: any) { return this.workflow.addPhoto(this.actor(r), id, b); }
  @Get('listings') search(@Query('query') query?: string) { return this.workflow.search(query); }
  @Get('listings/:id') listing(@Param('id') id: string) { return this.workflow.listing(id); }
  @Post('favorites/:listingId') favorite(@Req() r: Request, @Param('listingId') id: string) { return this.workflow.favorite(this.actor(r), id); }
  @Get('favorites') favorites(@Req() r: Request) { return this.workflow.favorites(this.actor(r)); }
  @Delete('favorites/:listingId') unfavorite(@Req() r: Request, @Param('listingId') id: string) { return this.workflow.removeFavorite(this.actor(r), id); }
  @Post('listings/:listingId/offers') offer(@Req() r: Request, @Param('listingId') id: string, @Body() b: any) { return this.workflow.submitOffer(this.actor(r), id, b.terms, b.expiresAt); }
  @Get('listings/:listingId/offers') offers(@Req() r: Request, @Param('listingId') id: string) { return this.workflow.offers(this.actor(r), id); }
  @Post('offers/:id/respond') respond(@Req() r: Request, @Param('id') id: string, @Body() b: any) { return this.workflow.respondOffer(this.actor(r), id, b.action, b.terms); }
  @Post('offers/:id/counter-response') counterResponse(@Req() r: Request, @Param('id') id: string, @Body() b: { accept: boolean }) { return this.workflow.buyerCounterResponse(this.actor(r), id, b.accept); }
  @Get('offers/:id/history') history(@Req() r: Request, @Param('id') id: string) { return this.workflow.history(this.actor(r), id); }
  @Get('transactions/:id') transaction(@Req() r: Request, @Param('id') id: string) { return this.workflow.transaction(this.actor(r), id); }
  @Patch('transactions/:id/closing-date') closing(@Req() r: Request, @Param('id') id: string, @Body() b: { closingDate: string }) { return this.workflow.setClosing(this.actor(r), id, b.closingDate); }
  @Get('transactions/:id/questionnaire') questionnaire(@Req() r: Request, @Param('id') id: string) { return this.workflow.questionnaire(this.actor(r), id); }
  @Patch('transactions/:id/questionnaire') saveQuestionnaire(@Req() r: Request, @Param('id') id: string, @Body() b: any) { return this.workflow.questionnaire(this.actor(r), id, b); }
  @Post('transactions/:id/agreement/generate') generate(@Req() r: Request, @Param('id') id: string) { return this.workflow.generateAgreement(this.actor(r), id); }
  @Post('transactions/:id/agreement/approve') approve(@Req() r: Request, @Param('id') id: string) { return this.workflow.approveAgreement(this.actor(r), id); }
  @Post('transactions/:id/agreement/sign') sign(@Req() r: Request, @Param('id') id: string) { return this.workflow.startSigning(this.actor(r), id); }
  @Post('transactions/:id/agreement/complete-local-signing') complete(@Param('id') id: string) { return this.workflow.completeSigning(id); }
  @Get('transactions/:id/inspection') inspection(@Req() r: Request, @Param('id') id: string) { return this.workflow.inspection(this.actor(r), id); }
  @Patch('transactions/:id/inspection') saveInspection(@Req() r: Request, @Param('id') id: string, @Body() b: any) { return this.workflow.inspection(this.actor(r), id, b); }
  @Post('transactions/:id/inspection/report') report(@Req() r: Request, @Param('id') id: string, @Body() b: any) { return this.workflow.uploadReport(this.actor(r), id, b.fileName, b.mimeType); }
  @Post('transactions/:id/repair-requests') repair(@Req() r: Request, @Param('id') id: string, @Body() b: any) { return this.workflow.repair(this.actor(r), id, b.finding, b.requestedAction); }
  @Post('repair-requests/:id/respond') respondRepair(@Req() r: Request, @Param('id') id: string, @Body() b: { sellerResponse: string }) { return this.workflow.respondRepair(this.actor(r), id, b.sellerResponse); }
}
