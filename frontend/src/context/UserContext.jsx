import { createContext, useState, useEffect } from 'react';

// Get API URL from environment variables with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create the context
export const UserContext = createContext();

// Create the provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Check if user data exists in localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          // Verify token is still valid
          try {
            const response = await fetch(`${API_URL}/auth/profile`, {
              headers: {
                'Authorization': `Bearer ${parsedUser.token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              setUser({ ...parsedUser, ...data });
            } else {
              // Token is invalid, clear user data
              localStorage.removeItem('user');
              setUser(null);
            }
          } catch (error) {
            console.error('Token validation error:', error);
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        setError('Failed to check user status');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Helper function to check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Ensure role is lowercase
      if (data.role) {
        data.role = data.role.toLowerCase();
      }
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Clear local storage data
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setError(null);
      if (!user || !user.token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Profile update failed');
      }

      const data = await response.json();
      // Update user data in localStorage
      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return data;
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Get user profile
  const getProfile = async () => {
    try {
      setError(null);
      if (!user || !user.token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      setError(null);
      if (!user || !user.token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_URL}/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          ...passwordData,
          userId: user._id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Password change failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Change password error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      setError(null);
      if (!user || !user.token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_URL}/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Account deletion failed');
      }

      // Clear user data on successful deletion
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
      return true;
    } catch (error) {
      console.error('Delete account error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Admin functions
  const getAllUsers = async () => {
    try {
      setError(null);
      if (!user || !user.token || !isAdmin()) {
        throw new Error('Admin access required');
      }

      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get all users error:', error);
      setError(error.message);
      throw error;
    }
  };

  const createUser = async (userData) => {
    try {
      setError(null);
      if (!user || !user.token || !isAdmin()) {
        throw new Error('Admin access required');
      }

      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create user error:', error);
      setError(error.message);
      throw error;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      setError(null);
      if (!user || !user.token || !isAdmin()) {
        throw new Error('Admin access required');
      }

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update user error:', error);
      setError(error.message);
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      setError(null);
      if (!user || !user.token || !isAdmin()) {
        throw new Error('Admin access required');
      }

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      setError(error.message);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        isAdmin,
        login,
        logout,
        register,
        updateProfile,
        getProfile,
        changePassword,
        deleteAccount,
        // Admin functions
        getAllUsers,
        createUser,
        updateUser,
        deleteUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
}; 