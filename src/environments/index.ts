import { DEV_CONFIG } from './dev';
import { UAT_CONFIG } from './uat';
import { PROD_CONFIG } from './prod';

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

export { DEV_CONFIG, UAT_CONFIG, PROD_CONFIG };