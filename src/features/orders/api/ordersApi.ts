import { PaginatedFetcher } from '../../../shared/services/paginatedFetcher';
import { Order } from '../../../shared/types';
import { getConfig } from '../../../environments';
import { fetchWithToken } from '../../../shared/services/fetchWithToken';

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

// Assuming transformOrderResponse is defined elsewhere, similar to transformOrder
const transformOrderResponse = (apiOrder: any): Order => {
  // This is a placeholder, assuming it's similar to transformOrder
  // In a real scenario, you'd ensure this matches the API response structure for search
  return transformOrder(apiOrder);
};


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
      // const { fetchWithToken } = await import('../../../shared/services/fetchWithToken');
      const config = getConfig();

      // Use the same endpoint structure as curl command with pagination params
      const url = `${config.endpoints.orders}/${orderId}?pageNo=1&pageSize=1`;
      const data = await fetchWithToken(url);

      // Handle paginated response structure
      if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
        return transformOrder(data.data[0]);
      }
      // Handle direct object response (non-paginated)
      else if (data && !Array.isArray(data) && data.orderID) {
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
      // const { fetchWithToken } = await import('../../../shared/services/fetchWithToken');
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
      // const { fetchWithToken } = await import('../../../shared/services/fetchWithToken');
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

  // Search orders
  async searchOrders({
    pageNo = 1,
    pageSize = 20,
    searchTerm,
    source,
    status,
    hasFulfilmentJob
  }: {
    pageNo?: number;
    pageSize?: number;
    searchTerm: string;
    source?: string;
    status?: string;
    hasFulfilmentJob?: string;
  }) {
    const config = getConfig();
    // Assuming baseUrl is part of the config, and endpoints.orders is the path
    const url = `${config.baseUrl}${config.endpoints.orders}`;

    const params = new URLSearchParams({
      pageNo: pageNo.toString(),
      pageSize: pageSize.toString(),
    });

    // Add search term - using the same parameter as in your curl example
    if (searchTerm) {
      params.append('search', searchTerm);
    }

    if (source) {
      params.append('source', source);
    }

    if (status) {
      params.append('status', status);
    }

    if (hasFulfilmentJob) {
      params.append('hasFulfilmentJob', hasFulfilmentJob);
    }

    const response = await fetchWithToken(`${url}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to search orders: ${response.status}`);
    }

    const data = await response.json();

    return {
      data: data.data?.map(transformOrderResponse) || [],
      totalRecords: data.totalRecords || 0,
      totalPages: data.totalPages || 1,
      pageNo: data.pageNo || 1,
      pageSize: data.pageSize || 20,
    };
  },
};

// Export the transform function for use in hooks
export { transformOrder };