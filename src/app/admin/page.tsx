"use client";

import Link from "next/link";

const CARDS = [
  {
    href: "/admin/users",
    title: "Usuários",
    desc: "Listar contas, buscar e alterar o nível de permissão.",
  },
  {
    href: "/admin/signatures",
    title: "Assinaturas",
    desc: "Visualizar, ativar ou cancelar manualmente assinaturas.",
  },
  {
    href: "/admin/custom-plans",
    title: "Planos sob medida",
    desc: "Criar ofertas personalizadas com link de pagamento exclusivo.",
  },
  {
    href: "/admin/partners",
    title: "Parceiros",
    desc: "Cadastrar cupons, descontos e comissão por parceiro.",
  },
  {
    href: "/admin/config",
    title: "Configurações do sistema",
    desc: "Avaliação gratuita, suporte e demais ajustes operacionais.",
  },
];

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Painel administrativo</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Operações restritas. Toda alteração é registrada na auditoria.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm"
          >
            <div className="text-base font-medium">{card.title}</div>
            <div className="mt-1 text-sm text-zinc-600">{card.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
