"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";

import Sidebar from "../components/Sidebar";
import Dashboard from "../components/Dashboard";

export default function Home() {
  const [activeMenu, setActiveMenu] = useState("new-alarm"); // Default active menu

  useEffect(() => {
    // Retrieve the token from the cookie
    const cookieToken = Cookies.get("token");

    // Check if the token exists
    if (!cookieToken) {
      handleLogout();
    }
  }, []);

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

  return (
    <main>
      <section className="bg-gray-900">
        <div className="flex flex-row h-screen">
          <Sidebar
            activeMenu={activeMenu}
            handleMenuClick={handleMenuClick}
            handleLogout={handleLogout}
          />
          <div
            className="flex-1 overflow-y-scroll" // Enable scrolling for the Dashboard
          >
            <Dashboard activeMenu={activeMenu} />
          </div>
        </div>
      </section>
    </main>
  );
}
