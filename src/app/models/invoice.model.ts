export interface InvoiceContent {
  serviceDescription: string;
  unitPrice: number;
  quantity: number;
  discount: number;
}

export interface Company {
  id: number;
  name: string;
  address: string;
  identityNumber: string;
  type: 'SUPPLIER' | 'CUSTOMER';
  vatNumber: string;
  responsibleOfficerName: string;
  bankIdentifierCode: string;
  bankName: string;
  iban: string;
}

export interface Invoice {
  id: number;
  serialNumber: number;
  issueDate: string;
  issueLocation: string;
  provider: Company;
  client: Company;
  contents: InvoiceContent[];
}

export interface InvoicePage {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface InvoiceResponse {
  content: Invoice[];
  page: InvoicePage;
}
