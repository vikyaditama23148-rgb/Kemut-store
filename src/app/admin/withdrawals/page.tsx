import { createAdminClient } from "@/lib/supabase/admin";
import { formatRupiah } from "@/lib/midtrans";
import { approveWithdrawal, rejectWithdrawal } from "./actions";

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const statusLabel: Record<string, string> = {
  pending: "Menunggu",
  processing: "Diproses",
  completed: "Selesai",
  rejected: "Ditolak",
};

export default async function AdminWithdrawalsPage() {
  const supabase = createAdminClient();

  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select("*, sellers:seller_id(store_name)")
    .order("created_at", { ascending: false });

  const pending = withdrawals?.filter((w) => w.status === "pending") ?? [];
  const others = withdrawals?.filter((w) => w.status !== "pending") ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-2 tracking-tightest">
        WITHDRAWAL REQUESTS
      </h1>
      <p className="text-sm text-on-surface-variant mb-10">
        {pending.length} request menunggu persetujuan
      </p>

      {/* Pending — perlu tindakan */}
      {pending.length > 0 && (
        <div className="mb-12">
          <p className="label-sm text-on-surface-variant mb-4">Perlu Ditindaklanjuti</p>
          <div className="flex flex-col gap-4">
            {pending.map((w: any) => (
              <div key={w.id} className="border-2 border-gold p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-lg">{formatRupiah(w.amount)}</p>
                    <p className="text-sm font-medium text-on-surface-variant mt-1">
                      {w.sellers?.store_name}
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      {w.bank_name} — {w.bank_account_number}
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      a.n. {w.bank_account_name}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-2">
                      {new Date(w.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className={`label-sm px-3 py-1 rounded ${statusColor[w.status]}`}>
                    {statusLabel[w.status]}
                  </span>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <form action={approveWithdrawal}>
                    <input type="hidden" name="id" value={w.id} />
                    <button type="submit" className="btn-primary text-xs px-6 py-3">
                      ✓ Sudah Ditransfer
                    </button>
                  </form>
                  <form action={rejectWithdrawal} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={w.id} />
                    <input type="hidden" name="seller_id" value={w.seller_id} />
                    <input type="hidden" name="amount" value={w.amount} />
                    <input
                      name="note"
                      placeholder="Alasan penolakan"
                      className="border border-outline-variant px-3 py-2 text-sm"
                    />
                    <button type="submit" className="btn-ghost text-xs px-6 py-3">
                      ✗ Tolak
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Riwayat */}
      {others.length > 0 && (
        <div>
          <p className="label-sm text-on-surface-variant mb-4">Riwayat</p>
          <div className="divide-y divide-outline-variant">
            {others.map((w: any) => (
              <div key={w.id} className="flex justify-between items-center py-4">
                <div>
                  <p className="font-medium">{formatRupiah(w.amount)}</p>
                  <p className="text-sm text-on-surface-variant">
                    {w.sellers?.store_name} · {w.bank_name} {w.bank_account_number}
                  </p>
                  {w.admin_note && (
                    <p className="text-xs text-on-surface-variant mt-1">
                      Catatan: {w.admin_note}
                    </p>
                  )}
                  <p className="text-xs text-on-surface-variant">
                    {new Date(w.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <span className={`label-sm px-3 py-1 rounded ${statusColor[w.status]}`}>
                  {statusLabel[w.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!withdrawals || withdrawals.length === 0) && (
        <p className="text-on-surface-variant">Belum ada request penarikan.</p>
      )}
    </div>
  );
}