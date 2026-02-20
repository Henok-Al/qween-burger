// Socket.io instance holder
// This avoids circular dependency issues between server.js and controllers

let io = null;

/**
 * Set the Socket.io instance
 * @param {Object} socketIo - Socket.io server instance
 */
const setIO = (socketIo) => {
  io = socketIo;
};

/**
 * Get the Socket.io instance
 * @returns {Object|null} Socket.io server instance
 */
const getIO = () => {
  if (!io) {
    console.warn('Socket.io not initialized. Call setIO first.');
  }
  return io;
};

module.exports = {
  setIO,
  getIO
};
