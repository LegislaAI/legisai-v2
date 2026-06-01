import Link from "next/link";
import type { ReactNode } from "react";

const NAV = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/users", label: "Usuários" },
  { href: "/admin/signatures", label: "Assinaturas" },
  { href: "/admin/signature-plans", label: "Planos de assinatura" },
  { href: "/admin/custom-plans", label: "Planos sob medida" },
  { href: "/admin/partners", label: "Parceiros" },
  { href: "/admin/webhooks", label: "Webhooks" },
  { href: "/admin/audit", label: "Auditoria" },
  { href: "/admin/config", label: "Configurações" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              LegisDados
            </span>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
              Admin
            </span>
          </div>
          <Link
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            Voltar ao app
          </Link>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">
        <aside className="w-56 shrink-0">
          <nav className="flex flex-col gap-1 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-3 py-2 hover:bg-zinc-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
