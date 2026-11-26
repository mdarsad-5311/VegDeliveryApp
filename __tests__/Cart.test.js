/**
 * Cart.test.js
 * Comprehensive unit test suite for Shopping Cart features (Step 8):
 * - Add products from listing and details
 * - Existing product quantity increment (no duplicates)
 * - Quantity decrement with minimum 1 enforcement
 * - Direct quantity updates and stock limit guards
 * - Subtotal, configurable delivery charge, and total calculations
 * - Product removal and cart clearing
 * - Cart count and navigation badge updates
 * - Toast feedback messages
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { AppProvider, DEFAULT_DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD } from '../src/context/AppContext';
import useAppContext from '../src/hooks/useAppContext';

// Sample mock product fixtures
const mockProductTomato = {
  id: 'prod-tomato-1',
  name: 'Organic Fresh Tomato',
  price: 40,
  unit: '1 kg',
  availableStock: 10,
  inStock: true,
};

const mockProductOnion = {
  id: 'prod-onion-1',
  name: 'Nashik Red Onion',
  price: 50,
  unit: '1 kg',
  availableStock: 5,
  inStock: true,
};

// Test consumer component to capture context values
let contextRef = {};
const TestConsumer = () => {
  const context = useAppContext();
  contextRef = context;
  return null;
};

const renderWithContext = async () => {
  let renderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AppProvider>
        <TestConsumer />
      </AppProvider>,
    );
  });
  return renderer;
};

describe('Shopping Cart Feature Unit Tests', () => {
  beforeEach(async () => {
    await renderWithContext();
    await ReactTestRenderer.act(async () => {
      contextRef.clearCart();
    });
  });

  test('1. Initial state is empty with 0 counts and 0.00 totals', () => {
    expect(contextRef.cart).toEqual({});
    expect(contextRef.cartCount).toBe(0);
    expect(contextRef.cartSubtotal).toBe(0);
    expect(contextRef.deliveryFee).toBe(0);
    expect(contextRef.cartTotal).toBe(0);
  });

  test('2. Add product to cart creates a cart entry with accurate price and quantity', async () => {
    await ReactTestRenderer.act(async () => {
      contextRef.addToCart(mockProductTomato, 2);
    });

    expect(contextRef.cart[mockProductTomato.id]).toBeDefined();
    expect(contextRef.cart[mockProductTomato.id].quantity).toBe(2);
    expect(contextRef.cart[mockProductTomato.id].product.price).toBe(40);
    expect(contextRef.cartCount).toBe(2);
    expect(contextRef.cartSubtotal).toBe(80); // 2 * 40
    expect(contextRef.toast.visible).toBe(true);
    expect(contextRef.toast.message).toContain('Added Organic Fresh Tomato to cart!');
  });

  test('3. Adding an existing product increases quantity instead of creating duplicates', async () => {
    // First add: quantity 2
    await ReactTestRenderer.act(async () => {
      contextRef.addToCart(mockProductTomato, 2);
    });

    // Second add: quantity 3
    await ReactTestRenderer.act(async () => {
      contextRef.addToCart(mockProductTomato, 3);
    });

    // Verify single entry exists in cart
    const keys = Object.keys(contextRef.cart);
    expect(keys.length).toBe(1);
    expect(contextRef.cart[mockProductTomato.id].quantity).toBe(5);
    expect(contextRef.cartCount).toBe(5);
    expect(contextRef.cartSubtotal).toBe(200); // 5 * 40
    expect(contextRef.toast.message).toContain('Updated Organic Fresh Tomato quantity to 5');
  });

  test('4. Quantity decrement decreases quantity but NEVER goes below 1', async () => {
    // Add product with quantity 3
    await ReactTestRenderer.act(async () => {
      contextRef.addToCart(mockProductTomato, 3);
    });
    expect(contextRef.cart[mockProductTomato.id].quantity).toBe(3);

    // Decrement once: 3 -> 2
    await ReactTestRenderer.act(async () => {
      contextRef.removeFromCart(mockProductTomato.id);
    });
    expect(contextRef.cart[mockProductTomato.id].quantity).toBe(2);

    // Decrement twice: 2 -> 1
    await ReactTestRenderer.act(async () => {
      contextRef.removeFromCart(mockProductTomato.id);
    });
    expect(contextRef.cart[mockProductTomato.id].quantity).toBe(1);

    // Decrement when quantity is 1: MUST REMAIN 1 (NEVER GO BELOW 1)
    await ReactTestRenderer.act(async () => {
      contextRef.removeFromCart(mockProductTomato.id);
    });
    expect(contextRef.cart[mockProductTomato.id]).toBeDefined();
    expect(contextRef.cart[mockProductTomato.id].quantity).toBe(1);
    expect(contextRef.cartCount).toBe(1);
  });

  test('5. Stock limits prevent adding beyond available stock', async () => {
    // mockProductOnion has availableStock: 5
    await ReactTestRenderer.act(async () => {
      const res = contextRef.addToCart(mockProductOnion, 6);
      expect(res.exceeded).toBe(true);
    });

    expect(contextRef.cart[mockProductOnion.id].quantity).toBe(5); // Capped at max stock
    expect(contextRef.toast.message).toContain('Maximum available stock reached (5 items)');
  });

  test('6. Explicit item removal deletes product and updates totals immediately', async () => {
    await ReactTestRenderer.act(async () => {
      contextRef.addToCart(mockProductTomato, 2); // 80
      contextRef.addToCart(mockProductOnion, 1);  // 50
    });
    expect(contextRef.cartCount).toBe(3);
    expect(contextRef.cartSubtotal).toBe(130);

    // Remove Tomato
    await ReactTestRenderer.act(async () => {
      contextRef.removeCartItem(mockProductTomato.id);
    });

    expect(contextRef.cart[mockProductTomato.id]).toBeUndefined();
    expect(contextRef.cart[mockProductOnion.id]).toBeDefined();
    expect(contextRef.cartCount).toBe(1);
    expect(contextRef.cartSubtotal).toBe(50);
    expect(contextRef.toast.message).toContain('Removed Organic Fresh Tomato from cart');
  });

  test('7. Delivery charge calculations: configurable standard fee and free threshold', async () => {
    // Under threshold (< 199): standard delivery fee applied (30)
    await ReactTestRenderer.act(async () => {
      contextRef.addToCart(mockProductTomato, 2); // 80
    });
    expect(contextRef.cartSubtotal).toBe(80);
    expect(contextRef.deliveryFee).toBe(DEFAULT_DELIVERY_CHARGE); // 30
    expect(contextRef.cartTotal).toBe(110); // 80 + 30

    // Above threshold (>= 199): free delivery (0)
    await ReactTestRenderer.act(async () => {
      contextRef.addToCart(mockProductOnion, 3); // 80 + 150 = 230
    });
    expect(contextRef.cartSubtotal).toBe(230);
    expect(contextRef.cartSubtotal).toBeGreaterThanOrEqual(FREE_DELIVERY_THRESHOLD);
    expect(contextRef.deliveryFee).toBe(0);
    expect(contextRef.cartTotal).toBe(230); // 230 + 0
  });

  test('8. Clear cart completely empties items and resets all amounts', async () => {
    await ReactTestRenderer.act(async () => {
      contextRef.addToCart(mockProductTomato, 2);
      contextRef.addToCart(mockProductOnion, 2);
    });
    expect(contextRef.cartCount).toBe(4);

    await ReactTestRenderer.act(async () => {
      contextRef.clearCart();
    });

    expect(contextRef.cart).toEqual({});
    expect(contextRef.cartCount).toBe(0);
    expect(contextRef.cartSubtotal).toBe(0);
    expect(contextRef.cartTotal).toBe(0);
    expect(contextRef.toast.message).toContain('Shopping cart cleared');
  });

  test('9. Toast hide callback works correctly', async () => {
    await ReactTestRenderer.act(async () => {
      contextRef.showToast('Test notification message', 'info');
    });
    expect(contextRef.toast.visible).toBe(true);
    expect(contextRef.toast.message).toBe('Test notification message');

    await ReactTestRenderer.act(async () => {
      contextRef.hideToast();
    });
    expect(contextRef.toast.visible).toBe(false);
  });
});
