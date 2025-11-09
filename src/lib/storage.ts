import { User, MenuItem, Order, Notification } from "@/types";
import { firebaseStorage } from "./firebaseStorage";
import { PREDEFINED_ACCOUNTS } from "@/lib/storageConstants";

// Export predefined accounts
export { PREDEFINED_ACCOUNTS };

// Add a comment to trigger refresh

// Firebase-based storage helper functions
export const storage = {
  // Users
  getUsers: async (): Promise<User[]> => {
    return await firebaseStorage.getUsers();
  },
  
  setUsers: async (users: User[]): Promise<void> => {
    // In Firebase, we don't need to set all users at once
    // This function is kept for compatibility but won't be used
    console.warn("setUsers is not needed with Firebase. Users are managed individually.");
  },

  // Menu
  getMenu: async (): Promise<MenuItem[]> => {
    return await firebaseStorage.getMenu();
  },
  
  setMenu: async (menu: MenuItem[]): Promise<void> => {
    // In Firebase, we don't need to set all menu items at once
    // This function is kept for compatibility but won't be used
    console.warn("setMenu is not needed with Firebase. Menu items are managed individually.");
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    return await firebaseStorage.getOrders();
  },
  
  setOrders: async (orders: Order[]): Promise<void> => {
    // In Firebase, we don't need to set all orders at once
    // This function is kept for compatibility but won't be used
    console.warn("setOrders is not needed with Firebase. Orders are managed individually.");
  },

  // Notifications
  getNotifications: async (): Promise<Notification[]> => {
    return await firebaseStorage.getNotifications();
  },
  
  setNotifications: async (notifications: Notification[]): Promise<void> => {
    // In Firebase, we don't need to set all notifications at once
    // This function is kept for compatibility but won't be used
    console.warn("setNotifications is not needed with Firebase. Notifications are managed individually.");
  },

  // Current User
  getCurrentUser: (): User | null => {
    // This will still use localStorage for session persistence
    const data = localStorage.getItem("mec_canteen_current_user");
    return data ? JSON.parse(data) : null;
  },
  
  setCurrentUser: (user: User | null) => {
    // This will still use localStorage for session persistence
    if (user) {
      localStorage.setItem("mec_canteen_current_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("mec_canteen_current_user");
    }
  },

  // Dark Mode
  getDarkMode: (): boolean => {
    const data = localStorage.getItem("mec_canteen_dark_mode");
    return data === "true";
  },
  
  setDarkMode: (isDark: boolean) => {
    localStorage.setItem("mec_canteen_dark_mode", String(isDark));
  },
  
  // Firebase-specific functions
  getUserById: async (userId: string): Promise<User | null> => {
    return await firebaseStorage.getUserById(userId);
  },
  
  getUserByEmail: async (email: string): Promise<User | null> => {
    return await firebaseStorage.getUserByEmail(email);
  },
  
  createUser: async (user: Omit<User, "id">): Promise<User | null> => {
    return await firebaseStorage.createUser(user);
  },
  
  updateUser: async (userId: string, updates: Partial<User>): Promise<boolean> => {
    return await firebaseStorage.updateUser(userId, updates);
  },
  
  getMenuItemById: async (itemId: string): Promise<MenuItem | null> => {
    return await firebaseStorage.getMenuItemById(itemId);
  },
  
  createMenuItem: async (item: Omit<MenuItem, "id">): Promise<MenuItem | null> => {
    return await firebaseStorage.createMenuItem(item);
  },
  
  updateMenuItem: async (itemId: string, updates: Partial<MenuItem>): Promise<boolean> => {
    return await firebaseStorage.updateMenuItem(itemId, updates);
  },
  
  deleteMenuItem: async (itemId: string): Promise<boolean> => {
    return await firebaseStorage.deleteMenuItem(itemId);
  },
  
  getOrdersByUser: async (userId: string): Promise<Order[]> => {
    return await firebaseStorage.getOrdersByUser(userId);
  },
  
  getOrderById: async (orderId: string): Promise<Order | null> => {
    return await firebaseStorage.getOrderById(orderId);
  },
  
  createOrder: async (order: Omit<Order, "id">): Promise<Order | null> => {
    return await firebaseStorage.createOrder(order);
  },
  
  updateOrder: async (orderId: string, updates: Partial<Order>): Promise<boolean> => {
    return await firebaseStorage.updateOrder(orderId, updates);
  },
  
  getNotificationsByUser: async (userId: string): Promise<Notification[]> => {
    return await firebaseStorage.getNotificationsByUser(userId);
  },
  
  createNotification: async (notification: Omit<Notification, "id">): Promise<Notification | null> => {
    return await firebaseStorage.createNotification(notification);
  },
  
  updateNotification: async (notificationId: string, updates: Partial<Notification>): Promise<boolean> => {
    return await firebaseStorage.updateNotification(notificationId, updates);
  },
  
  addReviewToMenuItem: async (itemId: string, review: any): Promise<boolean> => {
    return await firebaseStorage.addReviewToMenuItem(itemId, review);
  }
};