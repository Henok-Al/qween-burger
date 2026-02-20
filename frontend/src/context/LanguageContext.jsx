import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

// English translations
const en = {
  // Navbar
  'navbar.home': 'Home',
  'navbar.products': 'Products',
  'navbar.cart': 'Cart',
  'navbar.login': 'Login',
  'navbar.register': 'Register',
  'navbar.dashboard': 'Dashboard',
  'navbar.logout': 'Logout',
  'navbar.profile': 'Profile',
  'navbar.orders': 'Orders',
  
  // Home Page
  'home.title': 'Welcome to Qween Burger',
  'home.subtitle': 'Delicious burgers delivered to your doorstep',
  'home.features.title': 'Why Choose Us?',
  'home.features.fast': 'Fast Delivery',
  'home.features.fresh': 'Fresh Ingredients',
  'home.features.quality': 'Premium Quality',
  'home.features.affordable': 'Affordable Prices',
  'home.cta': 'Explore Our Menu',
  
  // Products Page
  'products.title': 'Our Products',
  'products.filter': 'Filter Products',
  'products.search': 'Search Products',
  'products.category.all': 'All',
  'products.category.classic': 'Classic',
  'products.category.premium': 'Premium',
  'products.category.veggie': 'Veggie',
  'products.category.chicken': 'Chicken',
  'products.category.beef': 'Beef',
  'products.category.special': 'Special',
  'products.viewAll': 'View All Products',
  
  // Product Details
  'product.details': 'Product Details',
  'product.addToCart': 'Add to Cart',
  'product.quantity': 'Quantity',
  'product.description': 'Description',
  'product.ingredients': 'Ingredients',
  'product.nutritional': 'Nutritional Information',
  'product.reviews': 'Reviews',
  'product.writeReview': 'Write a Review',
  'product.yourReview': 'Your Review',
  'product.submitReview': 'Submit Review',
  
  // Cart
  'cart.title': 'Shopping Cart',
  'cart.empty': 'Your cart is empty',
  'cart.continue': 'Continue Shopping',
  'cart.checkout': 'Checkout',
  'cart.subtotal': 'Subtotal',
  'cart.tax': 'Tax',
  'cart.total': 'Total',
  
  // Checkout
  'checkout.title': 'Checkout',
  'checkout.shipping': 'Shipping Information',
  'checkout.payment': 'Payment Method',
  'checkout.notes': 'Notes',
  'checkout.placeOrder': 'Place Order',
  
  // Orders
  'orders.title': 'My Orders',
  'orders.noOrders': 'No orders found',
  'orders.viewDetails': 'View Details',
  
  // Order Details
  'order.details': 'Order Details',
  'order.items': 'Items',
  'order.delivery': 'Delivery Information',
  'order.status': 'Status',
  'order.payment': 'Payment Status',
  'order.reorder': 'Reorder',
  'order.cancel': 'Cancel Order',
  
  // Admin Dashboard
  'admin.dashboard': 'Admin Dashboard',
  'admin.stats.users': 'Total Users',
  'admin.stats.products': 'Total Products',
  'admin.stats.orders': 'Total Orders',
  'admin.stats.revenue': 'Total Revenue',
  'admin.quickActions': 'Quick Actions',
  'admin.manageProducts': 'Manage Products',
  'admin.manageOrders': 'Manage Orders',
  'admin.manageUsers': 'Manage Users',
  'admin.monthlyStats': 'Monthly Statistics',
  
  // Admin Products
  'admin.products.title': 'Product Management',
  'admin.products.add': 'Add Product',
  'admin.products.search': 'Search Products',
  'admin.products.filter': 'Filter by Category',
  'admin.products.noProducts': 'No products found',
  'admin.products.edit': 'Edit',
  'admin.products.delete': 'Delete',
  'admin.products.enable': 'Enable',
  'admin.products.disable': 'Disable',
  
  // Admin Orders
  'admin.orders.title': 'Manage Orders',
  'admin.orders.filter': 'Filter by Status',
  'admin.orders.noOrders': 'No orders found',
  'admin.orders.viewDetails': 'View Details',
  
  // Admin Users
  'admin.users.title': 'User Management',
  'admin.users.search': 'Search Users',
  'admin.users.filter': 'Filter by Role',
  'admin.users.noUsers': 'No users found',
  'admin.users.edit': 'Edit',
  'admin.users.delete': 'Delete',
  
  // Login/Register
  'auth.login': 'Login',
  'auth.register': 'Register',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.name': 'Name',
  'auth.phone': 'Phone',
  'auth.address': 'Address',
  'auth.confirmPassword': 'Confirm Password',
  'auth.forgotPassword': 'Forgot Password?',
  'auth.resetPassword': 'Reset Password',
  'auth.sendReset': 'Send Reset Link',
  'auth.remember': 'Remember Me',
  
  // Footer
  'footer.about': 'About Us',
  'footer.contact': 'Contact Us',
  'footer.follow': 'Follow Us',
  'footer.copyright': '© 2024 Qween Burger. All rights reserved.',
  
  // Common
  'common.price': 'Price',
  'common.stock': 'Stock',
  'common.available': 'Available',
  'common.unavailable': 'Unavailable',
  'common.category': 'Category',
  'common.actions': 'Actions',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.confirm': 'Are you sure?',
  'common.yes': 'Yes',
  'common.no': 'No'
};

