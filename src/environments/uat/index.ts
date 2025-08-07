
const COMMON_ENDPOINTS = {
  token: "/goauth/oauth/token",
  orders: "/console/transactions/orders",
  locations: "/api/locations",
  simulateFulfillment: "/api/fulfillment/simulate",
  fulfillment: "/api/fulfillment",
  finalize: "/api/fulfillment/finalize",
  dashboard: "/api/dashboard",
};

export const UAT_CONFIG = {
  baseURL: "https://www.uataccount.retailcloud.com",
  grantType: "password",
  clientId: "rc-app-uat",
  clientSecret: "secret",
  endpoints: COMMON_ENDPOINTS,
};
