import Image from "next/image";

// The official S.T. Dupont wordmark. The source asset is black artwork on a
// white field, so we blend it into the surrounding surface:
//  - "dark"  : on light backgrounds → multiply drops the white field
//  - "light" : on dark backgrounds  → invert + screen yields a light mark
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
      src="/logo/dupont-logo.jpeg"
      alt="S.T. Dupont Paris"
      width={width}
      height={Math.round((width * 178) / 600)}
      priority={priority}
      className={`h-auto w-auto select-none ${
        variant === "light"
          ? "[filter:invert(1)] mix-blend-screen"
          : "mix-blend-multiply"
      } ${className}`}
    />
  );
}
