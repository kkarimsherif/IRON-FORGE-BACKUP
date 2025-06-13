/**
 * Application constants
 */
module.exports = {
  // User roles
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    TRAINER: 'trainer',
  },
  
  // Membership types
  MEMBERSHIP: {
    BASIC: 'basic',
    BLACK_CARD: 'black',
  },
  
  // Payment statuses
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },
  
  // Order statuses
  ORDER_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  },
  
  // BMI categories
  BMI_CATEGORIES: {
    UNDERWEIGHT: 'Underweight',
    NORMAL: 'Normal weight',
    OVERWEIGHT: 'Overweight',
    OBESE: 'Obese',
  },
}; 