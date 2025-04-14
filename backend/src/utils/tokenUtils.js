import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for a user
 * @param {string} userId - The ID of the user
 * @param {string} [expiresIn='30d'] - Token expiration time
 * @returns {string} JWT token
 */
export const generateToken = (userId, expiresIn = '30d') => {
  // Use a fallback secret if process.env.JWT_SECRET is not defined
  // eslint-disable-next-line no-undef
  const secret = process.env.JWT_SECRET || 'fallback_secret_key_for_development';
  return jwt.sign({ id: userId }, secret, {
    expiresIn
  });
};

/**
 * Verify a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const verifyToken = (token) => {
  try {
    // eslint-disable-next-line no-undef
    const secret = process.env.JWT_SECRET || 'fallback_secret_key_for_development';
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
};

/**
 * Decode a JWT token without verification
 * @param {string} token - The JWT token to decode
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}; 