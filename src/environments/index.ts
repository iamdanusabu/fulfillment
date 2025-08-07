const COMMON_ENDPOINTS = {
  token: "/goauth/oauth/token",
  orders: "/api/orders",
  locations: "/api/locations",
  simulateFulfillment: "/api/fulfillment/simulate",
  fulfillment: "/api/fulfillment",
  finalize: "/api/fulfillment/finalize",
  dashboard: "/api/dashboard",
};

export const DEV_CONFIG = {
  baseURL: "https://betaaccount.retailcloud.com",
  grantType: "password",
  clientId: "rc-app-beta",
  clientSecret: "secret",
  endpoints: COMMON_ENDPOINTS,
};

export const UAT_CONFIG = {
  baseURL: "https://www.uataccount.retailcloud.com",
  grantType: "password",
  clientId: "rc-app-uat",
  clientSecret: "secret",
  endpoints: COMMON_ENDPOINTS,
};

export const PROD_CONFIG = {
  baseURL: "https://www.console.retailcloud.com",
  grantType: "password",
  clientId: "rc-app-live",
  clientSecret: "secret",
  endpoints: COMMON_ENDPOINTS,
};

export const getConfig = () => {
  const env = process.env.NODE_ENV || "development";
  switch (env) {
    case "production":
      return PROD_CONFIG;
    case "uat":
      return UAT_CONFIG;
    default:
      return DEV_CONFIG;
  }
};
