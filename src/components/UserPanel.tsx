import { useState, useMemo } from "react";
import { User, MenuItem, CartItem, Order, OrderStatus, PaymentMode, Notification } from "@/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, LogOut, Search, Bell, X, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface UserPanelProps {
  user: User;
  onLogout: () => void;
}

export function UserPanel({ user, onLogout }: UserPanelProps) {
  const [menu] = useState<MenuItem[]>(storage.getMenu());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [cuisineFilter, setCuisineFilter] = useState<string>("all");
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Load notifications
  useMemo(() => {
    const allNotifications = storage.getNotifications();
    setNotifications(allNotifications.filter((n) => n.userId === user.id));
  }, [user.id]);

  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesCuisine = cuisineFilter === "all" || item.cuisine === cuisineFilter;
      return matchesSearch && matchesType && matchesCuisine;
    });
  }, [menu, searchQuery, typeFilter, cuisineFilter]);

  const cuisines = useMemo(() => {
    return Array.from(new Set(menu.map((item) => item.cuisine)));
  }, [menu]);

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((c) => c.id === item.id);
    if (existingItem) {
      setCart(cart.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast.success(`${item.name} added to cart`);
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((c) => c.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map((c) => (c.id === itemId ? { ...c, quantity } : c)));
    }
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const placeOrder = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setShowCart(false);
    setShowPayment(true);
  };

  const confirmOrder = () => {
    const maxPrepTime = Math.max(...cart.map((item) => item.prepTime));
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      items: cart,
      total: cartTotal,
      status: "pending",
      paymentMode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      prepTime: maxPrepTime,
    };

    const orders = storage.getOrders();
    orders.push(newOrder);
    storage.setOrders(orders);

    setCart([]);
    setShowPayment(false);
    toast.success("Order placed successfully!");
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "veg":
        return "bg-secondary";
      case "non-veg":
        return "bg-destructive";
      case "beverage":
        return "bg-info";
      default:
        return "bg-muted";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">MEC Canteen</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {user.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setShowCart(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Food Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="veg">Vegetarian</SelectItem>
                <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                <SelectItem value="beverage">Beverages</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Cuisine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cuisines</SelectItem>
                {cuisines.map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMenu.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedItem(item)}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                </div>
                <CardDescription>{item.cuisine}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">₹{item.price}</span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {item.prepTime}m
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Item Details Dialog */}
      <Dialog open={selectedItem !== null} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
            <DialogDescription>{selectedItem?.cuisine}</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              <p className="text-muted-foreground">{selectedItem.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <Badge className={getTypeColor(selectedItem.type)}>{selectedItem.type}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">₹{selectedItem.price}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Prep time: {selectedItem.prepTime} minutes
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => {
                  addToCart(selectedItem);
                  setSelectedItem(null);
                }}>
                  Add to Cart
                </Button>
                <Button className="flex-1" variant="secondary" onClick={() => {
                  addToCart(selectedItem);
                  setSelectedItem(null);
                  setShowCart(true);
                }}>
                  Order Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Your Cart</DialogTitle>
            <DialogDescription>Review your items before placing order</DialogDescription>
          </DialogHeader>
          {cart.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b border-border pb-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center justify-between text-lg font-bold pt-4">
                <span>Total:</span>
                <span className="text-primary">₹{cartTotal}</span>
              </div>
              <Button className="w-full" onClick={placeOrder}>
                Proceed to Payment
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
            <DialogDescription>Choose your payment method</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span>Total Amount:</span>
              <span className="text-2xl font-bold text-primary">₹{cartTotal}</span>
            </div>
            <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v as PaymentMode)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={confirmOrder}>
              Confirm Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>Your order updates</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.read ? "bg-muted/50" : "bg-accent/50"
                  }`}
                >
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
