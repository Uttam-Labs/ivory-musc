"use client";

import { set, unset, type StringInputProps } from "sanity";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function ColorPickerInput({ value, onChange, readOnly }: StringInputProps) {
  const selectedColor = typeof value === "string" && HEX_COLOR.test(value) ? value : "#000000";

  return (
    <div
      style={{
        display: "flex",
        minHeight: 44,
        alignItems: "center",
        gap: 12,
        padding: "6px 8px",
        border: "1px solid var(--card-border-color, #d8d8d8)",
        borderRadius: 4,
        background: "var(--card-bg-color, #fff)",
      }}
    >
      <input
        type="color"
        value={selectedColor}
        disabled={readOnly}
        aria-label="Choose color"
        onChange={(event) => onChange(set(event.currentTarget.value.toUpperCase()))}
        style={{
          width: 64,
          height: 32,
          padding: 0,
          border: 0,
          background: "transparent",
          cursor: readOnly ? "not-allowed" : "pointer",
        }}
      />
      <output style={{ flex: 1, fontFamily: "monospace", fontSize: 14 }}>{value || "Choose a color"}</output>
      {value && !readOnly && (
        <button
          type="button"
          onClick={() => onChange(unset())}
          style={{ padding: "6px 10px", border: "1px solid #d8d8d8", borderRadius: 3, background: "transparent", cursor: "pointer" }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
