import React from "react";

export function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-slate-200">
      {children}
    </label>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={[
        "w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-sm text-white placeholder:text-slate-400 shadow-inner shadow-black/20 outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

export function Textarea({ className = "", rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={[
        "w-full resize-none rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder:text-slate-400 shadow-inner shadow-black/20 outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

export function HelperText({ children }) {
  return <p className="text-xs text-slate-400">{children}</p>;
}

