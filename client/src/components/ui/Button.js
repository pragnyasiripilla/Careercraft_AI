import React from "react";

const STYLES = {
  primary:
    "bg-white text-slate-950 hover:bg-white/90 shadow-lg shadow-white/10",
  subtle:
    "bg-white/10 text-white hover:bg-white/15 border border-white/10",
  ghost: "bg-transparent text-slate-200 hover:bg-white/5",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60",
        STYLES[variant] || STYLES.primary,
        className,
      ].join(" ")}
      {...props}
    />
  );
}

