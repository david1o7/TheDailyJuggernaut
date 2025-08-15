import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../api';
import Mobile from './MobileNavigation'

const PostManager = () => {
  const { darkMode } = useTheme();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    visibility: 'public',
    is_published: true
  });
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/posts/my_posts/');
      setPosts(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories/');
      setCategories(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setAdditionalImages(files);
    
    // Create previews
    const previews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === files.length) {
          setAdditionalPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    
    if (mainImage) {
      submitData.append('image', mainImage);
    }
    
    additionalImages.forEach((image, index) => {
      submitData.append('additional_images', image);
    });

    try {
      setLoading(true);
      await api.post('/api/posts/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        category: '',
        visibility: 'public',
        is_published: true
      });
      setMainImage(null);
      setAdditionalImages([]);
      setImagePreview(null);
      setAdditionalPreviews([]);
      setShowCreateForm(false);
      
      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/api/posts/${postId}/`);
        fetchPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post. Please try again.');
      }
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Posts</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              darkMode
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {showCreateForm ? 'Cancel' : '+ Create New Post'}
          </button>
        </div>
        <Mobile />
        {/* Create Post Form */}
        {showCreateForm && (
          <div className={`mb-8 p-6 rounded-xl border ${
            darkMode 
              ? 'bg-slate-900 border-slate-700' 
              : 'bg-white border-slate-200'
          }`}>
            <h2 className="text-xl font-semibold mb-6">Create New Post</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-slate-800 border-slate-600 text-white focus:border-red-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-red-500'
                  } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                  placeholder="Enter post title..."
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
                    darkMode
                      ? 'bg-slate-800 border-slate-600 text-white focus:border-red-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-red-500'
                  } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                  placeholder="Write your post content..."
                />
              </div>

              {/* Category and Visibility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      darkMode
                        ? 'bg-slate-800 border-slate-600 text-white focus:border-red-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-red-500'
                    } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Visibility</label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      darkMode
                        ? 'bg-slate-800 border-slate-600 text-white focus:border-red-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-red-500'
                    } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>
              </div>

              {/* Main Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Main Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-slate-800 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-xs h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Additional Images */}
              <div>
                <label className="block text-sm font-medium mb-2">Additional Images (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-slate-800 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
                {additionalPreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {additionalPreviews.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleInputChange}
                  className="mr-3 w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <label className="text-sm font-medium">Publish immediately</label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {loading ? 'Creating Post...' : 'Create Post'}
              </button>
            </form>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Your Posts</h2>
          
          {loading && !showCreateForm ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className={`text-center py-12 rounded-xl border ${
              darkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <p className="text-lg mb-4">No posts yet</p>
              <p className="text-sm opacity-70">Create your first post to get started!</p>
            </div>
          ) : (
            posts.map(post => (
              <div
                key={post.id}
                className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                  darkMode
                    ? 'bg-slate-900 border-slate-700 hover:border-slate-600'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <div className="flex items-center space-x-4 text-sm opacity-70">
                      <span>{formatDate(post.created_at)}</span>
                      {post.category_name && (
                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">
                          {post.category_name}
                        </span>
                      )}
                      <span className="capitalize">{post.visibility}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete post"
                  >
                    🗑️
                  </button>
                </div>

                <p className="mb-4 line-clamp-3">{post.content}</p>

                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full max-w-md h-48 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="flex items-center space-x-6 text-sm opacity-70">
                  <span>👍 {post.likes_count} likes</span>
                  <span>💬 {post.comments_count} comments</span>
                  <span>👁️ {post.views_count} views</span>
                  <span>📤 {post.shares_count} shares</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostManager;
