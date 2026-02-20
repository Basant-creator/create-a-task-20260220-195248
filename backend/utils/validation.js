const Joi = require('joi');

// Joi schema for user signup validation
const validateSignup = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required().messages({
            'string.base': 'Name should be a type of text',
            'string.empty': 'Name cannot be an empty field',
            'string.min': 'Name should have a minimum length of {#limit}',
            'string.max': 'Name should have a maximum length of {#limit}',
            'any.required': 'Name is a required field'
        }),
        email: Joi.string().email().required().messages({
            'string.base': 'Email should be a type of text',
            'string.empty': 'Email cannot be an empty field',
            'string.email': 'Email must be a valid email',
            'any.required': 'Email is a required field'
        }),
        password: Joi.string().min(6).required().messages({
            'string.base': 'Password should be a type of text',
            'string.empty': 'Password cannot be an empty field',
            'string.min': 'Password should have a minimum length of {#limit}',
            'any.required': 'Password is a required field'
        }),
    });
    return schema.validate(data);
};

// Joi schema for user login validation
const validateLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().messages({
            'string.base': 'Email should be a type of text',
            'string.empty': 'Email cannot be an empty field',
            'string.email': 'Email must be a valid email',
            'any.required': 'Email is a required field'
        }),
        password: Joi.string().min(6).required().messages({ // Frontend also validates min 6, backend should too
            'string.base': 'Password should be a type of text',
            'string.empty': 'Password cannot be an empty field',
            'string.min': 'Password should have a minimum length of {#limit}',
            'any.required': 'Password is a required field'
        }),
    });
    return schema.validate(data);
};

// Joi schema for user profile update validation
const validateProfileUpdate = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required().messages({
            'string.base': 'Name should be a type of text',
            'string.empty': 'Name cannot be an empty field',
            'string.min': 'Name should have a minimum length of {#limit}',
            'string.max': 'Name should have a maximum length of {#limit}',
            'any.required': 'Name is a required field'
        })
        // Email is not updatable via this route, if it were, it would need validation
    });
    return schema.validate(data);
};

// Joi schema for password change validation
const validatePasswordChange = (data) => {
    const schema = Joi.object({
        currentPassword: Joi.string().min(6).required().messages({
            'string.base': 'Current password should be a type of text',
            'string.empty': 'Current password cannot be an empty field',
            'string.min': 'Current password should have a minimum length of {#limit}',
            'any.required': 'Current password is a required field'
        }),
        newPassword: Joi.string().min(6).required().messages({
            'string.base': 'New password should be a type of text',
            'string.empty': 'New password cannot be an empty field',
            'string.min': 'New password should have a minimum length of {#limit}',
            'any.required': 'New password is a required field'
        }),
    });
    return schema.validate(data);
};

// Joi schema for task validation (for creation and update)
const validateTask = (data) => {
    const schema = Joi.object({
        title: Joi.string().min(3).max(100).required().messages({
            'string.base': 'Title should be a type of text',
            'string.empty': 'Title cannot be an empty field',
            'string.min': 'Title should have a minimum length of {#limit}',
            'string.max': 'Title should have a maximum length of {#limit}',
            'any.required': 'Title is a required field'
        }),
        description: Joi.string().max(500).allow('').optional().messages({
            'string.base': 'Description should be a type of text',
            'string.max': 'Description should have a maximum length of {#limit}'
        }),
        dueDate: Joi.date().allow(null).optional().messages({
            'date.base': 'Due date must be a valid date'
        }),
        status: Joi.string().valid('pending', 'completed').optional().messages({
            'string.base': 'Status should be a string',
            'any.only': 'Status must be either "pending" or "completed"'
        })
    });
    return schema.validate(data);
};


module.exports = {
    validateSignup,
    validateLogin,
    validateProfileUpdate,
    validatePasswordChange,
    validateTask
};