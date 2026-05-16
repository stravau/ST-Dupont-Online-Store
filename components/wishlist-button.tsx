"use client";

import { useState, useTransition } from "react";
import { toggleWishlist } from "@/lib/actions";

export function WishlistButton({
  productId,
  lang,
  initialActive = false,
  label,
  className = "",
}: {
  productId: string;
  lang: string;
  initialActive?: boolean;
  label: string;
  className?: string;
}) {
  const [active, setActive] = useState(initialActive);
  const [pending, startTransition] = useTransition();

  function onClick() {
    setActive((a) => !a); // optimistic
    startTransition(async () => {
      const next = await toggleWishlist(productId, lang);
      setActive(next);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      disabled={pending}
      className={`transition-colors duration-300 ${
        active ? "text-gold" : "text-muted hover:text-ink"
      } ${className}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 21s-7.5-4.6-9.8-9A5.2 5.2 0 0 1 12 6a5.2 5.2 0 0 1 9.8 6c-2.3 4.4-9.8 9-9.8 9Z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
