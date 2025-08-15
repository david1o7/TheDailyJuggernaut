import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../api';
import Mobile from './MobileNavigation'

const PostFeed = () => {
  const { darkMode } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [filter, searchTerm]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = '/api/posts/';
      const params = new URLSearchParams();
      
      if (filter !== 'all') {
        params.append('category', filter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await api.get(url);
      setPosts(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/api/posts/${postId}/like/`);
      // Refresh posts to get updated like count
      fetchPosts();
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

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 text-slate-200' : 'bg-gray-50 text-slate-900'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">News Feed</h1>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                darkMode
                  ? 'bg-slate-800 border-slate-600 text-white focus:border-red-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-red-500'
              } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
            />
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`px-4 py-3 rounded-lg border transition-colors ${
                darkMode
                  ? 'bg-slate-800 border-slate-600 text-white focus:border-red-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-red-500'
              } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
            >
              <option value="all">All Categories</option>
              <option value="1">Breaking News</option>
              <option value="2">Sports</option>
              <option value="3">Technology</option>
              <option value="4">Campus Life</option>
            </select>
          </div>
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className={`text-center py-12 rounded-xl border ${
            darkMode ? 'border-slate-700' : 'border-slate-200'
          }`}>
            <p className="text-lg mb-4">No posts found</p>
            <p className="text-sm opacity-70">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <article
                key={post.id}
                className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                  darkMode
                    ? 'bg-slate-900 border-slate-700 hover:border-slate-600'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Post Header */}
                <div className="flex items-center mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {post.author_avatar && (
                        <img
                          src={post.author_avatar}
                          alt={post.author_username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h4 className="font-semibold">{post.author_username}</h4>
                        <div className="flex items-center space-x-2 text-sm opacity-70">
                          <span>{formatDate(post.created_at)}</span>
                          {post.category_name && (
                            <span 
                              className="px-2 py-1 rounded-full text-xs text-white"
                              style={{ backgroundColor: post.category_color || '#3B82F6' }}
                            >
                              {post.category_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {post.is_featured && (
                    <span className="px-3 py-1 bg-yellow-500 text-yellow-900 text-xs font-semibold rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                {/* Post Content */}
                <h2 className="text-xl font-bold mb-3">{post.title}</h2>
                <p className="mb-4 leading-relaxed">{post.content}</p>

                {/* Post Image */}
                {post.image && (
                  <div className="mb-4">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full max-h-96 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Additional Images */}
                {post.additional_images && post.additional_images.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {post.additional_images.map((img, index) => (
                      <img
                        key={index}
                        src={img.image}
                        alt={img.caption || `Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
                <Mobile />
                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        post.is_liked
                          ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{post.is_liked ? '❤️' : '🤍'}</span>
                      <span>{post.likes_count}</span>
                    </button>
                    
                    <div className="flex items-center space-x-2 text-sm opacity-70">
                      <span>💬 {post.comments_count}</span>
                      <span>👁️ {post.views_count}</span>
                      <span>📤 {post.shares_count}</span>
                    </div>
                  </div>

                  <div className="text-sm opacity-70">
                    {post.time_since_posted}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
    
  );
};

export default PostFeed;
