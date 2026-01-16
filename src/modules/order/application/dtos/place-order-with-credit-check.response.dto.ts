export interface PlaceOrderWithCreditCheckResponseDto {
  orderId: string;
  approved: boolean;
  requiresManualApproval: boolean;
  requiredDeposit: number;
  message?: string;
}
