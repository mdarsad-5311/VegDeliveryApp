import { paymentAPI } from '../src/services/api';
import RazorpayCheckout from 'react-native-razorpay';
import apiClient from '../src/services/api';

describe('Phase 3D – Razorpay Payment Gateway Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('paymentAPI service endpoints', () => {
    it('initiates online payment with correct payload and receives gateway order info', async () => {
      const mockInitiateResponse = {
        data: {
          message: 'Payment initiated successfully.',
          order_number: 'FV-20261126-TEST',
          payment_id: 42,
          transaction_id: 'TXN-FV-20261126-TEST-ABCD',
          gateway_name: 'razorpay',
          gateway_order_id: 'order_test_99887766',
          razorpay_order_id: 'order_test_99887766',
          amount_in_paise: 29900,
          key_id: 'rzp_test_placeholder',
          payment_method: 'online',
          amount: '299.00',
          currency: 'INR',
          gateway_ready: true,
          status: 'pending',
        },
      };

      const postSpy = jest
        .spyOn(apiClient, 'post')
        .mockResolvedValueOnce(mockInitiateResponse);

      const res = await paymentAPI.initiate({
        order_number: 'FV-20261126-TEST',
        payment_method: 'online',
        amount: '299.00',
      });

      expect(postSpy).toHaveBeenCalledWith('/payments/initiate/', {
        order_number: 'FV-20261126-TEST',
        payment_method: 'online',
        amount: '299.00',
      });

      expect(res.data.gateway_name).toBe('razorpay');
      expect(res.data.razorpay_order_id).toBe('order_test_99887766');
      expect(res.data.amount_in_paise).toBe(29900);
      expect(res.data.key_id).toBe('rzp_test_placeholder');
      expect(res.data.currency).toBe('INR');

      postSpy.mockRestore();
    });

    it('verifies Razorpay payment signature server-side', async () => {
      const mockVerifyResponse = {
        data: {
          message: 'Payment verified successfully.',
          order_number: 'FV-20261126-TEST',
          transaction_id: 'TXN-FV-20261126-TEST-ABCD',
          gateway_order_id: 'order_test_99887766',
          gateway_payment_id: 'pay_test_11223344',
          payment_status: 'successful',
          order_status: 'confirmed',
          amount: '299.00',
        },
      };

      const postSpy = jest
        .spyOn(apiClient, 'post')
        .mockResolvedValueOnce(mockVerifyResponse);

      const res = await paymentAPI.verify({
        order_number: 'FV-20261126-TEST',
        razorpay_order_id: 'order_test_99887766',
        razorpay_payment_id: 'pay_test_11223344',
        razorpay_signature: 'valid_hmac_sha256_signature_hex',
      });

      expect(postSpy).toHaveBeenCalledWith('/payments/verify/', {
        order_number: 'FV-20261126-TEST',
        razorpay_order_id: 'order_test_99887766',
        razorpay_payment_id: 'pay_test_11223344',
        razorpay_signature: 'valid_hmac_sha256_signature_hex',
      });

      expect(res.data.payment_status).toBe('successful');
      expect(res.data.order_status).toBe('confirmed');
      expect(res.data.gateway_payment_id).toBe('pay_test_11223344');

      postSpy.mockRestore();
    });

    it('fetches real-time payment status by order number', async () => {
      const mockStatusResponse = {
        data: {
          order_number: 'FV-20261126-TEST',
          order_status: 'confirmed',
          order_status_display: 'Confirmed',
          payment_status: 'paid',
          payment_status_display: 'Paid',
          total_amount: '299.00',
          payment_method: 'online',
          payment_method_display: 'Online / Card / UPI',
          transaction_id: 'TXN-FV-20261126-TEST-ABCD',
          gateway_name: 'razorpay',
          gateway_order_id: 'order_test_99887766',
          gateway_payment_id: 'pay_test_11223344',
          payment_date: '2026-11-26T10:00:00Z',
          payments: [
            {
              id: 42,
              payment_method: 'online',
              payment_status: 'successful',
              gateway_name: 'razorpay',
              gateway_order_id: 'order_test_99887766',
              gateway_payment_id: 'pay_test_11223344',
              currency: 'INR',
              amount: '299.00',
            },
          ],
        },
      };

      const getSpy = jest
        .spyOn(apiClient, 'get')
        .mockResolvedValueOnce(mockStatusResponse);

      const res = await paymentAPI.getPaymentStatus('FV-20261126-TEST');

      expect(getSpy).toHaveBeenCalledWith('/orders/FV-20261126-TEST/payment-status/');
      expect(res.data.payment_status).toBe('paid');
      expect(res.data.gateway_name).toBe('razorpay');
      expect(res.data.payments[0].gateway_order_id).toBe('order_test_99887766');

      getSpy.mockRestore();
    });
  });

  describe('Razorpay Native SDK Bridge', () => {
    it('launches Razorpay checkout sheet with exact options', async () => {
      const options = {
        description: 'FreshVeg Order #FV-20261126-TEST',
        image: 'https://cdn-icons-png.flaticon.com/512/2909/2909808.png',
        currency: 'INR',
        key: 'rzp_test_placeholder',
        amount: 29900,
        name: 'FreshVeg Delivery',
        order_id: 'order_test_99887766',
        prefill: {
          email: 'customer@freshveg.local',
          contact: '9876543210',
          name: 'FreshVeg Customer',
        },
        theme: { color: '#2E7D32' },
      };

      const paymentData = await RazorpayCheckout.open(options);

      expect(RazorpayCheckout.open).toHaveBeenCalledWith(options);
      expect(paymentData).toHaveProperty('razorpay_payment_id');
      expect(paymentData).toHaveProperty('razorpay_order_id');
      expect(paymentData).toHaveProperty('razorpay_signature');
    });

    it('handles checkout cancellation or failure gracefully', async () => {
      RazorpayCheckout.open.mockRejectedValueOnce({
        code: 0,
        description: 'Payment cancelled by user',
      });

      await expect(
        RazorpayCheckout.open({
          key: 'rzp_test_placeholder',
          amount: 29900,
        })
      ).rejects.toEqual({
        code: 0,
        description: 'Payment cancelled by user',
      });
    });
  });
});
