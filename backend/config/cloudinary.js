const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload Image to Cloudinary
const uploadImage = async (file) => {
  try {
    console.log('Cloudinary Upload - File received:', file);
    
    // Check if file has path, tempFilePath, or buffer
    let uploadSource;
    if (file.path) {
      uploadSource = file.path;
      console.log('Using file path:', uploadSource);
    } else if (file.tempFilePath) {
      uploadSource = file.tempFilePath;
      console.log('Using temp file path:', uploadSource);
    } else if (file.buffer) {
      uploadSource = file.buffer.toString('base64');
      console.log('Using buffer data');
    } else {
      throw new Error('File must have path, tempFilePath, or buffer');
    }

    const result = await cloudinary.uploader.upload(uploadSource, {
      folder: 'qween-burger',
      resource_type: 'image',
      quality: 'auto',
      format: 'webp',
    });

    console.log('Cloudinary Upload - Success:', result);

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Image upload failed');
  }
};

// Delete Image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
    throw new Error('Image deletion failed');
  }
};

// Generate Signed Upload URL (for direct client-side uploads)
const getSignedUploadUrl = async (filename, folder = 'qween-burger') => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request({
      timestamp,
      public_id: filename,
      folder,
      resource_type: 'image',
    }, process.env.CLOUDINARY_API_SECRET);

    return {
      timestamp,
      signature,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      folder,
    };
  } catch (error) {
    console.error('Cloudinary Signature Error:', error);
    throw new Error('Failed to generate signed URL');
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  getSignedUploadUrl
};
