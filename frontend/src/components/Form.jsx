import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import logo from "../../assets/logo.png";
import api from "../../api";
import { useNavigate, Link } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";
import "./styles.css";
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method }) {
  const [theme, setTheme] = useState("light");
  const formRef = useRef(null);
  const cardRef = useRef(null);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const name = method === "login" ? "Sign In" : "Sign Up";

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { y: 100, opacity: 0, scale: 0.9, filter: "blur(10px)" },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.2,
        ease: "power4.out",
      }
    );

    gsap.fromTo(
      formRef.current.querySelectorAll("div, button"),
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        delay: 0.7,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.15,
      }
    );
  }, [theme]);

  useEffect(() => {
    const card = cardRef.current;
    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        y: -5,
        scale: 1.02,
        boxShadow:
          theme === "light"
            ? "0 20px 40px rgba(0,0,0,0.1)"
            : "0 20px 40px rgba(255,255,255,0.1)",
        duration: 0.3,
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow:
          theme === "light"
            ? "0 10px 20px rgba(0,0,0,0.05)"
            : "0 10px 20px rgba(255,255,255,0.05)",
        duration: 0.3,
      });
    });
  }, [theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { username, password };
      if (method !== "login") {
        if (email) payload.email = email;
        if (firstName) payload.first_name = firstName;
        if (lastName) payload.last_name = lastName;
      }
      const res = await api.post(route, payload);
      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/home");
      } else {
        navigate("/login");
      }
    } catch (error) {
      // Extract and show helpful server errors
      const status = error?.response?.status;
      const data = error?.response?.data;
      let message = "An error occurred";
      if (status) message += ` (HTTP ${status})`;
      if (data) {
        if (typeof data === "string") {
          message += `\n${data}`;
        } else if (typeof data === "object") {
          const parts = [];
          for (const [key, val] of Object.entries(data)) {
            if (Array.isArray(val)) {
              parts.push(`${key}: ${val.join(", ")}`);
            } else if (typeof val === "string") {
              parts.push(`${key}: ${val}`);
            } else {
              parts.push(`${key}: ${JSON.stringify(val)}`);
            }
          }
          if (parts.length) message += `\n${parts.join("\n")}`;
        }
      } else if (error?.message) {
        message += `\n${error.message}`;
      }
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        theme === "light"
          ? "bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100"
          : "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
      }`}
    >
      <div
        ref={cardRef}
        className={`p-8 rounded-2xl shadow-2xl w-full max-w-md transition-colors duration-500 ${
          theme === "light"
            ? "bg-white text-gray-800"
            : "bg-gray-900 text-gray-200"
        }`}
      >
        {/* Theme Toggle Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() =>
              setTheme((prev) => (prev === "light" ? "dark" : "light"))
            }
            className="px-3 py-1 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-100 hover:text-white dark:hover:bg-gray-700 transition"
          >
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>

        {/* Logo & Title */}
        <h2 className="text-xl font-bold text-center mb-6">
          <img src={logo} alt="logo" className="h-10 rounded-full inline-block" />
          <div>Welcome to the Daily Juggernaut</div>
        </h2>

        <h2 className="text-3xl font-bold text-center mb-6">{name}</h2>

        {/* Form */}
        <form  ref={formRef} onSubmit={handleSubmit} className=" space-y-5">
          <div>
            <label htmlFor="name" className="block dark:text-white-800 text-sm font-medium">
              Username
            </label>
            <input
              type="text"
              id="name"
              className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${
                theme === "light"
                  ? "border-gray-300 focus:ring-blue-400"
                  : "bg-gray-800 border-gray-600 focus:ring-purple-400 text-white"
              }`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your Username"
              required
            />
          </div>

          {method !== "login" && (
            <>
              <div>
                <label htmlFor="email" className="block dark:text-white-800 text-sm font-medium">
                  Email (optional)
                </label>
                <input
                  type="email"
                  id="email"
                  className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${
                    theme === "light"
                      ? "border-gray-300 focus:ring-blue-400"
                      : "bg-gray-800 border-gray-600 focus:ring-purple-400 text-white"
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block dark:text-white-800 text-sm font-medium">
                    First name (optional)
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${
                      theme === "light"
                        ? "border-gray-300 focus:ring-blue-400"
                        : "bg-gray-800 border-gray-600 focus:ring-purple-400 text-white"
                    }`}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block dark:text-white-800 text-sm font-medium">
                    Last name (optional)
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${
                      theme === "light"
                        ? "border-gray-300 focus:ring-blue-400"
                        : "bg-gray-800 border-gray-600 focus:ring-purple-400 text-white"
                    }`}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="password"  className="block text-sm dark:text-white-800 font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${
                theme === "light"
                  ? "border-gray-300 focus:ring-blue-400"
                  : "bg-gray-800 border-gray-600 focus:ring-purple-400 text-white"
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Put in your password"
              required
            />
          </div>

          {/* Remember Me & Forgot Password */}
          {loading && <LoadingIndicator />}

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm font-semibold text-lg transition ${
              theme === "light"
                ? "text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                : "text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            }`}
          >
            {name}
          </button>
        </form>

        {/* Switch Auth Link */}
        <p className="mt-6 text-center text-sm">
          {method === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <Link
            to={method === "login" ? "/register" : "/login"}
            className={`font-medium ${
              theme === "light"
                ? "text-blue-600 hover:text-blue-500"
                : "text-purple-400 hover:text-purple-300"
            }`}
          >
            {method === "login" ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Form;
