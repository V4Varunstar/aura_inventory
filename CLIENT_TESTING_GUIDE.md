# Aura Inventory Management System - Client Testing Guide

## 🔗 Access Information

**Live Application URL:**  
https://aura-inventory-f2a063jpc-v4varunstars-projects.vercel.app

**Test Credentials:**
- Email: `admin@aura.com`
- Password: `password123`

---

## 🧪 Testing Checklist

### ✅ 1. Login & Dashboard
- [ ] Login with provided credentials
- [ ] View dashboard metrics (Total Stock Value, Units, etc.)
- [ ] Check charts and graphs
- [ ] Review recent activities

### ✅ 2. Products Management
- [ ] View product list
- [ ] Click "Add Product" to create a single product
- [ ] Edit an existing product
- [ ] Check product details (SKU, price, category, etc.)

### ✅ 3. **Bulk Upload Feature (NEW)** ⭐
- [ ] Click "Upload Excel" button
- [ ] Download the template file
- [ ] Open template in Excel and review the format
- [ ] Fill in 2-3 sample products (or use the provided samples)
- [ ] Upload the Excel file
- [ ] Observe validation results:
  - Valid products count
  - Error detection
  - Duplicate SKU detection
- [ ] Review the preview table
- [ ] Confirm and complete the import
- [ ] Check the import results summary
- [ ] Verify imported products appear in the product list

### ✅ 4. Warehouses
- [ ] View warehouse list
- [ ] Add a new warehouse
- [ ] Edit warehouse details

### ✅ 5. Inward/Outward Operations
- [ ] Create inward entry (stock in)
- [ ] Create outward entry (stock out)
- [ ] Check different destinations/sources

### ✅ 6. Reports
- [ ] Generate stock report
- [ ] Try different report types
- [ ] Download reports

### ✅ 7. Users Management
- [ ] View user list
- [ ] Check different roles (Admin, Manager, Staff, Viewer)
- [ ] Add/edit users

### ✅ 8. UI/UX Testing
- [ ] Test on desktop browser
- [ ] Test on mobile device (if available)
- [ ] Try dark mode (if toggle available)
- [ ] Check responsiveness
- [ ] Test navigation between pages

---

## 📋 Sample Data for Bulk Upload Testing

If you want to test the bulk upload feature, here's sample data you can use:

| sku | name | category | unit | mrp | costPrice | lowStockThreshold | batchTracking | imageUrl |
|-----|------|----------|------|-----|-----------|-------------------|---------------|----------|
| TEST-001 | Test Hair Serum | Hair Care | ml | 599 | 150 | 50 | Yes | |
| TEST-002 | Test Face Cream | Face Care | g | 899 | 220 | 30 | No | |
| TEST-003 | Test Body Lotion | Body Care | ml | 450 | 120 | 100 | No | |

**Valid Categories:** Hair Care, Skin Care, Face Care, Body Care  
**Valid Units:** pcs, ml, g  
**Batch Tracking:** Yes, No, true, false

---

## 🐛 Bug Reporting

If you encounter any issues, please note:
1. **What you were doing** - Step-by-step actions
2. **What happened** - The error or unexpected behavior
3. **Expected behavior** - What should have happened
4. **Browser/Device** - Chrome, Firefox, Safari, Mobile, etc.
5. **Screenshots** - If possible

---

## 💡 Key Features Highlights

### Bulk Product Upload (NEW)
- Upload multiple products at once using Excel
- Automatic validation of all fields
- Duplicate SKU detection
- Preview before importing
- Detailed success/failure reporting
- Download template with instructions

### Dashboard
- Real-time inventory metrics
- Visual charts and analytics
- Recent activity tracking

### Multi-Warehouse Support
- Track inventory across multiple locations
- Warehouse-specific stock levels

### Role-Based Access
- Admin, Manager, Warehouse Staff, Viewer roles
- Permission-based feature access

---

## 📞 Support

For questions or issues during testing:
- **Email:** [your-email@example.com]
- **Phone:** [your-phone-number]
- **Available:** [your-availability]

---

## 🎯 Testing Focus Areas

Please pay special attention to:
1. **Bulk Upload Feature** - This is the newest addition
2. **Data Validation** - Check if error messages are clear
3. **User Experience** - Is the interface intuitive?
4. **Performance** - Does it load quickly?
5. **Mobile Responsiveness** - Does it work well on phones?

---

Thank you for testing! Your feedback is valuable and will help us improve the system.

**Last Updated:** November 18, 2025  
**Version:** 1.0.0 with Bulk Upload Feature
