export interface PaymentProps {
  id: string;
  value: number;
  dateCreated: string;
  status: "PENDING" | "CONFIRMED";
  dueDate: string;
}

export interface CreditCardProps {
  creditCardNumber: string;
  creditCardBrand: string;
}
