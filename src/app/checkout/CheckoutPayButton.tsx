"use client";

import { useState, useEffect } from "react";
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
  const [snapReady, setSnapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const snapUrl =
      process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";

    if (document.getElementById("midtrans-snap")) {
      if (window.snap) setSnapReady(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "midtrans-snap";
    script.src = snapUrl;
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "");
    script.onload = () => setSnapReady(true);
    script.onerror = () => setError("Gagal memuat payment gateway. Cek koneksi internet Anda.");
    document.head.appendChild(script);
  }, []);

  async function handlePay() {
    if (!snapReady) {
      setError("Payment gateway belum siap, tunggu sebentar lalu coba lagi.");
      return;
    }

    setLoading(true);
    setError(null);

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

      if (!data.snapToken) {
        throw new Error("Token pembayaran tidak diterima dari server.");
      }

      window.snap.pay(data.snapToken, {
        onSuccess: () => {
          router.push(`/checkout/success?order=${data.orderNumber}`);
        },
        onPending: () => {
          router.push(`/checkout/success?order=${data.orderNumber}`);
        },
        onError: () => {
          setError("Pembayaran gagal. Silakan coba lagi.");
          setLoading(false);
        },
        onClose: () => {
          setLoading(false);
        },
      });
    } catch (e: any) {
      setError(e.message ?? "Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-700">
          {error}
        </div>
      )}
      {!snapReady && !error && (
        <p className="text-xs text-on-surface-variant animate-pulse">
          Memuat payment gateway...
        </p>
      )}
      <button
        onClick={handlePay}
        disabled={loading || !snapReady}
        className="btn-primary w-full"
      >
        {loading ? "Memproses..." : !snapReady ? "Memuat..." : "Bayar Sekarang"}
      </button>
      <p className="text-xs text-on-surface-variant text-center">
        Pembayaran diproses secara aman oleh Midtrans
      </p>
    </div>
  );
}