import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../api';
import Mobile from "./MobileNavigation.jsx"

const Dashboard = () => {
  const { darkMode } = useTheme();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    location: '',
    birth_date: '',
    website: '',
    phone: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/dashboard/');
      setUserData(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
        bio: response.data.bio || '',
        location: response.data.location || '',
        birth_date: response.data.birth_date || '',
        website: response.data.website || '',
        phone: response.data.phone || ''
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });
    
    if (avatarFile) {
      submitData.append('avatar', avatarFile);
    }
    
    if (coverFile) {
      submitData.append('cover_photo', coverFile);
    }

    try {
      setLoading(true);
      await api.patch('/api/profile/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setEditing(false);
      setAvatarFile(null);
      setCoverFile(null);
      setAvatarPreview(null);
      setCoverPreview(null);
      fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && !userData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-slate-950' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 text-slate-200' : 'bg-gray-50 text-slate-900'
    }`}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={() => setEditing(!editing)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              editing
                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {userData && (
          <div className="space-y-8">
            {/* Profile Header */}
            <div className={`relative rounded-2xl overflow-hidden ${
              darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'
            }`}>
              {/* Cover Photo */}
              <div className="relative h-48 md:h-64">
                {coverPreview || userData.cover_photo ? (
                  <img
                    src={coverPreview || userData.cover_photo}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full ${
                    darkMode ? 'bg-gradient-to-r from-slate-800 to-slate-700' : 'bg-gradient-to-r from-red-100 to-orange-100'
                  }`} />
                )}
                {editing && (
                  <div className="absolute top-4 right-4">
                    <label className="bg-black/50 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-black/70 transition-colors">
                      📷 Change Cover
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="relative px-6 pb-6">
                <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                      {avatarPreview || userData.avatar ? (
                        <img
                          src={avatarPreview || userData.avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                          👤
                        </div>
                      )}
                    </div>
                    {editing && (
                      <label className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700 transition-colors">
                        📷
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 mt-4 md:mt-0">
                    <h2 className="text-2xl md:text-3xl font-bold">
                      {userData.full_name || userData.username}
                    </h2>
                    <p className="text-lg opacity-70">@{userData.username}</p>
                    {userData.bio && (
                      <p className="mt-2 text-sm opacity-80">{userData.bio}</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex space-x-6 mt-4 md:mt-0">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{userData.posts_count}</div>
                      <div className="text-sm opacity-70">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{userData.followers_count}</div>
                      <div className="text-sm opacity-70">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{userData.following_count}</div>
                      <div className="text-sm opacity-70">Following</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            {editing && (
              <div className={`p-6 rounded-xl border ${
                darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <h3 className="text-xl font-semibold mb-6">Edit Profile Information</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          darkMode
                            ? 'bg-slate-800 border-slate-600 text-white focus:border-red-500'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-red-500'
                        } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          darkMode
                            ? 'bg-slate-800 border-slate-600 text-white focus:border-red-500'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-red-500'
                        } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          darkMode
                            ? 'bg-slate-800 border-slate-600 text-white focus:border-red-500'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-red-500'
                        } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          darkMode
                            ? 'bg-slate-800 border-slate-600 text-white focus:border-red-500'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-red-500'
                        } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          darkMode
                            ? 'bg-slate-800 border-slate-600 text-white focus:border-red-500'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-red-500'
                        } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Birth Date</label>
                      <input
                        type="date"
                        name="birth_date"
                        value={formData.birth_date}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          darkMode
                            ? 'bg-slate-800 border-slate-600 text-white focus:border-red-500'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-red-500'
                        } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Website</label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://..."
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          darkMode
                            ? 'bg-slate-800 border-slate-600 text-white focus:border-red-500'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-red-500'
                        } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
                          darkMode
                            ? 'bg-slate-800 border-slate-600 text-white focus:border-red-500'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-red-500'
                        } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            )}

            {/* Activity Overview */}
            {userData.activity && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-xl border ${
                  darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <h3 className="text-lg font-semibold mb-4">📝 Total Posts</h3>
                  <div className="text-3xl font-bold text-red-600">{userData.activity.total_posts}</div>
                </div>

                <div className={`p-6 rounded-xl border ${
                  darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <h3 className="text-lg font-semibold mb-4">👍 Likes Received</h3>
                  <div className="text-3xl font-bold text-green-600">{userData.activity.total_likes_received}</div>
                </div>

                <div className={`p-6 rounded-xl border ${
                  darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <h3 className="text-lg font-semibold mb-4">💬 Comments Received</h3>
                  <div className="text-3xl font-bold text-blue-600">{userData.activity.total_comments_received}</div>
                </div>
              </div>
            )}
            <Mobile />
            {/* Recent Posts */}
            {userData.activity && userData.activity.recent_posts.length > 0 && (
              <div className={`p-6 rounded-xl border ${
                darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <h3 className="text-xl font-semibold mb-6">Recent Posts</h3>
                <div className="space-y-4">
                  {userData.activity.recent_posts.map(post => (
                    <div key={post.id} className={`p-4 rounded-lg border ${
                      darkMode ? 'border-slate-600' : 'border-slate-200'
                    }`}>
                      <h4 className="font-semibold mb-2">{post.title}</h4>
                      <div className="flex items-center space-x-4 text-sm opacity-70">
                        <span>{formatDate(post.created_at)}</span>
                        <span>👍 {post.likes_count}</span>
                        <span>💬 {post.comments_count}</span>
                        <span>👁️ {post.views_count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
