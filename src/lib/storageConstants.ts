import { User, UserRole } from "@/types";

// Predefined shop and admin accounts
export const PREDEFINED_ACCOUNTS: Record<string, User> = {
  shop: {
    email: "canteen@admin",
    password: "shop123",
    role: "shop" as UserRole,
    name: "MEC Canteen Shop",
    id: "shop-1",
    active: true,
    createdAt: new Date().toISOString(),
  },
  admin: {
    email: "admin@mec",
    password: "admin123",
    role: "admin" as UserRole,
    name: "MEC Administrator",
    id: "admin-1",
    active: true,
    createdAt: new Date().toISOString(),
  },
};