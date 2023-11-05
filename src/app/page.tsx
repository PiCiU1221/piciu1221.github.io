"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";

import Sidebar from "../components/Sidebar";
import Dashboard from "../components/Dashboard";
import LoadingScreen from "../components/LoadingScreen";

export default function Home() {
  const [activeMenu, setActiveMenu] = useState("alarms"); // Default active menu
  const [isLoading, setIsLoading] = useState(true);
  const [renderComponents, setRenderComponents] = useState(false);

  useEffect(() => {
    // Retrieve the token from the cookie
    const cookieToken = Cookies.get("token");

    // Check if the token exists
    if (!cookieToken) {
      handleLogout();
    } else {
      // Parse the token to extract its payload
      const tokenPayload = parseToken(cookieToken);

      // Check if the token has expired
      if (tokenPayload.exp && tokenPayload.exp < Date.now() / 1000) {
        handleLogout();
      } else {
        // If the token exists and is not expired, set renderComponents to true
        setRenderComponents(true);
      }
    }
  }, []);

  const parseToken = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace("-", "+").replace("_", "/");
      return JSON.parse(window.atob(base64));
    } catch (error) {
      console.error("Error parsing token:", error);
      return {};
    }
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    // Add code here to handle menu option click and navigate to the corresponding page
  };

  const handleLogout = () => {
    // Remove the token from the cookie
    Cookies.remove("token");

    // Redirect the user to the login page
    window.location.href = "/login";
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <main>
      <section className="bg-gray-900">
        <div className="flex flex-row h-screen">
          {isLoading && (
            // Render the LoadingScreen while isLoading is true
            <LoadingScreen isLoading={isLoading} />
          )}
          {renderComponents && (
            <>
              <Sidebar
                activeMenu={activeMenu}
                handleMenuClick={handleMenuClick}
                handleLogout={handleLogout}
                handleLoadingComplete={handleLoadingComplete}
              />
              <div className="flex-1">
                <Dashboard activeMenu={activeMenu} />
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
