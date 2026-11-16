/** A two-step destructive button without client JavaScript: the first click reveals the real one. */
export default function ConfirmButton({
  action,
  fields,
  label,
  confirmLabel,
}: {
  action: (fd: FormData) => Promise<void>;
  fields: Record<string, string>;
  label: string;
  confirmLabel: string;
}) {
  return (
    <details className="confirm">
      <summary className="btn ghost sm danger">{label}</summary>
      <form action={action}>
        {Object.entries(fields).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <button className="btn sm danger-solid" type="submit">{confirmLabel}</button>
      </form>
    </details>
  );
}
