import "../styles/globals.css";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if the user is authenticated (e.g., valid token in cookies)
    const token = Cookies.get("token");
    if (token) {
      window.location.href = "/"; // Redirect to the dashboard if authenticated
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const token = await response.text();
        Cookies.set("token", token, { expires: 1 }); // Store the token in a cookie with an expiration of one day

        window.location.href = "/"; // Redirect to the desired route
      } else {
        if (response.status === 401) {
          // Unauthorized, i.e., invalid credentials
          setError(
            "Invalid credentials. Please check your username and password."
          );
        } else {
          // Handle server errors differently
          setError("An error occurred during login. Please try again later.");
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred during login. Please try again later.");
    }
  };

  return (
    <main>
      <section className="bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="flex items-center mb-6 text-2xl font-semibold text-white">
            <img
              className="w-16 h-16 mr-2"
              src="/siren_logo.svg"
              alt="logo"
            ></img>
            FireSignal
          </div>
          <div className="w-full rounded-lg shadow border md:mt-0 sm:max-w-md xl:p-0 bg-gray-800 border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight md:text-2xl text-white">
                Sign in to your account
              </h1>
              <form
                className="space-y-4 md:space-y-6"
                onSubmit={handleLogin}
                action="/api/auth/authenticate"
              >
                <div>
                  <label
                    htmlFor="username"
                    className="block mb-2 text-sm font-medium text-white"
                  >
                    Your username
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    className="bg-gray-50 border border-gray-300 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="username"
                    value={username} // Set the value to the state variable
                    onChange={(e) => setUsername(e.target.value)} // Update the state on change
                  ></input>
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-white"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className={`bg-gray-50 border ${
                      error ? "border-red-500" : "border-gray-300"
                    } sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-700 ${
                      error ? "placeholder-red-500" : "placeholder-gray-400"
                    } text-white focus:ring-blue-500 focus:border-blue-500`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  ></input>
                  {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="remember"
                        aria-describedby="remember"
                        type="checkbox"
                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 bg-gray-700 border-gray-600 focus:ring-primary-600 ring-offset-gray-800"
                      ></input>
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="remember" className="text-gray-300">
                        Remember me
                      </label>
                    </div>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium hover:underline text-red-700"
                  >
                    Forgot password?
                  </Link>
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-primary-500 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Sign in
                </button>
                <p className="text-sm font-light text-gray-400">
                  Don’t have an account yet?{" "}
                  <a
                    href="#"
                    className="font-medium hover:underline text-red-700"
                  >
                    Sign up
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
