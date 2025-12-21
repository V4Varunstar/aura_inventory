import React from 'react';

// User data
export const CURRENT_USER = {
  name: "Alex Morgan",
  email: "alex@inventory.com", 
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format",
  role: "Super Admin"
};

// KPI Stats data
export const KPI_STATS = [
  {
    title: "Total Companies",
    value: "1,240",
    change: "+12%",
    changeType: "positive" as const,
    icon: "apartment",
    iconColorClass: "text-green-500",
    iconBgClass: "bg-green-100",
    changeLabel: "vs last month"
  },
  {
    title: "Active",
    value: "1,100", 
    change: "+5%",
    changeType: "positive" as const,
    icon: "check_circle",
    iconColorClass: "text-emerald-400",
    iconBgClass: "bg-emerald-100",
    changeLabel: "vs last week"
  },
  {
    title: "Suspended",
    value: "45",
    change: "+2%", 
    changeType: "negative" as const,
    icon: "block",
    iconColorClass: "text-red-500",
    iconBgClass: "bg-red-100", 
    changeLabel: "action needed"
  },
  {
    title: "Revenue",
    value: "$24.5K",
    change: "+18%",
    changeType: "positive" as const, 
    icon: "payments",
    iconColorClass: "text-blue-500",
    iconBgClass: "bg-blue-100",
    changeLabel: "this month"
  },
  {
    title: "Growth",
    value: "8.2%",
    change: "+3.1%",
    changeType: "positive" as const,
    icon: "trending_up", 
    iconColorClass: "text-purple-500",
    iconBgClass: "bg-purple-100",
    changeLabel: "vs last month"
  }
];

// Chart data
export const CHART_DATA = [
  { plan: "Free", companies: 320, color: "#10b981" },
  { plan: "Starter", companies: 450, color: "#3b82f6" },
  { plan: "Professional", companies: 280, color: "#8b5cf6" },
  { plan: "Enterprise", companies: 190, color: "#f59e0b" }
];

// Recent companies data
export const RECENT_COMPANIES = [
  {
    id: "1",
    name: "Tech Innovations Ltd", 
    email: "admin@techinnovations.com",
    plan: "Enterprise",
    status: "Active",
    joinedDate: "2024-01-15",
    users: 45,
    revenue: "$2,400"
  },
  {
    id: "2", 
    name: "StartUp Solutions",
    email: "contact@startupsolutions.com",
    plan: "Professional",
    status: "Active", 
    joinedDate: "2024-01-10",
    users: 12,
    revenue: "$850"
  },
  {
    id: "3",
    name: "Global Enterprises", 
    email: "info@globalent.com",
    plan: "Enterprise",
    status: "Suspended",
    joinedDate: "2024-01-05",
    users: 78,
    revenue: "$3,200"
  }
];