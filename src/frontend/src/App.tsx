import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { CartProvider } from "./context/CartContext";
import AdminPage from "./pages/AdminPage";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";

type Route = "home" | "admin" | "checkout";

export default function App() {
  const [route, setRoute] = useState<Route>(() => {
    if (window.location.pathname === "/admin") return "admin";
    if (window.location.pathname === "/checkout") return "checkout";
    return "home";
  });

  const navigate = (to: Route) => {
    setRoute(to);
    const paths: Record<Route, string> = {
      home: "/",
      admin: "/admin",
      checkout: "/checkout",
    };
    window.history.pushState(null, "", paths[to]);
  };

  return (
    <CartProvider>
      <Toaster richColors position="top-right" />
      {route === "home" && (
        <HomePage
          onNavigateAdmin={() => navigate("admin")}
          onNavigateCheckout={() => navigate("checkout")}
        />
      )}
      {route === "admin" && (
        <AdminPage onNavigateHome={() => navigate("home")} />
      )}
      {route === "checkout" && (
        <CheckoutPage onNavigateHome={() => navigate("home")} />
      )}
    </CartProvider>
  );
}
