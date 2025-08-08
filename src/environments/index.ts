import { DEV_CONFIG } from './dev';
import { UAT_CONFIG } from './uat';
import { PROD_CONFIG } from './prod';

export const COMMON_ENDPOINTS = {
  token: "/goauth/oauth/token",
  orders: "/console/transactions/orders",
  locations: "/api/locations",
  stores: "/console/business/stores",
  warehouses: "/console/business/warehouses",
  simulateFulfillment: "/api/fulfillment/simulate",
  fulfillment: "/api/fulfillment",
  finalize: "/api/fulfillment/finalize",
  dashboard: "/api/dashboard",
};

export const getConfig = () => {
  const env = process.env.NODE_ENV || "development";
  switch (env) {
    case "production":
      return { ...PROD_CONFIG, endpoints: COMMON_ENDPOINTS };
    case "uat":
      return { ...UAT_CONFIG, endpoints: COMMON_ENDPOINTS };
    default:
      return { ...DEV_CONFIG, endpoints: COMMON_ENDPOINTS };
  }
};

export { DEV_CONFIG, UAT_CONFIG, PROD_CONFIG };