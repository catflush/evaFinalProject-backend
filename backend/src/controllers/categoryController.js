import Category from '../models/Category.js';
import Joi from 'joi';

// Validation schema
const categoryValidationSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().allow('', null).trim(),
  isActive: Joi.boolean().default(true)
});

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single category
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    console.error('Error fetching category:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create new category
export const createCategory = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = categoryValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ name: value.name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name already exists'
      });
    }

    // Create category
    const category = await Category.create(value);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    console.error('Error creating category:', err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name or slug already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = categoryValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Check if category exists
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if new name conflicts with existing category
    if (value.name && value.name !== category.name) {
      const existingCategory = await Category.findOne({ name: value.name });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: 'Category with this name already exists'
        });
      }
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedCategory
    });
  } catch (err) {
    console.error('Error updating category:', err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name or slug already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 