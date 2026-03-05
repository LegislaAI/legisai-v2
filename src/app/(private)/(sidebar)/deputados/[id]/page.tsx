"use client";

import type { PlanLevel } from "@/@types/signature";
import { BackButton } from "@/components/v2/components/ui/BackButton";
import { Card } from "@/components/v2/components/ui/Card";
import { useSignatureContext } from "@/context/SignatureContext";
import { deputadoDetailOnlyHeader } from "@/lib/plan-access";
import { cn } from "@/lib/utils";
import * as Tabs from "@radix-ui/react-tabs";
import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  DeputadoHeader,
  SkeletonLoader,
  TABS,
  TabAgenda,
  TabAtuacao,
  TabDespesasFinanceiro,
  TabOverview,
  TabPerfil,
  TabPosicionamento,
  useDeputadoPage,
} from "./_components";

export default function DeputadoDetalhesPage2() {
  const params = useParams();
  const id = params?.id as string;
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { activeSignature } = useSignatureContext();
  const level: PlanLevel = activeSignature?.signaturePlan?.level ?? 4;
  const onlyHeader = deputadoDetailOnlyHeader(level);

  const data = useDeputadoPage(id);

  if (!id) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
        <BackButton />
        <Card className="border-gray-100 p-8 text-center text-gray-500">
          ID do deputado não informado.
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
      <BackButton />

      {data.loading ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <SkeletonLoader className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <SkeletonLoader className="h-8 w-48" />
              <SkeletonLoader className="h-4 w-32" />
            </div>
          </div>
          <SkeletonLoader className="h-64 w-full rounded-2xl" />
        </div>
      ) : !data.politician ? (
        <Card className="border-gray-100 p-8 text-center text-gray-500">
          {data.fetchError ? (
            <>
              <p className="font-medium text-gray-700">
                Não foi possível carregar o deputado
              </p>
              <p className="mt-2 text-sm">{data.fetchError}</p>
              <p className="mt-4 text-sm">
                Confirme que a API está rodando e que o banco de dados está
                acessível. O ID {id} pode estar correto, mas o servidor não
                respondeu.
              </p>
            </>
          ) : (
            "Deputado não encontrado."
          )}
        </Card>
      ) : (
        <>
          <DeputadoHeader
            politician={data.politician}
            onExportPDF={data.handleExportPDF}
            ufNascimento={data.biografia?.ufNascimento}
          />

          <div className={cn("relative w-full", onlyHeader && "h-[575px]")}>
            <Tabs.Root
              value={activeTab}
              onValueChange={setActiveTab}
              className={cn("w-full", onlyHeader && "hidden")}
            >
              <Tabs.List className="scrollbar-hide mb-6 flex flex-nowrap gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-gray-50/50 p-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <Tabs.Trigger
                      key={tab.id}
                      value={tab.id}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200",
                        activeTab === tab.id
                          ? "bg-[#749c5b] text-white shadow-sm"
                          : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {tab.label}
                    </Tabs.Trigger>
                  );
                })}
              </Tabs.List>

              <Tabs.Content
                value="overview"
                className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300"
              >
                <TabOverview data={data} onNavigateTab={setActiveTab} />
              </Tabs.Content>

              <Tabs.Content
                value="agenda"
                className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <TabAgenda data={data} />
              </Tabs.Content>

              <Tabs.Content
                value="posicionamento"
                className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300"
              >
                <TabPosicionamento data={data} />
              </Tabs.Content>

              <Tabs.Content
                value="despesas-financeiro"
                className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300"
              >
                <TabDespesasFinanceiro data={data} />
              </Tabs.Content>

              <Tabs.Content
                value="atuacao"
                className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300"
              >
                <TabAtuacao data={data} />
              </Tabs.Content>

              <Tabs.Content
                value="perfil"
                className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300"
              >
                <TabPerfil data={data} />
              </Tabs.Content>
            </Tabs.Root>

            {onlyHeader && (
              <div
                className="absolute inset-0 top-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-md"
                aria-hidden="true"
              >
                <div className="mx-4 flex max-w-md flex-col items-center gap-4 rounded-2xl border border-gray-200/80 bg-white/90 px-6 py-8 shadow-xl backdrop-blur-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#749c5b]/15">
                    <Lock className="h-7 w-7 text-[#749c5b]" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Conteúdo exclusivo
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Para acessar agenda, posicionamento, despesas e demais
                      informações do deputado, faça upgrade do seu plano.
                    </p>
                  </div>
                  <Link
                    href="/plans"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#749c5b] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#64944b] hover:shadow-lg"
                  >
                    <Sparkles className="h-4 w-4" />
                    Ver planos
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
