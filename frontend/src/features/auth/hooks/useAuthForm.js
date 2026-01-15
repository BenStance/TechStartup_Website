import { useState } from 'react';

// Custom hook for handling form state and validation
export const useAuthForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    resetForm
  };
};

// Custom hook for authentication operations
export const useAuthOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const executeAuthOperation = async (operation) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    executeAuthOperation
  };
};