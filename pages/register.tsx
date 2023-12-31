import "../styles/globals.css";

import React, { useState, useEffect } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if the username, password, and passwordConfirmation fields are not empty
    if (!username || !password || !passwordConfirmation) {
      setError("Please fill in all fields.");
      return;
    }

    // Check if passwords match
    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    try {
      const response = await fetch(`${apiBaseUrl}/api/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Registration was successful, redirect to the login page
        window.location.href = "/login";
      } else {
        // Handle different HTTP status codes
        const responseBody = await response.json(); // Parse JSON response

        if (response.status === 400) {
          // Bad Request (e.g., validation error)
          setError(
            responseBody.message ||
              "Invalid registration data. Please check your input."
          );
        } else if (response.status === 409) {
          // Conflict (e.g., username already in use)
          setError(responseBody.message || "Username is already in use.");
        } else {
          // Handle other server errors
          setError(
            "An error occurred during registration. Please try again later."
          );
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setError(
        "An error occurred during registration. Please try again later."
      );
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
                Create an account
              </h1>
              <form
                className="space-y-4 md:space-y-6"
                onSubmit={handleRegister}
                action="/api/auth/register"
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
                </div>
                <div>
                  <label
                    htmlFor="passwordConfirmation"
                    className="block mb-2 text-sm font-medium text-white"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="passwordConfirmation"
                    id="passwordConfirmation"
                    placeholder="••••••••"
                    className={`bg-gray-50 border ${
                      error ? "border-red-500" : "border-gray-300"
                    } sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-700 ${
                      error ? "placeholder-red-500" : "placeholder-gray-400"
                    } text-white focus:ring-blue-500 focus:border-blue-500`}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                  ></input>
                  {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-primary-500 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Register
                </button>
                <p className="text-sm font-light text-gray-400">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="font-medium hover:underline text-red-700"
                  >
                    Sign in
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
