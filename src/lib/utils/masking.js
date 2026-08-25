/**
 * Masks a string, keeping only the last N characters visible.
 * @param {string} str - The string to mask
 * @param {number} visibleCount - Number of characters to keep visible at the end
 * @param {string} maskChar - The character to use for masking
 * @returns {string} - The masked string
 */
export const maskString = (str, visibleCount = 4, maskChar = '*') => {
  if (!str) return '';
  const strValue = String(str);
  if (strValue.length <= visibleCount) return strValue;
  
  const maskedPart = maskChar.repeat(strValue.length - visibleCount);
  const visiblePart = strValue.slice(-visibleCount);
  
  return maskedPart + visiblePart;
};

/**
 * Masks a bank account number to show only the last 4 digits (e.g., **** **** **** 1234)
 */
export const maskBankAccount = (accountNumber) => {
  if (!accountNumber) return '';
  const numStr = String(accountNumber);
  if (numStr.length <= 4) return numStr;
  
  // Format as groups of 4 for better readability if desired, or just mask the beginning
  const visible = numStr.slice(-4);
  const masked = '*'.repeat(numStr.length - 4).replace(/(.{4})/g, '$1 ').trim();
  
  return `${masked} ${visible}`;
};

/**
 * Masks an email address (e.g., j***@example.com)
 */
export const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  
  return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
};
