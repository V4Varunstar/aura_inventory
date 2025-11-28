# Client Testing Checklist - Aura Inventory SaaS

## 🔗 Production URLs
- **Main App**: https://aura-inventory-rpdwrex3o-v4varunstars-projects.vercel.app
- **Alternative**: https://aura-inventory.vercel.app

---

## ✅ Testing Checklist for Client

### 1. Landing Page Testing
- [ ] Visit the root URL (should show landing page, not login)
- [ ] Click "Get Started Free" button → Should go to Login page
- [ ] Click "View Pricing" button → Should go to Pricing page
- [ ] Scroll through all sections:
  - [ ] Hero section visible
  - [ ] 6 feature cards display correctly
  - [ ] 3 customer testimonials show
  - [ ] CTA section with "Start Your Free Trial"
  - [ ] Footer with legal links (Privacy, Terms, Refund)
- [ ] Click each footer link to verify pages load:
  - [ ] Privacy Policy
  - [ ] Terms of Service
  - [ ] Refund Policy

**Expected Result**: Professional landing page loads, all links work, responsive on mobile

---

### 2. Pricing Page Testing
- [ ] Visit `/#/pricing` from landing page
- [ ] Verify 4 pricing cards display:
  - [ ] Free (₹0, 1 user, 1 warehouse, 100 products)
  - [ ] Starter (₹999/mo, 3 users, 3 warehouses, 1,000 products)
  - [ ] Pro (₹2,999/mo, 10 users, 10 warehouses, 10,000 products) - "Most Popular" badge
  - [ ] Business (₹9,999/mo, Unlimited)
- [ ] Toggle billing frequency:
  - [ ] Monthly → Yearly (should show 20% discount on all paid plans)
  - [ ] Yearly → Monthly (prices revert)
- [ ] Scroll to comparison table:
  - [ ] All features listed in rows
  - [ ] Checkmarks/X marks show correctly
  - [ ] Free column shows limited features
  - [ ] Business column shows all features
- [ ] Scroll to FAQ section:
  - [ ] 6 questions display
  - [ ] Click each question → answer expands
  - [ ] Click again → answer collapses
- [ ] "Still Have Questions?" CTA section visible
- [ ] Footer links work (Privacy, Terms, Refund)

**Expected Result**: All 4 plans show correct pricing, toggle works, table is readable

---

### 3. Legal Pages Testing

#### Privacy Policy (`/#/privacy`)
- [ ] Page loads with header "Privacy Policy"
- [ ] "Last Updated" date shows
- [ ] All 11 sections display:
  1. Information We Collect
  2. How We Use Your Information
  3. Data Security
  4. Your Rights
  5. Cookies and Tracking
  6. Third-Party Services
  7. Data Retention
  8. International Data Transfers
  9. Children's Privacy
  10. Changes to This Policy
  11. Contact Us
- [ ] "Back to Home" button → goes to landing page
- [ ] "Contact Support" button → goes to contact page (or shows email)

#### Terms of Service (`/#/terms`)
- [ ] Page loads with header "Terms of Service"
- [ ] All 15 sections display:
  1. Acceptance of Terms
  2. Description of Service
  3. User Accounts
  4. License Grant
  5. Billing and Payment
  6. Free Trial
  7. Pricing Changes
  8. Acceptable Use Policy
  9. Data and Privacy
  10. Service Availability
  11. Intellectual Property
  12. Termination
  13. Disclaimers and Limitations
  14. Indemnification
  15. Governing Law
- [ ] Navigation buttons work

#### Refund Policy (`/#/refund`)
- [ ] Page loads with header "Refund Policy"
- [ ] All 12 sections display:
  1. 30-Day Money-Back Guarantee
  2. Free Trial Policy
  3. Refund Eligibility
  4. Requesting a Refund
  5. Refund Processing
  6. Cancellation Policy
  7. Downgrade Policy
  8. Billing Errors
  9. Failed Payments
  10. Exceptional Circumstances
  11. Data Retention
  12. Contact Information
- [ ] Key policies clear:
  - [ ] 30-day guarantee for annual plans
  - [ ] No refunds on monthly plans (can cancel anytime)
  - [ ] 5-7 business days processing
- [ ] Support email visible: support@aurainventory.com

**Expected Result**: All legal pages load, content is readable, professional formatting

---

### 4. Login & Authentication Testing
- [ ] Visit `/#/login`
- [ ] Enter credentials:
  - Email: `admin@aura.com`
  - Password: `password123`
