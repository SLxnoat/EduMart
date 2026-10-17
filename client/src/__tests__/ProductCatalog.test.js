import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import ProductList from '../pages/products/ProductList';
import ProductDetail from '../pages/products/ProductDetail';
import ProductCreate from '../pages/products/ProductCreate';
import productService from '../services/productService';

jest.mock('../services/productService');
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      firstName: 'Vidula',
      lastName: 'Dissanayake',
      role: 'tutor',
      institution: 'Royal Institute'
    },
    loading: false
  })
}));

const mockProducts = [
  {
    id: 'prod-uuid-1',
    title: 'G.C.E. A/L Combined Mathematics 2023 Past Paper',
    description: 'Detailed marking scheme and model answers for Pure and Applied Maths.',
    price: 750.00,
    subject: 'Combined Mathematics',
    grade_level: 'A/L Grade 13',
    exam_year: 2023,
    product_type: 'past_paper',
    format: 'digital',
    rating_average: 4.9,
    rating_count: 24,
    stock_quantity: 50,
    seller: {
      first_name: 'Vidula',
      last_name: 'Dissanayake',
      institution: 'Royal Institute'
    },
    category: {
      id: 1,
      name: 'Past Papers & Marking Schemes'
    }
  },
  {
    id: 'prod-uuid-2',
    title: 'G.C.E. A/L Physics Mechanics Master Revision Pack',
    description: 'Comprehensive formulas, derivations and past questions.',
    price: 1450.00,
    subject: 'Physics',
    grade_level: 'A/L Grade 12-13',
    exam_year: 2024,
    product_type: 'revision_notes',
    format: 'both',
    rating_average: 4.8,
    rating_count: 18,
    stock_quantity: 25,
    seller: {
      first_name: 'Vidula',
      last_name: 'Dissanayake',
      institution: 'Royal Institute'
    },
    category: {
      id: 2,
      name: 'Revision Guides & Short Notes'
    }
  }
];

const mockCategories = [
  { id: 1, name: 'Past Papers & Marking Schemes' },
  { id: 2, name: 'Revision Guides & Short Notes' }
];

const mockPreview = {
  productId: 'prod-uuid-1',
  title: 'G.C.E. A/L Combined Mathematics 2023 Past Paper',
  subject: 'Combined Mathematics',
  grade_level: 'A/L Grade 13',
  exam_year: 2023,
  tableOfContents: ['Unit 1: Pure Mathematics', 'Unit 2: Applied Mathematics'],
  sampleExcerpt: 'Evaluation of step-by-step problem-solving sequence.',
  is_watermarked: true
};

