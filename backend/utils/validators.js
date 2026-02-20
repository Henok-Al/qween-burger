const { z } = require('zod');

// User validation schema
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  address: z.string().optional(),
  phone: z.string().optional().refine(
    (val) => !val || /^[0-9\s\-\+\(\)]{7,15}$/.test(val),
    'Please enter a valid phone number'
  ),
  role: z.enum(['user', 'admin']).optional().default('user')
});

// Product validation schema
const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(100, 'Product name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  price: z.number().positive('Price must be a positive number'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  stock: z.number().int().min(0, 'Stock must be a non-negative number').optional().default(0),
  isAvailable: z.boolean().optional().default(true),
  image: z.string().optional()
});

// Order validation schema
const orderSchema = z.object({
  items: z.array(z.object({
    product: z.string(),
    quantity: z.number().int().positive('Quantity must be a positive number'),
    price: z.number().positive('Price must be a positive number')
  })),
  totalAmount: z.number().positive('Total amount must be a positive number'),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional().default('pending'),
  paymentMethod: z.string().optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed']).optional().default('pending')
});

// Login validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Password update schema
const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

// Forgot password schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

// Reset password schema
const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Category validation schema
const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(50, 'Category name must be less than 50 characters'),
  description: z.string().optional(),
  image: z.string().optional()
});

module.exports = {
  userSchema,
  productSchema,
  orderSchema,
  loginSchema,
  passwordUpdateSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  categorySchema
};
