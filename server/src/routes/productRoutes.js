const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getCategories,
  getSuggestions,
  getRelatedProducts,
  getProductPreview,
  getProductPreviewFile,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, seller } = require('../middleware/authMiddleware');
const { uploadMaterialFiles } = require('../middleware/uploadMiddleware');

// Public catalog routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/suggestions', getSuggestions);
router.get('/:id', getProductById);
router.get('/:id/related', getRelatedProducts);
router.get('/:id/preview', getProductPreview);
router.get('/:id/preview-file', getProductPreviewFile);

// Protected tutor/admin operations
router.post('/', protect, seller, uploadMaterialFiles, createProduct);
router.put('/:id', protect, seller, uploadMaterialFiles, updateProduct);
router.delete('/:id', protect, seller, deleteProduct);

module.exports = router;
