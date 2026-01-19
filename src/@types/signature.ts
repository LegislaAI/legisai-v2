export interface SignaturePlan {
  id: string;
  name: string;
  description: string;
  pixPrice: number;
  creditCardPrice: number;
  userQuantity: number;
  yearlyDiscount: number;
  status: "active" | "inactive" | "expired";
}

export interface UserSignature {
  id: string;
  signaturePlanId: string;
  paymentId: string;
  expirationDate: string;
  paymentType: "pix" | "credit_card";
  invoiceId?: string;
  isAutoRenewActivated: boolean;
  refoundDateLimit?: string;
  status: "active" | "inactive" | "expired";
  installmentCount: number;
  creditCardId?: string;
  yearly: boolean;
  asaasSubscriptionId?: string;
  createdAt: string;
  signaturePlan: SignaturePlan;
}

export interface CreditCardDto {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface CreditCardHolderInfoDto {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  phone: string;
}

export interface SignatureWithPixDto {
  yearly: boolean;
}

export interface SignatureWithNewCreditCardDto {
  planId: string;
  creditCard: CreditCardDto;
  creditCardHolderInfo: CreditCardHolderInfoDto;
  installmentCount?: number;
  yearly: boolean;
}

export interface PixPaymentResponse {
  payment: {
    encodedImage: string;
    payload: string;
    expirationDate?: string;
  };
  subscriptionId?: string;
}
