import React from "react";
import { Link, NavLink } from "react-router-dom";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-lg px-3 py-2 text-sm font-medium transition",
          isActive
            ? "bg-white/10 text-white"
            : "text-slate-200 hover:bg-white/5 hover:text-white",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export function Navbar() {
  return (
    <header className="border-b border-white/10 bg-slate-950/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="group inline-flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/20">
            <span className="text-sm font-black tracking-tight">CC</span>
          </span>
          <span className="text-sm font-semibold tracking-tight text-white">
            CareerCraft AI
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/dashboard">Dashboard</NavItem>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-white/10 transition hover:bg-white/90"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}

