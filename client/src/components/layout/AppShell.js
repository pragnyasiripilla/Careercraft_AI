import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { ChatbotPanel } from "../chat/ChatbotPanel";

export function AppShell() {
  const location = useLocation();
  const hideNav = location.pathname === "/";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-500 blur-3xl" />
        <div className="absolute -bottom-48 right-[-120px] h-[520px] w-[520px] rounded-full bg-fuchsia-500 blur-3xl" />
      </div>

      {!hideNav && (
        <div className="relative z-10">
          <Navbar />
        </div>
      )}

      <main className="relative z-10">
        <Outlet />
      </main>

      <ChatbotPanel />
    </div>
  );
}

