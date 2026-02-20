import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

const Products = () => {
  const { language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Query parameters
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: itemsPerPage,
          category: category || undefined,
          search: search || undefined,
          sort: sort || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          rating: rating || undefined,
          inStock: inStock ? 'true' : undefined,
        };

        const response = await productAPI.getProducts(params);
        setProducts(response.data.data);
        setTotalPages(Math.ceil(response.data.pagination.total / itemsPerPage));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, category, search, sort, minPrice, maxPrice]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productAPI.getProductCategories();
        setCategories(response.data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Update query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (rating) params.set('rating', rating);
    if (inStock) params.set('inStock', 'true');
    if (page > 1) params.set('page', page);

    setSearchParams(params);
  }, [page, category, search, sort, minPrice, maxPrice, rating, inStock, setSearchParams]);

  const handleSearch = () => {
    setPage(1);
  };

  const handleResetFilters = () => {
    setCategory('');
    setSearch('');
    setSort('');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setInStock(false);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">{language === 'en' ? 'Our Products' : 'የእኛም ምርቶች'}</h1>
          <p className="text-gray-600">{language === 'en' ? 'Browse our delicious range of burgers' : 'ምንጨዩ በርገሮችን ይመልከቱ'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-4">{language === 'en' ? 'Filters' : 'የመጠን አይነት'}</h3>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Search' : 'ይፈልጉ'}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={language === 'en' ? 'Search products...' : 'ምርቶችን ይፈልጉ...'}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
                <button
                  onClick={handleSearch}
                  className="w-full mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {language === 'en' ? 'Search' : 'ይፈልጉ'}
                </button>
              </div>

              {/* Category filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Category' : 'ዓይነት'}</label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">{language === 'en' ? 'All Categories' : 'ሁሉም ዓይነቶች'}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Price Range' : 'ዋጋ ምንጭ'}</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder={language === 'en' ? 'Min' : 'ቀንስ'}
                    className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder={language === 'en' ? 'Max' : 'ቀንስ'}
                    className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

               {/* Rating filter */}
               <div className="mb-6">
                 <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Minimum Rating' : 'የጠቀምላ አይነት'}</label>
                 <select
                   value={rating}
                   onChange={(e) => {
                     setRating(e.target.value);
                     setPage(1);
                   }}
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                 >
                   <option value="">{language === 'en' ? 'All Ratings' : 'ሁሉም አይነቶች'}</option>
                   <option value="4.5">★★★★☆ & Up</option>
                   <option value="4">★★★★☆ & Up</option>
                   <option value="3.5">★★★☆☆ & Up</option>
                   <option value="3">★★★☆☆ & Up</option>
                   <option value="2.5">★★☆☆☆ & Up</option>
                 </select>
               </div>

               {/* In Stock filter */}
               <div className="mb-6">
                 <label className="flex items-center">
                   <input
                     type="checkbox"
                     checked={inStock}
                     onChange={(e) => {
                       setInStock(e.target.checked);
                       setPage(1);
                     }}
                     className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                   />
                   <span className="ml-2 text-sm font-medium">{language === 'en' ? 'In Stock Only' : 'ቀንስ ቀንስ'}</span>
                 </label>
               </div>

               {/* Sort by */}
               <div className="mb-6">
                 <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Sort By' : 'ይፈልጉ'}</label>
                 <select
                   value={sort}
                   onChange={(e) => {
                     setSort(e.target.value);
                     setPage(1);
                   }}
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                 >
                   <option value="">{language === 'en' ? 'Default' : 'የተነበቀ አይነት'}</option>
                   <option value="price">{language === 'en' ? 'Price: Low to High' : 'ዋጋ: ቀንስ ወደ ከፍተኛ'}</option>
                   <option value="-price">{language === 'en' ? 'Price: High to Low' : 'ዋጋ: ከፍተኛ ወደ ቀንስ'}</option>
                   <option value="name">{language === 'en' ? 'Name: A to Z' : 'ስም: A ወደ Z'}</option>
                   <option value="-name">{language === 'en' ? 'Name: Z to A' : 'ስም: Z ወደ A'}</option>
                   <option value="ratings">{language === 'en' ? 'Ratings' : 'የጠቀምላ አይነት'}</option>
                 </select>
               </div>

               {/* Reset filters */}
              <button
                onClick={handleResetFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {language === 'en' ? 'Reset Filters' : 'የመጠን አይነት ይጠቀምላል'}
              </button>
            </div>
          </div>

          {/* Products grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
              </div>
             ) : products.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-search text-gray-400 text-6xl mb-4"></i>
                <h3 className="text-xl font-semibold mb-2">{language === 'en' ? 'No products found' : 'ምንም ምርት አልተገኘም'}</h3>
                <p className="text-gray-600">{language === 'en' ? 'Try adjusting your filters or search terms' : 'መጠን አይነትን ይጠቀምላል'}</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {language === 'en' ? 'Reset Filters' : 'የመጠን አይነት ይጠቀምላል'}
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-12 space-x-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          page === index + 1
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
