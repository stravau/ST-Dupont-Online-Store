import Image from "next/image";

// The official S.T. Dupont wordmark — transparent PNG, WHITE artwork
// (508×96). It shows as-is on dark surfaces (variant="light"); on light
// surfaces (variant="dark", the default) we invert it to a dark mark.
export function Logo({
  variant = "dark",
  className = "",
  width = 150,
  priority = false,
}: {
  variant?: "dark" | "light";
  className?: string;
  width?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo/dupont-logo-white.png"
      alt="S.T. Dupont"
      width={width}
      height={Math.round((width * 96) / 508)}
      priority={priority}
      quality={100}
      className={`h-auto select-none ${
        variant === "light" ? "" : "[filter:invert(1)]"
      } ${className}`}
    />
  );
}
