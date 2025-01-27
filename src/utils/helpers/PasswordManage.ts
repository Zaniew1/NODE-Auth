import bcrypt from 'bcryptjs';

/**
 * This function compares password given by user and a password from database.
 * If both are the same then return true, otherwise return false
 *
 * @async
 * @param {string} passwordToValidate
 * @param {string} databasePassword
 * @returns {Promise<boolean>}
 */
export const comparePasswords = async (passwordToValidate: string, databasePassword: string): Promise<boolean> => {
  return await bcrypt.compare(passwordToValidate, databasePassword).catch(() => false);
};

/**
 * This function hashes user's password.
 *
 * @async
 * @param {string} password
 * @param {number} [salt=10]
 * @returns {Promise<string>}
 */
export const hashPassword = async (password: string, salt: number = 10): Promise<string> => {
  return await bcrypt.hash(password, salt);
};
