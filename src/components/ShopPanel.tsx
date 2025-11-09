import { useState, useEffect, useMemo } from "react";
import { User, Order, Notification } from "@/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Clock, User as UserIcon, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { AnimatedBackground } from "./AnimatedBackground";

interface ShopPanelProps {
  user: User;
  onLogout: () => void;
}

export function ShopPanel({ user, onLogout }: ShopPanelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newPrepTime, setNewPrepTime] = useState<number>(0);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const allOrders = storage.getOrders();
    setOrders(allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const pendingOrders = useMemo(() => {
    return orders.filter((o) => o.status === "pending");
  }, [orders]);

  const activeOrders = useMemo(() => {
    return orders.filter((o) => o.status === "approved");
  }, [orders]);

  const completedOrders = useMemo(() => {
    return orders.filter((o) => o.status === "ready" || o.status === "completed" || o.status === "declined" || o.status === "cancelled");
  }, [orders]);

  const cancelOrder = (orderId: string) => {
    const allOrders = storage.getOrders();
    const orderIndex = allOrders.findIndex((o) => o.id === orderId);
    
    if (orderIndex !== -1) {
      allOrders[orderIndex].status = "cancelled" as any;
      allOrders[orderIndex].updatedAt = new Date().toISOString();
      storage.setOrders(allOrders);
      
      // Create notification
      const notifications = storage.getNotifications();
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        userId: allOrders[orderIndex].userId,
        orderId,
        message: `Your order #${orderId.slice(-6)} has been cancelled`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      notifications.push(notification);
      storage.setNotifications(notifications);
      
      loadOrders();
      setSelectedOrder(null);
      toast.success("Order cancelled");
    }
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    const allOrders = storage.getOrders();
    const orderIndex = allOrders.findIndex((o) => o.id === orderId);
    
    if (orderIndex !== -1) {
      allOrders[orderIndex].status = status;
      allOrders[orderIndex].updatedAt = new Date().toISOString();
      storage.setOrders(allOrders);
      
      // Create notification
      const notifications = storage.getNotifications();
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        userId: allOrders[orderIndex].userId,
        orderId,
        message: `Your order #${orderId.slice(-6)} has been ${status}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      notifications.push(notification);
      storage.setNotifications(notifications);
      
      loadOrders();
      toast.success(`Order ${status}`);
    }
  };

  const updatePrepTime = (orderId: string) => {
    if (newPrepTime <= 0) {
      toast.error("Please enter a valid preparation time");
      return;
    }

    const allOrders = storage.getOrders();
    const orderIndex = allOrders.findIndex((o) => o.id === orderId);
    
    if (orderIndex !== -1) {
      allOrders[orderIndex].prepTime = newPrepTime;
      allOrders[orderIndex].updatedAt = new Date().toISOString();
      storage.setOrders(allOrders);
      
      // Create notification
      const notifications = storage.getNotifications();
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        userId: allOrders[orderIndex].userId,
        orderId,
        message: `Preparation time updated to ${newPrepTime} minutes for order #${orderId.slice(-6)}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      notifications.push(notification);
      storage.setNotifications(notifications);
      
      loadOrders();
      setSelectedOrder(null);
      toast.success("Preparation time updated");
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-warning";
      case "approved":
        return "bg-info";
      case "ready":
        return "bg-success";
      case "declined":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => {
        setSelectedOrder(order);
        setNewPrepTime(order.prepTime);
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Order #{order.id.slice(-6)}</CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <UserIcon className="w-4 h-4" />
              {order.userName}
            </p>
          </div>
          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Items:</span>
            <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Prep Time:
            </span>
            <span>{order.prepTime}m</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payment:</span>
            <span className="uppercase">{order.paymentMode}</span>
          </div>
          <div className="flex items-center justify-between font-bold pt-2 border-t border-border">
            <span>Total:</span>
            <span className="text-shop">₹{order.total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-gradient-shop">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold text-shop-foreground">MEC Canteen - Shop Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-shop-foreground hidden sm:inline">{user.name}</span>
            <Button variant="ghost" size="icon" onClick={onLogout} className="text-shop-foreground hover:bg-shop-foreground/20">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="pending">
              Pending
              {pendingOrders.length > 0 && (
                <Badge className="ml-2 bg-warning text-warning-foreground">{pendingOrders.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">
              Active
              {activeOrders.length > 0 && (
                <Badge className="ml-2 bg-info text-info-foreground">{activeOrders.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingOrders.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">No pending orders</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeOrders.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">No active orders</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedOrders.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">No completed orders</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Order Details Dialog */}
      <Dialog open={selectedOrder !== null} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id.slice(-6)}</DialogTitle>
            <DialogDescription>Order details and actions</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer</Label>
                  <p className="text-lg font-medium">{selectedOrder.userName}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
                  </div>
                </div>
                <div>
                  <Label>Order Time</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Payment Mode</Label>
                  <p className="text-sm uppercase">{selectedOrder.paymentMode}</p>
                </div>
              </div>

              <div>
                <Label>Items</Label>
                <div className="mt-2 space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>{item.name} x {item.quantity}</span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xl font-bold">
                <span>Total:</span>
                <span className="text-shop">₹{selectedOrder.total}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prepTime">Preparation Time (minutes)</Label>
                <div className="flex gap-2">
                  <Input
                    id="prepTime"
                    type="number"
                    value={newPrepTime}
                    onChange={(e) => setNewPrepTime(parseInt(e.target.value) || 0)}
                    min="1"
                  />
                  <Button onClick={() => updatePrepTime(selectedOrder.id)}>Update</Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  {selectedOrder.status === "pending" && (
                    <>
                      <Button
                        variant="shop"
                        className="flex-1"
                        onClick={() => updateOrderStatus(selectedOrder.id, "approved")}
                      >
                        Approve Order
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => updateOrderStatus(selectedOrder.id, "declined")}
                      >
                        Decline Order
                      </Button>
                    </>
                  )}
                  {selectedOrder.status === "approved" && (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => updateOrderStatus(selectedOrder.id, "ready")}
                    >
                      Mark as Ready
                    </Button>
                  )}
                </div>
                {selectedOrder.status !== "completed" && selectedOrder.status !== "cancelled" && (
                  <Button
                    variant="outline"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={() => cancelOrder(selectedOrder.id)}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Animated Background */}
      <AnimatedBackground />
    </div>
  );
}
