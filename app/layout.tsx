import type { Metadata } from "next";
import { LoanSystemProvider } from "@/context/LoanSystemContext";
import AppShell from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "CréditoÁgil RD — Gestión de Préstamos y Cobros",
  description: "Mockup interactivo para la gestión de préstamos y cobros en el mercado de República Dominicana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen">
        <LoanSystemProvider>
          <AppShell>
            {children}
          </AppShell>
        </LoanSystemProvider>
      </body>
    </html>
  );
}
