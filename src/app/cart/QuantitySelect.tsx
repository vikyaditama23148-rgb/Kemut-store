"use client";

import { updateCartItem } from "./actions";

export default function QuantitySelect({
  itemId,
  quantity,
  max,
}: {
  itemId: string;
  quantity: number;
  max: number;
}) {
  return (
    <form action={updateCartItem} className="flex items-center gap-2">
      <input type="hidden" name="item_id" value={itemId} />
      <select
        name="quantity"
        defaultValue={quantity}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="border border-outline-variant px-3 py-2 text-sm bg-white"
      >
        {Array.from({ length: Math.max(max, quantity, 1) }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </form>
  );
}
