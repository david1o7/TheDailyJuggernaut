import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../api';

const UserSearch = ({ onUserSelect, placeholder = "Search users...", className = "" }) => {
  const { darkMode } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/api/search/users/?q=${encodeURIComponent(query)}`);
        setResults(response.data.results || []);
        setShowResults(true);
      } catch (err) {
        setError('Failed to search users');
        setResults([]);
        console.error('User search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleUserClick = (user) => {
    if (onUserSelect) {
      onUserSelect(user);
    }
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const formatUserName = (user) => {
    return user.full_name || user.username;
  };

  const formatUserInfo = (user) => {
    const parts = [];
    if (user.username) parts.push(`@${user.username}`);
    if (user.location) parts.push(user.location);
    return parts.join(' • ');
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-2 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
            darkMode 
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
          ) : (
            <svg 
              className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div 
          ref={resultsRef}
          className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg border z-50 max-h-80 overflow-y-auto ${
            darkMode 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}
        >
          {error && (
            <div className="p-4 text-center text-red-500 text-sm">
              {error}
            </div>
          )}
          
          {!error && results.length === 0 && query.trim().length >= 2 && !loading && (
            <div className={`p-4 text-center text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No users found for "{query}"
            </div>
          )}
          
          {!error && results.length > 0 && (
            <div className="py-2">
              {results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className={`w-full px-4 py-3 text-left hover:bg-opacity-50 transition-colors flex items-center space-x-3 ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-white' 
                      : 'hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={formatUserName(user)}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        👤
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {formatUserName(user)}
                    </div>
                    <div className={`text-sm truncate ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatUserInfo(user)}
                    </div>
                    {user.bio && (
                      <div className={`text-xs truncate mt-1 ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {user.bio}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {query.trim().length < 2 && (
            <div className={`p-4 text-center text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Type at least 2 characters to search
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
