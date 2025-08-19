
# Project Folder Structure

```
orderup-app/
├── .config/
│   ├── eas-cli-nodejs/
│   │   └── user-settings.json
│   └── npm/
│       └── node_global/
│           ├── bin/
│           │   └── eas
│           └── lib/
├── .expo/
├── assets/
│   ├── fonts/
│   │   └── SpaceMono-Regular.ttf
│   └── images/
│       ├── adaptive-icon.png
│       ├── favicon.png
│       ├── icon.png
│       ├── partial-react-logo.png
│       ├── react-logo.png
│       ├── react-logo@2x.png
│       ├── react-logo@3x.png
│       └── splash-icon.png
├── attached_assets/
│   └── [Various attached files and images]
├── src/
│   ├── app/ (Expo Router - File-based routing)
│   │   ├── orders/
│   │   │   ├── [orderId].tsx
│   │   │   └── detail.tsx
│   │   ├── picklist/
│   │   │   ├── create.tsx
│   │   │   ├── location-selection.tsx
│   │   │   └── packing.tsx
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── orders.tsx
│   │   ├── picklist.tsx
│   │   └── settings.tsx
│   ├── components/
│   │   └── layout/
│   │       ├── AppToolbar.tsx
│   │       ├── index.ts
│   │       └── useTabTitle.ts
│   ├── contexts/
│   │   ├── StoreContext.tsx
│   │   └── ThemeContext.tsx
│   ├── environments/
│   │   ├── dev/
│   │   │   └── index.ts
│   │   ├── prod/
│   │   │   └── index.ts
│   │   ├── uat/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   └── authApi.ts
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   └── screens/
│   │   │       └── LoginScreen.tsx
│   │   ├── dashboard/
│   │   │   ├── api/
│   │   │   │   └── dashboardApi.ts
│   │   │   ├── hooks/
│   │   │   │   └── useDashboard.ts
│   │   │   └── screens/
│   │   │       └── DashboardScreen.tsx
│   │   ├── orders/
│   │   │   ├── api/
│   │   │   │   └── ordersApi.ts
│   │   │   ├── components/
│   │   │   │   └── QRCodeScanner.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useOrderFilters.ts
│   │   │   │   ├── useOrders.ts
│   │   │   │   ├── usePaginatedOrders.ts
│   │   │   │   └── useQRScanner.ts
│   │   │   └── screens/
│   │   │       ├── OrderDetailScreen.tsx
│   │   │       └── OrdersScreen.tsx
│   │   ├── picklist/
│   │   │   ├── api/
│   │   │   │   └── picklistApi.ts
│   │   │   ├── hooks/
│   │   │   │   └── usePicklist.ts
│   │   │   └── screens/
│   │   │       ├── CreatePicklistScreen.tsx
│   │   │       ├── LocationSelectionScreen.tsx
│   │   │       ├── PackingScreen.tsx
│   │   │       └── PicklistIndexScreen.tsx
│   │   └── settings/
│   │       ├── hooks/
│   │       │   └── useSettings.ts
│   │       └── screens/
│   │           └── SettingsScreen.tsx
│   └── shared/
│       ├── components/
│       │   ├── BigCommerceIcon.tsx
│       │   ├── CommonHeader.tsx
│       │   ├── EcwidIcon.tsx
│       │   ├── Header.tsx
│       │   ├── OrderUpLogo.tsx
│       │   ├── ShopifyIcon.tsx
│       │   └── Sidebar.tsx
│       ├── services/
│       │   ├── fetchWithToken.ts
│       │   └── paginatedFetcher.ts
│       └── types/
│           └── index.ts
├── .gitignore
├── .replit
├── API_CHECKLIST.md
├── README.md
├── app.json
├── eas.json
├── eslint.config.js
├── generated-icon.png
├── network_security_config.xml
├── package-lock.json
├── package.json
├── replit.nix
└── tsconfig.json
```

## Key Structure Overview

### Core Architecture
- **src/app/**: Expo Router file-based routing system
- **src/features/**: Feature-based modules (auth, orders, picklist, dashboard, settings)
- **src/shared/**: Reusable components, services, and types
- **src/environments/**: Environment-specific configurations

### Feature Structure Pattern
Each feature follows a consistent pattern:
```
feature/
├── api/          # API layer for the feature
├── hooks/        # Custom React hooks
├── components/   # Feature-specific components (if needed)
└── screens/      # Screen components
```

### Environment Configuration
- **dev/**: Development environment settings
- **uat/**: User Acceptance Testing environment
- **prod/**: Production environment settings

### Shared Resources
- **components/**: Reusable UI components
- **services/**: Common services (API utilities, data fetching)
- **types/**: TypeScript type definitions

This structure follows React Native/Expo best practices with a feature-driven architecture for scalability and maintainability.
