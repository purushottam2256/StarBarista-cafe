// Add validation to ensure date is a valid Date object
export const formatDate = (date: any): string => {
  if (!date) return 'N/A';
  
  // If date is a string or number, convert it to a Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Generates a sequential order ID with ORD prefix and date component
 */
export const generateOrderId = (): string => {
  return `ORD${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
};

/**
 * Formats currency values
 */
export const formatCurrency = (amount: number) => {
  return `₹${amount.toFixed(2)}`;
};

/**
 * Safely parse JSON or return default value
 */
export const safelyParseJSON = (jsonString: string, defaultValue: any = {}) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return defaultValue;
  }
};

// Add these new utility functions for safe price handling
export const formatPrice = (price: number | string | undefined): string => {
  if (typeof price === 'undefined') return '0.00';
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
};

export const calculateItemTotal = (price: number | string, quantity: number): number => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return isNaN(numericPrice) || isNaN(quantity) ? 0 : numericPrice * quantity;
};

// Function to safely convert string values to numbers
export const safeNumber = (value: any): number => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return !isNaN(parsed) ? parsed : 0;
  }
  return 0;
};
