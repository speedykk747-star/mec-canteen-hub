import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { User, MenuItem, Order, Notification, Review } from "@/types";

// Collection names
const COLLECTIONS = {
  USERS: "users",
  MENU: "menu",
  ORDERS: "orders",
  NOTIFICATIONS: "notifications",
};

// Helper function to convert Firestore timestamp to string
const timestampToString = (timestamp: any): string => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  return timestamp || new Date().toISOString();
};

// Helper function to convert string to Firestore timestamp
const stringToTimestamp = (dateString: string) => {
  return Timestamp.fromDate(new Date(dateString));
};

// Firebase storage service
export const firebaseStorage = {
  // Users
  getUsers: async (): Promise<User[]> => {
    try {
      const q = query(collection(db, COLLECTIONS.USERS));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          password: data.password,
          role: data.role,
          name: data.name,
          active: data.active,
          createdAt: timestampToString(data.createdAt),
        } as User;
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  getUserById: async (userId: string): Promise<User | null> => {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          email: data.email,
          password: data.password,
          role: data.role,
          name: data.name,
          active: data.active,
          createdAt: timestampToString(data.createdAt),
        } as User;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    try {
      const q = query(collection(db, COLLECTIONS.USERS), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        return {
          id: docSnap.id,
          email: data.email,
          password: data.password,
          role: data.role,
          name: data.name,
          active: data.active,
          createdAt: timestampToString(data.createdAt),
        } as User;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      return null;
    }
  },

  createUser: async (user: Omit<User, "id">): Promise<User | null> => {
    try {
      const newUser = {
        ...user,
        createdAt: stringToTimestamp(user.createdAt),
      };
      
      const docRef = doc(collection(db, COLLECTIONS.USERS));
      await setDoc(docRef, newUser);
      
      return {
        ...user,
        id: docRef.id,
      };
    } catch (error: any) {
      console.error("Error creating user:", error);
      // Show more specific error message to user
      if (error.code === 'permission-denied') {
        console.error("Permission denied. Check Firestore security rules.");
      } else if (error.code === 'unavailable') {
        console.error("Firestore service unavailable. Check your Firebase configuration.");
      }
      return null;
    }
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<boolean> => {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, userId);
      
      // Handle timestamp conversion for createdAt if it's being updated
      const updateData: any = { ...updates };
      if (updates.createdAt) {
        updateData.createdAt = stringToTimestamp(updates.createdAt);
      }
      
      await updateDoc(docRef, updateData);
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      return false;
    }
  },

  // Menu Items
  getMenu: async (): Promise<MenuItem[]> => {
    try {
      const q = query(collection(db, COLLECTIONS.MENU), orderBy("name"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          price: data.price,
          type: data.type,
          cuisine: data.cuisine,
          prepTime: data.prepTime,
          image: data.image,
          description: data.description,
          reviews: data.reviews || [],
          averageRating: data.averageRating || 0,
        } as MenuItem;
      });
    } catch (error) {
      console.error("Error fetching menu:", error);
      return [];
    }
  },

  getMenuItemById: async (itemId: string): Promise<MenuItem | null> => {
    try {
      const docRef = doc(db, COLLECTIONS.MENU, itemId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          price: data.price,
          type: data.type,
          cuisine: data.cuisine,
          prepTime: data.prepTime,
          image: data.image,
          description: data.description,
          reviews: data.reviews || [],
          averageRating: data.averageRating || 0,
        } as MenuItem;
      }
      return null;
    } catch (error) {
      console.error("Error fetching menu item:", error);
      return null;
    }
  },

  createMenuItem: async (item: Omit<MenuItem, "id">): Promise<MenuItem | null> => {
    try {
      const docRef = doc(collection(db, COLLECTIONS.MENU));
      await setDoc(docRef, item);
      
      return {
        ...item,
        id: docRef.id,
      };
    } catch (error) {
      console.error("Error creating menu item:", error);
      return null;
    }
  },

  updateMenuItem: async (itemId: string, updates: Partial<MenuItem>): Promise<boolean> => {
    try {
      const docRef = doc(db, COLLECTIONS.MENU, itemId);
      await updateDoc(docRef, updates);
      return true;
    } catch (error) {
      console.error("Error updating menu item:", error);
      return false;
    }
  },

  deleteMenuItem: async (itemId: string): Promise<boolean> => {
    try {
      const docRef = doc(db, COLLECTIONS.MENU, itemId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("Error deleting menu item:", error);
      return false;
    }
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    try {
      const q = query(collection(db, COLLECTIONS.ORDERS), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          items: data.items,
          total: data.total,
          status: data.status,
          paymentMode: data.paymentMode,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
          prepTime: data.prepTime,
        } as Order;
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  },

  getOrdersByUser: async (userId: string): Promise<Order[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.ORDERS), 
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          items: data.items,
          total: data.total,
          status: data.status,
          paymentMode: data.paymentMode,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
          prepTime: data.prepTime,
        } as Order;
      });
    } catch (error) {
      console.error("Error fetching user orders:", error);
      return [];
    }
  },

  getOrderById: async (orderId: string): Promise<Order | null> => {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId,
          userName: data.userName,
          items: data.items,
          total: data.total,
          status: data.status,
          paymentMode: data.paymentMode,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
          prepTime: data.prepTime,
        } as Order;
      }
      return null;
    } catch (error) {
      console.error("Error fetching order:", error);
      return null;
    }
  },

  createOrder: async (order: Omit<Order, "id">): Promise<Order | null> => {
    try {
      const newOrder = {
        ...order,
        createdAt: stringToTimestamp(order.createdAt),
        updatedAt: stringToTimestamp(order.updatedAt),
      };
      
      const docRef = doc(collection(db, COLLECTIONS.ORDERS));
      await setDoc(docRef, newOrder);
      
      return {
        ...order,
        id: docRef.id,
      };
    } catch (error) {
      console.error("Error creating order:", error);
      return null;
    }
  },

  updateOrder: async (orderId: string, updates: Partial<Order>): Promise<boolean> => {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
      
      // Handle timestamp conversion if needed
      const updateData: any = { ...updates };
      if (updates.createdAt) {
        updateData.createdAt = stringToTimestamp(updates.createdAt);
      }
      if (updates.updatedAt) {
        updateData.updatedAt = stringToTimestamp(updates.updatedAt);
      }
      
      await updateDoc(docRef, updateData);
      return true;
    } catch (error) {
      console.error("Error updating order:", error);
      return false;
    }
  },

  // Notifications
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const q = query(collection(db, COLLECTIONS.NOTIFICATIONS), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          orderId: data.orderId,
          message: data.message,
          read: data.read,
          createdAt: timestampToString(data.createdAt),
        } as Notification;
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },

  getNotificationsByUser: async (userId: string): Promise<Notification[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS), 
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          orderId: data.orderId,
          message: data.message,
          read: data.read,
          createdAt: timestampToString(data.createdAt),
        } as Notification;
      });
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      return [];
    }
  },

  createNotification: async (notification: Omit<Notification, "id">): Promise<Notification | null> => {
    try {
      const newNotification = {
        ...notification,
        createdAt: stringToTimestamp(notification.createdAt),
      };
      
      const docRef = doc(collection(db, COLLECTIONS.NOTIFICATIONS));
      await setDoc(docRef, newNotification);
      
      return {
        ...notification,
        id: docRef.id,
      };
    } catch (error) {
      console.error("Error creating notification:", error);
      return null;
    }
  },

  updateNotification: async (notificationId: string, updates: Partial<Notification>): Promise<boolean> => {
    try {
      const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
      
      // Handle timestamp conversion if needed
      const updateData: any = { ...updates };
      if (updates.createdAt) {
        updateData.createdAt = stringToTimestamp(updates.createdAt);
      }
      
      await updateDoc(docRef, updateData);
      return true;
    } catch (error) {
      console.error("Error updating notification:", error);
      return false;
    }
  },

  // Add a review to a menu item
  addReviewToMenuItem: async (itemId: string, review: Review): Promise<boolean> => {
    try {
      const item = await firebaseStorage.getMenuItemById(itemId);
      if (!item) return false;
      
      const reviews = item.reviews || [];
      reviews.push(review);
      
      // Calculate new average rating
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      return await firebaseStorage.updateMenuItem(itemId, {
        reviews,
        averageRating
      });
    } catch (error) {
      console.error("Error adding review:", error);
      return false;
    }
  },
};