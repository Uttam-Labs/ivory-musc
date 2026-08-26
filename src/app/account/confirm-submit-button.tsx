"use client";

export function ConfirmSubmitButton({
  message,
  children,
  className,
  matchFields,
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
  matchFields?: readonly [string, string];
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        const form = event.currentTarget.form;
        if (matchFields && form) {
          const first = form.elements.namedItem(
            matchFields[0],
          ) as HTMLInputElement | null;
          const second = form.elements.namedItem(
            matchFields[1],
          ) as HTMLInputElement | null;
          second?.setCustomValidity("");
          if (first && second && first.value !== second.value) {
            event.preventDefault();
            second.setCustomValidity("Passwords do not match.");
            second.reportValidity();
            return;
          }
        }
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
