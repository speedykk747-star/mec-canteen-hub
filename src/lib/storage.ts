import { User, MenuItem, Order, Notification } from "@/types";

const STORAGE_KEYS = {
  USERS: "mec_canteen_users",
  MENU: "mec_canteen_menu",
  ORDERS: "mec_canteen_orders",
  NOTIFICATIONS: "mec_canteen_notifications",
  CURRENT_USER: "mec_canteen_current_user",
  DARK_MODE: "mec_canteen_dark_mode",
};

// Predefined shop and admin accounts
export const PREDEFINED_ACCOUNTS = {
  shop: {
    email: "canteen@admin",
    password: "shop123",
    role: "shop" as const,
    name: "MEC Canteen Shop",
    id: "shop-1",
    active: true,
    createdAt: new Date().toISOString(),
  },
  admin: {
    email: "admin@mec",
    password: "admin123",
    role: "admin" as const,
    name: "MEC Administrator",
    id: "admin-1",
    active: true,
    createdAt: new Date().toISOString(),
  },
};

// Initialize default menu items
const DEFAULT_MENU: MenuItem[] = [
  {
    id: "item-1",
    name: "Chicken Biryani",
    price: 120,
    type: "non-veg",
    cuisine: "Indian",
    prepTime: 20,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400",
    description: "Fragrant basmati rice with tender chicken pieces",
  },
  {
    id: "item-2",
    name: "Paneer Butter Masala",
    price: 100,
    type: "veg",
    cuisine: "Indian",
    prepTime: 15,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400",
    description: "Creamy tomato gravy with soft paneer cubes",
  },
  {
    id: "item-3",
    name: "Masala Dosa",
    price: 60,
    type: "veg",
    cuisine: "South Indian",
    prepTime: 10,
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400",
    description: "Crispy dosa with potato filling",
  },
  {
    id: "item-4",
    name: "Veg Fried Rice",
    price: 80,
    type: "veg",
    cuisine: "Chinese",
    prepTime: 12,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
    description: "Stir-fried rice with fresh vegetables",
  },
  {
    id: "item-5",
    name: "Grilled Sandwich",
    price: 50,
    type: "veg",
    cuisine: "Continental",
    prepTime: 8,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400",
    description: "Toasted sandwich with cheese and veggies",
  },
  {
    id: "item-6",
    name: "Coffee",
    price: 30,
    type: "beverage",
    cuisine: "Beverage",
    prepTime: 5,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
    description: "Hot filter coffee",
  },
  {
    id: "item-7",
    name: "Mango Juice",
    price: 40,
    type: "beverage",
    cuisine: "Beverage",
    prepTime: 3,
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400",
    description: "Fresh mango juice",
  },
  {
    id: "item-8",
    name: "Chicken Wrap",
    price: 90,
    type: "non-veg",
    cuisine: "Continental",
    prepTime: 12,
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400",
    description: "Grilled chicken wrapped in tortilla",
  },
];

// Storage helper functions
export const storage = {
  // Users
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },
  setUsers: (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },
  
  // Menu
  getMenu: (): MenuItem[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MENU);
    if (!data) {
      storage.setMenu(DEFAULT_MENU);
      return DEFAULT_MENU;
    }
    return JSON.parse(data);
  },
  setMenu: (menu: MenuItem[]) => {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
  },
  
  // Orders
  getOrders: (): Order[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  },
  setOrders: (orders: Order[]) => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },
  
  // Notifications
  getNotifications: (): Notification[] => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  },
  setNotifications: (notifications: Notification[]) => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },
  
  // Current User
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },
  
  // Dark Mode
  getDarkMode: (): boolean => {
    const data = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    return data === "true";
  },
  setDarkMode: (isDark: boolean) => {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(isDark));
  },
};
