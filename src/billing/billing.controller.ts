import {
  Controller,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { PermissionGuard } from 'src/authorization/permission.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('organizations/:organizationId/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  createCheckout(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
  ) {
    return this.billingService.createCheckoutSession(organizationId);
  }

  @Post('portal')
  createPortal(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
  ) {
    return this.billingService.createCustomerPortalSession(organizationId);
  }
}

@Controller('billing')
export class BillingWebhookController {
  constructor(private readonly billingService: BillingService) {}

  @Post('webhook')
  handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.billingService.handleWebhook(request.rawBody!, signature);
  }
}
