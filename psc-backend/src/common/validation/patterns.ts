export const EMAIL_WITH_MIN_LOCAL_PATTERN = /^(?:$|[^\s@]{3,}@[^\s@]+\.[^\s@]{2,})$/;
export const PAKISTAN_PHONE_PATTERN = /^(?:$|03\d{2}[\s-]?\d{7}|(?:\+?92)[\s-]?3\d{2}[\s-]?\d{7}|0\d{2,4}[\s-]?\d{6,8})$/;
export const CNIC_PATTERN = /^(?:$|\d{13}|\d{5}-\d{7}-\d)$/;
export const NON_NEGATIVE_INTEGER_PATTERN = /^(?:$|\d+)$/;
export const NON_NEGATIVE_DECIMAL_PATTERN = /^(?:$|\d+(?:\.\d+)?)$/;

export const VALIDATION_MESSAGES = {
  email: 'Email must be valid and have at least 3 characters before @',
  phone: 'Phone must be valid Pakistan mobile or landline number',
  cnic: 'CNIC must be 13 digits, with or without dashes',
  integer: 'Value must be a non-negative whole number',
  decimal: 'Value must be a non-negative number',
};
