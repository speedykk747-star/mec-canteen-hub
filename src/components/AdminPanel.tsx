import { useState, useEffect, useMemo } from "react";
import { User as UserType, MenuItem, Order } from "@/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Plus, Edit, Trash2, Users, UtensilsCrossed, ShoppingBag, BarChart } from "lucide-react";
import { toast } from "sonner";
import { AnimatedBackground } from "./AnimatedBackground";

interface AdminPanelProps {
  user: UserType;
  onLogout: () => void;
}

export function AdminPanel({ user, onLogout }: AdminPanelProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showMenuDialog, setShowMenuDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState<Partial<MenuItem>>({
    name: "",
    price: 0,
    type: "veg",
    cuisine: "",
    prepTime: 0,
    image: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, menuData, ordersData] = await Promise.all([
        storage.getUsers(),
        storage.getMenu(),
        storage.getOrders()
      ]);
      
      setUsers(usersData);
      setMenu(menuData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (userToUpdate) {
        const success = await storage.updateUser(userId, { active: !userToUpdate.active });
        if (success) {
          loadData();
          toast.success(`User ${!userToUpdate.active ? "activated" : "deactivated"}`);
        } else {
          toast.error("Failed to update user status");
        }
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // In a real app, you might want to implement soft delete or handle related data
      // For now, we'll just show a message since we don't actually delete users in Firebase
      toast.success("User would be deleted in a full implementation");
      loadData();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const openAddMenuItem = () => {
    setEditingItem(null);
    setMenuForm({
      name: "",
      price: 0,
      type: "veg",
      cuisine: "",
      prepTime: 0,
      image: "",
      description: "",
    });
    setShowMenuDialog(true);
  };

  const openEditMenuItem = (item: MenuItem) => {
    setEditingItem(item);
    setMenuForm(item);
    setShowMenuDialog(true);
  };

  const saveMenuItem = async () => {
    if (!menuForm.name || !menuForm.price || !menuForm.cuisine || !menuForm.prepTime) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      let success = false;
      
      if (editingItem) {
        // Update existing item
        success = await storage.updateMenuItem(editingItem.id, {
          name: menuForm.name!,
          price: menuForm.price!,
          type: menuForm.type as MenuItem["type"],
          cuisine: menuForm.cuisine!,
          prepTime: menuForm.prepTime!,
          image: menuForm.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
          description: menuForm.description || "",
        });
        
        if (success) {
          toast.success("Menu item updated");
        }
      } else {
        // Create new item
        const newItem: Omit<MenuItem, "id"> = {
          name: menuForm.name!,
          price: menuForm.price!,
          type: menuForm.type as MenuItem["type"],
          cuisine: menuForm.cuisine!,
          prepTime: menuForm.prepTime!,
          image: menuForm.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
          description: menuForm.description || "",
        };
        
        const createdItem = await storage.createMenuItem(newItem);
        success = !!createdItem;
        
        if (success) {
          toast.success("Menu item added");
        }
      }

      if (success) {
        loadData();
        setShowMenuDialog(false);
      } else {
        toast.error("Failed to save menu item");
      }
    } catch (error) {
      console.error("Error saving menu item:", error);
      toast.error("Failed to save menu item");
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    try {
      const success = await storage.deleteMenuItem(itemId);
      if (success) {
        loadData();
        toast.success("Menu item deleted");
      } else {
        toast.error("Failed to delete menu item");
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast.error("Failed to delete menu item");
    }
  };

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const itemCounts = orders.reduce((acc, order) => {
      order.items.forEach((item) => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
      });
      return acc;
    }, {} as Record<string, number>);
    
    const mostOrdered = Object.entries(itemCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      totalOrders,
      totalSales,
      mostOrdered,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      completedOrders: orders.filter((o) => o.status === "ready" || o.status === "completed").length,
    };
  }, [orders]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-gradient-admin">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold text-admin-foreground">MEC Canteen - Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-admin-foreground hidden sm:inline">{user.name}</span>
            <Button variant="ghost" size="icon" onClick={onLogout} className="text-admin-foreground hover:bg-admin-foreground/20">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="reports">
              <BarChart className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="menu">
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Orders</CardDescription>
                  <CardTitle className="text-3xl">{stats.totalOrders}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Sales</CardDescription>
                  <CardTitle className="text-3xl text-success">₹{stats.totalSales}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Pending Orders</CardDescription>
                  <CardTitle className="text-3xl text-warning">{stats.pendingOrders}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Completed</CardDescription>
                  <CardTitle className="text-3xl text-success">{stats.completedOrders}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Most Ordered Items</CardTitle>
                <CardDescription>Top 5 popular items</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.mostOrdered.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.mostOrdered.map(([name, count], index) => (
                      <div key={name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                          <span className="font-medium">{name}</span>
                        </div>
                        <Badge>{count} orders</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{u.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={u.active ? "bg-success" : "bg-destructive"}>
                            {u.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleUserStatus(u.id)}
                            >
                              {u.active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteUser(u.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Menu Management</CardTitle>
                    <CardDescription>Add, edit, or remove menu items</CardDescription>
                  </div>
                  <Button variant="admin" onClick={openAddMenuItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menu.map((item) => (
                    <Card key={item.id}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription>{item.cuisine}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-admin">₹{item.price}</span>
                            <Badge>{item.type}</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => openEditMenuItem(item)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteMenuItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Overview</CardTitle>
                <CardDescription>View all orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">#{order.id.slice(-6)}</TableCell>
                        <TableCell>{order.userName}</TableCell>
                        <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                        <TableCell className="font-bold">₹{order.total}</TableCell>
                        <TableCell className="uppercase">{order.paymentMode}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              order.status === "pending"
                                ? "bg-warning"
                                : order.status === "approved"
                                ? "bg-info"
                                : order.status === "ready"
                                ? "bg-success"
                                : order.status === "declined"
                                ? "bg-destructive"
                                : "bg-muted"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Menu Item Dialog */}
      <Dialog open={showMenuDialog} onOpenChange={setShowMenuDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
            <DialogDescription>Fill in the details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={menuForm.name}
                onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={menuForm.price}
                  onChange={(e) => setMenuForm({ ...menuForm, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prepTime">Prep Time (min) *</Label>
                <Input
                  id="prepTime"
                  type="number"
                  value={menuForm.prepTime}
                  onChange={(e) => setMenuForm({ ...menuForm, prepTime: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={menuForm.type}
                  onValueChange={(v) => setMenuForm({ ...menuForm, type: v as MenuItem["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veg">Vegetarian</SelectItem>
                    <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                    <SelectItem value="beverage">Beverage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine *</Label>
                <Input
                  id="cuisine"
                  value={menuForm.cuisine}
                  onChange={(e) => setMenuForm({ ...menuForm, cuisine: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={menuForm.image}
                onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={menuForm.description}
                onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
              />
            </div>
            <Button variant="admin" className="w-full" onClick={saveMenuItem}>
              {editingItem ? "Update Item" : "Add Item"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Animated Background */}
      <AnimatedBackground />
    </div>
  );
}