import { useState } from "react";
import { User } from "@/types";
import { storage, PREDEFINED_ACCOUNTS } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AnimatedBackground } from "./AnimatedBackground";
import mecLogo from "@/assets/mec-logo.png";

interface LandingPageProps {
  onLogin: (user: User) => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      // Sign Up
      if (!formData.name || !formData.email || !formData.password) {
        toast.error("Please fill all fields");
        return;
      }

      const users = storage.getUsers();
      if (users.find((u) => u.email === formData.email)) {
        toast.error("Email already registered");
        return;
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        email: formData.email,
        password: formData.password,
        role: "user",
        name: formData.name,
        active: true,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      storage.setUsers(users);
      storage.setCurrentUser(newUser);
      toast.success("Account created successfully!");
      onLogin(newUser);
    } else {
      // Sign In
      if (!formData.email || !formData.password) {
        toast.error("Please fill all fields");
        return;
      }

      // Check predefined accounts
      if (
        formData.email === PREDEFINED_ACCOUNTS.shop.email &&
        formData.password === PREDEFINED_ACCOUNTS.shop.password
      ) {
        storage.setCurrentUser(PREDEFINED_ACCOUNTS.shop);
        toast.success("Welcome, Shop Manager!");
        onLogin(PREDEFINED_ACCOUNTS.shop);
        return;
      }

      if (
        formData.email === PREDEFINED_ACCOUNTS.admin.email &&
        formData.password === PREDEFINED_ACCOUNTS.admin.password
      ) {
        storage.setCurrentUser(PREDEFINED_ACCOUNTS.admin);
        toast.success("Welcome, Administrator!");
        onLogin(PREDEFINED_ACCOUNTS.admin);
        return;
      }

      // Check regular users
      const users = storage.getUsers();
      const user = users.find(
        (u) => u.email === formData.email && u.password === formData.password
      );

      if (user) {
        if (!user.active) {
          toast.error("Your account has been deactivated");
          return;
        }
        storage.setCurrentUser(user);
        toast.success(`Welcome back, ${user.name}!`);
        onLogin(user);
      } else {
        toast.error("Invalid email or password");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 relative overflow-hidden">
      <AnimatedBackground />
      <Card className="w-full max-w-md shadow-xl z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={mecLogo} alt="MEC Logo" className="h-24 w-24 object-contain" />
          </div>
          <CardTitle className="text-3xl font-bold">MEC Canteen</CardTitle>
          <CardDescription>Welcome! Sign in or create an account to order food</CardDescription>
        </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                {isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary font-medium hover:underline"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Demo Accounts:</strong>
                <br />
                Shop: canteen@admin / shop123
                <br />
                Admin: admin@mec / admin123
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
