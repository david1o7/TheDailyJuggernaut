import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from './Navbar';
import api from '../api';

const HomePage = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/posts/');
      const allPosts = response.data.results || response.data;
      
      if (Array.isArray(allPosts)) {
        const regularPosts = allPosts.filter(post => !post.is_featured);
        const featuredPost = allPosts.find(post => post.is_featured) || allPosts[0];
        
        setPosts(regularPosts);
        setFeaturedPost(featuredPost);
      } else {
        setError('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error.response?.data?.detail || error.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId, event) => {
    if (event) event.stopPropagation();
    
    try {
      const response = await api.post(`/api/posts/${postId}/like/`);
      
      // Update posts state
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes_count: response.data.status === 'liked' 
              ? post.likes_count + 1 
              : post.likes_count - 1,
            is_liked: response.data.status === 'liked'
          };
        }
        return post;
      }));
      
      // Update featured post if same
      if (featuredPost && featuredPost.id === postId) {
        setFeaturedPost(prev => ({
          ...prev,
          likes_count: response.data.status === 'liked' 
            ? prev.likes_count + 1 
            : prev.likes_count - 1,
          is_liked: response.data.status === 'liked'
        }));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Error Loading Posts</h2>
            <p className={`text-gray-600 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
            <button 
              onClick={fetchPosts}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 overflow-x-hidden ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="container mx-auto px-4 py-6 md:py-8 max-w-7xl w-full">
        {/* Hero Section */}
        <section className="mb-8 md:mb-12">
          <div className={`rounded-2xl p-6 md:p-8 mb-6 md:mb-8 ${
            darkMode 
              ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600' 
              : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200'
          }`}>
            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 leading-tight ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Welcome to Daily Juggernaut
            </h1>
            <p className={`text-lg md:text-xl mb-4 md:mb-6 leading-relaxed ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Stay informed with the latest campus news, research breakthroughs, and student stories.
              check click on the feed button to read and see newly uploaded material. 
            </p>
            <div className="flex flex-wrap gap-2 md:gap-4">
              <span className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium ${
                darkMode 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 text-green-800'
              }`}>
                Verified News
              </span>
            </div>
          </div>
        </section>

        {/* Featured Article */}
        {featuredPost && (
          <section className="mb-8 md:mb-12">
            <h2 className={`text-2xl md:text-3xl font-bold mb-4 md:mb-6 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Featured Story
            </h2>
            <div className={`rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="md:flex">
                <div className="md:w-1/3 lg:w-2/5">
                  {featuredPost.image ? (
                    <img 
                      src={featuredPost.image} 
                      alt={featuredPost.title}
                      className="h-48 md:h-full w-full object-cover"
                    />
                  ) : (
                    <div className={`h-48 md:h-full flex items-center justify-center text-4xl md:text-6xl ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      📰
                    </div>
                  )}
                </div>
                <div className="md:w-2/3 lg:w-3/5 p-4 md:p-6 lg:p-8">
                  <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
                    {featuredPost.category_name && (
                      <span 
                        className="text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium"
                        style={{ backgroundColor: featuredPost.category_color || '#DC2626' }}
                      >
                        {featuredPost.category_name}
                      </span>
                    )}
                    <span className={`text-xs md:text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatDate(featuredPost.created_at)}
                    </span>
                  </div>
                  <h3 className={`text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4 leading-tight break-words ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {featuredPost.title}
                  </h3>
                  <p className={`text-sm md:text-base lg:text-lg mb-3 md:mb-4 leading-relaxed break-words ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {featuredPost.content.length > 150 
                      ? featuredPost.content.substring(0, 150) + '...' 
                      : featuredPost.content}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className={`text-xs md:text-sm font-medium ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      By {featuredPost.author_username}
                    </span>
                    <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-4">
                      <div className="flex items-center space-x-2 md:space-x-3 text-xs md:text-sm opacity-70">
                        <span>👍 {featuredPost.likes_count}</span>
                        <span>💬 {featuredPost.comments_count}</span>
                        <span>👁️ {featuredPost.views_count}</span>
                      </div>
                      <button 
                        onClick={(e) => handleLike(featuredPost.id, e)}
                        className={`px-4 md:px-6 py-1.5 md:py-2 rounded-lg text-sm font-medium transition-colors ${
                          featuredPost.is_liked 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-600'
                        }`}
                      >
                        {featuredPost.is_liked ? '❤️ Liked' : '🤍 Like'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Latest Posts */}
        <section className="mb-8">
          <h2 className={`text-2xl md:text-3xl font-bold mb-4 md:mb-6 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Latest News
          </h2>
          
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {posts.map((post) => (
                <article 
                  key={post.id}
                  className={`rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ${
                    darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}
                >
                  {post.image ? (
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="h-40 md:h-48 w-full object-cover"
                    />
                  ) : (
                    <div className={`h-40 md:h-48 flex items-center justify-center text-3xl md:text-4xl ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      📰
                    </div>
                  )}
                  <div className="p-4 md:p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-3">
                      {post.category_name && (
                        <span 
                          className="text-white px-2 py-1 rounded text-xs font-medium"
                          style={{ backgroundColor: post.category_color || '#DC2626' }}
                        >
                          {post.category_name}
                        </span>
                      )}
                      <span className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                    <h3 className={`text-base md:text-lg font-bold mb-2 md:mb-3 leading-tight break-words ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {post.title}
                    </h3>
                    <p className={`text-sm mb-3 md:mb-4 leading-relaxed break-words ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {post.content.length > 120 
                        ? post.content.substring(0, 120) + '...' 
                        : post.content}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        By {post.author_username}
                      </span>
                      <div className="flex items-center justify-between sm:justify-end gap-2 md:gap-3">
                        <div className="flex items-center space-x-2 text-xs opacity-70">
                          <span>👍 {post.likes_count}</span>
                          <span>💬 {post.comments_count}</span>
                          <span>👁️ {post.views_count}</span>
                        </div>
                        <button 
                          onClick={(e) => handleLike(post.id, e)}
                          className={`text-xs md:text-sm font-medium transition-colors ${
                            post.is_liked 
                              ? 'text-red-600 hover:text-red-700' 
                              : 'text-gray-500 hover:text-red-600'
                          }`}
                        >
                          {post.is_liked ? '❤️ Liked' : '🤍 Like'}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={`text-center py-12 rounded-xl ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="text-4xl mb-4">📝</div>
              <p className={`text-lg mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                No posts available yet.
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Check back later for new content!
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomePage;
