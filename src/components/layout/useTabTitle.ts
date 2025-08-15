import { usePathname } from 'expo-router';
import { useMemo } from 'react';

export function useTabTitle() {
  const pathname = usePathname();

  const getTabTitle = (path: string): string => {
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/orders':
        return 'Orders';
      case '/picklist':
        return 'Picklists';
      case '/picklist/location-selection':
        return 'Select Location';
      case '/picklist/create':
        return 'Create Picklist';
      case '/picklist/packing':
        return 'Packing';
      case '/settings':
        return 'Settings';
      case '/login':
        return 'Login';
      default:
        if (path.includes('/orders/')) {
          return 'Order Details';
        }
        return 'OrderUp';
    }
  };

  const tabTitle = getTabTitle(pathname);

  return { tabTitle };
}