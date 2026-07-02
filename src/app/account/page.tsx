import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut, saveAddress } from "./actions";

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
  const { data: address } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user!.id)
    .eq("is_default", true)
    .maybeSingle();

  return (
    <div className="px-5 md:px-16 max-w-3xl mx-auto py-20">
      <div className="flex justify-between items-center mb-12">
        <h1 className="font-display text-3xl font-semibold tracking-tightest">MY ACCOUNT</h1>
        <form action={signOut}>
          <button type="submit" className="label-sm text-on-surface-variant hover:text-gold">
            Sign Out
          </button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <p className="label-sm text-on-surface-variant mb-2">Name</p>
          <p className="mb-6">{profile?.full_name || "—"}</p>
          <p className="label-sm text-on-surface-variant mb-2">Email</p>
          <p>{user?.email}</p>
        </div>
        <div>
          <Link href="/account/orders" className="btn-ghost">
            View Order History
          </Link>
        </div>
      </div>

      <h2 className="label-sm text-on-surface-variant mb-6">Default Shipping Address</h2>
      <form action={saveAddress} className="grid md:grid-cols-2 gap-6 max-w-2xl">
        <input type="hidden" name="address_id" value={address?.id ?? ""} />
        <input name="recipient_name" placeholder="Recipient name" required defaultValue={address?.recipient_name} className="input-line" />
        <input name="phone" placeholder="Phone number" required defaultValue={address?.phone} className="input-line" />
        <input name="line1" placeholder="Street address" required defaultValue={address?.line1} className="input-line md:col-span-2" />
        <input name="city" placeholder="City" required defaultValue={address?.city} className="input-line" />
        <input name="province" placeholder="Province" required defaultValue={address?.province} className="input-line" />
        <input name="postal_code" placeholder="Postal code" required defaultValue={address?.postal_code} className="input-line" />
        <button type="submit" className="btn-primary md:col-span-2 mt-4">
          Save Address
        </button>
      </form>
    </div>
  );
}
