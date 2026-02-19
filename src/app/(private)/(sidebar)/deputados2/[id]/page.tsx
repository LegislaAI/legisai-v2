"use client";

import { BackButton } from "@/components/v2/components/ui/BackButton";
import { Card } from "@/components/v2/components/ui/Card";
import { useParams } from "next/navigation";
import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import {
  DeputadoHeader,
  SkeletonLoader,
  TABS,
  TabOverview,
  TabAgenda,
  TabPosicionamento,
  TabDespesasFinanceiro,
  TabAtuacao,
  TabPerfil,
  useDeputadoPage,
} from "./_components";

export default function DeputadoDetalhesPage2() {
  const params = useParams();
  const id = params?.id as string;
  const [activeTab, setActiveTab] = useState<string>("overview");

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
            selectedYear={data.selectedYear}
            availableYears={data.availableYears}
            onYearChange={data.setSelectedYear}
            onExportPDF={data.handleExportPDF}
          />

          <Tabs.Root
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
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
        </>
      )}
    </div>
  );
}
