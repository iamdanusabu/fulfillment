import { usePathname } from 'expo-router';
import { useMemo } from 'react';

export const useTabTitle = () => {
  const pathname = usePathname();

  const getTabInfo = (path: string) => {
    switch (path) {
      case '/dashboard':
        return { title: 'Dashboard', showBackButton: false };
      case '/orders':
        return { title: 'Orders', showBackButton: true };
      case '/picklist':
        return { title: 'Picklist', showBackButton: false };
      case '/settings':
        return { title: 'Settings', showBackButton: false };
      default:
        if (path.startsWith('/orders/')) {
          return { title: 'Order Details', showBackButton: true };
        }
        if (path.startsWith('/picklist/')) {
          return { title: 'Picklist', showBackButton: true };
        }
        return { title: 'App', showBackButton: false };
    }
  };

  return getTabInfo(pathname);
};