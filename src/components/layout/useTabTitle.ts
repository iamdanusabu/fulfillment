
import { usePathname } from 'expo-router';
import { useMemo } from 'react';

export function useTabTitle() {
  const pathname = usePathname();

  const tabTitle = useMemo(() => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/orders':
        return 'Orders';
      case '/picklist':
        return 'Picklists';
      case '/settings':
        return 'Settings';
      case '/login':
        return 'Login';
      default:
        if (pathname.startsWith('/orders/')) {
          return 'Order Details';
        }
        if (pathname.startsWith('/picklist/')) {
          return 'Picklist';
        }
        return 'OrderUp';
    }
  }, [pathname]);

  return { tabTitle, pathname };
}
