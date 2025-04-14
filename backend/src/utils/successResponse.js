/**
 * Create a standardized success response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Standardized success response
 */
const createSuccessResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    status: 'success',
    message,
    data
  };
};

/**
 * Create a paginated success response
 * @param {Array} data - Response data
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @param {string} message - Success message
 * @returns {Object} Paginated success response
 */
const createPaginatedResponse = (data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    status: 'success',
    message,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Create a created success response (201)
 * @param {Object} data - Created resource data
 * @param {string} message - Success message
 * @returns {Object} Created success response
 */
const createCreatedResponse = (data, message = 'Resource created successfully') => {
  return createSuccessResponse(data, message, 201);
};

/**
 * Create a no content success response (204)
 * @param {string} message - Success message
 * @returns {Object} No content success response
 */
const createNoContentResponse = (message = 'No content') => {
  return {
    success: true,
    status: 'success',
    message
  };
};

module.exports = {
  createSuccessResponse,
  createPaginatedResponse,
  createCreatedResponse,
  createNoContentResponse
}; 