// Afaan Oromoo (Oromic) translations
const om = {
  // Navbar
  'navbar.home': 'Fuula Dhiyoo',
  'navbar.products': 'Oomisholee',
  'navbar.cart': 'Kaaraa',
  'navbar.login': 'Seenuu',
  'navbar.register': 'Galmeessuu',
  'navbar.dashboard': 'Daashboordii',
  'navbar.logout': 'Ba\'uu',
  'navbar.profile': 'Profaayilii',
  'navbar.orders': 'Ajajawwan',
  
  // Home Page
  'home.title': 'Qween Burgeritti Baga Nagaan Dhuftan',
  'home.subtitle': 'Burgeeroota mi\'aa ta\'an mana keessanitti isiniif geessina',
  'home.features.title': 'Maaliif Nu Filattaa?',
  'home.features.fast': 'Geessitaa Sanaa',
  'home.features.fresh': 'Wantoota Haaraa',
  'home.features.quality': 'Safara Ol\'anaa',
  'home.features.affordable': 'Gatii Gahaa',
  'home.cta': 'Meenyuu Keenya Ilaalaa',
  
  // Products Page
  'products.title': 'Oomisholee Keenya',
  'products.filter': 'Oomisholee Baasuu',
  'products.search': 'Oomisholee Barbaaduu',
  'products.category.all': 'Hunda',
  'products.category.classic': 'Klaasikii',
  'products.category.premium': 'Piriimiyamii',
  'products.category.veggie': 'Biyya Laafaa',
  'products.category.chicken': 'Inda\'uu',
  'products.category.beef': 'Hanga',
  'products.category.special': 'Addaa',
  'products.viewAll': 'Oomisholee Hunda Ilaalaa',
  
  // Product Details
  'product.details': 'Bal\'ina Oomishaa',
  'product.addToCart': 'Karaa Isa Kaaraa',
  'product.quantity': 'Lakkoofsa',
  'product.description': 'Ibsa',
  'product.ingredients': 'Wantoota Keessaa',
  'product.nutritional': 'Odeeffannoo Soorataa',
  'product.reviews': 'Yaadannoowwan',
  'product.writeReview': 'Yaadannoo Barreessaa',
  'product.yourReview': 'Yaadannoo Keessan',
  'product.submitReview': 'Yaadannoo Ergaa',
  
  // Cart
  'cart.title': 'Kaaraa Bituu',
  'cart.empty': 'Kaaraan keessan duwwaa dha',
  'cart.continue': 'Bituu Itti Fufaa',
  'cart.checkout': 'Kaffaltii',
  'cart.subtotal': 'Walduraa duubaan',
  'cart.tax': 'Bal\'ina',
  'cart.total': 'Waliigalaa',
  
  // Checkout
  'checkout.title': 'Kaffaltii',
  'checkout.shipping': 'Odeeffannoo Geessitaa',
  'checkout.payment': 'Malaa Kaffaltii',
  'checkout.notes': 'Yaadannoowwan',
  'checkout.placeOrder': 'Ajaja Eeggaa',
  
  // Orders
  'orders.title': 'Ajajawwan Koo',
  'orders.noOrders': 'Ajajawwan hin argamane',
  'orders.viewDetails': 'Bal\'ina Ilaalaa',
  
  // Order Details
  'order.details': 'Bal\'ina Ajajaa',
  'order.items': 'Wantoota',
  'order.delivery': 'Odeeffannoo Geessitaa',
  'order.status': 'Haala',
  'order.payment': 'Haala Kaffaltii',
  'order.reorder': 'Irra Deebi\'uu',
  'order.cancel': 'Ajajaa Haquu',
  
  // Admin Dashboard
  'admin.dashboard': 'Daashboordii Bulchaa',
  'admin.stats.users': 'Fayyadamtoota Waliigalaa',
  'admin.stats.products': 'Oomisholee Waliigalaa',
  'admin.stats.orders': 'Ajajawwan Waliigalaa',
  'admin.stats.revenue': 'Gelii Waliigalaa',
  'admin.quickActions': 'Hojiilee Sanaa',
  'admin.manageProducts': 'Oomisholee Bulchuu',
  'admin.manageOrders': 'Ajajawwan Bulchuu',
  'admin.manageUsers': 'Fayyadamtoota Bulchuu',
  'admin.monthlyStats': 'Ibsa Ji\'aa',
  
  // Admin Products
  'admin.products.title': 'Bulchiinsa Oomishaa',
  'admin.products.add': 'Oomishaa Id\'uu',
  'admin.products.search': 'Oomisholee Barbaaduu',
  'admin.products.filter': 'Sadarkaa Garee Baasuu',
  'admin.products.noProducts': 'Oomisholee hin argamane',
  'admin.products.edit': 'Gulaaluu',
  'admin.products.delete': 'Haquu',
  'admin.products.enable': 'Dandeessisuu',
  'admin.products.disable': 'Dandeessisuu Dhaabuu',
  
  // Admin Orders
  'admin.orders.title': 'Ajajawwan Bulchuu',
  'admin.orders.filter': 'Haala Baasuu',
  'admin.orders.noOrders': 'Ajajawwan hin argamane',
  'admin.orders.viewDetails': 'Bal\'ina Ilaalaa',
  
  // Admin Users
  'admin.users.title': 'Bulchiinsa Fayyadamaa',
  'admin.users.search': 'Fayyadamtoota Barbaaduu',
  'admin.users.filter': 'Sadarkaa Baasuu',
  'admin.users.noUsers': 'Fayyadamtoota hin argamane',
  'admin.users.edit': 'Gulaaluu',
  'admin.users.delete': 'Haquu',
  
  // Login/Register
  'auth.login': 'Seenuu',
  'auth.register': 'Galmeessuu',
  'auth.email': 'Imeeilii',
  'auth.password': 'Jecha Iccitii',
  'auth.name': 'Maqaa',
  'auth.phone': 'Bilbila',
  'auth.address': 'Teessoo',
  'auth.confirmPassword': 'Jecha Iccitii Mirkaneessaa',
  'auth.forgotPassword': 'Jecha Iccitii Irre Darbitee?',
  'auth.resetPassword': 'Jecha Iccitii Haaromuu',
  'auth.sendReset': 'Linkii Haaromuu Ergaa',
  'auth.remember': 'Na Yaadadhaa',
  
  // Footer
  'footer.about': 'Waa\'ii Keenya',
  'footer.contact': 'Nu Quunnamaa',
  'footer.follow': 'Nu Hordofaa',
  'footer.copyright': '© 2024 Qween Burger. Haqa hundi eegama.',
  
  // Common
  'common.price': 'Gatii',
  'common.stock': 'Kuusaa',
  'common.available': 'Jira',
  'common.unavailable': 'Hin Jiru',
  'common.category': 'Garee',
  'common.actions': 'Hojiilee',
  'common.loading': 'Fe\'amaa jira...',
  'common.error': 'Dogoggora',
  'common.success': 'Milkaa\'ina',
  'common.confirm': 'Sirritti yaaddaa?',
  'common.yes': 'Eeyyee',
  'common.no': 'Lakki'
};

