import { useState, useEffect } from "react";
import { User } from "@/types";
import { storage } from "@/lib/storage";
import { LandingPage } from "@/components/LandingPage";
import { UserPanel } from "@/components/UserPanel";
import { ShopPanel } from "@/components/ShopPanel";
import { AdminPanel } from "@/components/AdminPanel";
import { DarkModeToggle } from "@/components/DarkModeToggle";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load dark mode preference
    const darkMode = storage.getDarkMode();
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    }

    // Check for existing session
    const user = storage.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    } else {
      // Redirect to login page if no user is found
      window.location.href = "/";
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    setCurrentUser(null);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    storage.setDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Show appropriate panel based on user role
  if (!currentUser) {
    return (
      <>
        <DarkModeToggle isDark={isDarkMode} onToggle={toggleDarkMode} />
        <LandingPage onLogin={handleLogin} />
      </>
    );
  }

  if (currentUser.role === "shop") {
    return (
      <>
        <DarkModeToggle isDark={isDarkMode} onToggle={toggleDarkMode} />
        <ShopPanel user={currentUser} onLogout={handleLogout} />
      </>
    );
  }

  if (currentUser.role === "admin") {
    return (
      <>
        <DarkModeToggle isDark={isDarkMode} onToggle={toggleDarkMode} />
        <AdminPanel user={currentUser} onLogout={handleLogout} />
      </>
    );
  }

  return (
    <>
      <DarkModeToggle isDark={isDarkMode} onToggle={toggleDarkMode} />
      <UserPanel user={currentUser} onLogout={handleLogout} />
    </>
  );
};

export default Index;