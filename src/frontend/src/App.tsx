import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";

type Route = "home" | "admin";

export default function App() {
  const [route, setRoute] = useState<Route>(() => {
    if (window.location.pathname === "/admin") return "admin";
    return "home";
  });

  const navigate = (to: Route) => {
    setRoute(to);
    window.history.pushState(null, "", to === "home" ? "/" : "/admin");
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      {route === "home" ? (
        <HomePage onNavigateAdmin={() => navigate("admin")} />
      ) : (
        <AdminPage onNavigateHome={() => navigate("home")} />
      )}
    </>
  );
}
