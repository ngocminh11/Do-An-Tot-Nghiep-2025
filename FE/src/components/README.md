# Components Directory Structure

This directory contains all reusable components of the application. Components are organized by their functionality and scope.

## Structure

```
components/
├── common/              # Shared components used across the app
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   ├── Modal/
│   ├── Loading/
│   └── ErrorBoundary/
├── layout/             # Layout components
│   ├── Header/
│   ├── Footer/
│   ├── Sidebar/
│   └── Navigation/
├── product/            # Product-related components
│   ├── ProductCard/
│   ├── ProductList/
│   ├── ProductDetail/
│   ├── ProductFilter/
│   └── ProductSearch/
├── cart/               # Shopping cart components
│   ├── CartItem/
│   ├── CartSummary/
│   └── CheckoutForm/
├── order/              # Order-related components
│   ├── OrderItem/
│   ├── OrderSummary/
│   └── OrderStatus/
├── user/               # User-related components
│   ├── Profile/
│   ├── AddressForm/
│   └── PaymentMethod/
└── admin/              # Admin dashboard components
    ├── Dashboard/
    ├── DataTable/
    └── FormControls/
```

## Component Guidelines

1. Each component should be in its own directory with:
   - index.js (main component file)
   - styles.css (component-specific styles)
   - types.js (TypeScript types if using TS)
   - tests/ (component tests)

2. Components should be:
   - Reusable
   - Self-contained
   - Follow a single responsibility principle
   - Include proper prop-types or TypeScript types
   - Include documentation 