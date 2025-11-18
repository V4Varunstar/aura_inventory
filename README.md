<<<<<<< HEAD
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1lusZwk0gbxLRsa-i4w-dODYpo-KHD4Ym

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
=======
# Aura Inventory
Personal Care & Beauty Brand Inventory Management System

## Features

### Product Management
- **Single Product Entry**: Add/edit products individually with full details
- **Bulk Product Upload**: Import multiple products at once using Excel files
  - Upload `.xlsx` files with product data
  - Automatic validation of required fields (SKU, name, category, price, etc.)
  - Duplicate detection (within file and existing database)
  - Preview and confirmation before import
  - Detailed import results with success/failure summary
  - Download sample Excel template
  
For detailed instructions on bulk upload, see [Bulk Upload Guide](docs/BULK_UPLOAD_GUIDE.md)

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/V4Varunstar/aura_inventory.git
   cd aura_inventory
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Bulk Product Upload

The bulk upload feature allows you to import multiple products at once:

1. Navigate to **Products** page
2. Click **"Upload Excel"** button
3. Upload your Excel file or download the template
4. Review validation and duplicates
5. Confirm and import

### Excel File Format

Required columns:
- `sku` - Unique product code
- `name` - Product name
- `category` - Hair Care, Skin Care, Face Care, or Body Care
- `unit` - pcs, ml, or g
- `mrp` - Maximum retail price
- `costPrice` - Cost price
- `lowStockThreshold` - Minimum stock alert level

Optional columns:
- `batchTracking` - Yes/No for batch tracking
- `imageUrl` - Product image URL

See [Bulk Upload Guide](docs/BULK_UPLOAD_GUIDE.md) for complete documentation.
>>>>>>> 876326604e13d97846f9064870bbcbd0127b58f1
