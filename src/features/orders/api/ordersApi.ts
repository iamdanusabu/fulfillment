import { PaginatedFetcher } from '../../../shared/services/paginatedFetcher';
import { Order } from '../../../shared/types';
import { getConfig } from '../../../environments';

interface GetOrdersParams {
  source?: string;
  pageNo?: number;
  status?: string;
  paymentStatus?: string;
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
      initialParams: {
        hasFulfilmentJob: 'false',
        expand: 'item,bin,location_hint,payment',
        pagination: 'true',
        ...params,
      },
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
    try {
      const { fetchWithToken } = await import('../../../shared/services/fetchWithToken');
      const config = getConfig();
      
      // Use the same endpoint structure as curl command with pagination params
      const url = `${config.endpoints.orders}/${orderId}?pageNo=1&pageSize=1`;
      const data = await fetchWithToken(url);
      
      // Handle paginated response structure
      if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
        return transformOrder(data.data[0]);
      }
      // Handle direct object response
      else if (data && !Array.isArray(data)) {
        return transformOrder(data);
      }

      throw new Error('Order not found');
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      throw error;
    }
  },

  // Fulfill order
  async fulfillOrder(orderId: string, fulfillmentLocationId: string) {
    try {
      const { fetchWithToken } = await import('../../../shared/services/fetchWithToken');
      const config = getConfig();
      
      const requestBody = [{
        orderID: orderId,
        fulfillmentLocation: {
          type: "STORE",
          id: fulfillmentLocationId
        }
      }];
      
      const data = await fetchWithToken(config.endpoints.orderFulfill, {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      });
      
      return data;
    } catch (error) {
      console.error('Error fulfilling order:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string) {
    try {
      const { fetchWithToken } = await import('../../../shared/services/fetchWithToken');
      const config = getConfig();
      
      const requestBody = {
        orderID: orderId,
        status: status
      };
      
      const data = await fetchWithToken(`${config.endpoints.orders}/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      });
      
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },
};

// Export the transform function for use in hooks
export { transformOrder };