
import { usePathname } from 'expo-router';
import { useMemo } from 'react';

export function useTabTitle() {
  const pathname = usePathname();

  const tabTitle = useMemo(() => {
    switch (pathname) {
      case '/(tabs)/dashboard':
        return 'Dashboard';
      case '/(tabs)/orders':
        return 'Orders';
      case '/(tabs)/picklist':
        return 'Picklists';
      case '/(tabs)/settings':
        return 'Settings';
      case '/login':
        return 'Login';
      default:
        if (pathname.startsWith('/(tabs)/orders/')) {
          return 'Order Details';
        }
        if (pathname.startsWith('/(tabs)/picklist/')) {
          return 'Picklist';
        }
        return 'OrderUp';
    }
  }, [pathname]);

  return { tabTitle, pathname };
}
