import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/midtrans";
import { saveBankInfo, requestWithdrawal } from "./actions";

const statusLabel: Record<string, string> = {
  pending: "Menunggu",
  processing: "Diproses",
  completed: "Selesai",
  rejected: "Ditolak",
};

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default async function SellerWalletPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: seller } = await supabase
    .from("sellers")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select("*")
    .eq("seller_id", user!.id)
    .order("created_at", { ascending: false });

  const pendingWithdrawal = withdrawals?.find(
    (w) => w.status === "pending" || w.status === "processing"
  );

  return (
    <div className="max-w-2xl space-y-12">
      <h1 className="font-display text-2xl font-semibold tracking-tightest">DOMPET SAYA</h1>

      {/* Saldo */}
      <div className="grid grid-cols-2 gap-6">
        <div className="border border-outline-variant p-6">
          <p className="label-sm text-on-surface-variant mb-2">Saldo Tersedia</p>
          <p className="text-3xl font-semibold text-primary">
            {formatRupiah(seller?.balance ?? 0)}
          </p>
          <p className="text-xs text-on-surface-variant mt-2">
            Setelah 5% platform fee
          </p>
        </div>
        <div className="border border-outline-variant p-6">
          <p className="label-sm text-on-surface-variant mb-2">Total Pendapatan</p>
          <p className="text-3xl font-semibold">
            {formatRupiah(seller?.total_earned ?? 0)}
          </p>
          <p className="text-xs text-on-surface-variant mt-2">
            Akumulasi semua order selesai
          </p>
        </div>
      </div>

      {/* Info Rekening Bank */}
      <div>
        <h2 className="label-sm text-on-surface-variant mb-6">Rekening Bank</h2>
        <form action={saveBankInfo} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-sm text-on-surface-variant block mb-2">Nama Bank</label>
              <select
                name="bank_name"
                defaultValue={seller?.bank_name ?? ""}
                className="border border-outline-variant px-4 py-3 text-sm bg-white w-full"
              >
                <option value="">— Pilih Bank —</option>
                {["BCA", "BNI", "BRI", "Mandiri", "CIMB Niaga", "Danamon", "BSI", "Permata", "OVO", "GoPay", "DANA"].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-sm text-on-surface-variant block mb-2">Nomor Rekening</label>
              <input
                name="bank_account_number"
                defaultValue={seller?.bank_account_number ?? ""}
                placeholder="1234567890"
                className="input-line"
              />
            </div>
          </div>
          <div>
            <label className="label-sm text-on-surface-variant block mb-2">Nama Pemilik Rekening</label>
            <input
              name="bank_account_name"
              defaultValue={seller?.bank_account_name ?? ""}
              placeholder="Sesuai rekening bank"
              className="input-line"
            />
          </div>
          <button type="submit" className="btn-ghost mt-2">
            Simpan Info Rekening
          </button>
        </form>
      </div>

      {/* Request Withdraw */}
      <div>
        <h2 className="label-sm text-on-surface-variant mb-6">Tarik Saldo</h2>

        {!seller?.bank_name && (
          <p className="text-sm text-on-surface-variant p-4 bg-surface-container-low rounded">
            Isi info rekening bank terlebih dahulu sebelum melakukan penarikan.
          </p>
        )}

        {seller?.bank_name && pendingWithdrawal && (
          <p className="text-sm text-on-surface-variant p-4 bg-yellow-50 border border-yellow-200 rounded">
            Ada request penarikan yang sedang diproses ({formatRupiah(pendingWithdrawal.amount)}).
            Tunggu hingga selesai sebelum mengajukan yang baru.
          </p>
        )}

        {seller?.bank_name && !pendingWithdrawal && (
          <form action={requestWithdrawal} className="space-y-4 max-w-sm">
            <input type="hidden" name="bank_name" value={seller.bank_name} />
            <input type="hidden" name="bank_account_number" value={seller.bank_account_number} />
            <input type="hidden" name="bank_account_name" value={seller.bank_account_name} />

            <div>
              <label className="label-sm text-on-surface-variant block mb-2">
                Jumlah Penarikan (min. Rp 50.000)
              </label>
              <input
                type="number"
                name="amount"
                min={50000}
                max={seller.balance}
                placeholder="50000"
                required
                className="input-line"
              />
              <p className="text-xs text-on-surface-variant mt-1">
                Saldo tersedia: {formatRupiah(seller.balance)}
              </p>
            </div>

            <button
              type="submit"
              disabled={(seller?.balance ?? 0) < 50000}
              className="btn-primary"
            >
              Ajukan Penarikan
            </button>

            {(seller?.balance ?? 0) < 50000 && (
              <p className="text-xs text-on-surface-variant">
                Saldo minimum untuk penarikan adalah Rp 50.000
              </p>
            )}
          </form>
        )}
      </div>

      {/* Riwayat Penarikan */}
      {withdrawals && withdrawals.length > 0 && (
        <div>
          <h2 className="label-sm text-on-surface-variant mb-6">Riwayat Penarikan</h2>
          <div className="divide-y divide-outline-variant">
            {withdrawals.map((w) => (
              <div key={w.id} className="flex justify-between items-center py-4">
                <div>
                  <p className="font-medium">{formatRupiah(w.amount)}</p>
                  <p className="text-sm text-on-surface-variant">
                    {w.bank_name} · {w.bank_account_number}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {new Date(w.created_at).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </p>
                  {w.admin_note && (
                    <p className="text-xs text-on-surface-variant mt-1">
                      Catatan: {w.admin_note}
                    </p>
                  )}
                </div>
                <span className={`label-sm px-3 py-1 rounded ${statusColor[w.status]}`}>
                  {statusLabel[w.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}