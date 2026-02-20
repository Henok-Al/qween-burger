import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productAPI.getProductById(id);
        setProduct(response.data.data);
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 10) {
      setQuantity(value);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setReviewError('Please log in to submit a review');
      return;
    }

    if (reviewComment.trim().length < 3 || reviewComment.trim().length > 500) {
      setReviewError('Comment must be between 3 and 500 characters');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError('');
      setReviewSuccess('');

      const response = await productAPI.createReview(id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      // Update product with new review
      setProduct((prev) => ({
        ...prev,
        reviews: response.data.data,
        ratings: response.data.data.reduce((sum, review) => sum + review.rating, 0) / response.data.data.length,
        numReviews: response.data.data.length,
      }));

      setReviewSuccess('Review submitted successfully!');
      setReviewComment('');
      setReviewRating(5);
    } catch (error) {
      setReviewError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 text-center">
          <i className="fas fa-exclamation-triangle text-6xl text-yellow-500 mb-4"></i>
          <h2 className="text-2xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you are looking for does not exist.</p>
          <Link
            to="/products"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product image */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-96 object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x400?text=Product+Image';
              }}
            />
          </div>

          {/* Product details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">{product.category}</div>
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
              
              {product.ratings > 0 && (
                <div className="flex items-center mb-4">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`fas fa-star text-yellow-500 ${
                          star <= product.ratings ? 'text-yellow-500' : 'text-gray-300'
                        }`}
                      ></i>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    ({product.numReviews} reviews)
                  </span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold text-primary mb-2">${product.price.toFixed(2)}</div>
              {product.stock > 0 ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <i className="fas fa-check-circle"></i>
                  <span>In Stock ({product.stock} available)</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-600">
                  <i className="fas fa-times-circle"></i>
                  <span>Out of Stock</span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {product.ingredients && product.ingredients.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.nutritionalInfo && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Nutritional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Calories</div>
                    <div className="text-lg font-semibold">{product.nutritionalInfo.calories} cal</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Protein</div>
                    <div className="text-lg font-semibold">{product.nutritionalInfo.protein}g</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Carbs</div>
                    <div className="text-lg font-semibold">{product.nutritionalInfo.carbs}g</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Fat</div>
                    <div className="text-lg font-semibold">{product.nutritionalInfo.fat}g</div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-minus"></i>
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max="10"
                  className="w-20 px-4 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= 10}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.isAvailable || product.stock <= 0}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <i className="fas fa-shopping-cart"></i>
                <span>Add to Cart</span>
              </button>

              <Link
                to="/products"
                className="px-6 py-3 bg-white text-primary border border-primary rounded-lg font-medium hover:bg-primary/5 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Reviews ({product.numReviews})</h2>
            
            {/* Write a Review */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              
              {reviewError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                  {reviewError}
                </div>
              )}
              
              {reviewSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg">
                  {reviewSuccess}
                </div>
              )}
              
              {!isAuthenticated ? (
                <div className="p-4 text-center">
                  <p className="mb-4">Please log in to write a review</p>
                  <Link
                    to="/login"
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Log In
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-yellow-500 hover:text-yellow-600 transition-colors"
                        >
                          <i
                            className={`fas fa-star ${
                              star <= reviewRating ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                          ></i>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Comment</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Write your review..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      maxLength={500}
                    ></textarea>
                    <div className="text-sm text-gray-500 mt-1">
                      {reviewComment.length} / 500 characters
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingReview ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        Submit Review
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
            
            {/* Existing Reviews */}
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div key={review._id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium">{review.userName}</div>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i
                              key={star}
                              className={`fas fa-star text-yellow-500 ${
                                star <= review.rating ? 'text-yellow-500' : 'text-gray-300'
                              }`}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-gray-600">{review.comment}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <i className="fas fa-comments text-4xl mb-4"></i>
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
