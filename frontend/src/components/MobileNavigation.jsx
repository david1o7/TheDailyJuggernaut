import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import UserSearch from './UserSearch';
import api from "../api";

const MobileNavigation = () => {
  const { darkMode } = useTheme();
  const location = useLocation();
  const [showSearchModal, setShowSearchModal] = useState(false);
   const [username, setUsername] = useState("");

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

  const navItems = [
    {
      path: '/home',
      icon: '🏠',
      label: 'Home',
      activeIcon: '🏠'
    },
    {
      path: '/feed',
      icon: '📰',
      label: 'Feed',
      activeIcon: '📰'
    },
    {
      action: 'search',
      icon: '🔍',
      label: 'Search',
      activeIcon: '🔍'
    },
    {
      path: '/posts',
      icon: '➕',
      label: 'Create',
      activeIcon: '➕'
    },
    {
      path: '/dashboard',
      icon: '👤',
      label: username || 'Loading...',
      activeIcon: '👤'
    },

  ];

  const isActive = (path) => location.pathname === path;

  const handleUserSelect = (user) => {
    console.log('Selected user:', user);
    setShowSearchModal(false);
    // Add navigation logic here if needed
  };

  const handleItemClick = (item) => {
    if (item.action === 'search') {
      setShowSearchModal(true);
    }
  };

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 md:hidden border-t transition-colors duration-300 ${
      darkMode 
        ? 'bg-slate-900/95 backdrop-blur border-slate-700' 
        : 'bg-white/95 backdrop-blur border-slate-200'
    }`}>
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item, index) => (
          item.path ? (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                isActive(item.path)
                  ? darkMode
                    ? 'text-red-400 bg-red-900/20'
                    : 'text-red-600 bg-red-50'
                  : darkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={`text-xl mb-1 transition-transform duration-200 ${
                isActive(item.path) ? 'scale-110' : 'scale-100'
              }`}>
                {isActive(item.path) ? item.activeIcon : item.icon}
              </span>
              <span className={`text-xs font-medium transition-all duration-200 ${
                isActive(item.path) ? 'opacity-100' : 'opacity-70'
              }`}>
                {item.label}
              </span>
            </Link>
          ) : (
            <button
              key={index}
              onClick={() => handleItemClick(item)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                darkMode
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="text-xl mb-1 transition-transform duration-200">
                {item.icon}
              </span>
              <span className="text-xs font-medium transition-all duration-200 opacity-70">
                {item.label}
              </span>
            </button>
          )
        ))}
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`w-full max-w-md rounded-2xl p-6 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Search Users
              </h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                ✕
              </button>
            </div>
            <UserSearch 
              onUserSelect={handleUserSelect}
              placeholder="Search for users..."
              className="w-full"
            />
          </div>
        </div>
      )}
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-inherit"></div>
    </nav>
  );
};

export default MobileNavigation;