- [ ] Click "Login" → Should redirect to `/dashboard`
- [ ] Verify user is logged in (avatar in top-right)
- [ ] Navigate back to root `/` → Should redirect to `/dashboard` (not landing page)

**Expected Result**: Login works, authenticated users see dashboard instead of landing page

---

### 5. Dashboard & Main App Testing
- [ ] Dashboard loads after login
- [ ] Top stats cards show:
  - [ ] Total Products
  - [ ] Total Stock Value
  - [ ] Low Stock Items
  - [ ] Warehouses
- [ ] Sidebar menu visible with all pages:
  - [ ] Dashboard
  - [ ] Products
  - [ ] Inward
  - [ ] Outward
  - [ ] Adjustments
  - [ ] Warehouses
  - [ ] Users
  - [ ] Reports
- [ ] Header shows:
  - [ ] User avatar with name "Admin User"
  - [ ] Search bar
  - [ ] Dropdown menu with Logout

**Expected Result**: Dashboard functional, all navigation working

---

### 6. Products Page Testing
- [ ] Click "Products" in sidebar
- [ ] Verify product table shows sample data
- [ ] Click "Add Product" button → Modal opens
- [ ] Click "Upload Excel" button → Bulk upload modal opens
- [ ] Test bulk upload:
  - [ ] Click "Download Sample Template" → Excel file downloads
  - [ ] Upload the template (without editing) → Should process successfully
  - [ ] Upload with invalid data → Should show validation errors

**Expected Result**: Products page loads, bulk upload feature works

---

### 7. Multi-Tenant Features Testing (Backend)

**Note**: Currently using mock data. Real testing requires Firebase implementation.

#### Company Context
- [ ] Open browser console (F12)
- [ ] Look for logs: "CompanyContext: Fetching company data..."
- [ ] Should show:
  ```
  Company: Demo Beauty Store
  Plan: pro
  Users: 7/10 (70%)
  Warehouses: 6/10 (60%)
  Products: 234/10000 (2%)
  ```

#### Plan Limits
- [ ] Check if usage indicators show anywhere (Dashboard or header)
- [ ] If at 80%+ of any limit → "Approaching limit" banner should show
- [ ] Try adding item when at limit → Should be blocked with "Upgrade" prompt

**Expected Result**: Company data loads in console, usage tracking works

---

### 8. RBAC Testing (Role-Based Access)

**Note**: Requires changing role in mock data to test different roles

#### As Admin (Current)
- [ ] Can access `/users` page
- [ ] Can see "Add User", "Edit", "Delete" buttons
- [ ] Can access all pages

#### As Manager (Change role in code)
- [ ] Can access most pages except `/users`
- [ ] Cannot add/remove users
- [ ] Can manage products and warehouses

#### As Viewer (Read-only)
- [ ] Can view dashboards and reports
- [ ] Cannot see "Add" buttons
- [ ] Cannot edit/delete items

**Expected Result**: Different roles see different UI elements

---

### 9. Mobile Responsiveness Testing
- [ ] Open on phone or resize browser to mobile size (375px width)
- [ ] Landing page:
  - [ ] Hamburger menu appears
  - [ ] Hero text readable
  - [ ] Feature cards stack vertically
  - [ ] Footer readable
- [ ] Pricing page:
  - [ ] Pricing cards stack vertically
  - [ ] Toggle button accessible
  - [ ] Table scrolls horizontally
- [ ] Dashboard (logged in):
  - [ ] Sidebar hidden by default
  - [ ] Hamburger button shows sidebar
  - [ ] Stats cards stack vertically
  - [ ] Tables scroll horizontally

**Expected Result**: All pages usable on mobile devices

---

### 10. Dark Mode Testing
- [ ] Landing page should auto-detect system theme
- [ ] If system is dark → landing page uses dark colors
- [ ] If system is light → landing page uses light colors
- [ ] In main app (after login):
  - [ ] Look for theme toggle (if implemented)
  - [ ] Or check if it follows system preference

**Expected Result**: Dark mode looks good, no white flashes

---

## 🐛 Known Issues / Limitations

### Current Limitations
1. **Payment Integration**: "Upgrade" buttons link to `/contact` page (not built yet)
   - **Fix Needed**: Integrate Razorpay checkout
   - **Workaround**: For now, use "Contact Sales" flow

2. **Firebase Mock Data**: All data is hardcoded in context
   - **Fix Needed**: Connect to real Firestore database
   - **Workaround**: Demo works, but no data persistence

