import Image from "next/image";

// The official S.T. Dupont wordmark — transparent PNG (black artwork),
// upscaled to 1800×440 from the trimmed 225×55 source so it stays crisp
// at the large hero size. On dark surfaces we invert it to a light mark;
// transparency means no background blending is needed.
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
      height={Math.round((width * 440) / 1800)}
      priority={priority}
      quality={100}
      className={`h-auto select-none ${
        variant === "light" ? "[filter:invert(1)]" : ""
      } ${className}`}
    />
  );
}
