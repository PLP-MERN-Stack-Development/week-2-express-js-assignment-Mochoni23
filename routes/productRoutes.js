const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateProduct } = require('../middleware/validator');

// In-memory product list
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// Get all products (no filtering)
router.get('/', (req, res) => {
  res.json(products);
});

// Get a product by ID
router.get('/:id', (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    const error = new Error('Product not found');
    error.name = 'NotFoundError';
    error.status = 404;
    return next(error);
  }
  res.json(product);
});

// Create new product (protected)
router.post('/', auth, validateProduct, (req, res) => {
  const { name, description, price, category, inStock } = req.body;

  const newProduct = {
    id: uuidv4(),
    name: name.trim(),
    description: description ? description.trim() : '',
    price,
    category: category.trim(),
    inStock
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Update product by ID (protected)
router.put('/:id', auth, validateProduct, (req, res) => {
  const product = products.find(p => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }

  const { name, description, price, category, inStock } = req.body;

  // Update the product's properties directly
  product.name = name.trim();
  product.description = description.trim();
  product.price = price;
  product.category = category.trim();
  product.inStock = inStock;

  res.json({
    success: true,
    product
  });
});

// Delete product (protected)
router.delete('/:id', auth, (req, res, next) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);

    if (productIndex === -1) {
      const error = new Error('Product not found');
      error.name = 'NotFoundError';
      error.status = 404;
      return next(error);
    }

    products.splice(productIndex, 1);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;