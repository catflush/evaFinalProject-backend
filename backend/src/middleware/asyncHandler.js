/**
 * Wrapper function to handle async operations in Express routes
 * Eliminates the need for try/catch blocks in route handlers
 * 
 * @param {Function} fn - The async function to be wrapped
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Alternative implementation using try/catch
 * This version provides more explicit error handling
 * 
 * @param {Function} fn - The async function to be wrapped
 * @returns {Function} Express middleware function
 */
const asyncHandlerTryCatch = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

export { asyncHandler, asyncHandlerTryCatch };
export default asyncHandler; 