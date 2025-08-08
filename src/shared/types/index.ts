export interface Order {
  id: string;
  orderID: number;
  orderNumber: string;
  source: string;
  status: string;
  customer: string | object;
  items: OrderItem[];
  createdAt: string;
  date: string;
  type: string;
  paymentStatus: string;
  employeeID: number;
  subTotal: number;
  totalFees: number;
  customizationTotal: number;
  tax: number;
  amount: number;
  registerID: number;
  externalOrderKey: string;
  netDiscount: number;
  isTaxExempt: boolean;
  totalItemQuantity: number;
  employee: any;
  store: any;
  register: any;
}

export interface Customer {
  customerNumber: string;
  name: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  email: string;
  countryCode: string;
  mobilePhone: string;
  id: string;
}

export interface Address {
  addressID: string;
  fullName: string;
  address1: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  postalCode: string;
  id: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  pickedQuantity?: number;
  orderItemID: string;
  itemID: string;
  orderID: number;
  upc: string;
  name: string;
  sequence: number;
  orderQuantity: number;
  returnQuantity: number;
  unitPrice: number;
  costPrice: number;
  discount: number;
  tax: number;
  customizationTotal: number;
  status: string;
  batch: number;
  amount: number;
}

export interface Location {
  id: string;
  name: string;
  type: 'warehouse' | 'store';
  address: string;
}

export interface Bin {
  id: number;
  name: string;
  location: {
    type: string;
    name: string;
    locationID: number;
    id: number;
  };
}

export interface LocationHint {
  id: number;
  hint: string;
  location: {
    type: string;
    name: string;
    locationID: number;
    id: number;
  };
  createdOn: string;
  createdBy: {
    userID: number;
    userName: string;
    id: number;
  };
}

export interface PicklistItem {
  id: string;
  productId: string;
  productName: string;
  location: string;
  requiredQuantity: number;
  pickedQuantity: number;
  availableQuantity?: number;
  upc?: string;
  batch?: number;
  bin?: Bin;
  locationHints?: LocationHint[];
}

export interface Picklist {
  id: string;
  orderIds: string[];
  locationId: string;
  items: PicklistItem[];
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
}

export interface Fulfillment {
  id: string;
  name: string;
  status: string;
  totalItemCount: number;
  totalItemAmount: number;
  type: string;
  fulfillmentStatus: 'FULFILLED' | 'UNFULFILLED';
  fulfillmentLocation: {
    type: string;
    name: string;
    locationID: number;
    id: number;
  };
  sources: Array<{
    fulfillment: {
      id: string;
      name: string;
    };
    type: string;
    typeID: string;
    status: string;
    createdBy: {
      userID: number;
      name: string;
      pinEncrypted: boolean;
      id: number;
    };
    createdOn: string;
    modifiedBy: {
      userID: number;
      name: string;
      pinEncrypted: boolean;
      id: number;
    };
    modifiedOn: string;
    modifiedTime: string;
  }>;
  createdBy: {
    userID: number;
    name: string;
    pinEncrypted: boolean;
    id: number;
  };
  createdOn: string;
  modifiedBy: {
    userID: number;
    name: string;
    pinEncrypted: boolean;
    id: number;
  };
  modifiedOn: string;
  modifiedTime: string;
  orderCount: number;
}

export interface DashboardStats {
  orderCounts: {
    fanvista: number;
    suite: number;
    total: number;
  };
  activePicklists: number;
  readyForPickup: number;
}

export interface PaginatedResponse<T> {
  totalRecords: number;
  totalPages: number;
  pageNo: number;
  nextPageURL: string | null;
  data: T[];
}