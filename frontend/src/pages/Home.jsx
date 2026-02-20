import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const { language } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Translations for all three languages
  const translations = {
    en: {
      bestBurgers: 'Best Burgers in Town',
      deliciousBurgers: 'Delicious Burgers',
      deliveredToYou: 'Delivered to You',
      heroDescription: 'Experience the best burgers made with fresh ingredients and delivered hot to your doorstep.',
      orderNow: 'Order Now',
      contactUs: 'Contact Us',
      fastDelivery: 'Fast Delivery',
      fastDeliveryDesc: '30 mins or less',
      freshFood: 'Fresh Food',
      freshFoodDesc: 'Quality ingredients',
      bestPrice: 'Best Price',
      bestPriceDesc: 'Affordable rates',
      madeWithLove: 'Made with Love',
      madeWithLoveDesc: 'Passion for food',
      ourMenu: 'Our Menu',
      featuredProducts: 'Featured Products',
      featuredDesc: 'Our most popular burgers loved by customers',
      viewAllProducts: 'View All Products',
      testimonials: 'Testimonials',
      whatCustomersSay: 'What Our Customers Say',
      regularCustomer: 'Regular Customer',
      foodEnthusiast: 'Food Enthusiast',
      foodBlogger: 'Food Blogger',
      testimonial1: "The best burgers I've ever tasted! Fresh ingredients, amazing taste, and fast delivery. Highly recommended!",
      testimonial2: "Great service and delicious food! The delivery was fast and the burger was still hot. Will definitely order again!",
      testimonial3: "The quality of ingredients is outstanding. You can taste the difference. Perfect for burger lovers!",
      readyToOrder: 'Ready to Order?',
      readyToOrderDesc: 'Order now and get your delicious burger delivered in 30 minutes or less!',
      browseMenu: 'Browse Menu',
      happyCustomers: '5K+ Happy Customers'
    },
    am: {
      bestBurgers: 'በከተማው ውስጥ ምርጥ በርገሮች',
      deliciousBurgers: 'ጣፋጭ በርገሮች',
      deliveredToYou: 'እስከ እርስዎ ድረስ ይደርሳል',
      heroDescription: 'በአዲስ ንጥረ ነገሮች የተሰሩ ምርጥ በርገሮችን ይሞክሩ እና ሙቅ ሆነው እስከ በርናዎ ድረስ ይደርሳሉ።',
      orderNow: 'አሁን ይዘዙ',
      contactUs: 'እኛን ያግኙ',
      fastDelivery: 'ፈጣን አቅርቦት',
      fastDeliveryDesc: '30 ደቂቃ ወይም ያነሰ',
      freshFood: 'ንፅህና',
      freshFoodDesc: 'ጥራት ያለው ንጥረ ነገር',
      bestPrice: 'ተመጣጣኝ ዋጋ',
      bestPriceDesc: 'ተመጣጣኝ ዋጋዎች',
      madeWithLove: 'በፍቅር የተሰራ',
      madeWithLoveDesc: 'ለምግብ ፍቅር',
      ourMenu: 'ምናሌን',
      featuredProducts: 'ተመራጭ ምርቶች',
      featuredDesc: 'በደንበኞች የተወደዱ ተወዳጅ በርገሮቻችን',
      viewAllProducts: 'ሁሉንም ምርቶች ይመልከቱ',
      testimonials: 'መስክሮች',
      whatCustomersSay: 'ደንበኞቻችን ምን ይላሉ',
      regularCustomer: 'መደበኛ ደንበኛ',
      foodEnthusiast: 'ምግብ ፈን ተከታይ',
      foodBlogger: 'ምግብ ብሎገር',
      testimonial1: 'እስካሁን የባድኩት ምርጥ በርገር! ንፅህና ያለው ንጥረ ነገር፣ ጣፋጭ ጣዕም እና ፈጣን አቅርቦት። እንደገና እንደገና እጠይቃለሁ!',
      testimonial2: 'ጥሩ አገልግሎት እና ጣፋጭ ምግብ! አቅርቦቱ ፈጣን ነበር እና በርገሩ አሁንም ሙቅ ነበር። እንደገና እዘዝማለሁ!',
      testimonial3: 'የንጥረ ነገሮች ጥራት የማይታመስ ነው። ልዩነቱን መቅመስ ይችላሉ። ለበርገር ፈንታዎች ፍጹም ነው!',
      readyToOrder: 'ለማዘዝ ዝግጁ ነዎት?',
      readyToOrderDesc: 'አሁን ያዘዙ እና ጣፋጭ በርገርዎን በ30 ደቂቃ ውስጥ ያግኙ!',
      browseMenu: 'ምናሌን ይመልከቱ',
      happyCustomers: '5K+ ደስተኛ ደንበኞች'
    },
    om: {
      bestBurgers: 'Burgeeroota Gaariin Magaalaa Keessatti',
      deliciousBurgers: 'Burgeeroota Mi\'aa Ta\'an',
      deliveredToYou: 'Isiniif Geessina',
      heroDescription: 'Burgeeroota gaariidha wantoota haaraatiin hoiiwaniifamee fi hoo\'aa ta\'ee mana keessanitti isiniif geessina.',
      orderNow: 'Amaj Ajajaa',
      contactUs: 'Nu Quunnamaa',
      fastDelivery: 'Geessitaa Sanaa',
      fastDeliveryDesc: 'daqiiqaa 30 ykn gadi',
      freshFood: 'Nyaata Haaraa',
      freshFoodDesc: 'Wantoota gaariidha',
      bestPrice: 'Gatii Gaariidha',
      bestPriceDesc: 'Gatii Gahaa',
      madeWithLove: 'Jaalalaan Hoiiwame',
      madeWithLoveDesc: 'Nyaataaf jaalala',
      ourMenu: 'Meenyuu Keenya',
      featuredProducts: 'Oomisholee Iddoo Duraa',
      featuredDesc: 'Burgeeroota jaallatamoo miira fayyadamtootaan jaallataman',
      viewAllProducts: 'Oomisholee Hunda Ilaalaa',
      testimonials: 'Ragaa Dawwataa',
      whatCustomersSay: 'Fayyadamtoonni Keenya Maal Jedhan',
      regularCustomer: 'Fayyadama Yeroo Hundaa',
      foodEnthusiast: 'Jaallata Nyaataa',
      foodBlogger: 'Blogger Nyaataa',
      testimonial1: 'Ani dhugaa burjeelchaan burgeerota mi\'aa ta\'e nyaadhe! Wantoota haaraa, dhundhuma gaarii, fi geessitaa sanaa. Kan gorsu ta\'a!',
      testimonial2: 'Tajaajila gaarii fi nyaata mi\'aa ta\'e! Geessiichi sanaa ture fi burjeelchi amma hoo\'aa ture. Irra deebi\'uun ajajuu nan yaada!',
      testimonial3: 'Gaariin wantootaa kan dandeessisu dha. Fardeen isaa dandeessuu ni dandeessa. Jaallattoota burjeelchaf guutuudha!',
      readyToOrder: 'Ajajuuf Qophii?',
      readyToOrderDesc: 'Amaj ajajaa fi burjeelcha keessan daqiiqaa 30 keessatti argadhu!',
      browseMenu: 'Meenyuu Ilaalaa',
      happyCustomers: '5K+ Fayyadamtoota Gamagamoo'
    }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productAPI.getFeaturedProducts();
        setFeaturedProducts(response.data.data);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-amber-50">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-500 rounded-full translate-y-1/2 -translate-x-1/3"></div>
        </div>
        <div className="container mx-auto px-4 py-12 md:py-20 lg:py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
                <span className="mr-2">🍔</span>
                {t.bestBurgers}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                {t.deliciousBurgers}
                <span className="block text-primary">
                  {t.deliveredToYou}
                </span>
              </h1>
              <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 max-w-lg mx-auto lg:mx-0">
                {t.heroDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/products"
                  className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-primary to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-primary transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span>{t.orderNow}</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  to="/contact"
                  className="px-6 md:px-8 py-3 md:py-4 bg-white text-primary border-2 border-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-300 text-center"
                >
                  {t.contactUs}
                </Link>
              </div>
            </div>
            <div className="flex justify-center order-1 lg:order-2">
              <div className="relative">
                <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-primary/20 to-red-500/20 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                <img
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&fit=crop"
                  alt="Delicious Burger"
                  className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-cover rounded-full shadow-2xl"
                />
                <div className="absolute -bottom-2 -right-2 sm:bottom-4 sm:right-4 bg-white rounded-xl shadow-lg p-3 sm:p-4 animate-bounce">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-red-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-gray-800">{t.fastDelivery}</div>
                      <div className="text-xs text-gray-500">30 mins avg</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-2 -left-2 sm:top-4 sm:left-4 bg-white rounded-xl shadow-lg p-3 sm:p-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full border-2 border-white"></div>
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full border-2 border-white"></div>
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-gray-700">{t.happyCustomers}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-6 rounded-2xl text-center hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1 md:mb-2">{t.fastDelivery}</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden sm:block">{t.fastDeliveryDesc}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-6 rounded-2xl text-center hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1 md:mb-2">{t.freshFood}</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden sm:block">{t.freshFoodDesc}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6 rounded-2xl text-center hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1 md:mb-2">{t.bestPrice}</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden sm:block">{t.bestPriceDesc}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6 rounded-2xl text-center hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1 md:mb-2">{t.madeWithLove}</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden sm:block">{t.madeWithLoveDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-3">
              {t.ourMenu}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-gray-800">
              {t.featuredProducts}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              {t.featuredDesc}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {featuredProducts.slice(0, 6).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:mt-12">
            <Link
              to="/products"
              className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-white text-primary border-2 border-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <span>{t.viewAllProducts}</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-3">
              {t.testimonials}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-gray-800">
              {t.whatCustomersSay}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {[
              {
                name: 'Sarah M.',
                role: t.regularCustomer,
                text: t.testimonial1
              },
              {
                name: 'John D.',
                role: t.foodEnthusiast,
                text: t.testimonial2
              },
              {
                name: 'Mike T.',
                role: t.foodBlogger,
                text: t.testimonial3
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-red-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-primary to-red-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6">
            {t.readyToOrder}
          </h2>
          <p className="text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto text-sm md:text-base">
            {t.readyToOrderDesc}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-white text-primary rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg"
          >
            <span>{t.browseMenu}</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
