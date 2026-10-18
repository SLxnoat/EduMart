import api from './api';

const productService = {
  getAllProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  getSuggestions: async (query = '') => {
    const response = await api.get('/products/suggestions', {
      params: { q: query }
    });
    return response.data;
  },
  getRelatedProducts: async (id) => {
    const response = await api.get(`/products/${id}/related`);
    return response.data;
  },
  getProductPreview: async (id) => {
    const response = await api.get(`/products/${id}/preview`);
    return response.data;
  },
  createProduct: async (productData) => {
    const isFormData = typeof FormData !== 'undefined' && productData instanceof FormData;
    const response = await api.post('/products', productData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
  },
  updateProduct: async (id, productData) => {
    const isFormData = typeof FormData !== 'undefined' && productData instanceof FormData;
    const response = await api.put(`/products/${id}`, productData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
  },
  getPreviewFileUrl: (id) => {
    const base = api.defaults.baseURL || process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return `${base}/products/${id}/preview-file`;
  },
  getPreviewImageUrl: (id, page = 1) => {
    const base = api.defaults.baseURL || process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return `${base}/products/${id}/preview-image/${page}`;
  },
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  }
};

export default productService;
