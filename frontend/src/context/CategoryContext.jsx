import { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useUser } from './useUser';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error("API URL is required, are you missing a .env file?");
}

const CategoryContext = createContext();

export { CategoryContext };

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();

  // Helper function to ensure data is an array
  const ensureArray = useCallback((data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
  }, []);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/categories`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(ensureArray(data.data));
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
      setCategories([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  }, [ensureArray]);

  // Create new category
  const createCategory = useCallback(async (categoryData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create category');
      }

      const responseData = await response.json();
      const newCategory = responseData.data || responseData;
      setCategories(prev => [...ensureArray(prev), newCategory]);
      toast.success('Category created successfully');
      return newCategory;
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [ensureArray, user]);

  // Update category
  const updateCategory = useCallback(async (categoryId, categoryData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update category');
      }

      const responseData = await response.json();
      const updatedCategory = responseData.data || responseData;
      setCategories(prev => ensureArray(prev).map(category => 
        category._id === categoryId ? updatedCategory : category
      ));
      toast.success('Category updated successfully');
      return updatedCategory;
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [ensureArray, user]);

  // Delete category
  const deleteCategory = useCallback(async (categoryId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      setCategories(prev => ensureArray(prev).filter(category => category._id !== categoryId));
      toast.success('Category deleted successfully');
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [ensureArray, user]);

  // Get single category
  const getCategory = useCallback(async (categoryId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/categories/${categoryId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch category');
      }

      const responseData = await response.json();
      return responseData.data || responseData;
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    categories: ensureArray(categories),
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    ensureArray
  }), [
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    ensureArray
  ]);

  return (
    <CategoryContext.Provider value={contextValue}>
      {children}
    </CategoryContext.Provider>
  );
}; 