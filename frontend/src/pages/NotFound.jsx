import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="text-6xl font-bold text-gray-900 mb-4">404</div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-8">
            The page you are looking for does not exist or may have been moved.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <i className="fas fa-home mr-2"></i>
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
