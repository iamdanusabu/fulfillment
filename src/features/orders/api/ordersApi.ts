
import { fetchWithToken } from '../../../shared/services/fetchWithToken';
import { Order, PaginatedResponse } from '../../../shared/types';

export const ordersApi = {
  async getOrders(params: {
    pageNo?: number;
    limit?: number;
    source?: string;
    status?: string;
    paymentStatus?: string;
    hasFulfilmentJob?: boolean;
    expand?: string;
    pagination?: boolean;
  } = {}): Promise<PaginatedResponse<Order>> {
    const defaultParams = {
      source: 'Shopify,Tapin2,Breakaway,bigcommerce,Ecwid,PHONE ORDER,DELIVERY,BAR TAB,TIKT,TABLE,OTHER,MANUAL,FanVista,QSR',
      limit: 20,
      pageNo: 1,
      expand: 'item,bin,location_hint,payment',
      pagination: true,
      hasFulfilmentJob: false,
      status: 'Initiated,Sent for Processing',
      paymentStatus: 'PAID,UNPAID',
      ...params
    };
    
    const searchParams = new URLSearchParams();
    Object.entries(defaultParams).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return await fetchWithToken(`/console/transactions/orders?${searchParams.toString()}`);
  }
};
