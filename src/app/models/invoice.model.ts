export interface InvoiceContent {
  serviceDescription: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  totalPrice: number;
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
  issueDate: number[];
  issueLocation: string;
  provider: Company;
  client: Company;
  contents: InvoiceContent[];
  verbalTotalPrice: string | null;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  offset: number;
  unpaged: boolean;
  paged: boolean;
}

export interface Sort {
  empty: boolean;
  unsorted: boolean;
  sorted: boolean;
}

export interface InvoiceResponse {
  content: Invoice[];
  pageable: Pageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: Sort;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
