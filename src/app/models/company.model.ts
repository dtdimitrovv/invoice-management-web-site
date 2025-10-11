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

export interface CompanyCreationRequest {
  name: string;
  address: string;
  identityNumber: string;
  vatNumber: string;
  responsibleOfficerName: string;
  bankIdentifierCode: string;
  bankName: string;
  iban: string;
}

export interface CompanyResponse {
  content: Company[];
  pageable: {
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
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
