# Quick Setup & Demo Guide

## Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Demo Instructions

### Consumer Demo Flow

1. **Register & Login**
   - Navigate to `http://localhost:3000/auth/register`
   - Fill in the registration form
   - Or use test account: `consumer@scp.kz` / `consumer123`

2. **Search Items & Suppliers**
   - Go to "Catalog" page
   - Use the search box to find products by name
   - Use the supplier dropdown to filter by supplier
   - Click "Add to Cart" on products you want

3. **Send Link Request**
   - Go to "Links" page
   - Click "Request Link" button
   - Select a supplier from dropdown
   - Click "Send Request"
   - You'll see it in "Pending Requests" section

4. **Chat & Send Messages**
   - Go to "Chat" page
   - Select a conversation from the list
   - Type a message and click send
   - Messages appear in real-time

5. **Create Order & Checkout**
   - Go to "Orders" page
   - Click "New Order" button
   - Add products from the available list
   - Adjust quantities using +/- buttons
   - Add order notes if needed
   - Click "Place Order"
   - View order in order history

### Supplier Demo Flow

1. **Login as Supplier**
   - Use one of these accounts:
     - Owner: `owner@scp.kz` / `owner123`
     - Manager: `admin@scp.kz` / `admin123`
     - Sales: `sales@scp.kz` / `sales123`

2. **Add Manager/Sales Person**
   - Go to "Administration" page
   - Click "Add User" button
   - Fill in: name, email, role (Manager/Sales), password
   - Click "Add User"
   - New user appears in team members list

3. **Manage Products**
   
   **Add Product:**
   - Go to "Catalog" page
   - Click "Add Product" button
   - Fill in all fields (name, unit, description, price, stock, MOQ)
   - Click "Add Product"
   
   **Edit Product:**
   - Find a product card
   - Click "Edit" button
   - Modify any fields
   - Click "Update Product"
   
   **Remove Product:**
   - Find a product card
   - Click the trash icon
   - Product is removed from catalog

4. **Approve/Reject Link Requests**
   - Go to "Links" page
   - See "Pending Approval" section
   - Review consumer information
   - Click "Approve" or "Decline"
   - Approved links move to "Active Links"

5. **Manage Orders** (Optional)
   - Go to "Orders" page
   - View incoming orders from consumers
   - Click "Accept" or "Reject" on pending orders

## Features Checklist

### Consumer ✅
- [x] Signup & Login
- [x] Search items
- [x] Search suppliers
- [x] Send link request
- [x] Show chat
- [x] Send messages
- [x] Create order
- [x] Checkout

### Supplier ✅
- [x] Signup & Login
- [x] Add manager
- [x] Add sales person
- [x] Add item
- [x] Edit item
- [x] Update item
- [x] Remove item
- [x] Approve link request
- [x] Reject link request

## Tips for Video Recording

1. **Have Two Browser Windows**: One for consumer, one for supplier (use incognito mode for the second)
2. **Prepare Test Data**: Have product names, order details ready
3. **Show Real-Time Updates**: Demonstrate link approval by showing both accounts
4. **Highlight Key Features**: Point out search, filters, cart counter, status badges
5. **Keep It Smooth**: Have accounts logged in before recording to save time

## Test Accounts Reference

| Role | Email | Password |
|------|-------|----------|
| Consumer | consumer@scp.kz | consumer123 |
| Owner | owner@scp.kz | owner123 |
| Manager | admin@scp.kz | admin123 |
| Sales | sales@scp.kz | sales123 |

## Troubleshooting

**Issue**: TypeScript errors in VSCode  
**Solution**: Run `npm install` first, then restart VSCode

**Issue**: Page not loading  
**Solution**: Make sure dev server is running (`npm run dev`)

**Issue**: Data not persisting  
**Solution**: Don't clear browser localStorage, or re-login to create fresh data

**Issue**: Links/Messages not appearing  
**Solution**: These features use localStorage - make sure you're using the same browser session

## Project Structure

```
frontend/
├── app/
│   ├── auth/              # Login & Register pages
│   ├── dashboard/         # Main app features
│   │   ├── admin/         # User management
│   │   ├── catalog/       # Product browsing & CRUD
│   │   ├── chat/          # Messaging
│   │   ├── links/         # Link requests
│   │   └── orders/        # Order management
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home/Landing page
├── components/            # Reusable UI components
├── lib/                   # Utilities
└── types/                 # TypeScript definitions
```

All features are fully functional and ready for demonstration! 🎉
