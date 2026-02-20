import { z } from 'zod';

// User validation schema
export const userSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  address: z.string().optional(),
  phone: z.string().optional().refine(
    (val) => !val || /^[0-9\s\-+()]{7,15}$/.test(val),
    'Please enter a valid phone number'
  )
});

// Product validation schema
export const productSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name must be less than 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  price: z.string()
    .min(1, 'Price is required')
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Price must be a positive number'),
  category: z.string()
    .min(1, 'Category is required')
    .min(2, 'Category must be at least 2 characters'),
  stock: z.string()
    .refine(val => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 0), 'Stock must be a non-negative number').optional(),
  isAvailable: z.boolean().optional().default(true),
  image: z.string()
    .min(1, 'Product image is required')
    .refine(val => val.startsWith('http') || val.startsWith('data:image'), 'Please upload a valid product image')
});

// Login validation schema
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
});

// Password update schema
export const passwordUpdateSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required')
    .min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string()
    .min(1, 'New password is required')
    .min(6, 'New password must be at least 6 characters')
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
});

// Reset password schema
export const resetPasswordSchema = z.object({
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password')
    .min(6, 'Password must be at least 6 characters')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Category validation schema
export const categorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must be less than 50 characters'),
  description: z.string().optional(),
  image: z.any().optional()
});

// Contact form validation schema
export const contactSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z.string().optional().refine(
    (val) => !val || /^[0-9\s\-+()]{7,15}$/.test(val),
    'Please enter a valid phone number'
  ),
  subject: z.string()
    .min(1, 'Subject is required')
    .min(3, 'Subject must be at least 3 characters')
    .max(100, 'Subject must be less than 100 characters'),
  message: z.string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
});

// Checkout form validation schema
export const checkoutSchema = z.object({
  name: z.string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .refine(val => /^\d{10,15}$/.test(val.replace(/\D/g, '')), 'Please enter a valid phone number (10-15 digits)'),
  address: z.string()
    .min(1, 'Address is required')
    .min(5, 'Address must be at least 5 characters'),
  paymentMethod: z.string()
    .min(1, 'Payment method is required'),
  notes: z.string().optional()
});

// Profile form validation schema
export const profileSchema = z.object({
  name: z.string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z.string().optional().refine(
    (val) => !val || /^\d{10,15}$/.test(val.replace(/\D/g, '')),
    'Please enter a valid phone number (10-15 digits)'
  ),
  address: z.string()
    .min(1, 'Address is required')
    .min(5, 'Address must be at least 5 characters')
});
