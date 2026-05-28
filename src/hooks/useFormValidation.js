/**
 * Reusable form validation hook
 * Centralizes validation logic used across multiple pages
 */

import { useState } from 'react';

export function useFormValidation() {
  const [errors, setErrors] = useState({});

  /**
   * Validate required fields
   */
  const validateRequired = (formData, requiredFields) => {
    const newErrors = {};
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = `${field.replace(/_/g, ' ')} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Validate email format
   */
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  /**
   * Validate phone format
   */
  const isValidPhone = (phone) => {
    return /^\+?[\d\s\-()]{10,}$/.test(phone);
  };

  /**
   * Validate field with custom predicate
   */
  const validateField = (field, value, predicate, errorMsg) => {
    if (!predicate(value)) {
      setErrors(prev => ({ ...prev, [field]: errorMsg }));
      return false;
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    return true;
  };

  /**
   * Clear all errors
   */
  const clearErrors = () => setErrors({});

  /**
   * Clear specific field errors
   */
  const clearFieldError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  return {
    errors,
    setErrors,
    validateRequired,
    isValidEmail,
    isValidPhone,
    validateField,
    clearErrors,
    clearFieldError,
  };
}