3. **Email Sending**: No emails sent for notifications/alerts
   - **Fix Needed**: Set up SendGrid/Mailgun + Cloud Functions
   - **Workaround**: Show in-app notifications only

4. **Audit Log Viewer**: No UI to view audit logs yet
   - **Fix Needed**: Create `/audit-logs` page
   - **Workaround**: Logs are created in background (check Firestore console)

5. **Company Settings**: No settings page to change company name, logo, etc.
   - **Fix Needed**: Create `/settings` page
   - **Workaround**: Use Firebase console to update company data

### Minor Issues
- **Build Warning**: "Some chunks are larger than 500 kB" - Not breaking, just optimization needed
- **Search Bar**: Visible but not functional (needs search implementation)
- **Profile Link**: Header dropdown has "Profile" link, but page not created yet

---

## 📊 What to Show Your Client

### Elevator Pitch
> "Aura Inventory is now a **complete SaaS platform** with:
> - Professional landing page to attract new customers
> - 4 subscription tiers (Free to Business) with transparent pricing
> - Multi-tenant architecture - each customer gets their own workspace
> - Role-based access control - admin, manager, employee, viewer roles
> - Automatic usage tracking and plan enforcement
> - Full legal compliance (Privacy, Terms, Refund policies)
> - All existing features (bulk upload, reporting, etc.) still work perfectly"

### Demo Flow (15 minutes)
1. **Start at Landing Page** (2 min)
   - Show hero, features, testimonials
   - Click "View Pricing"

2. **Pricing Page** (3 min)
   - Walk through each plan
   - Toggle monthly/yearly
   - Show FAQ section
   - Point out "30-day money-back guarantee"

3. **Legal Pages** (1 min)
   - Quick scroll through Privacy Policy
   - Mention: "These protect both you and your customers legally"

4. **Login & Dashboard** (2 min)
   - Login with demo account
   - Show dashboard stats
   - Point out company plan indicator (if visible)

5. **Products & Bulk Upload** (3 min)
   - Show product list
   - Click "Upload Excel"
   - Download template
   - Upload → show success

6. **RBAC Demo** (2 min)
   - Show how admin sees all features
   - Mention: "Managers and employees see limited options based on their role"

7. **Next Steps** (2 min)
   - "To go live, we need to:"
     1. Integrate Razorpay for payments
     2. Connect real Firebase database
     3. Set up email notifications
   - "After that, you can start onboarding real customers!"

---

## 🚀 Deployment URLs

### Current Deployment
- **Production**: https://aura-inventory-rpdwrex3o-v4varunstars-projects.vercel.app
- **Alternative**: https://aura-inventory.vercel.app

### Access
- **No Vercel login needed** - clients can access directly
- **Demo Credentials**:
  - Email: `admin@aura.com`
  - Password: `password123`

### Sharing with Client
1. Send production URL
2. Provide demo login credentials
3. Attach this checklist as PDF
4. Schedule 15-min walkthrough call

---

## 📝 Feedback Collection

After client testing, ask:
1. **First Impressions**: "What's your initial reaction to the landing page?"
2. **Pricing**: "Do the pricing tiers make sense? Should we add/remove any?"
3. **Legal Pages**: "Any changes needed to Privacy/Terms/Refund policies?"
4. **Missing Features**: "What features are critical before launch?"
5. **Design**: "Any UI/UX improvements you'd like?"

---

## ✅ Sign-off Checklist (Before Going Live)

- [ ] Client approves landing page design
- [ ] Pricing confirmed (amounts, features per plan)
- [ ] Legal pages reviewed by lawyer (if needed)
- [ ] Demo account works for all features
- [ ] Razorpay integrated and tested
- [ ] Firebase connected (real database)
- [ ] Email notifications working
- [ ] Mobile responsiveness verified
- [ ] Domain name purchased (e.g., aurainventory.com)
- [ ] Custom domain connected to Vercel
- [ ] SSL certificate active (HTTPS)
- [ ] Analytics added (Google Analytics / Mixpanel)
- [ ] Error tracking setup (Sentry)
- [ ] Support email configured (support@aurainventory.com)
- [ ] WhatsApp business number ready
- [ ] Terms, Privacy, Refund pages linked in footer
- [ ] SEO meta tags added (title, description, OG image)

---

**Last Updated**: 2025-01-XX
**Tested By**: [Your Name]
**Client**: [Client Company Name]
**Status**: Ready for Client Review ✅
