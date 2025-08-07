
export interface Order {
  id: string;
  orderNumber: string;
  source: string;
  status: string;
  customer: string;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  pickedQuantity?: number;
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
