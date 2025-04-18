import { useState, useEffect } from "react";
import { useUser } from "../context/useUser";
import { usePosts } from "../context/PostContext";
import { FaUser, FaEnvelope, FaLock, FaEdit, FaSave, FaTimes, FaTrash, FaExclamationTriangle, FaImage } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword, getProfile, deleteAccount } = useUser();
  const { posts, loading: postsLoading, deletePost, updatePost } = usePosts();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedPostContent, setEditedPostContent] = useState("");
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Filter posts to show only user's posts
  const userPosts = posts.filter(post => post.author._id === user?._id);

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const handleEditPost = (post) => {
    setEditingPostId(post._id);
    setEditedPostContent(post.content);
  };

  const handleUpdatePost = async (postId) => {
    try {
      await updatePost(postId, { content: editedPostContent });
      setEditingPostId(null);
      setEditedPostContent("");
      toast.success("Post updated successfully");
    } catch (error) {
      toast.error("Failed to update post");
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        // First try to get the latest profile data from the server
        const profile = await getProfile();
        setProfileData({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          email: profile.email || ""
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        // Fallback to user data from context if API call fails
        if (user) {
          setProfileData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || ""
          });
          toast.warning("Could not fetch latest profile data. Using cached data.");
        } else {
          // Redirect to login if not logged in
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfile();
    } else {
      // Redirect to login if not logged in
      navigate("/login");
    }
  }, [user, getProfile, navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    setProfileError("");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordError("");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      setProfileError("All fields are required");
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      setProfileError("Please enter a valid email address");
      return;
    }
    
    try {
      setSaving(true);
      await updateProfile(profileData);
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileError(error.message || "Failed to update profile");
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    // Password strength validation
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }
    
    try {
      setSaving(true);
      await changePassword(passwordData);
      toast.success("Password changed successfully");
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError(error.message || "Failed to change password");
      toast.error(error.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setSaving(true);
      await deleteAccount();
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account");
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <FaUser className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {profileData.firstName} {profileData.lastName}
            </h1>
            <p className="text-base-content/70">Manage your account information</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Profile Information</h2>
            {!isEditing ? (
              <button 
                className="btn btn-sm btn-primary gap-2"
                onClick={() => setIsEditing(true)}
              >
                <FaEdit className="h-4 w-4" />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  className="btn btn-sm btn-ghost gap-2"
                  onClick={() => {
                    setIsEditing(false);
                    setProfileData({
                      firstName: user?.firstName || "",
                      lastName: user?.lastName || "",
                      email: user?.email || ""
                    });
                    setProfileError("");
                  }}
                >
                  <FaTimes className="h-4 w-4" />
                  Cancel
                </button>
                <button 
                  className="btn btn-sm btn-primary gap-2"
                  onClick={handleProfileSubmit}
                  disabled={saving}
                >
                  <FaSave className="h-4 w-4" />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          {profileError && (
            <div className="alert alert-error mb-4">
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">First Name</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  className="input input-bordered w-full"
                  disabled={!isEditing}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Last Name</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  className="input input-bordered w-full"
                  disabled={!isEditing}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <div className="flex items-center gap-2">
                  <FaEnvelope className="h-4 w-4 text-primary" />
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="input input-bordered w-full"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Change Password</h2>
            {!isChangingPassword ? (
              <button 
                className="btn btn-sm btn-primary gap-2"
                onClick={() => setIsChangingPassword(true)}
              >
                <FaLock className="h-4 w-4" />
                Change
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  className="btn btn-sm btn-ghost gap-2"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: ""
                    });
                    setPasswordError("");
                  }}
                >
                  <FaTimes className="h-4 w-4" />
                  Cancel
                </button>
                <button 
                  className="btn btn-sm btn-primary gap-2"
                  onClick={handlePasswordSubmit}
                  disabled={saving}
                >
                  <FaSave className="h-4 w-4" />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          {passwordError && (
            <div className="alert alert-error mb-4">
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Current Password</span>
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="input input-bordered w-full"
                  disabled={!isChangingPassword}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">New Password</span>
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="input input-bordered w-full"
                  disabled={!isChangingPassword}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm New Password</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="input input-bordered w-full"
                  disabled={!isChangingPassword}
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Account Deletion */}
      <div className="mt-8 bg-base-100 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-error/10 p-3 rounded-lg">
              <FaExclamationTriangle className="h-6 w-6 text-error" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-error">Delete Account</h2>
              <p className="text-base-content/70">Permanently delete your account and all associated data</p>
            </div>
          </div>
          <button 
            className="btn btn-error gap-2"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <FaTrash className="h-4 w-4" />
            Delete Account
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="alert alert-error mt-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="h-5 w-5" />
                <span className="font-bold">Warning: This action cannot be undone</span>
              </div>
              <p>Are you sure you want to delete your account? All your data will be permanently removed.</p>
              <div className="flex gap-2 mt-2">
                <button 
                  className="btn btn-sm btn-ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-sm btn-error"
                  onClick={handleDeleteAccount}
                  disabled={saving}
                >
                  {saving ? "Deleting..." : "Yes, Delete My Account"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User's Posts Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">My Posts</h2>
        {postsLoading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">You haven't created any posts yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <div key={post._id} className="bg-base-100 rounded-lg shadow-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPost(post)}
                      className="btn btn-ghost btn-sm"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="btn btn-ghost btn-sm text-error"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {editingPostId === post._id ? (
                  <div className="space-y-2">
                    <textarea
                      className="textarea textarea-bordered w-full"
                      value={editedPostContent}
                      onChange={(e) => setEditedPostContent(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingPostId(null);
                          setEditedPostContent("");
                        }}
                        className="btn btn-ghost btn-sm"
                      >
                        <FaTimes />
                      </button>
                      <button
                        onClick={() => handleUpdatePost(post._id)}
                        className="btn btn-primary btn-sm"
                      >
                        <FaSave />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mb-4">{post.content}</p>
                    {post.image && (
                      <div className="relative w-full h-64 mb-4">
                        <img
                          src={post.image}
                          alt="Post content"
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            console.error('Error loading image:', e);
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage; 