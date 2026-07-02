import { createAdminClient } from "@/lib/supabase/admin";
import { approveSeller, rejectSeller, suspendSeller } from "../actions";

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  suspended: "bg-gray-100 text-gray-600",
};

export default async function AdminSellersPage() {
  const supabase = createAdminClient();

  const { data: sellers, error } = await supabase
    .from("sellers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Sellers query error:", error);
  }

  const sellersWithProfile = await Promise.all(
    (sellers ?? []).map(async (seller) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", seller.id)
        .single();
      return { ...seller, full_name: profile?.full_name ?? "—" };
    })
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-2 tracking-tightest">SELLERS</h1>
      <p className="text-sm text-on-surface-variant mb-10">
        Total pendaftar: {sellersWithProfile.length}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 mb-6 text-sm text-red-700">
          Error: {error.message}
        </div>
      )}

      {sellersWithProfile.length === 0 && (
        <p className="text-on-surface-variant py-10">Belum ada pendaftar seller.</p>
      )}

      <div className="flex flex-col gap-6">
        {sellersWithProfile.map((s) => (
          <div key={s.id} className="border border-outline-variant p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-medium text-lg">{s.store_name}</p>
                <p className="text-sm text-on-surface-variant">
                  {s.full_name} · {s.phone}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Daftar: {new Date(s.created_at).toLocaleDateString("id-ID")}
                </p>
              </div>
              <span className={`label-sm px-3 py-1 rounded ${statusColor[s.status] ?? ""}`}>
                {s.status}
              </span>
            </div>

            {s.description && (
              <p className="text-sm text-on-surface-variant mb-4 italic">"{s.description}"</p>
            )}

            {s.rejection_reason && (
              <p className="text-sm text-red-600 mb-4">Alasan ditolak: {s.rejection_reason}</p>
            )}

            <div className="flex items-center gap-4 flex-wrap">
              {s.status === "pending" && (
                <>
                  <form action={approveSeller}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="btn-primary text-xs px-6 py-3">
                      ✓ Approve
                    </button>
                  </form>
                  <form action={rejectSeller} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={s.id} />
                    <input
                      name="reason"
                      placeholder="Alasan penolakan (opsional)"
                      className="border border-outline-variant px-3 py-2 text-sm"
                    />
                    <button type="submit" className="btn-ghost text-xs px-6 py-3">
                      ✗ Reject
                    </button>
                  </form>
                </>
              )}
              {s.status === "approved" && (
                <form action={suspendSeller}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" className="label-sm text-red-600 hover:underline">
                    Suspend Toko
                  </button>
                </form>
              )}
              {(s.status === "rejected" || s.status === "suspended") && (
                <form action={approveSeller}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" className="btn-primary text-xs px-6 py-3">
                    ✓ Approve
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}