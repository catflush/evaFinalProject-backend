import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from './useUser';
import { toast } from 'react-toastify';

const PostContext = createContext();

export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};

export const PostProvider = ({ children }) => {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Helper function to ensure image URLs are properly constructed
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    
    // Remove any leading slashes and 'uploads/' prefix to avoid duplicates
    const cleanPath = imagePath.replace(/^\/+/, '').replace(/^uploads\//, '');
    return `${API_URL.replace(/\/api$/, '')}/uploads/${cleanPath}`;
  };

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/posts`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch posts');
      }

      const data = await response.json();
      console.log('Fetched posts:', data);
      
      // Ensure image URLs are properly constructed
      const postsWithFullImageUrls = data.map(post => ({
        ...post,
        image: getFullImageUrl(post.image)
      }));
      
      setPosts(postsWithFullImageUrls);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.token, API_URL]);

  const createPost = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);

      // Log the form data for debugging
      console.log('Creating post with formData:', {
        content: formData.get('content'),
        hasImage: formData.has('image'),
        imageName: formData.get('image')?.name
      });

      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.message || 'Failed to create post');
      }

      const newPost = await response.json();
      console.log('Created post:', newPost);
      
      // Ensure the image URL is properly constructed
      if (newPost.image) {
        newPost.image = getFullImageUrl(newPost.image);
      }
      
      setPosts(prevPosts => [newPost, ...prevPosts]);
      toast.success('Post created successfully! 🎉');
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.message);
      toast.error(error.message || 'Failed to create post. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.token, API_URL]);

  const updatePost = useCallback(async (postId, postData) => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('content', postData.content);
      if (postData.image) {
        formData.append('image', postData.image);
      }

      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update post');
      }

      const updatedPost = await response.json();
      
      // Ensure the image URL is properly constructed
      if (updatedPost.image) {
        updatedPost.image = getFullImageUrl(updatedPost.image);
      }
      
      setPosts(prevPosts => 
        prevPosts.map(post => post._id === postId ? updatedPost : post)
      );
      toast.success('Post updated successfully');
      return updatedPost;
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.token, API_URL]);

  const deletePost = useCallback(async (postId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete post');
      }

      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      setError(error.message);
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.token, API_URL]);

  const likePost = useCallback(async (postId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to like post');
      }

      const updatedPost = await response.json();
      setPosts(prevPosts => 
        prevPosts.map(post => post._id === postId ? updatedPost : post)
      );
    } catch (error) {
      console.error('Error liking post:', error);
      setError(error.message);
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.token, API_URL]);

  const addComment = useCallback(async (postId, content) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add comment');
      }

      const updatedPost = await response.json();
      setPosts(prevPosts => 
        prevPosts.map(post => post._id === postId ? updatedPost : post)
      );
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error.message);
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.token, API_URL]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  const value = useMemo(() => ({
    posts,
    loading,
    error,
    createPost,
    deletePost,
    updatePost,
    fetchPosts,
    likePost,
    addComment
  }), [
    posts,
    loading,
    error,
    createPost,
    deletePost,
    updatePost,
    fetchPosts,
    likePost,
    addComment
  ]);

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
};

export default PostContext; 