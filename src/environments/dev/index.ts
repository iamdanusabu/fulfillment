
const COMMON_ENDPOINTS = {
  token: "/goauth/oauth/token",
  orders: "/console/transactions/orders",
  locations: "/api/locations",
  simulateFulfillment: "/api/fulfillment/simulate",
  fulfillment: "/api/fulfillment",
  finalize: "/api/fulfillment/finalize",
  dashboard: "/api/dashboard",
};

export const DEV_CONFIG = {
  baseURL: "https://betaaccount.retailcloud.com",
  grantType: "password",
  clientId: "rc-cportal-beta",
  clientSecret: "secret",
  endpoints: COMMON_ENDPOINTS,
};
