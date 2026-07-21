/**
 * Shiprocket integration.
 *
 * Setup:
 * 1. Sign up at shiprocket.in, complete KYC, add a pickup address
 *    (Settings → Pickup Addresses) — note its "pickup_location" nickname.
 * 2. Set SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD / SHIPROCKET_PICKUP_LOCATION
 *    in your env.
 * 3. Auth tokens expire after ~10 days; we fetch a fresh one and cache it
 *    in memory per server instance rather than persisting it.
 *
 * Docs: https://apidocs.shiprocket.in
 */

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  if (!res.ok) {
    throw new Error(`Shiprocket auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = { value: data.token, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 9 };
  return cachedToken.value;
}

interface ShiprocketOrderInput {
  orderNumber: string;
  orderDate: Date;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  items: { name: string; quantity: number; unitPricePaise: number }[];
  subtotalPaise: number;
  totalWeightGrams: number;
  /** cm — a reasonable single box size covering all items in the order */
  dimensionsCm: { length: number; breadth: number; height: number };
}

export interface ShiprocketResult {
  shiprocketOrderId: string;
  shipmentId: string;
  courierName?: string;
  awb?: string;
  trackingUrl?: string;
}

/**
 * Creates the order in Shiprocket. This alone doesn't assign a courier —
 * call assignCourier() after, or do it manually from the Shiprocket
 * dashboard if you prefer to pick couriers by hand initially.
 */
export async function createShiprocketOrder(input: ShiprocketOrderInput): Promise<ShiprocketResult> {
  const token = await getToken();
  const [firstName, ...rest] = input.customerName.trim().split(" ");

  const res = await fetch(`${BASE_URL}/orders/create/adhoc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      order_id: input.orderNumber,
      order_date: input.orderDate.toISOString().slice(0, 16).replace("T", " "),
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION,
      billing_customer_name: firstName,
      billing_last_name: rest.join(" ") || firstName,
      billing_address: input.addressLine1,
      billing_address_2: input.addressLine2 || "",
      billing_city: input.city,
      billing_state: input.state,
      billing_pincode: input.pincode,
      billing_country: "India",
      billing_email: input.customerEmail,
      billing_phone: input.customerPhone,
      shipping_is_billing: true,
      order_items: input.items.map((item) => ({
        name: item.name,
        units: item.quantity,
        selling_price: (item.unitPricePaise / 100).toFixed(2),
      })),
      payment_method: "Prepaid", // Razorpay already collected payment
      sub_total: (input.subtotalPaise / 100).toFixed(2),
      length: input.dimensionsCm.length,
      breadth: input.dimensionsCm.breadth,
      height: input.dimensionsCm.height,
      weight: Math.max(input.totalWeightGrams / 1000, 0.05), // kg, 50g floor
    }),
  });

  if (!res.ok) {
    throw new Error(`Shiprocket order creation failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();

  return {
    shiprocketOrderId: String(data.order_id),
    shipmentId: String(data.shipment_id),
  };
}

/**
 * Auto-assigns the cheapest/recommended available courier and generates
 * an AWB (tracking number). Call this after createShiprocketOrder, or
 * skip it and assign manually from the Shiprocket dashboard.
 */
export async function assignCourier(shipmentId: string): Promise<ShiprocketResult> {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/courier/assign/awb`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: shipmentId }),
  });

  if (!res.ok) {
    throw new Error(`Shiprocket courier assignment failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const awb = data.response?.data?.awb_code as string | undefined;
  const courierName = data.response?.data?.courier_name as string | undefined;

  return {
    shiprocketOrderId: String(data.response?.data?.order_id ?? ""),
    shipmentId,
    courierName,
    awb,
    trackingUrl: awb ? `https://shiprocket.co/tracking/${awb}` : undefined,
  };
}
