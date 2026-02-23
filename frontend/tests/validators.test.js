import {
  userSchema,
  productSchema,
  loginSchema,
  categorySchema,
  contactSchema,
  checkoutSchema,
  resetPasswordSchema,
  profileSchema,
} from '../src/utils/validators';

describe('User Validation Schema', () => {
  test('should validate a valid user', () => {
    const validUser = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      address: '123 Main St',
      phone: '+1234567890',
    };
    const result = userSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  test('should reject empty name', () => {
    const invalidUser = {
      name: '',
      email: 'john@example.com',
      password: 'password123',
    };
    const result = userSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  test('should reject invalid email', () => {
    const invalidUser = {
      name: 'John',
      email: 'invalid-email',
      password: 'password123',
    };
    const result = userSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  test('should reject short password', () => {
    const invalidUser = {
      name: 'John',
      email: 'john@example.com',
      password: '123',
    };
    const result = userSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  test('should reject invalid phone number', () => {
    const invalidUser = {
      name: 'John',
      email: 'john@example.com',
      password: 'password123',
      phone: 'abc',
    };
    const result = userSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });
});

describe('Login Validation Schema', () => {
  test('should validate a valid login', () => {
    const validLogin = {
      email: 'john@example.com',
      password: 'password123',
    };
    const result = loginSchema.safeParse(validLogin);
    expect(result.success).toBe(true);
  });

  test('should reject empty email', () => {
    const invalidLogin = {
      email: '',
      password: 'password123',
    };
    const result = loginSchema.safeParse(invalidLogin);
    expect(result.success).toBe(false);
  });

  test('should reject invalid email format', () => {
    const invalidLogin = {
      email: 'not-an-email',
      password: 'password123',
    };
    const result = loginSchema.safeParse(invalidLogin);
    expect(result.success).toBe(false);
  });
});

describe('Product Validation Schema', () => {
  test('should validate a valid product', () => {
    const validProduct = {
      name: 'Burger',
      description: 'Delicious burger with cheese',
      price: '9.99',
      category: 'Fast Food',
      stock: '10',
      isAvailable: true,
    };
    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  test('should reject empty product name', () => {
    const invalidProduct = {
      name: '',
      description: 'Delicious burger',
      price: '9.99',
      category: 'Fast Food',
    };
    const result = productSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
  });

  test('should reject invalid price', () => {
    const invalidProduct = {
      name: 'Burger',
      description: 'Delicious burger',
      price: '-10',
      category: 'Fast Food',
    };
    const result = productSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
  });

  test('should reject short description', () => {
    const invalidProduct = {
      name: 'Burger',
      description: 'Short',
      price: '9.99',
      category: 'Fast Food',
    };
    const result = productSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
  });
});

describe('Category Validation Schema', () => {
  test('should validate a valid category', () => {
    const validCategory = {
      name: 'Fast Food',
      description: 'Quick meals',
    };
    const result = categorySchema.safeParse(validCategory);
    expect(result.success).toBe(true);
  });

  test('should reject empty category name', () => {
    const invalidCategory = {
      name: '',
      description: 'Description',
    };
    const result = categorySchema.safeParse(invalidCategory);
    expect(result.success).toBe(false);
  });

  test('should reject short category name', () => {
    const invalidCategory = {
      name: 'A',
      description: 'Description',
    };
    const result = categorySchema.safeParse(invalidCategory);
    expect(result.success).toBe(false);
  });
});

describe('Contact Validation Schema', () => {
  test('should validate a valid contact form', () => {
    const validContact = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      subject: 'Inquiry',
      message: 'This is a test message about the service.',
    };
    const result = contactSchema.safeParse(validContact);
    expect(result.success).toBe(true);
  });

  test('should reject empty subject', () => {
    const invalidContact = {
      name: 'John',
      email: 'john@example.com',
      subject: '',
      message: 'This is a test message.',
    };
    const result = contactSchema.safeParse(invalidContact);
    expect(result.success).toBe(false);
  });

  test('should reject short message', () => {
    const invalidContact = {
      name: 'John',
      email: 'john@example.com',
      subject: 'Subject',
      message: 'Short',
    };
    const result = contactSchema.safeParse(invalidContact);
    expect(result.success).toBe(false);
  });
});

describe('Checkout Validation Schema', () => {
  test('should validate a valid checkout', () => {
    const validCheckout = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Main Street',
      paymentMethod: 'chapa',
    };
    const result = checkoutSchema.safeParse(validCheckout);
    expect(result.success).toBe(true);
  });

  test('should reject empty address', () => {
    const invalidCheckout = {
      name: 'John',
      email: 'john@example.com',
      phone: '1234567890',
      address: '',
      paymentMethod: 'chapa',
    };
    const result = checkoutSchema.safeParse(invalidCheckout);
    expect(result.success).toBe(false);
  });
});

describe('Password Reset Validation Schema', () => {
  test('should validate matching passwords', () => {
    const validReset = {
      password: 'newpassword',
      confirmPassword: 'newpassword',
    };
    const result = resetPasswordSchema.safeParse(validReset);
    expect(result.success).toBe(true);
  });

  test('should reject non-matching passwords', () => {
    const invalidReset = {
      password: 'newpassword',
      confirmPassword: 'differentpassword',
    };
    const result = resetPasswordSchema.safeParse(invalidReset);
    expect(result.success).toBe(false);
  });
});

describe('Profile Validation Schema', () => {
  test('should validate a valid profile', () => {
    const validProfile = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Main Street',
    };
    const result = profileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  test('should reject empty address', () => {
    const invalidProfile = {
      name: 'John',
      email: 'john@example.com',
      phone: '1234567890',
      address: '',
    };
    const result = profileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });
});
