"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess: (result: unknown) => void;
        onPending: (result: unknown) => void;
        onError: (result: unknown) => void;
        onClose: () => void;
      }) => void;
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
      setError("Payment gateway belum siap, coba lagi.");
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
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      if (!data.snapToken) throw new Error("Token pembayaran tidak diterima.");

      window.snap.pay(data.snapToken, {
        onSuccess: () => router.push(`/checkout/success?order=${data.orderNumber}`),
        onPending: () => router.push(`/checkout/success?order=${data.orderNumber}`),
        onError: () => {
          setError("Pembayaran gagal. Silakan coba lagi.");
          setLoading(false);
        },
        onClose: () => setLoading(false),
      });
    } catch (e: any) {
      setError(e.message ?? "Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 border border-[#ba1a1a]/30 bg-[#ffdad6] text-[#93000a] text-sm label-caps">
          {error}
        </div>
      )}
      {!snapReady && !error && (
        <p className="label-caps text-[#747878] text-center animate-pulse">
          Memuat payment gateway...
        </p>
      )}
      <button
        onClick={handlePay}
        disabled={loading || !snapReady}
        className="w-full bg-black text-white py-6 label-caps tracking-[0.2em]
          hover:bg-[#d4af37] transition-all duration-500 active:scale-[0.98]
          disabled:opacity-40 disabled:pointer-events-none
          flex items-center justify-center gap-3 group"
      >
        {loading ? "MEMPROSES..." : !snapReady ? "MEMUAT..." : "PAY NOW"}
        {!loading && snapReady && (
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        )}
      </button>
      <p className="label-caps text-[#747878] text-center text-[10px]">
        Pembayaran diproses secara aman oleh Midtrans
      </p>
    </div>
  );
}