// Amharic translations
const am = {
  // Navbar
  'navbar.home': 'ሆም',
  'navbar.products': 'ምርቶች',
  'navbar.cart': 'ሻንጉት',
  'navbar.login': 'መግቢያ',
  'navbar.register': 'መዝግብ',
  'navbar.dashboard': 'ዳሽბోరድ',
  'navbar.logout': 'መውጣት',
  'navbar.profile': 'ሴክሊንግ',
  'navbar.orders': 'የትከላላ ወረቀት',
  
  // Home Page
  'home.title': 'ኳዊን በርገር እንኳን ደህና መጡ',
  'home.subtitle': 'ምንጨዩ በርገሮች በትከላላ ወረቀትዎ ላይ ይላካሉ',
  'home.features.title': 'ለምን እኛን ይምረጡ?',
  'home.features.fast': 'ፈጣን አቅራቢያ',
  'home.features.fresh': 'አዳዲስ አይነት ተከላላዎች',
  'home.features.quality': 'ከፍተኛ ደረጃ',
  'home.features.affordable': 'ጥቅምጥራዊ ዋጋዎች',
  'home.cta': 'የምናለውን ዘንዴ እንዴት እንደምንም',
  
  // Products Page
  'products.title': 'የእኛምምርቶች',
  'products.filter': 'ምርቶችን ይጠኑ',
  'products.search': 'ምርቶችን ይፈልጉ',
  'products.category.all': 'ሁሉም',
  'products.category.classic': 'ክላሲክ',
  'products.category.premium': 'ፕሪሚየም',
  'products.category.veggie': 'ወቀት',
  'products.category.chicken': 'ከሆን',
  'products.category.beef': 'በፍ',
  'products.category.special': 'ስፔሻል',
  'products.viewAll': 'ሁሉንም ምርቶች ይመልከቱ',
  
  // Product Details
  'product.details': 'የምርት ዝርዝር',
  'product.addToCart': ' ወደ ሻንጉት አስገባ',
  'product.quantity': 'ቁጥር',
  'product.description': 'ገለጻ',
  'product.ingredients': 'አይነት ተከላላዎች',
  'product.nutritional': 'የምግብ አይነት',
  'product.reviews': 'የተጫኔ ምከራተያዎች',
  'product.writeReview': 'አንድ ምከራተያ ይጻፈው',
  'product.yourReview': 'የእርስዎ ምከራተያ',
  'product.submitReview': 'ምከራተያ ይላከው',
  
  // Cart
  'cart.title': 'የሻንጉት ገነት',
  'cart.empty': 'የእርስዎ ሻንጉት ባዶ ነው',
  'cart.continue': 'ይቀጥላል ያገዛል',
  'cart.checkout': 'ይቀጥላል',
  'cart.subtotal': 'አጠቃላይ',
  'cart.tax': 'ጡታ',
  'cart.total': 'ጠቅላላ',
  
  // Checkout
  'checkout.title': 'ይቀጥላል',
  'checkout.shipping': 'የአቅራቢያ አይነት',
  'checkout.payment': 'የክፍያ አይነት',
  'checkout.notes': 'ማስታወሻዎች',
  'checkout.placeOrder': 'የትከላላ ወረቀት ይጫኑ',
  
  // Orders
  'orders.title': 'የእኛም የትከላላ ወረቀት',
  'orders.noOrders': 'ምንም የትከላላ ወረቀት አልተገኘም',
  'orders.viewDetails': 'ዝርዝር ይመልከቱ',
  
  // Order Details
  'order.details': 'የትከላላ ወረቀት ዝርዝር',
  'order.items': 'የትከላላ ወረቀት አይነት',
  'order.delivery': 'የአቅራቢያ አይነት',
  'order.status': 'የትከላላ ወረቀት አይነት',
  'order.payment': 'የክፍያ አይነት',
  'order.reorder': 'ድጋሚ ያገዛል',
  'order.cancel': 'የትከላላ ወረቀት ይቀጥላል',
  
  // Admin Dashboard
  'admin.dashboard': 'የአዳሚንዳዊ ዳሽბోరድ',
  'admin.stats.users': 'ጠቅላላ ተጠቃሚዎች',
  'admin.stats.products': 'ጠቅላላ ምርቶች',
  'admin.stats.orders': 'ጠቅላላ የትከላላ ወረቀት',
  'admin.stats.revenue': 'ጠቅላላ ገቢ',
  'admin.quickActions': 'ፈጣን አይነት ተግባራት',
  'admin.manageProducts': 'ምርቶችን ይጠቀምላል',
  'admin.manageOrders': 'የትከላላ ወረቀትን ይጠቀምላል',
  'admin.manageUsers': 'ተጠቃሚዎችን ይጠቀምላል',
  'admin.monthlyStats': 'የወር አይነት የተጫኔ አይነት',
  
  // Admin Products
  'admin.products.title': 'የምርት አስተዳዳሪነት',
  'admin.products.add': 'ምርት አከልተው',
  'admin.products.search': 'ምርቶችን ይፈልጉ',
  'admin.products.filter': 'በዓይነት ይጠኑ',
  'admin.products.noProducts': 'ምንም ምርት አልተገኘም',
  'admin.products.edit': 'ይጠቀምላል',
  'admin.products.delete': 'ይሰረዝ',
  'admin.products.enable': 'ይሰረዝ',
  'admin.products.disable': 'ይሰረዝ',
  
  // Admin Orders
  'admin.orders.title': 'የትከላላ ወረቀት አስተዳዳሪነት',
  'admin.orders.filter': 'በዓይነት ይጠኑ',
  'admin.orders.noOrders': 'ምንም የትከላላ ወረቀት አልተገኘም',
  'admin.orders.viewDetails': 'ዝርዝር ይመልከቱ',
  
  // Admin Users
  'admin.users.title': 'ተጠቃሚ አስተዳዳሪነት',
  'admin.users.search': 'ተጠቃሚዎችን ይፈልጉ',
  'admin.users.filter': 'በዓይነት ይጠኑ',
  'admin.users.noUsers': 'ምንም ተጠቃሚ አልተገኘም',
  'admin.users.edit': 'ይጠቀምላል',
  'admin.users.delete': 'ይሰረዝ',
  
  // Login/Register
  'auth.login': 'መግቢያ',
  'auth.register': 'መዝግብ',
  'auth.email': 'ኢሜል',
  'auth.password': 'የይለፍ ቃል',
  'auth.name': 'ስም',
  'auth.phone': 'ስልክ',
  'auth.address': 'አድራሻ',
  'auth.confirmPassword': 'የይለፍ ቃልን ይረጋግጡ',
  'auth.forgotPassword': 'የይለፍ ቃልን እርማዎት ነው?',
  'auth.resetPassword': 'የይለፍ ቃልን ይቀይርዎት',
  'auth.sendReset': 'የቀይር ቃልን ይላከው',
  'auth.remember': 'አስታውስከው',
  
  // Footer
  'footer.about': 'ስለ እኛ',
  'footer.contact': 'ያግኛልን',
  'footer.follow': 'ከእኛ ጋር ይቀጥላል',
  'footer.copyright': '© 2024 Qween Burger. ሁሉንም መብት ይጠበቀላል.',
  
  // Common
  'common.price': 'ዋጋ',
  'common.stock': 'አካል',
  'common.available': 'ይገኛል',
  'common.unavailable': 'ይገኛል አይገኛል',
  'common.category': 'ዓይነት',
  'common.actions': 'ተግባራት',
  'common.loading': 'የጫንታ...',
  'common.error': 'ስህተት',
  'common.success': 'ተሳካ',
  'common.confirm': 'እርስዎን በማንኛውም መንገድ ይረጋግጡ?',
  'common.yes': 'አዎ',
  'common.no': 'አይ'
};

// Translations object
const translations = {
  en,
  am,
  om
};

// Language names for display
export const languageNames = {
  en: 'English',
  am: 'አማርኛ',
  om: 'Afaan Oromoo'
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Check local storage or use default
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    // Save language preference to local storage
    localStorage.setItem('language', language);
  }, [language]);

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
  };

  const t = (key) => {
    const langTranslations = translations[language] || translations.en;
    return langTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, languageNames }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
