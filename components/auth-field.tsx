export function AuthField({
  label,
  name,
  type,
  required,
  autoComplete,
  hint,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="overline mb-2 block">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold"
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
