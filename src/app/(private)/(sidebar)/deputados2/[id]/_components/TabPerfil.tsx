"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { Button } from "@/components/v2/components/ui/Button";
import { Input } from "@/components/v2/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/v2/components/ui/select";
import { Progress } from "@/components/v2/components/ui/progress";
import { CustomPagination } from "@/components/ui/CustomPagination";
import {
  BarChart3,
  Briefcase,
  Building2,
  Calendar,
  ExternalLink,
  Globe,
  History,
  Mail,
  MapPin,
  Phone,
  Tag,
  User,
  Vote,
} from "lucide-react";
import dynamic from "next/dynamic";
import type { DeputadoPageData } from "./useDeputadoPage";
import { SkeletonLoader } from "./SkeletonLoader";
import { HISTORICO_YEARS, HISTORICO_PAGE_SIZES } from "./constants";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function TabPerfil({ data }: { data: DeputadoPageData }) {
  const {
    politician,
    profile,
    contadores,
    presenca,
    temas,
    profissoes,
    ocupacoes,
    loadingBio,
    socialLinks,
    historico,
    loadingHistorico,
    historicoPage,
    setHistoricoPage,
    historicoPageSize,
    setHistoricoPageSize,
    historicoYear,
    historicoSearch,
    setHistoricoSearch,
    handleHistoricoYearChange,
    handleHistoricoSearchApply,
  } = data;

  if (!politician) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover:border-secondary/10 border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-2 border-b border-gray-100/50 p-4">
            <div className="bg-secondary/10 rounded-lg p-2">
              <User className="text-secondary h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">
                Identidade e mandato
              </h3>
              <p className="text-xs text-gray-500">
                Dados pessoais e do mandato
              </p>
            </div>
          </div>
          <ul className="space-y-0 p-4">
            {politician.birthDate && (
              <li className="flex items-center gap-3 rounded-lg py-2.5 pl-2 transition-colors hover:bg-gray-50">
                <Calendar className="text-secondary h-4 w-4 shrink-0" />
                <span className="text-sm text-gray-700">
                  Nascimento:{" "}
                  <strong>
                    {new Date(politician.birthDate).toLocaleDateString("pt-BR", {
                      dateStyle: "long",
                    })}
                  </strong>
                </span>
              </li>
            )}
            {politician.placeOfBirth && (
              <li className="flex items-center gap-3 rounded-lg py-2.5 pl-2 transition-colors hover:bg-gray-50">
                <MapPin className="text-secondary h-4 w-4 shrink-0" />
                <span className="text-sm text-gray-700">
                  Natural de <strong>{politician.placeOfBirth}</strong>
                </span>
              </li>
            )}
            {politician.mandatoDataInicio && (
              <li className="flex items-center gap-3 rounded-lg py-2.5 pl-2 transition-colors hover:bg-gray-50">
                <Globe className="text-secondary h-4 w-4 shrink-0" />
                <span className="text-sm text-gray-700">
                  Início do exercício:{" "}
                  <strong>
                    {new Date(
                      politician.mandatoDataInicio,
                    ).toLocaleDateString("pt-BR")}
                  </strong>
                </span>
              </li>
            )}
            {!politician.birthDate &&
              !politician.placeOfBirth &&
              !politician.mandatoDataInicio && (
                <li className="py-4 text-center text-sm text-gray-500">
                  Nenhum dado de identidade disponível.
                </li>
              )}
          </ul>
        </Card>

        <Card className="hover:border-secondary/10 border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-2 border-b border-gray-100/50 p-4">
            <div className="bg-secondary/10 rounded-lg p-2">
              <Building2 className="text-secondary h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Contato</h3>
              <p className="text-xs text-gray-500">Gabinete e canais</p>
            </div>
          </div>
          <ul className="space-y-0 p-4">
            {politician.email && (
              <li>
                <a
                  href={`mailto:${politician.email}`}
                  className="hover:bg-secondary/5 flex items-center gap-3 rounded-lg py-2.5 pl-2 transition-colors"
                >
                  <Mail className="text-secondary h-4 w-4 shrink-0" />
                  <span className="hover:text-secondary text-sm text-gray-700 underline-offset-2 hover:underline">
                    {politician.email}
                  </span>
                </a>
              </li>
            )}
            {politician.phone && (
              <li>
                <a
                  href={`tel:${politician.phone}`}
                  className="hover:bg-secondary/5 flex items-center gap-3 rounded-lg py-2.5 pl-2 transition-colors"
                >
                  <Phone className="text-secondary h-4 w-4 shrink-0" />
                  <span className="hover:text-secondary text-sm text-gray-700 underline-offset-2 hover:underline">
                    {politician.phone}
                  </span>
                </a>
              </li>
            )}
            {(politician.gabinetePredio ||
              politician.gabineteAndar ||
              politician.gabineteSala) && (
              <li className="flex items-center gap-3 rounded-lg py-2.5 pl-2 transition-colors hover:bg-gray-50">
                <Building2 className="text-secondary h-4 w-4 shrink-0" />
                <span className="text-sm text-gray-700">
                  Gabinete:{" "}
                  {[
                    politician.gabinetePredio,
                    politician.gabineteAndar,
                    politician.gabineteSala,
                  ]
                    .filter(Boolean)
                    .join(" / ")}
                </span>
              </li>
            )}
            {politician.address && (
              <li className="flex items-center gap-3 rounded-lg py-2.5 pl-2 transition-colors hover:bg-gray-50">
                <MapPin className="text-secondary h-4 w-4 shrink-0" />
                <span className="text-sm text-gray-700">
                  {politician.address}
                </span>
              </li>
            )}
            {!politician.email &&
              !politician.phone &&
              !politician.gabinetePredio &&
              !politician.address && (
                <li className="py-4 text-center text-sm text-gray-500">
                  Nenhum contato disponível.
                </li>
              )}
          </ul>
        </Card>
      </div>

      {politician.positions && politician.positions.length > 0 && (
        <Card className="hover:border-secondary/10 border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-2 border-b border-gray-100/50 p-4">
            <div className="bg-secondary/10 rounded-lg p-2">
              <Globe className="text-secondary h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Cargos e mandatos</h3>
              <p className="text-xs text-gray-500">Histórico de posições</p>
            </div>
          </div>
          <div className="relative p-6 pl-8">
            <div className="bg-secondary/20 absolute top-6 bottom-6 left-[19px] w-0.5" />
            {politician.positions.map((pos) => (
              <div key={pos.id} className="relative mb-6 last:mb-0">
                <div className="bg-secondary absolute top-0.5 left-[-26px] h-3 w-3 rounded-full border-2 border-white shadow-sm" />
                <div className="hover:border-secondary/20 hover:bg-secondary/5 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-colors">
                  <p className="font-medium text-gray-900">{pos.position}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Desde{" "}
                    {new Date(pos.startDate).toLocaleDateString("pt-BR", {
                      dateStyle: "long",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="hover:border-secondary/10 border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="flex items-center gap-2 border-b border-gray-100/50 p-4">
          <div className="bg-secondary/10 rounded-lg p-2">
            <Briefcase className="text-secondary h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Biografia</h3>
            <p className="text-xs text-gray-500">
              Profissões e ocupações declaradas
            </p>
          </div>
        </div>
        <div className="space-y-6 p-6">
          {loadingBio ? (
            <div className="space-y-3">
              <SkeletonLoader className="h-10 w-full rounded-lg" />
              <SkeletonLoader className="h-16 w-full rounded-lg" />
            </div>
          ) : (
            <>
              {profissoes.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Profissões declaradas
                  </h4>
                  <ul className="flex flex-wrap gap-2">
                    {profissoes.map((p, i) => (
                      <li
                        key={i}
                        className="bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                      >
                        {p.titulo}
                        {p.data ? ` (${p.data})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {ocupacoes.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Ocupações declaradas
                  </h4>
                  <ul className="space-y-2">
                    {ocupacoes.map((o, i) => (
                      <li
                        key={i}
                        className="hover:border-secondary/20 hover:bg-secondary/5 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 transition-colors"
                      >
                        <span className="font-medium">{o.titulo}</span>
                        {(o.entidade || o.periodo) && (
                          <span className="text-gray-500">
                            {" "}
                            —{" "}
                            {[o.entidade, o.periodo]
                              .filter(Boolean)
                              .join(" • ")}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {profissoes.length === 0 &&
                ocupacoes.length === 0 &&
                !loadingBio && (
                  <p className="text-center text-sm text-gray-500">
                    Nenhuma informação de biografia disponível.
                  </p>
                )}
            </>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {contadores && (
          <Card className="hover:border-secondary/10 border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex items-center gap-2 border-b border-gray-100/50 p-4">
              <div className="bg-secondary/10 rounded-lg p-2">
                <BarChart3 className="text-secondary h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Em números</h3>
                <p className="text-xs text-gray-500">
                  Resumo da atuação parlamentar
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
              <div className="grid grid-cols-2 gap-3 sm:flex-1">
                <div className="hover:bg-secondary/5 rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center transition-colors">
                  <p className="text-2xl font-bold text-gray-900">
                    {contadores.eventos}
                  </p>
                  <p className="text-xs text-gray-500">Eventos</p>
                </div>
                <div className="hover:bg-secondary/5 rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center transition-colors">
                  <p className="text-2xl font-bold text-gray-900">
                    {contadores.proposicoes}
                  </p>
                  <p className="text-xs text-gray-500">Proposições</p>
                </div>
                <div className="hover:bg-secondary/5 rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center transition-colors">
                  <p className="text-2xl font-bold text-gray-900">
                    {contadores.discursos}
                  </p>
                  <p className="text-xs text-gray-500">Discursos</p>
                </div>
                <div className="hover:bg-secondary/5 rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center transition-colors">
                  <p className="text-2xl font-bold text-gray-900">
                    {contadores.votacoes}
                  </p>
                  <p className="text-xs text-gray-500">Votações</p>
                </div>
              </div>
              {contadores.eventos +
                contadores.proposicoes +
                contadores.discursos +
                contadores.votacoes >
                0 && (
                <div className="h-[160px] w-full max-w-[160px] shrink-0 sm:mx-auto">
                  <ReactApexChart
                    options={{
                      chart: { type: "donut", fontFamily: "inherit" },
                      colors: ["#749c5b", "#5a8c4a", "#4E9F3D", "#1B3B2B"],
                      labels: [
                        "Eventos",
                        "Proposições",
                        "Discursos",
                        "Votações",
                      ],
                      legend: { show: false },
                      dataLabels: {
                        enabled: true,
                        formatter: (val: number) => `${Math.round(val)}%`,
                      },
                      plotOptions: { pie: { donut: { size: "70%" } } },
                    }}
                    series={[
                      contadores.eventos,
                      contadores.proposicoes,
                      contadores.discursos,
                      contadores.votacoes,
                    ]}
                    type="donut"
                    height={160}
                    width="100%"
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {presenca && presenca.presencas + presenca.ausencias > 0 && (
          <Card className="hover:border-secondary/10 border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex items-center gap-2 border-b border-gray-100/50 p-4">
              <div className="bg-secondary/10 rounded-lg p-2">
                <Calendar className="text-secondary h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  Presença no período
                </h3>
                <p className="text-xs text-gray-500">
                  {new Date(presenca.dataInicio).toLocaleDateString("pt-BR")} a{" "}
                  {new Date(presenca.dataFim).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 flex justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {presenca.presencas} presenças
                </span>
                <span className="text-gray-500">
                  {presenca.ausencias} ausências
                </span>
              </div>
              <Progress
                value={
                  (presenca.presencas /
                    (presenca.presencas + presenca.ausencias)) *
                  100
                }
                className="h-4 bg-gray-200"
              />
              <p className="text-secondary mt-2 text-center text-2xl font-bold">
                {(
                  (presenca.presencas /
                    (presenca.presencas + presenca.ausencias)) *
                  100
                ).toFixed(0)}
                % taxa de presença
              </p>
            </div>
          </Card>
        )}

        {temas?.temas && temas.temas.length > 0 && (
          <Card className="hover:border-secondary/10 border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md lg:col-span-2">
            <div className="flex items-center gap-2 border-b border-gray-100/50 p-4">
              <div className="bg-secondary/10 rounded-lg p-2">
                <Tag className="text-secondary h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Temas de atuação</h3>
                <p className="text-xs text-gray-500">
                  Temas nas proposições (autor/coautor)
                </p>
              </div>
            </div>
            <div className="p-6">
              <ul className="grid gap-3 sm:grid-cols-2">
                {temas.temas.slice(0, 10).map((t) => {
                  const maxCount = Math.max(
                    ...temas.temas.map((x) => x.count),
                    1,
                  );
                  return (
                    <li
                      key={t.cod_tema}
                      className="hover:border-secondary/20 hover:bg-secondary/5 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {t.tema_nome}
                        </p>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="bg-secondary h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${(t.count / maxCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="bg-secondary/15 text-secondary shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold">
                        {t.count}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Card>
        )}

        {profile && (
          <Card className="hover:border-secondary/10 border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md lg:col-span-2">
            <div className="flex items-center gap-2 border-b border-gray-100/50 p-4">
              <div className="bg-secondary/10 rounded-lg p-2">
                <Vote className="text-secondary h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  Perfil parlamentar ({profile.year})
                </h3>
                <p className="text-xs text-gray-500">
                  Plenário, comissões, proposições e votações
                </p>
              </div>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="hover:bg-secondary/5 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-colors">
                <p className="text-xs font-medium text-gray-500">Plenário</p>
                <p className="mt-0.5 font-semibold text-gray-900">
                  {profile.plenaryPresence ?? "—"}
                </p>
              </div>
              <div className="hover:bg-secondary/5 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-colors">
                <p className="text-xs font-medium text-gray-500">Comissões</p>
                <p className="mt-0.5 font-semibold text-gray-900">
                  {profile.committeesPresence ?? "—"}
                </p>
              </div>
              <div className="hover:bg-secondary/5 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-colors">
                <p className="text-xs font-medium text-gray-500">
                  Proposições (criadas / relacionadas)
                </p>
                <p className="mt-0.5 font-semibold text-gray-900">
                  {profile.createdProposals ?? "—"} /{" "}
                  {profile.relatedProposals ?? "—"}
                </p>
              </div>
              <div className="hover:bg-secondary/5 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-colors">
                <p className="text-xs font-medium text-gray-500">
                  Discursos / Votações nominais
                </p>
                <p className="mt-0.5 font-semibold text-gray-900">
                  {profile.speeches ?? "—"} / {profile.rollCallVotes ?? "—"}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {socialLinks.length > 0 && (
        <Card className="hover:border-secondary/10 border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-2 border-b border-gray-100/50 p-4">
            <div className="bg-secondary/10 rounded-lg p-2">
              <ExternalLink className="text-secondary h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Redes sociais</h3>
              <p className="text-xs text-gray-500">Perfis oficiais</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 p-6">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.url!}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:border-secondary/40 hover:bg-secondary/10 hover:text-secondary inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                {s.label}
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Histórico de movimentações */}
      <Card className="overflow-hidden border-0 rounded-2xl bg-white shadow-lg shadow-gray-200/50 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/10 border-gray-100 hover:border-secondary/10">
        <div className="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10">
              <History className="text-secondary h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-gray-900">
                Histórico de movimentações
              </h3>
              <p className="text-sm text-gray-500">
                Comissões, cargos e posse (fonte: CSV Câmara)
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Ano
              </label>
              <Select
                value={historicoYear || "todos"}
                onValueChange={handleHistoricoYearChange}
              >
                <SelectTrigger className="h-10 w-[120px] rounded-xl border-gray-200 bg-white shadow-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {HISTORICO_YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Buscar
              </label>
              <div className="flex gap-2">
                <Input
                  className="h-10 w-[220px] rounded-xl border-gray-200 bg-white shadow-sm placeholder:text-gray-400"
                  placeholder="Ex.: comissão, CPI..."
                  value={historicoSearch}
                  onChange={(e) => setHistoricoSearch(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleHistoricoSearchApply()
                  }
                />
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-secondary/40 bg-secondary/10 font-medium text-secondary hover:bg-secondary/20"
                  onClick={handleHistoricoSearchApply}
                >
                  Filtrar
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Por página
              </label>
              <Select
                value={String(historicoPageSize)}
                onValueChange={(v) => {
                  setHistoricoPageSize(Number(v));
                  setHistoricoPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-[90px] rounded-xl border-gray-200 bg-white shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HISTORICO_PAGE_SIZES.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="p-6">
          {loadingHistorico ? (
            <div className="space-y-4 py-12">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-4"
                >
                  <SkeletonLoader className="h-8 w-20 shrink-0 rounded-lg" />
                  <SkeletonLoader className="h-5 flex-1" />
                </div>
              ))}
            </div>
          ) : historico && historico.movimentacoes.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">
                  <span className="rounded-full bg-secondary/15 px-2.5 py-0.5 font-semibold text-secondary">
                    {historico.total}
                  </span>{" "}
                  movimentação(ões)
                </p>
              </div>
              <div className="relative pl-6">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b from-secondary/30 via-secondary/20 to-secondary/10" />
                <ul className="space-y-4" role="list">
                  {historico.movimentacoes.map((mov, idx) => (
                    <li key={`${mov.data}-${idx}`} className="relative flex gap-4">
                      <div className="absolute left-[-22px] top-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-white bg-secondary shadow-sm" />
                      <div className="min-w-0 flex-1 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50/80 to-white p-4 shadow-sm transition-all hover:border-secondary/20 hover:shadow-md">
                        <span className="mb-1.5 inline-block rounded-lg bg-gray-200/80 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                          {mov.data}
                        </span>
                        <p className="text-sm leading-relaxed text-gray-800">
                          {mov.descricao}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {historico.totalPages > 1 && (
                <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50/30 p-4">
                  <CustomPagination
                    pages={historico.totalPages}
                    currentPage={historicoPage}
                    setCurrentPage={setHistoricoPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <History className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-700">
                Nenhuma movimentação encontrada
              </h4>
              <p className="mt-2 max-w-sm text-sm text-gray-500">
                Não há registros de comissões, cargos ou posse para este
                deputado no período. Tente outro ano ou termo de busca.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
