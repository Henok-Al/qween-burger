import '@testing-library/jest-dom';

// Polyfills for React 19 and Node.js
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock localStorage
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};
global.localStorage = localStorageMock;

// Mock window.location
delete window.location;
window.location = {
  href: '',
  assign: () => {},
  reload: () => {},
};

// Mock import.meta.env for Vite
global.importMeta = {
  env: {
    VITE_API_URL: 'http://localhost:5000/api',
    MODE: 'test',
  },
};
