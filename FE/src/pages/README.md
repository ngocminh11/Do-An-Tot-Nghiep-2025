# Pages Directory Structure

This directory contains all the main pages/routes of the application. Each page is a container component that:
- Handles routing
- Manages page-level state
- Composes smaller components together
- Handles page-level data fetching

## Structure

```
pages/
├── auth/              # Authentication related pages
│   ├── Login.js
│   └── Register.js
├── user/              # User-facing pages
│   ├── Home.js
│   ├── Profile.js
│   ├── Products.js
│   ├── ProductDetail.js
│   ├── Cart.js
│   ├── Checkout.js
│   ├── Orders.js
│   └── Wishlist.js
├── static/            # Static pages
│   ├── About.js
│   ├── Contact.js
│   ├── FAQ.js
│   ├── Privacy.js
│   └── Terms.js
└── admin/             # Admin dashboard pages
    ├── Dashboard.js
    ├── Products.js
    ├── Orders.js
    ├── Users.js
    └── Categories.js
``` 