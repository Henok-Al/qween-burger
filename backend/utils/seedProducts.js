/**
 * Seed Script for Products
 * Run with: node backend/utils/seedProducts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Sample burger images from Unsplash (free to use)
const burgerImages = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', // Classic burger
  'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800', // Double burger
  'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800', // Cheese burger
  'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800', // Veggie burger
  'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800', // Chicken burger
  'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800', // Bacon burger
  'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800', // Special burger
  'https://images.unsplash.com/photo-1597151841235-9a4740f8b1dd?w=800', // Premium burger
  'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=800', // Beef burger
  'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800', // Loaded burger
];

// Sample products data
const products = [
  {
    name: 'Classic Cheeseburger',
    description: 'A timeless favorite with juicy beef patty, melted cheddar cheese, fresh lettuce, tomatoes, pickles, and our special sauce on a toasted sesame bun.',
    price: 8.99,
    category: 'classic',
    stock: 50,
    ingredients: ['Beef Patty', 'Cheddar Cheese', 'Lettuce', 'Tomato', 'Pickles', 'Special Sauce', 'Sesame Bun'],
    nutritionalInfo: { calories: 520, protein: 28, carbs: 42, fat: 26 }
  },
  {
    name: 'Double Bacon Deluxe',
    description: 'Two flame-grilled beef patties stacked with crispy bacon, American cheese, caramelized onions, and smoky BBQ sauce.',
    price: 12.99,
    category: 'premium',
    stock: 35,
    ingredients: ['Double Beef Patty', 'Bacon', 'American Cheese', 'Caramelized Onions', 'BBQ Sauce', 'Brioche Bun'],
    nutritionalInfo: { calories: 780, protein: 45, carbs: 48, fat: 42 }
  },
  {
    name: 'Veggie Garden Burger',
    description: 'A delicious plant-based patty made with black beans, quinoa, and roasted vegetables, topped with avocado and fresh greens.',
    price: 9.99,
    category: 'veggie',
    stock: 30,
    ingredients: ['Black Bean Patty', 'Avocado', 'Sprouts', 'Tomato', 'Vegan Mayo', 'Whole Wheat Bun'],
    nutritionalInfo: { calories: 420, protein: 18, carbs: 52, fat: 18 }
  },
  {
    name: 'Spicy Chicken Burger',
    description: 'Crispy fried chicken breast marinated in spicy seasonings, topped with jalapeños, coleslaw, and spicy mayo.',
    price: 10.99,
    category: 'chicken',
    stock: 40,
    ingredients: ['Chicken Breast', 'Jalapeños', 'Coleslaw', 'Spicy Mayo', 'Lettuce', 'Brioche Bun'],
    nutritionalInfo: { calories: 580, protein: 32, carbs: 45, fat: 28 }
  },
  {
    name: 'BBQ Beef Burger',
    description: 'Angus beef patty smothered in tangy BBQ sauce, topped with crispy onion rings, cheddar cheese, and bacon bits.',
    price: 11.99,
    category: 'beef',
    stock: 25,
    ingredients: ['Angus Beef Patty', 'BBQ Sauce', 'Onion Rings', 'Cheddar Cheese', 'Bacon Bits', 'Pretzel Bun'],
    nutritionalInfo: { calories: 720, protein: 38, carbs: 56, fat: 36 }
  },
  {
    name: 'Mushroom Swiss Burger',
    description: 'Premium beef patty topped with sautéed mushrooms, melted Swiss cheese, and garlic aioli on a toasted bun.',
    price: 11.49,
    category: 'premium',
    stock: 28,
    ingredients: ['Beef Patty', 'Mushrooms', 'Swiss Cheese', 'Garlic Aioli', 'Lettuce', 'Onion Bun'],
    nutritionalInfo: { calories: 620, protein: 35, carbs: 40, fat: 32 }
  },
  {
    name: 'Hawaiian Teriyaki Burger',
    description: 'Beef patty glazed with teriyaki sauce, topped with grilled pineapple, Swiss cheese, and crispy lettuce.',
    price: 10.49,
    category: 'special',
    stock: 22,
    ingredients: ['Beef Patty', 'Teriyaki Sauce', 'Grilled Pineapple', 'Swiss Cheese', 'Lettuce', 'Hawaiian Bun'],
    nutritionalInfo: { calories: 590, protein: 30, carbs: 58, fat: 24 }
  },
  {
    name: 'Grilled Chicken Club',
    description: 'Grilled chicken breast with hickory smoked bacon, Swiss cheese, lettuce, tomato, and honey mustard sauce.',
    price: 10.99,
    category: 'chicken',
    stock: 35,
    ingredients: ['Grilled Chicken', 'Bacon', 'Swiss Cheese', 'Lettuce', 'Tomato', 'Honey Mustard', 'Ciabatta Bun'],
    nutritionalInfo: { calories: 540, protein: 36, carbs: 38, fat: 24 }
  },
  {
    name: 'The Qween Special',
    description: 'Our signature burger! Triple beef patties, three types of cheese, bacon, fried egg, and our secret Qween sauce.',
    price: 15.99,
    category: 'special',
    stock: 20,
    ingredients: ['Triple Beef Patty', 'Cheddar', 'Swiss', 'Blue Cheese', 'Bacon', 'Fried Egg', 'Qween Sauce', 'Brioche Bun'],
    nutritionalInfo: { calories: 980, protein: 62, carbs: 52, fat: 58 }
  },
  {
    name: 'Classic Hamburger',
    description: 'Simple and delicious - pure beef patty with ketchup, mustard, pickles, and fresh onions on a soft bun.',
    price: 6.99,
    category: 'classic',
    stock: 60,
    ingredients: ['Beef Patty', 'Ketchup', 'Mustard', 'Pickles', 'Onions', 'Classic Bun'],
    nutritionalInfo: { calories: 380, protein: 22, carbs: 35, fat: 16 }
  },
  {
    name: 'Jalapeño Popper Burger',
    description: 'Spicy beef patty stuffed with cream cheese and jalapeños, topped with bacon and pepper jack cheese.',
    price: 12.49,
    category: 'special',
    stock: 18,
    ingredients: ['Beef Patty', 'Cream Cheese', 'Jalapeños', 'Bacon', 'Pepper Jack Cheese', 'Sourdough Bun'],
    nutritionalInfo: { calories: 680, protein: 34, carbs: 42, fat: 38 }
  },
  {
    name: 'Portobello Veggie Burger',
    description: 'Grilled portobello mushroom cap with roasted peppers, goat cheese, arugula, and balsamic glaze.',
    price: 10.99,
    category: 'veggie',
    stock: 25,
    ingredients: ['Portobello Mushroom', 'Roasted Peppers', 'Goat Cheese', 'Arugula', 'Balsamic Glaze', 'Focaccia Bun'],
    nutritionalInfo: { calories: 380, protein: 14, carbs: 45, fat: 16 }
  }
];

async function uploadImageToCloudinary(imageUrl, publicId) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
      folder: 'qween-burger/products',
      transformation: [
        { width: 800, height: 600, crop: 'fill' },
        { quality: 'auto:good' }
      ]
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error(`Failed to upload image ${imageUrl}:`, error.message);
    return null;
  }
}

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');

    // Create products with uploaded images
    const createdProducts = [];
    
    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      const imageUrl = burgerImages[i % burgerImages.length];
      
      console.log(`📤 Uploading image for: ${productData.name}`);
      
      // Upload image to Cloudinary
      const uploadedImage = await uploadImageToCloudinary(
        imageUrl,
        `product-${i + 1}-${Date.now()}`
      );
      
      if (uploadedImage) {
        const product = new Product({
          ...productData,
          image: uploadedImage.url,
          imagePublicId: uploadedImage.publicId,
          isAvailable: true,
          ratings: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3.0 and 5.0
          numReviews: Math.floor(Math.random() * 100) + 10 // Random reviews between 10 and 110
        });
        
        await product.save();
        createdProducts.push(product);
        console.log(`✅ Created product: ${product.name}`);
      }
    }

    console.log(`\n🎉 Successfully seeded ${createdProducts.length} products!`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

// Run the seed script
seedProducts();
