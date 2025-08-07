
const COMMON_ENDPOINTS = {
  token: "/goauth/oauth/token",
  orders: "/console/transactions/orders",
  locations: "/api/locations",
  simulateFulfillment: "/api/fulfillment/simulate",
  fulfillment: "/api/fulfillment",
  finalize: "/api/fulfillment/finalize",
  dashboard: "/api/dashboard",
};

export const PROD_CONFIG = {
  baseURL: "https://www.console.retailcloud.com",
  grantType: "password",
  clientId: "rc-app-live",
  clientSecret: "secret",
  endpoints: COMMON_ENDPOINTS,
};
