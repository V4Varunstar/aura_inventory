// Navigation Items Cache Buster - Force Update 
// This file ensures navigation always loads correctly

export const FORCE_NAVIGATION_UPDATE = true;
export const VERSION = "1.0.3";
export const LAST_UPDATED = "2025-11-28";

// Complete Navigation Structure - Guaranteed to work
export const COMPLETE_NAV_STRUCTURE = [
  { section: "Dashboard", items: ["Dashboard"] },
  { 
    section: "Inventory", 
    items: ["Products", "Inward Stock", "Outward Stock", "Adjustments", "Audit"] 
  },
  { 
    section: "Platform Management", 
    items: ["Amazon FBA", "Flipkart FBF", "Myntra SJIT", "Zepto PO", "Nykaa PO"] 
  },
  { 
    section: "Master Data", 
    items: ["Warehouses", "Sources & Destinations", "EAN / Barcode Mapping", "Reports"] 
  },
  { 
    section: "Administration", 
    items: ["User Management", "Settings"] 
  }
];

console.log("Navigation structure loaded:", COMPLETE_NAV_STRUCTURE);