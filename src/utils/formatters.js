/**
 * Formats currency values
 * @param {number} amount
 * @param {string} currencySymbol
 * @returns {string}
 */
export const formatCurrency = (amount = 0, currencySymbol = '₹') => {
  return `${currencySymbol}${Number(amount).toFixed(2)}`;
};

/**
 * Formats weight quantities (grams or kilograms)
 * @param {number} grams
 * @returns {string}
 */
export const formatWeight = (grams = 0) => {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1).replace(/\.0$/, '')} kg`;
  }
  return `${grams} g`;
};

/**
 * Capitalizes first letter of string
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str = '') => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
