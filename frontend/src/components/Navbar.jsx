import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import UserSearch from "./UserSearch";
import api from "../api";

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const tl = gsap.timeline();
    
    // Initial animation
    tl.fromTo(navRef.current, 
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(logoRef.current,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" },
      0.2
    )
    .fromTo(menuRef.current.children,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
      0.4
    )
    .fromTo(toggleRef.current,
      { scale: 0, rotation: 180 },
      { scale: 1, rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" },
      0.6
    );
  }, []);

  // Load current user's profile to get username
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await api.get("/api/profile/");
        if (isMounted) setUsername(res?.data?.username || "");
      } catch (e) {
        // Silent fail; keep placeholder or empty
        if (isMounted) setUsername("");
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    
    if (!isMenuOpen) {
      gsap.to(".mobile-menu", {
        height: "auto",
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    } else {
      gsap.to(".mobile-menu", {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      });
    }
  };

  const handleThemeToggle = () => {
    // Animate the toggle switch
    gsap.to(toggleRef.current, {
      rotation: 360,
      duration: 0.5,
      ease: "power2.out"
    });
    
    // Animate the entire page theme transition
    gsap.to("body", {
      duration: 0.3,
      ease: "power2.inOut"
    });
    
    toggleDarkMode();
  };

  const handleUserSelect = (user) => {
    // Navigate to user profile or handle user selection
    console.log('Selected user:', user);
    // You can add navigation logic here
    // For example: navigate(`/profile/${user.username}`);
  };

  return (
    <nav 
      ref={navRef}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-900 border-gray-700 shadow-lg shadow-gray-900/20' 
          : 'bg-white border-gray-200 shadow-lg shadow-gray-200/20'
      } border-b backdrop-blur-sm`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div ref={logoRef} className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
              darkMode ? 'bg-red-600 text-white' : 'bg-red-600 text-white'
            }`}>
              DJ
            </div>
            <span className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Daily Juggernaut
            </span>
          </div>

          {/* Desktop Menu */}
          <div ref={menuRef} className="hidden lg:flex items-center space-x-6">
            <a 
              href="/" 
              className={`font-medium transition-all duration-200 hover:scale-105 ${
                darkMode 
                  ? 'text-gray-300 hover:text-red-400' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Home
            </a>
            <a 
              href="/dashboard" 
              className={`font-medium transition-all duration-200 hover:scale-105 ${
                darkMode 
                  ? 'text-gray-300 hover:text-red-400' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Dashboard
            </a>
            <a 
              href="/feed" 
              className={`font-medium transition-all duration-200 hover:scale-105 ${
                darkMode 
                  ? 'text-gray-300 hover:text-red-400' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Feed
            </a>
            <a 
              href="/posts" 
              className={`font-medium transition-all duration-200 hover:scale-105 ${
                darkMode 
                  ? 'text-gray-300 hover:text-red-400' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Create
            </a>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <UserSearch 
              onUserSelect={handleUserSelect}
              placeholder="Search users..."
              className="w-full"
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              ref={toggleRef}
              onClick={handleThemeToggle}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                darkMode 
                  ? 'bg-red-600 focus:ring-red-500' 
                  : 'bg-gray-300 focus:ring-red-500'
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center text-xs ${
                darkMode 
                  ? 'transform translate-x-7 bg-gray-900 text-yellow-400' 
                  : 'bg-white text-gray-600'
              }`}>
                {darkMode ? '🌙' : '☀️'}
              </div>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}>
                👤
              </div>
              <span className={`hidden sm:block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {username || 'Loading...'}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gray-800' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 transition-all duration-300 ${
                  darkMode ? 'bg-gray-300' : 'bg-gray-700'
                } ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                <span className={`block w-5 h-0.5 mt-1 transition-all duration-300 ${
                  darkMode ? 'bg-gray-300' : 'bg-gray-700'
                } ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-5 h-0.5 mt-1 transition-all duration-300 ${
                  darkMode ? 'bg-gray-300' : 'bg-gray-700'
                } ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu md:hidden overflow-hidden transition-all duration-300 ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        } ${isMenuOpen ? 'h-auto opacity-100' : 'h-0 opacity-0'}`}>
          <div className="py-4 space-y-3">
            {/* Mobile Search */}
            <div className="px-4 mb-4">
              <UserSearch 
                onUserSelect={handleUserSelect}
                placeholder="Search users..."
                className="w-full"
              />
            </div>
            
            <a 
              href="/" 
              className={`block px-4 py-2 font-medium transition-colors ${
                darkMode 
                  ? 'text-gray-300 hover:text-red-400 hover:bg-gray-800' 
                  : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
              } rounded-lg`}
            >
              Home
            </a>
            <a 
              href="/dashboard" 
              className={`block px-4 py-2 font-medium transition-colors ${
                darkMode 
                  ? 'text-gray-300 hover:text-red-400 hover:bg-gray-800' 
                  : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
              } rounded-lg`}
            >
              Dashboard
            </a>
            <a 
              href="/feed" 
              className={`block px-4 py-2 font-medium transition-colors ${
                darkMode 
                  ? 'text-gray-300 hover:text-red-400 hover:bg-gray-800' 
                  : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
              } rounded-lg`}
            >
              Feed
            </a>
            <a 
              href="/posts" 
              className={`block px-4 py-2 font-medium transition-colors ${
                darkMode 
                  ? 'text-gray-300 hover:text-red-400 hover:bg-gray-800' 
                  : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
              } rounded-lg`}
            >
              Create Post
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
