"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Form pembayaran Stripe (dirender di dalam Elements provider)
function PaymentForm({
  clientSecret,
  orderNumber,
}: {
  clientSecret: string;
  orderNumber: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order=${orderNumber}`,
      },
    });

    // Jika sampai sini berarti ada error (sukses langsung redirect)
    if (stripeError) {
      setError(
        stripeError.message ?? "Pembayaran gagal. Silakan coba lagi."
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
          defaultValues: { billingDetails: { address: { country: "ID" } } },
        }}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 p-3 text-sm text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="btn-primary w-full"
      >
        {loading ? "Memproses..." : "Bayar Sekarang"}
      </button>

      <p className="text-xs text-on-surface-variant text-center">
        🔒 Pembayaran diproses secara aman oleh Stripe
      </p>
    </form>
  );
}

// Komponen utama — fetch client secret dulu lalu render Stripe Elements
export default function CheckoutPayButton({ addressId }: { addressId: string }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function createPaymentIntent() {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ addressId }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || `Error ${res.status}`);
        }

        setClientSecret(data.clientSecret);
        setOrderNumber(data.orderNumber);
      } catch (e: any) {
        setError(e.message ?? "Gagal memuat form pembayaran.");
      } finally {
        setLoading(false);
      }
    }

    createPaymentIntent();
  }, [addressId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-12 bg-surface-container animate-pulse rounded" />
        <div className="h-12 bg-surface-container animate-pulse rounded" />
        <div className="h-14 bg-surface-container animate-pulse rounded" />
        <p className="text-xs text-on-surface-variant text-center animate-pulse">
          Memuat form pembayaran...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-700 rounded">
        <p className="font-medium mb-1">Gagal memuat pembayaran</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!clientSecret) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "flat",
          variables: {
            colorPrimary: "#0a0a0a",
            colorBackground: "#fbf9f9",
            colorText: "#1b1c1c",
            colorDanger: "#ba1a1a",
            fontFamily: "Inter, sans-serif",
            borderRadius: "0px",
            spacingUnit: "4px",
          },
        },
        locale: "id",
      }}
    >
      <PaymentForm clientSecret={clientSecret} orderNumber={orderNumber} />
    </Elements>
  );
}