export interface IItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface IInvoice {
  //invoice details
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  currency: "INR" | "USD";
  status: "Draft" | "Unpaid" | "Paid" | "Overdue";

  //business info
  business: {
    businessName: string;
    businessEmail: string;
    businessAddress: string;
    businessPhone: string;
    gstNumber?: string;
  };

  //client info
  client: {
    clientName: string;
    clientEmail: string;
    clientAddress: string;
    clientPhone: string;
  };

  //images and owner details
  stampUrl?: string;
  signUrl?: string;
  companyLogoUrl?: string;
  signOwnerName?: string;
  signOwnerTitle?: string;

  //tax and total info
  subTotal: number;
  taxPercentage: number;
  taxAmount: number;
  total: number;

  //items
  items: IItem[];
}
