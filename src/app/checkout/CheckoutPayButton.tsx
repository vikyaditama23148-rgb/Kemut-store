"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess: (result: unknown) => void;
          onPending: (result: unknown) => void;
          onError: (result: unknown) => void;
          onClose: () => void;
        }
      ) => void;
    };
  }
}

export default function CheckoutPayButton({ addressId }: { addressId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      window.snap.pay(data.snapToken, {
        onSuccess: () => router.push(`/checkout/success?order=${data.orderNumber}`),
        onPending: () => router.push(`/checkout/success?order=${data.orderNumber}`),
        onError: () => setError("Payment failed. Please try again."),
        onClose: () => router.push(`/checkout/success?order=${data.orderNumber}`),
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src={
          process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js"
        }
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />
      {error && <p className="text-error text-sm mb-4">{error}</p>}
      <button onClick={handlePay} disabled={loading} className="btn-primary w-full">
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </>
  );
}
