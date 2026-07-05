"use client";

import { useRef } from "react";
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
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(newQty: number) {
    if (newQty < 1 || newQty > max) return;
    if (inputRef.current) inputRef.current.value = String(newQty);
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={updateCartItem} className="flex items-center">
      <input type="hidden" name="item_id" value={itemId} />
      <input ref={inputRef} type="hidden" name="quantity" defaultValue={quantity} />

      <div className="flex items-center border border-[#e8e4de] h-10">
        <button
          type="button"
          onClick={() => submit(quantity - 1)}
          disabled={quantity <= 1}
          className="px-4 h-full hover:bg-[#efeeeb] transition-colors disabled:opacity-30 label-caps"
        >
          −
        </button>
        <span className="px-5 h-full flex items-center border-x border-[#e8e4de] label-caps min-w-[40px] justify-center">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => submit(quantity + 1)}
          disabled={quantity >= max}
          className="px-4 h-full hover:bg-[#efeeeb] transition-colors disabled:opacity-30 label-caps"
        >
          +
        </button>
      </div>
    </form>
  );
}