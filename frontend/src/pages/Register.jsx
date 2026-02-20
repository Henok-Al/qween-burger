import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema } from '../utils/validators';

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, googleLogin, isLoading, error } = useAuth();
  const { language } = useLanguage();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Translations for all three languages
  const translations = {
    en: {
      title: 'Create an Account',
      subtitle: 'Join Qween Burger and enjoy delicious burgers!',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Enter your full name',
      email: 'Email Address',
      emailPlaceholder: 'Enter your email address',
      phone: 'Phone Number',
      phonePlaceholder: 'Enter your phone number',
      address: 'Address',
      addressPlaceholder: 'Enter your delivery address',
      password: 'Password',
      passwordPlaceholder: 'Create a password',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm your password',
      createAccount: 'Create Account',
      creatingAccount: 'Creating Account...',
      orContinueWith: 'Or continue with',
      continueWithGoogle: 'Continue with Google',
      signingIn: 'Signing in...',
      haveAccount: 'Already have an account?',
      loginHere: 'Login here'
    },
    am: {
      title: 'መለያ ይፍጠሩ',
      subtitle: 'Qween Burger ይቀላቀሉ እና ጣፋጭ በርገሮችን ያጡ!',
      fullName: 'ሙሉ ስም',
      fullNamePlaceholder: 'ሙሉ ስምዎን ያስገቡ',
      email: 'ኢሜል አድራሻ',
      emailPlaceholder: 'የኢሜል አድራሻዎን ያስገቡ',
      phone: 'ስልክ ቁጥር',
      phonePlaceholder: 'የስልክ ቁጥርዎን ያስገቡ',
      address: 'አድራሻ',
      addressPlaceholder: 'የአቅርቦት አድራሻዎን ያስገቡ',
      password: 'የይለፍ ቃል',
      passwordPlaceholder: 'የይለፍ ቃል ይፍጠሩ',
      confirmPassword: 'የይለፍ ቃል ያረጋግጡ',
      confirmPasswordPlaceholder: 'የይለፍ ቃልዎን ያረጋግጡ',
      createAccount: 'መለያ ፍጠር',
      creatingAccount: 'መለያ በመፍጠር ላይ...',
      orContinueWith: 'ወይም ይቀጥሉ በ',
      continueWithGoogle: 'በGoogle ይቀጥሉ',
      signingIn: 'በመግባት ላይ...',
      haveAccount: 'መለያ አሎት?',
      loginHere: 'እዚህ ይግቡ'
    },
    om: {
      title: 'Miira Uumaa',
      subtitle: 'Qween Burgeritti makamoo fi burgeerota mi\'aa ta\'an qabaa!',
      fullName: 'Maqaa Guutuu',
      fullNamePlaceholder: 'Maqaa keessan guutuu galchaa',
      email: 'Imeeilii',
      emailPlaceholder: 'Imeeilii keessan galchaa',
      phone: 'Bilbila Lakkoofsa',
      phonePlaceholder: 'Lakkoofsa bilbila keessan galchaa',
      address: 'Teessoo',
      addressPlaceholder: 'Teessoo geessitaa keessan galchaa',
      password: 'Jecha Iccitii',
      passwordPlaceholder: 'Jecha iccitii uumaa',
      confirmPassword: 'Jecha Iccitii Mirkaneessaa',
      confirmPasswordPlaceholder: 'Jecha iccitii keessan mirkaneessaa',
      createAccount: 'Miira Uumaa',
      creatingAccount: 'Miira uumuu jira...',
      orContinueWith: 'Yookiin itti fufaa',
      continueWithGoogle: 'Google tiin itti fufaa',
      signingIn: 'Seenuu jira...',
      haveAccount: 'Miira qabdu qabdaa?',
      loginHere: 'Asitti seenaa'
    }
  };

  const t = translations[language] || translations.en;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
    },
  });

  const onSubmit = async (data) => {
    const result = await registerUser(
      data.name,
      data.email,
      data.password,
      data.address,
      data.phone
    );

    if (result.success) {
      navigate('/');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const result = await googleLogin();
    setGoogleLoading(false);
    
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🍔</div>
              <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-gray-600 mt-2">{t.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t.fullNamePlaceholder}
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.email}
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t.emailPlaceholder}
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.phone}
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t.phonePlaceholder}
                  required
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.address}
                </label>
                <textarea
                  {...register('address')}
                  rows="3"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t.addressPlaceholder}
                  required
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.password}
                </label>
                <input
                  type="password"
                  {...register('password')}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t.passwordPlaceholder}
                  required
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.confirmPassword}
                </label>
                <input
                  type="password"
                  {...register('confirmPassword')}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t.confirmPasswordPlaceholder}
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t.creatingAccount}
                  </span>
                ) : (
                  t.createAccount
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {t.orContinueWith}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {googleLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="ml-2">{t.signingIn}</span>
                    </span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span className="font-medium text-gray-700">{t.continueWithGoogle}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t.haveAccount}{' '}
                <Link to="/login" className="font-medium text-primary hover:text-primary/90">
                  {t.loginHere}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
