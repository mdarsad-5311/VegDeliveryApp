import {
  deliverySlotAPI,
  orderAPI,
  normalizeDeliverySlot,
  normalizeBackendOrder,
  formatApiError,
  apiClient,
  ORDER_STATUS_MAP,
} from '../src/services';

describe('Phase 3C: Checkout & Order Management API Integration Suite', () => {
  const originalGet = apiClient.get;
  const originalPost = apiClient.post;

  afterEach(() => {
    apiClient.get = originalGet;
    apiClient.post = originalPost;
    jest.clearAllMocks();
  });

  describe('1. Delivery Slot API & Normalization', () => {
    it('calls GET /delivery/slots/ via deliverySlotAPI.getSlots', async () => {
      const mockSlots = [
        {
          id: 1,
          name: '⚡ Instant Express (20 - 30 mins)',
          start_time: '08:00:00',
          end_time: '22:00:00',
          delivery_date: null,
          max_orders: 100,
          booked_orders: 5,
          available_capacity: 95,
          is_available: true,
          is_full: false,
          is_active: true,
        },
        {
          id: 2,
          name: '☀️ Morning Slot (7:00 AM - 10:00 AM)',
          start_time: '07:00:00',
          end_time: '10:00:00',
          delivery_date: '2026-11-27',
          max_orders: 50,
          booked_orders: 50,
          available_capacity: 0,
          is_available: false,
          is_full: true,
          is_active: true,
        },
      ];

      apiClient.get = jest.fn().mockResolvedValueOnce({ data: mockSlots });

      const res = await deliverySlotAPI.getSlots({ date: '2026-11-27' });
      expect(apiClient.get).toHaveBeenCalledWith('/delivery/slots/', {
        params: { date: '2026-11-27' },
      });
      expect(res.data).toHaveLength(2);
      expect(res.data[0].name).toContain('Instant Express');
    });

    it('normalizes available express slot correctly with FASTEST badge', () => {
      const rawSlot = {
        id: 10,
        name: '⚡ Instant Express (20 - 30 mins)',
        start_time: '09:00:00',
        end_time: '21:00:00',
        delivery_date: null,
        max_orders: 100,
        booked_orders: 10,
        available_capacity: 90,
        is_available: true,
        is_full: false,
      };

      const normalized = normalizeDeliverySlot(rawSlot);
      expect(normalized.id).toBe(10);
      expect(normalized.backendId).toBe(10);
      expect(normalized.badge).toBe('FASTEST');
      expect(normalized.isFull).toBe(false);
      expect(normalized.isAvailable).toBe(true);
      expect(normalized.availableCapacity).toBe(90);
      expect(normalized.time).toBe('09:00 AM - 09:00 PM');
    });

    it('normalizes full/at-capacity slot with FULL badge and disabled state', () => {
      const rawSlot = {
        id: 11,
        name: '🌅 Evening Slot (6:00 PM - 8:00 PM)',
        start_time: '18:00:00',
        end_time: '20:00:00',
        delivery_date: '2026-11-26',
        max_orders: 40,
        booked_orders: 40,
        available_capacity: 0,
        is_available: false,
        is_full: true,
      };

      const normalized = normalizeDeliverySlot(rawSlot);
      expect(normalized.id).toBe(11);
      expect(normalized.badge).toBe('FULL');
      expect(normalized.isFull).toBe(true);
      expect(normalized.isAvailable).toBe(false);
      expect(normalized.availableCapacity).toBe(0);
      expect(normalized.time).toBe('06:00 PM - 08:00 PM');
    });

    it('normalizes standard available slot with AVAILABLE badge', () => {
      const rawSlot = {
        id: 12,
        name: '🌤️ Afternoon Slot (1:00 PM - 3:00 PM)',
        start_time: '13:00:00',
        end_time: '15:00:00',
        delivery_date: null,
        max_orders: 50,
        booked_orders: 20,
        available_capacity: 30,
        is_available: true,
        is_full: false,
      };

      const normalized = normalizeDeliverySlot(rawSlot);
      expect(normalized.badge).toBe('AVAILABLE');
      expect(normalized.isFull).toBe(false);
      expect(normalized.availableCapacity).toBe(30);
      expect(normalized.time).toBe('01:00 PM - 03:00 PM');
    });
  });

  describe('2. Order Checkout API & Payload Normalization', () => {
    it('calls POST /orders/checkout/ with correct payload and normalized payment method', async () => {
      const mockCheckoutResponse = {
        message: 'Order #FV-100293 placed successfully.',
        order: {
          id: 501,
          order_number: 'FV-100293',
          customer_email: 'user@freshveg.local',
          order_status: 'pending',
          order_status_display: 'Order Placed',
          subtotal: '240.00',
          delivery_fee: '0.00',
          discount: '0.00',
          grand_total: '240.00',
          created_at: '2026-11-26T10:00:00Z',
          address: {
            id: 201,
            full_name: 'Rahul Sharma',
            phone_number: '9876543210',
            address_line1: 'Flat 402, Green Meadows',
            city: 'Pune',
            pincode: '411045',
          },
          delivery_slot: {
            id: 1,
            name: '⚡ Instant Express (20 - 30 mins)',
            start_time: '08:00:00',
            end_time: '22:00:00',
          },
          items: [
            {
              id: 901,
              product: 1,
              product_name: 'Fresh Spinach',
              product_price: '40.00',
              quantity: 2,
              unit: '250g',
              subtotal: '80.00',
            },
            {
              id: 902,
              product: 2,
              product_name: 'Red Tomatoes',
              product_price: '40.00',
              quantity: 4,
              unit: '1 kg',
              subtotal: '160.00',
            },
          ],
          latest_payment: {
            payment_method: 'COD',
            payment_status: 'pending',
          },
        },
      };

      apiClient.post = jest.fn().mockResolvedValueOnce({ data: mockCheckoutResponse });

      const payload = {
        address_id: 201,
        delivery_slot_id: 1,
        payment_method: 'cod',
        customer_note: 'Please leave at the door',
      };

      const res = await orderAPI.checkout(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/orders/checkout/', {
        address_id: 201,
        delivery_slot_id: 1,
        payment_method: 'COD',
        customer_note: 'Please leave at the door',
      });
      expect(res.data.order.order_number).toBe('FV-100293');
      expect(res.data.order.grand_total).toBe('240.00');
    });

    it('formats digital payment method online correctly', async () => {
      apiClient.post = jest.fn().mockResolvedValueOnce({ data: { message: 'Order placed' } });

      await orderAPI.checkout({
        addressId: 202,
        deliverySlotId: 2,
        paymentMethod: 'card',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/orders/checkout/', {
        address_id: 202,
        delivery_slot_id: 2,
        payment_method: 'online',
        customer_note: '',
      });
    });

    it('formats UPI payment method correctly', async () => {
      apiClient.post = jest.fn().mockResolvedValueOnce({ data: { message: 'Order placed' } });

      await orderAPI.checkout({
        address_id: 203,
        delivery_slot_id: 3,
        payment_method: 'upi',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/orders/checkout/', {
        address_id: 203,
        delivery_slot_id: 3,
        payment_method: 'UPI',
        customer_note: '',
      });
    });
  });

  describe('3. Order Listing, Detail, and Cancellation APIs', () => {
    it('calls GET /orders/ via orderAPI.getAll with status filter', async () => {
      const mockOrdersList = [
        {
          id: 501,
          order_number: 'FV-100293',
          order_status: 'pending',
          grand_total: '240.00',
        },
      ];

      apiClient.get = jest.fn().mockResolvedValueOnce({ data: mockOrdersList });

      const res = await orderAPI.getAll({ status: 'pending' });
      expect(apiClient.get).toHaveBeenCalledWith('/orders/', {
        params: { status: 'pending' },
      });
      expect(res.data).toEqual(mockOrdersList);
    });

    it('calls GET /orders/{order_number}/ via orderAPI.getByOrderNumber', async () => {
      const mockOrderDetail = {
        id: 501,
        order_number: 'FV-100293',
        order_status: 'confirmed',
        subtotal: '240.00',
        grand_total: '240.00',
        items: [],
      };

      apiClient.get = jest.fn().mockResolvedValueOnce({ data: mockOrderDetail });

      const res = await orderAPI.getByOrderNumber('FV-100293');
      expect(apiClient.get).toHaveBeenCalledWith('/orders/FV-100293/');
      expect(res.data.order_number).toBe('FV-100293');
    });

    it('calls POST /orders/{order_number}/cancel/ with cancellation reason', async () => {
      const mockCancelResponse = {
        message: 'Order FV-100293 has been cancelled successfully.',
        order: {
          id: 501,
          order_number: 'FV-100293',
          order_status: 'cancelled',
          order_status_display: 'Cancelled',
        },
      };

      apiClient.post = jest.fn().mockResolvedValueOnce({ data: mockCancelResponse });

      const res = await orderAPI.cancel('FV-100293', {
        reason: 'Changed mind, ordering tomorrow',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/orders/FV-100293/cancel/', {
        reason: 'Changed mind, ordering tomorrow',
      });
      expect(res.data.order.order_status).toBe('cancelled');
    });
  });

  describe('4. Backend Order Normalization & Status Mapping', () => {
    it('maps backend statuses to corresponding UI labels and stages', () => {
      expect(ORDER_STATUS_MAP.pending.label).toBe('Order Placed');
      expect(ORDER_STATUS_MAP.pending.stage).toBe(1);

      expect(ORDER_STATUS_MAP.confirmed.label).toBe('Order Confirmed');
      expect(ORDER_STATUS_MAP.confirmed.stage).toBe(2);

      expect(ORDER_STATUS_MAP.processing.label).toBe('Preparing Order');
      expect(ORDER_STATUS_MAP.processing.stage).toBe(3);

      expect(ORDER_STATUS_MAP.packed.label).toBe('Order Packed');
      expect(ORDER_STATUS_MAP.packed.stage).toBe(3);

      expect(ORDER_STATUS_MAP.out_for_delivery.label).toBe('Out for Delivery');
      expect(ORDER_STATUS_MAP.out_for_delivery.stage).toBe(4);

      expect(ORDER_STATUS_MAP.delivered.label).toBe('Delivered');
      expect(ORDER_STATUS_MAP.delivered.stage).toBe(5);

      expect(ORDER_STATUS_MAP.cancelled.label).toBe('Cancelled');
      expect(ORDER_STATUS_MAP.cancelled.stage).toBe(0);
    });

    it('normalizes a complete backend order object into frontend format', () => {
      const rawBackendOrder = {
        id: 502,
        order_number: 'FV-884210',
        order_status: 'out_for_delivery',
        created_at: '2026-11-26T12:30:00.000Z',
        subtotal: '350.00',
        delivery_fee: '0.00',
        discount: '25.00',
        grand_total: '325.00',
        delivery_partner_name: 'Suresh Patil',
        customer_note: 'Call upon arrival',
        delivery_slot: {
          id: 1,
          name: '⚡ Instant Express (20 - 30 mins)',
          start_time: '12:00:00',
          end_time: '13:00:00',
        },
        address: {
          id: 301,
          full_name: 'Anjali Deshmukh',
          phone_number: '9822098220',
          address_line1: 'B-604, Rohan Ashima',
          city: 'Pune',
          pincode: '411045',
        },
        items: [
          {
            id: 88,
            product: 1,
            product_name: 'Baby Spinach',
            product_price: '45.00',
            quantity: 2,
            unit: '250g',
            subtotal: '90.00',
          },
        ],
        latest_payment: {
          payment_method: 'UPI',
          payment_status: 'successful',
        },
      };

      const normalized = normalizeBackendOrder(rawBackendOrder);

      expect(normalized.id).toBe('FV-884210');
      expect(normalized.orderNumber).toBe('FV-884210');
      expect(normalized.backendId).toBe(502);
      expect(normalized.status).toBe('Out for Delivery');
      expect(normalized.order_status).toBe('out_for_delivery');
      expect(normalized.stage).toBe(4);
      expect(normalized.isCancelled).toBe(false);
      expect(normalized.isDelivered).toBe(false);
      expect(normalized.subtotal).toBe(350);
      expect(normalized.grandTotal).toBe(325);
      expect(normalized.discount).toBe(25);
      expect(normalized.deliveryPartner.name).toBe('Suresh Patil');
      expect(normalized.address.fullName).toBe('Anjali Deshmukh');
      expect(normalized.items).toHaveLength(1);
      expect(normalized.items[0].name).toBe('Baby Spinach');
      expect(normalized.timeline).toHaveLength(5);
      expect(normalized.timeline[3].title).toBe('Out for Delivery');
      expect(normalized.timeline[3].current).toBe(true);
    });
  });

  describe('5. Error Formatting & Validation Guards', () => {
    it('formats field validation error from backend', () => {
      const errorObj = {
        response: {
          status: 400,
          data: {
            delivery_slot_id: ['Selected delivery slot is fully booked. Please choose another slot.'],
          },
        },
      };

      const formatted = formatApiError(errorObj);
      expect(formatted).toBe('Selected delivery slot is fully booked. Please choose another slot.');
    });

    it('formats stock validation error from backend', () => {
      const errorObj = {
        response: {
          status: 400,
          data: {
            stock: ['Insufficient stock for Fresh Broccoli.'],
          },
        },
      };

      const formatted = formatApiError(errorObj);
      expect(formatted).toBe('Insufficient stock for Fresh Broccoli.');
    });

    it('formats detail error message', () => {
      const errorObj = {
        response: {
          status: 403,
          data: {
            detail: 'You do not have permission to perform this action.',
          },
        },
      };

      const formatted = formatApiError(errorObj);
      expect(formatted).toBe('You do not have permission to perform this action.');
    });
  });
});
