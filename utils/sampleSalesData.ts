// Sample data generator for testing CategoryWiseSalesPieChart
export const generateSampleSalesData = (month: string = '2025-01') => {
  return [
    // Hair Care Products
    {
      productName: "Argan Shine Hair Serum",
      category: "Hair Care",
      unitsSold: 45,
      month: month
    },
    {
      productName: "Volume Boost Shampoo",
      category: "Hair Care", 
      unitsSold: 32,
      month: month
    },
    {
      productName: "Deep Nourish Hair Mask",
      category: "Hair Care",
      unitsSold: 28,
      month: month
    },

    // Face Care Products  
    {
      productName: "Radiant Face Serum",
      category: "Face Care",
      unitsSold: 89,
      month: month
    },
    {
      productName: "Glow Moisturizer",
      category: "Face Care",
      unitsSold: 67,
      month: month
    },
    {
      productName: "Vitamin C Face Wash",
      category: "Face Care",
      unitsSold: 54,
      month: month
    },

    // Body Care Products
    {
      productName: "Aloe Hydration Lotion",
      category: "Body Care",
      unitsSold: 120,
      month: month
    },
    {
      productName: "Coconut Body Butter",
      category: "Body Care", 
      unitsSold: 78,
      month: month
    },
    {
      productName: "Exfoliating Body Scrub",
      category: "Body Care",
      unitsSold: 43,
      month: month
    },

    // Skin Care Products
    {
      productName: "Anti-Aging Night Cream",
      category: "Skin Care",
      unitsSold: 36,
      month: month
    },
    {
      productName: "Hyaluronic Acid Serum",
      category: "Skin Care",
      unitsSold: 29,
      month: month
    },

    // Eye Care Products
    {
      productName: "Under Eye Brightening Cream",
      category: "Eye Care",
      unitsSold: 22,
      month: month
    },
    {
      productName: "Eye Makeup Remover",
      category: "Eye Care",
      unitsSold: 18,
      month: month
    },

    // Lip Care Products
    {
      productName: "Nourishing Lip Balm",
      category: "Lip Care",
      unitsSold: 95,
      month: month
    },
    {
      productName: "Matte Lip Stain",
      category: "Lip Care",
      unitsSold: 41,
      month: month
    }
  ];
};

export const SAMPLE_CATEGORY_REFERENCE = [
  {
    category: "Hair Care",
    products: ["Argan Shine Hair Serum", "Volume Boost Shampoo", "Deep Nourish Hair Mask", "Keratin Treatment Oil"]
  },
  {
    category: "Face Care", 
    products: ["Radiant Face Serum", "Glow Moisturizer", "Vitamin C Face Wash", "Retinol Night Serum"]
  },
  {
    category: "Body Care",
    products: ["Aloe Hydration Lotion", "Coconut Body Butter", "Exfoliating Body Scrub", "Firming Body Oil"]
  },
  {
    category: "Skin Care",
    products: ["Anti-Aging Night Cream", "Hyaluronic Acid Serum", "Collagen Booster", "SPF 50 Sunscreen"]
  },
  {
    category: "Eye Care",
    products: ["Under Eye Brightening Cream", "Eye Makeup Remover", "Lash Growth Serum", "Dark Circle Corrector"]
  },
  {
    category: "Lip Care", 
    products: ["Nourishing Lip Balm", "Matte Lip Stain", "Glossy Lip Treatment", "Overnight Lip Repair"]
  }
];