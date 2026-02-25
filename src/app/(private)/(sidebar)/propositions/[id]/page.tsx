"use client";

import { BackButton } from "@/components/v2/components/ui/BackButton";
import { Card } from "@/components/v2/components/ui/Card";
import { PropositionRelatedSection } from "@/components/v2/components/ui/PropositionRelatedSection";
import { useApiContext } from "@/context/ApiContext";
import { ExternalLink, FileText, Calendar, Building2, User, Play, List, Users, Sparkles, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

type Author = { id: string; name: string; politicianId?: string };
type Theme = { id: string; name: string };
type Process = {
  id: string;
  agencyAcronym: string;
  sequency: number;
  regime: string;
  processingDescription: string;
  situationDescription?: string;
  dispatch: string;
  url?: string;
  scope: string;
  appreciation: string;
  date: string;
};
type Event = {
  id: string;
  sequence: number;
  regime: string;
  topic: string;
  title: string;
  situation: string;
  event: {
    id: string;
    startDate: string;
    description: string;
    local?: string;
    videoUrl?: string;
  };
};

type PropositionDetail = {
  id: string;
  description: string;
  typeAcronym: string;
  number: number;
  year: number;
  presentationDate: string;
  lastMovementDate: string;
  situationDescription?: string;
  movementDescription?: string;
  fullPropositionUrl?: string;
  type: { id: string; name: string; acronym: string };
  situation: { id: string; name: string } | null;
  authors?: Author[];
  themes?: Theme[] | { theme: Theme }[];
  processes?: Process[];
  events?: Event[];
};

export default function PropositionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { GetAPI } = useApiContext();
  const [proposition, setProposition] = useState<PropositionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await GetAPI(`/proposition/${id}`, true);
      if (res.status === 200 && res.body) {
        const data = (res.body as { proposition?: PropositionDetail }).proposition ?? res.body;
        setProposition(data as PropositionDetail);
      } else {
        setProposition(null);
      }
    } catch {
      setProposition(null);
    } finally {
      setLoading(false);
    }
  }, [id, GetAPI]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (!id) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
        <BackButton />
        <Card className="border-gray-100 p-8 text-center text-gray-500">
          ID da proposição não informado.
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
        <BackButton />
        <div className="space-y-6">
          <Card className="animate-pulse border-gray-100 p-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 rounded-2xl bg-gray-200" />
              <div className="space-y-2">
                <div className="h-6 w-48 rounded bg-gray-200" />
                <div className="h-4 w-32 rounded bg-gray-100" />
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <div className="h-4 w-full rounded bg-gray-100" />
              <div className="h-4 w-5/6 rounded bg-gray-100" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!proposition) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
        <BackButton />
        <Card className="border-gray-100 p-8 text-center text-gray-500">
          Proposição não encontrada.
        </Card>
      </div>
    );
  }

  const TABS = [
    { id: "overview", label: "Visão Geral", icon: FileText },
    { id: "tramitacao", label: "Tramitação", icon: List },
    { id: "eventos", label: "Eventos", icon: Calendar },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
      <BackButton />

      <header>
        <div className="relative overflow-hidden rounded-2xl shadow-lg">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                "linear-gradient(135deg, #1B3B2B 0%, #2d5a3d 38%, #749c5b 65%, #5a8c4a 100%)",
            }}
          />
          <div className="relative z-20 rounded-2xl bg-white/92 p-6 backdrop-blur-sm md:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5a8a42] to-[#749c5b] shadow-md sm:h-24 sm:w-24">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {proposition.typeAcronym} {proposition.number}/{proposition.year}
                  </h1>
                  <p className="mt-1 text-base text-gray-800">
                    {proposition.type.name}
                  </p>
                  {proposition.situationDescription && (
                    <div className="mt-3 inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-bold text-secondary uppercase tracking-tight">
                      {proposition.situationDescription}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {proposition.fullPropositionUrl && (
                  <a
                    href={proposition.fullPropositionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    Câmara <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
                <button
                  onClick={() => {
                    const propositionName = `${proposition.typeAcronym} ${proposition.number}/${proposition.year}`;
                    const promptText = `Faça um relatório legislativo completo, detalhista e expansivo sobre a proposição: ${propositionName}. 

Detalhe o resumo do texto, matérias correlatas, todo o histórico de tramitação (status, comissões, horários) e mapeie os atores políticos envolvidos (autores, relatores e partidos).`;
                    window.location.href = `/procedures?initialPrompt=${encodeURIComponent(promptText)}`;
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all hover:scale-105"
                >
                  <Sparkles className="h-4 w-4" />
                  Usar IA Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

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
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-gray-100 p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <FileText className="h-5 w-5 text-secondary" /> Ementa
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-gray-700">
                {proposition.description || "Nenhuma ementa disponível."}
              </p>
            </Card>

            <Card className="border-gray-100 p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Calendar className="h-5 w-5 text-secondary" /> Datas Importantes
              </h3>
              <div className="mt-4 space-y-4">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-sm font-medium text-gray-500">Apresentação</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date(proposition.presentationDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {proposition.lastMovementDate && (
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-sm font-medium text-gray-500">Último Andamento</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(proposition.lastMovementDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
              </div>
            </Card>
            
            {(proposition.authors && proposition.authors.length > 0) && (
              <Card className="border-gray-100 p-6 shadow-sm md:col-span-2">
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Users className="h-5 w-5 text-secondary" /> Autoria
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {proposition.authors.map((a) => (
                    a.politicianId ? (
                      <Link
                        key={a.id}
                        href={`/deputados/${a.politicianId}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:border-secondary hover:text-secondary"
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        {a.name}
                      </Link>
                    ) : (
                      <span key={a.id} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-sm text-gray-600">
                        <User className="h-4 w-4 text-gray-400" />
                        {a.name}
                      </span>
                    )
                  ))}
                </div>
              </Card>
            )}

            {(proposition.themes && proposition.themes.length > 0) && (
              <Card className="border-gray-100 p-6 shadow-sm md:col-span-2">
                <h3 className="mb-4 text-lg font-bold text-gray-900">Temas Relacionados</h3>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(proposition.themes)
                    ? proposition.themes.map((t) => ("theme" in t ? t.theme : t))
                    : []
                  ).map((t) => (
                    <span
                      key={t.id}
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="mt-8">
            <PropositionRelatedSection propositionId={id} />
          </div>
        </Tabs.Content>

        <Tabs.Content
          value="tramitacao"
          className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300"
        >
          <Card className="border-gray-100 p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-gray-900">Histórico de Tramitação</h3>
            {(!proposition.processes || proposition.processes.length === 0) ? (
              <p className="text-sm text-gray-500">Nenhum histórico de tramitação encontrado.</p>
            ) : (
              <div className="space-y-6">
                {proposition.processes.map((proc, idx) => (
                  <div key={proc.id} className="relative flex gap-4">
                    {/* Linha do tempo vertical */}
                    {idx !== proposition.processes!.length - 1 && (
                      <div className="absolute top-8 left-[19px] bottom-[-24px] w-0.5 bg-gray-100" />
                    )}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white bg-secondary/10 text-secondary z-10">
                      <List className="h-4 w-4" />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                         {new Date(proc.date).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {proc.agencyAcronym}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">
                        {proc.dispatch}
                      </p>
                      {proc.processingDescription && (
                        <p className="mt-1 text-xs text-gray-500">
                          <span className="font-semibold text-gray-600">Fase:</span> {proc.processingDescription}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Tabs.Content>

        <Tabs.Content
          value="eventos"
          className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300"
        >
          <Card className="border-gray-100 p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-gray-900">Eventos e Audiências</h3>
            {(!proposition.events || proposition.events.length === 0) ? (
              <p className="text-sm text-gray-500">Nenhum evento registrado para esta proposição.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {proposition.events.map((evt) => (
                  <Card key={evt.id} className="flex flex-col border border-gray-100 p-5 shadow-sm hover:border-secondary/30 transition-colors">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 line-clamp-2" title={evt.title || evt.event.description}>
                          {evt.title || evt.event.description}
                        </h4>
                        <p className="mt-1 text-xs text-secondary font-medium">
                          {new Date(evt.event.startDate).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto flex flex-col gap-2 border-t border-gray-50 pt-4">
                      {evt.event.local && (
                        <span className="flex items-center gap-2 text-xs text-gray-500">
                          <Building2 className="h-3.5 w-3.5" />
                          {evt.event.local}
                        </span>
                      )}
                      {evt.event.videoUrl && (
                        <a
                          href={evt.event.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs font-semibold text-secondary hover:underline"
                        >
                          <Play className="h-3.5 w-3.5" /> Assistir Vídeo
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
