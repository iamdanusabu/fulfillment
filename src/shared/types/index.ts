
export interface Order {
  id: string;
  orderNumber?: string;
  source: string;
  status: string;
  customer: string | Customer;
  items: OrderItem[];
  createdAt?: string;
  orderID: string;
  externalOrderID?: string;
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
  externalOrderKey?: number;
  netDiscount: number;
  isTaxExempt: boolean;
  totalItemQuantity: number;
  employee?: {
    employeeID: number;
    name: string;
    userID: number;
    id: number;
  };
  store?: {
    storeID: number;
    name: string;
    id: number;
  };
  register?: {
    id: number;
    registerID: number;
    name: string;
  };
  billingAddress?: Address;
  deliveryAddress?: Address;
  statusCode?: number;
  modifiedBy?: number;
  modifiedDate?: string;
  transactions?: string[];
  metadata?: any;
  createTransaction?: boolean;
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

export interface PicklistItem {
  id: string;
  productId: string;
  productName: string;
  requiredQuantity: number;
  pickedQuantity: number;
  location: string;
}

export interface Picklist {
  id: string;
  orderIds: string[];
  locationId: string;
  items: PicklistItem[];
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
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
