
import { PaginatedFetcher } from '../../../shared/services/paginatedFetcher';
import { Order } from '../../../shared/types';
import { getConfig } from '../../../environments';

interface GetOrdersParams {
  source?: string;
  pageNo?: number;
}

const transformOrder = (apiOrder: any): Order => ({
  id: apiOrder.orderID.toString(),
  orderID: apiOrder.orderID,
  orderNumber: apiOrder.externalOrderID || apiOrder.orderID.toString(),
  source: apiOrder.source,
  status: apiOrder.status,
  customer: apiOrder.customer?.name || apiOrder.employee?.name || 'Unknown Customer',
  items: apiOrder.items?.map((item: any) => ({
    id: item.orderItemID.toString(),
    productId: item.itemID,
    productName: item.name,
    quantity: item.orderQuantity,
    pickedQuantity: item.returnQuantity || 0,
    orderItemID: item.orderItemID,
    itemID: item.itemID,
    orderID: item.orderID,
    upc: item.upc,
    name: item.name,
    sequence: item.sequence,
    orderQuantity: item.orderQuantity,
    returnQuantity: item.returnQuantity,
    unitPrice: item.unitPrice,
    costPrice: item.costPrice,
    discount: item.discount,
    tax: item.tax,
    customizationTotal: item.customizationTotal,
    status: item.status,
    batch: item.batch,
    amount: item.amount,
  })) || [],
  createdAt: apiOrder.date,
  date: apiOrder.date,
  type: apiOrder.type,
  paymentStatus: apiOrder.paymentStatus,
  employeeID: apiOrder.employeeID,
  subTotal: apiOrder.subTotal,
  totalFees: apiOrder.totalFees,
  customizationTotal: apiOrder.customizationTotal,
  tax: apiOrder.tax,
  amount: apiOrder.amount,
  registerID: apiOrder.registerID,
  externalOrderKey: apiOrder.externalOrderKey,
  netDiscount: apiOrder.netDiscount,
  isTaxExempt: apiOrder.isTaxExempt,
  totalItemQuantity: apiOrder.totalItemQuantity,
  employee: apiOrder.employee,
  store: apiOrder.store,
  register: apiOrder.register,
});

export const ordersApi = {
  // Create a paginated fetcher for orders
  createPaginatedOrdersFetcher(params: GetOrdersParams = {}) {
    const config = getConfig();
    return new PaginatedFetcher<any>(config.endpoints.orders, {
      pageSize: 20,
      initialParams: params,
    });
  },

  // Create a paginated fetcher for a single order
  createSingleOrderFetcher(orderId: string) {
    const config = getConfig();
    return new PaginatedFetcher<any>(`${config.endpoints.orders}/${orderId}`, {
      pageSize: 1,
    });
  },

  // Get single order by ID
  async getOrderById(orderId: string) {
    const fetcher = this.createSingleOrderFetcher(orderId);
    const response = await fetcher.fetchPage();
    
    // Handle direct object response (not in array)
    if (response.data) {
      // If response.data is an array, get first item
      if (Array.isArray(response.data) && response.data.length > 0) {
        return transformOrder(response.data[0]);
      }
      // If response.data is a direct object
      else if (!Array.isArray(response.data)) {
        return transformOrder(response.data);
      }
    }
    
    throw new Error('Order not found');
  },
};

// Export the transform function for use in hooks
export { transformOrder };