describe('Vidula Product Catalog & Search Components', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    productService.getCategories.mockResolvedValue({ categories: mockCategories });
    productService.getSuggestions.mockResolvedValue({
      suggestions: ['Combined Mathematics 2023', 'Physics Mechanics']
    });
    productService.getRelatedProducts.mockResolvedValue({
      products: [mockProducts[1]]
    });
    productService.getProductPreview.mockResolvedValue({
      preview: mockPreview
    });
    productService.getAllProducts.mockResolvedValue({
      success: true,
      count: mockProducts.length,
      total: mockProducts.length,
      totalPages: 1,
      currentPage: 1,
      products: mockProducts
    });
  });

  describe('ProductList Page', () => {
    test('renders catalog header, filters, star ratings and loads products list', async () => {
      render(
        <SnackbarProvider>
          <MemoryRouter>
            <ProductList />
          </MemoryRouter>
        </SnackbarProvider>
      );

      expect(screen.getByText(/Educational Materials Catalog/i)).toBeInTheDocument();
      expect(screen.getByText(/Filters/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search topic, title, paper.../i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/Combined Mathematics 2023 Past Paper/i)).toBeInTheDocument();
        expect(screen.getByText(/Physics Mechanics Master Revision Pack/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/LKR 750.00/i)).toBeInTheDocument();
      expect(screen.getByText(/LKR 1,450.00/i)).toBeInTheDocument();
      expect(screen.getByText('(24)')).toBeInTheDocument();
      expect(screen.getByText(/Publish Material/i)).toBeInTheDocument();
    });

    test('updates search keyword and triggers product fetch', async () => {
      render(
        <SnackbarProvider>
          <MemoryRouter>
            <ProductList />
          </MemoryRouter>
        </SnackbarProvider>
      );

      const searchInput = screen.getByPlaceholderText(/Search topic, title, paper.../i);
      fireEvent.change(searchInput, { target: { value: 'Physics' } });

      await waitFor(() => {
        expect(productService.getAllProducts).toHaveBeenCalledWith(
          expect.objectContaining({ keyword: 'Physics' })
        );
      });
    });

    test('adds product to localStorage cart when clicking Cart button', async () => {
      render(
        <SnackbarProvider>
          <MemoryRouter>
            <ProductList />
          </MemoryRouter>
        </SnackbarProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Combined Mathematics 2023 Past Paper/i)).toBeInTheDocument();
      });

      const cartButtons = screen.getAllByRole('button', { name: /Cart/i });
      fireEvent.click(cartButtons[0]);

      const cart = JSON.parse(localStorage.getItem('cart'));
      expect(cart).toBeDefined();
      expect(cart.length).toBe(1);
      expect(cart[0].id).toBe('prod-uuid-1');
      expect(cart[0].quantity).toBe(1);
    });

    test('displays empty state when no products match filters', async () => {
      productService.getAllProducts.mockResolvedValueOnce({
        success: true,
        count: 0,
        total: 0,
        totalPages: 1,
        currentPage: 1,
        products: []
      });

      render(
        <SnackbarProvider>
          <MemoryRouter>
            <ProductList />
          </MemoryRouter>
        </SnackbarProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/No educational materials found/i)).toBeInTheDocument();
      });
    });
  });

  describe('ProductDetail Page', () => {
    beforeEach(() => {
      productService.getProductById.mockResolvedValue({
        success: true,
        product: mockProducts[0]
      });
    });

    test('renders specifications, related materials, and opens sample preview modal', async () => {
      render(
        <SnackbarProvider>
          <MemoryRouter initialEntries={['/products/prod-uuid-1']}>
            <Routes>
              <Route path="/products/:id" element={<ProductDetail />} />
            </Routes>
          </MemoryRouter>
        </SnackbarProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Combined Mathematics 2023 Past Paper/i })).toBeInTheDocument();
      });

      expect(screen.getByText(/Material Specifications/i)).toBeInTheDocument();
      expect(screen.getByText(/EduMart Quality Guarantee/i)).toBeInTheDocument();
      expect(screen.getByText(/Instant Digital PDF Delivery/i)).toBeInTheDocument();
      expect(screen.getByText(/Related Study Materials/i)).toBeInTheDocument();

      // Click Sample Preview button
      const previewBtn = screen.getByRole('button', { name: /Sample Preview/i });
      fireEvent.click(previewBtn);

      await waitFor(() => {
        expect(screen.getByText(/Material Sample Preview/i)).toBeInTheDocument();
        expect(screen.getByText(/Table of Contents & Curriculum Structure:/i)).toBeInTheDocument();
      });

      // Close Preview Dialog
      const closeBtn = screen.getByRole('button', { name: /Close/i });
      fireEvent.click(closeBtn);
    });

    test('increases and decreases purchase quantity', async () => {
      render(
        <SnackbarProvider>
          <MemoryRouter initialEntries={['/products/prod-uuid-1']}>
            <Routes>
              <Route path="/products/:id" element={<ProductDetail />} />
            </Routes>
          </MemoryRouter>
        </SnackbarProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Combined Mathematics 2023 Past Paper/i })).toBeInTheDocument();
      });

      const increaseBtn = screen.getByLabelText(/increase quantity/i);
      fireEvent.click(increaseBtn);

      expect(screen.getByText('2')).toBeInTheDocument();
      // Price calculation for 2 units: 750 * 2 = 1500
      expect(screen.getByText(/LKR 1,500.00/i)).toBeInTheDocument();

      const decreaseBtn = screen.getByLabelText(/decrease quantity/i);
      fireEvent.click(decreaseBtn);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('adds selected quantity to cart from detail page', async () => {
      render(
        <SnackbarProvider>
          <MemoryRouter initialEntries={['/products/prod-uuid-1']}>
            <Routes>
              <Route path="/products/:id" element={<ProductDetail />} />
            </Routes>
          </MemoryRouter>
        </SnackbarProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Combined Mathematics 2023 Past Paper/i })).toBeInTheDocument();
      });

      const increaseBtn = screen.getByLabelText(/increase quantity/i);
      fireEvent.click(increaseBtn); // quantity = 2

      const addToCartBtn = screen.getByRole('button', { name: /^Add to Cart$/i });
      fireEvent.click(addToCartBtn);

      const cart = JSON.parse(localStorage.getItem('cart'));
      expect(cart).toBeDefined();
      expect(cart[0].id).toBe('prod-uuid-1');
      expect(cart[0].quantity).toBe(2);
    });

    test('handles product not found gracefully', async () => {
      productService.getProductById.mockRejectedValueOnce({
        response: { data: { message: 'Product not found' } }
      });

      render(
        <SnackbarProvider>
          <MemoryRouter initialEntries={['/products/invalid-id']}>
            <Routes>
              <Route path="/products/:id" element={<ProductDetail />} />
            </Routes>
          </MemoryRouter>
        </SnackbarProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Product not found/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Back to Catalog/i)).toBeInTheDocument();
    });
  });

  describe('ProductCreate Page', () => {
    test('renders material upload form and handles submission', async () => {
      productService.createProduct.mockResolvedValueOnce({
        success: true,
        product: { id: 'new-prod-id', title: 'New Test Paper' }
      });

      render(
        <SnackbarProvider>
          <MemoryRouter>
            <ProductCreate />
          </MemoryRouter>
        </SnackbarProvider>
      );

      expect(screen.getByText(/Publish New Educational Material/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Material Title/i)).toBeInTheDocument();

      const titleInput = screen.getByLabelText(/Material Title/i);
      const descInput = screen.getByLabelText(/Description & Syllabus Coverage/i);
      const priceInput = screen.getByLabelText(/Price \(LKR\)/i);

      fireEvent.change(titleInput, { target: { value: '2024 Physics Mechanics Guide' } });
      fireEvent.change(descInput, { target: { value: 'Complete kinematics and dynamics notes.' } });
      fireEvent.change(priceInput, { target: { value: '850.00' } });

      const publishBtn = screen.getByRole('button', { name: /Publish Material/i });
      fireEvent.click(publishBtn);

      await waitFor(() => {
        expect(productService.createProduct).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '2024 Physics Mechanics Guide',
            price: 850.00
          })
        );
      });
    });
  });
});
