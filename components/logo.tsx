import Image from "next/image";

// The official S.T. Dupont wordmark — transparent PNG (black artwork),
// trimmed to its bounding box (225×55). On dark surfaces we invert it to
// a light mark; transparency means no background blending is needed.
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
      src="/logo/dupont-logo.png"
      alt="S.T. Dupont"
      width={width}
      height={Math.round((width * 55) / 225)}
      priority={priority}
      className={`h-auto w-auto select-none ${
        variant === "light" ? "[filter:invert(1)]" : ""
      } ${className}`}
    />
  );
}
