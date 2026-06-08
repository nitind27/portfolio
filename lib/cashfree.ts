const API_VERSION = '2023-08-01';

function getBaseUrl() {
  return process.env.CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
}

function getHeaders() {
  const appId = process.env.CASHFREE_APP_ID;
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!appId || !secret) {
    throw new Error('CASHFREE_APP_ID and CASHFREE_SECRET_KEY must be set');
  }
  return {
    'Content-Type': 'application/json',
    'x-api-version': API_VERSION,
    'x-client-id': appId,
    'x-client-secret': secret,
  };
}

export function getPremiumPrice() {
  return Number(process.env.PREMIUM_PRICE || 99);
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  order_status: string;
  payment_session_id: string;
}

export async function createCashfreeOrder(params: {
  orderId: string;
  amount: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}) {
  const res = await fetch(`${getBaseUrl()}/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      order_id: params.orderId,
      order_amount: params.amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: params.customerId,
        customer_name: params.customerName,
        customer_email: params.customerEmail,
        customer_phone: params.customerPhone,
      },
      order_meta: {
        return_url: `${getAppUrl()}/payment/callback?order_id={order_id}`,
      },
      order_note: 'Webquro Premium',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error?.message || 'Failed to create Cashfree order');
  }
  return data as CashfreeOrderResponse;
}

export async function fetchCashfreeOrder(orderId: string) {
  const res = await fetch(`${getBaseUrl()}/orders/${orderId}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to fetch order');
  }
  return data as CashfreeOrderResponse;
}

export function getCashfreeCheckoutMode() {
  return process.env.CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
}
