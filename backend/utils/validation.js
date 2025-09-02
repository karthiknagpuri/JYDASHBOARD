// Data validation utilities

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d\s\-\+\(\)]+$/;

/**
 * Validate participant data
 * @param {Object} participant - Participant data object
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validateParticipant = (participant) => {
  const errors = [];

  // Required fields
  if (!participant.yatri_id || participant.yatri_id.trim() === '') {
    errors.push('Yatri ID is required');
  }

  if (!participant.first_name || participant.first_name.trim() === '') {
    errors.push('First name is required');
  }

  if (!participant.last_name || participant.last_name.trim() === '') {
    errors.push('Last name is required');
  }

  if (!participant.email || participant.email.trim() === '') {
    errors.push('Email is required');
  } else if (!emailRegex.test(participant.email)) {
    errors.push('Invalid email format');
  }

  // Optional field validations
  if (participant.contact_number && !phoneRegex.test(participant.contact_number)) {
    errors.push('Invalid phone number format');
  }

  if (participant.date_of_birth) {
    const dob = new Date(participant.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    
    if (isNaN(dob.getTime())) {
      errors.push('Invalid date of birth');
    } else if (age < 15 || age > 100) {
      errors.push('Age must be between 15 and 100 years');
    }
  }

  if (participant.gender) {
    const validGenders = ['male', 'female', 'other', 'prefer not to say'];
    if (!validGenders.includes(participant.gender.toLowerCase())) {
      errors.push(`Gender must be one of: ${validGenders.join(', ')}`);
    }
  }

  if (participant.yatri_annual_income !== undefined && participant.yatri_annual_income !== null) {
    const income = parseFloat(participant.yatri_annual_income);
    if (isNaN(income) || income < 0) {
      errors.push('Annual income must be a positive number');
    }
  }

  if (participant.scholarship_total_amount_paid !== undefined && participant.scholarship_total_amount_paid !== null) {
    const amount = parseFloat(participant.scholarship_total_amount_paid);
    if (isNaN(amount) || amount < 0) {
      errors.push('Scholarship amount must be a positive number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize participant data
 * @param {Object} participant - Raw participant data
 * @returns {Object} - Sanitized participant data
 */
const sanitizeParticipant = (participant) => {
  const sanitized = {};

  // String fields - trim and prevent XSS
  const stringFields = [
    'yatri_id', 'yatri_type', 'first_name', 'last_name', 'email',
    'dial_code', 'contact_number', 'gender', 'address', 'country',
    'state', 'district', 'education', 'status', 'institute',
    'area_of_interest', 'area_of_interest_2', 'profile', 'payment_id',
    'designation', 'source'
  ];

  stringFields.forEach(field => {
    if (participant[field]) {
      // Remove HTML tags and trim
      sanitized[field] = participant[field]
        .toString()
        .replace(/<[^>]*>/g, '')
        .trim();
    }
  });

  // Date fields
  const dateFields = ['date_of_birth', 'selected_date', 'payment_date'];
  dateFields.forEach(field => {
    if (participant[field]) {
      try {
        const date = new Date(participant[field]);
        if (!isNaN(date.getTime())) {
          sanitized[field] = date.toISOString().split('T')[0];
        }
      } catch (e) {
        // Invalid date, skip
      }
    }
  });

  // Timestamp fields
  if (participant.application_submitted_on) {
    try {
      const date = new Date(participant.application_submitted_on);
      if (!isNaN(date.getTime())) {
        sanitized.application_submitted_on = date.toISOString();
      }
    } catch (e) {
      // Invalid date, skip
    }
  }

  // Numeric fields
  if (participant.yatri_annual_income !== undefined) {
    const income = parseFloat(participant.yatri_annual_income);
    if (!isNaN(income) && income >= 0) {
      sanitized.yatri_annual_income = income;
    }
  }

  if (participant.scholarship_total_amount_paid !== undefined) {
    const amount = parseFloat(participant.scholarship_total_amount_paid);
    if (!isNaN(amount) && amount >= 0) {
      sanitized.scholarship_total_amount_paid = amount;
    }
  }

  // Normalize gender
  if (sanitized.gender) {
    sanitized.gender = sanitized.gender.toLowerCase();
  }

  // Copy over unprocessed fields
  Object.keys(participant).forEach(key => {
    if (!(key in sanitized) && participant[key] !== undefined && participant[key] !== null) {
      sanitized[key] = participant[key];
    }
  });

  return sanitized;
};

/**
 * Validate CSV file
 * @param {Object} file - Uploaded file object
 * @returns {Object} - { isValid: boolean, error: string }
 */
const validateCSVFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file extension
  const fileName = file.originalname || file.name || '';
  if (!fileName.toLowerCase().endsWith('.csv')) {
    return { isValid: false, error: 'File must be a CSV file' };
  }

  // Check MIME type
  const mimeType = file.mimetype || file.type || '';
  if (mimeType && !mimeType.includes('csv') && !mimeType.includes('text')) {
    return { isValid: false, error: 'Invalid file type. Please upload a CSV file' };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size && file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds 10MB limit' };
  }

  return { isValid: true };
};

/**
 * Validate bulk participants data
 * @param {Array} participants - Array of participant objects
 * @returns {Object} - { valid: [], invalid: [], summary: {} }
 */
const validateBulkParticipants = (participants) => {
  const valid = [];
  const invalid = [];
  const duplicates = new Set();
  const seenIds = new Set();

  participants.forEach((participant, index) => {
    // Check for duplicates
    if (seenIds.has(participant.yatri_id)) {
      duplicates.add(participant.yatri_id);
      invalid.push({
        row: index + 1,
        data: participant,
        errors: [`Duplicate Yatri ID: ${participant.yatri_id}`]
      });
      return;
    }
    seenIds.add(participant.yatri_id);

    // Validate participant
    const validation = validateParticipant(participant);
    if (validation.isValid) {
      valid.push(sanitizeParticipant(participant));
    } else {
      invalid.push({
        row: index + 1,
        data: participant,
        errors: validation.errors
      });
    }
  });

  return {
    valid,
    invalid,
    summary: {
      total: participants.length,
      valid: valid.length,
      invalid: invalid.length,
      duplicates: duplicates.size,
      validationRate: ((valid.length / participants.length) * 100).toFixed(2)
    }
  };
};

module.exports = {
  validateParticipant,
  sanitizeParticipant,
  validateCSVFile,
  validateBulkParticipants
};