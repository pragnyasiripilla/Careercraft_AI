import React from "react";

export function Card({ className = "", children }) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/10 bg-white/5 shadow-xl shadow-black/20 backdrop-blur",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return (
    <div className={["border-b border-white/10 p-5", className].join(" ")}>
      {children}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={["p-5", className].join(" ")}>{children}</div>;
}

