export interface InvoiceItem {
  id?: number;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number; // Default 0, not required
}

export interface InvoiceContent {
  serviceDescription: string;
  unitPrice: number;
  quantity: number;
  discount: number;
}

export interface CreateInvoiceRequest {
  clientId: number;
  contents: InvoiceContent[];
}
