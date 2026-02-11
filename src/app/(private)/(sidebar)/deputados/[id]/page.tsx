"use client";

import { PoliticianDetailsProps } from "@/@types/v2/politician";
import { BackButton } from "@/components/v2/components/ui/BackButton";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/v2/components/ui/avatar";
import { Button } from "@/components/v2/components/ui/Button";
import { Card } from "@/components/v2/components/ui/Card";
import { PageHeader } from "@/components/v2/components/ui/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/v2/components/ui/select";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { Input } from "@/components/v2/components/ui/Input";
import { useApiContext } from "@/context/ApiContext";
import { generatePoliticianReport } from "@/utils/pdfGenerator";
import {
  BarChart3,
  Briefcase,
  Building2,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Globe,
  History,
  Mail,
  MapPin,
  Mic2,
  Phone,
  User,
  Vote,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const SkeletonLoader = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

const START_YEAR = 2019;
const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

interface HistoricoMovimentacao {
  data: string;
  descricao: string;
}

interface HistoricoResponse {
  id: string;
  nome: string;
  partido: string;
  movimentacoes: HistoricoMovimentacao[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const HISTORICO_YEARS = [2026, 2025, 2024, 2023];
const HISTORICO_PAGE_SIZES = [5, 10, 20];

export default function DeputadoDetalhesPage() {
  const params = useParams();
  const id = params?.id as string;
  const { GetAPI } = useApiContext();

  const [politician, setPolitician] = useState<PoliticianDetailsProps | null>(null);
  const [loading, setLoading] = useState(true);
  // Ano padrão 2025 (último ano com dados disponíveis)
  const [selectedYear, setSelectedYear] = useState("2025");

  const [historico, setHistorico] = useState<HistoricoResponse | null>(null);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [historicoPage, setHistoricoPage] = useState(1);
  const [historicoPageSize, setHistoricoPageSize] = useState(10);
  const [historicoYear, setHistoricoYear] = useState<string>("");
  const [historicoSearch, setHistoricoSearch] = useState("");
  const [historicoSearchApplied, setHistoricoSearchApplied] = useState("");

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let y = currentYear; y >= START_YEAR; y--) years.push(y.toString());
    return years;
  }, []);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await GetAPI(`/politician/details/${id}?year=${selectedYear}`, true);
      if (res.status === 200 && res.body) {
        setPolitician(res.body);
      } else {
        setPolitician(null);
      }
    } catch {
      setPolitician(null);
    } finally {
      setLoading(false);
    }
  }, [id, selectedYear, GetAPI]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const fetchHistorico = useCallback(async () => {
    if (!id) return;
    setLoadingHistorico(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(historicoPage));
      params.set("pageSize", String(historicoPageSize));
      if (historicoYear) params.set("year", historicoYear);
      if (historicoSearchApplied.trim()) params.set("search", historicoSearchApplied.trim());
      const res = await GetAPI(
        `/politician/${id}/historico?${params.toString()}`,
        true,
      );
      if (res.status === 200 && res.body) {
        setHistorico(res.body);
      } else {
        setHistorico(null);
      }
    } catch {
      setHistorico(null);
    } finally {
      setLoadingHistorico(false);
    }
  }, [
    id,
    historicoPage,
    historicoPageSize,
    historicoYear,
    historicoSearchApplied,
    GetAPI,
  ]);

  useEffect(() => {
    if (!id) return;
    fetchHistorico();
  }, [id, fetchHistorico]);

  const handleHistoricoYearChange = (value: string) => {
    setHistoricoYear(value);
    setHistoricoPage(1);
  };

  const handleHistoricoSearchApply = () => {
    setHistoricoSearchApplied(historicoSearch);
    setHistoricoPage(1);
  };

  const handleExportPDF = () => {
    if (politician) generatePoliticianReport(politician, selectedYear);
  };

  const chartOptions: ApexOptions = {
    chart: { type: "area", toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#749c5b", "#1a1d1f"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] },
    },
    xaxis: {
      categories: MONTHS,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: true,
      labels: {
        formatter: (value) =>
          `R$ ${value > 1000 ? (value / 1000).toFixed(0) + "k" : value?.toFixed(0)}`,
      },
    },
    grid: { borderColor: "#f1f1f1" },
    legend: { show: true, position: "top" },
  };

  const monthlyCosts = politician?.finance?.monthlyCosts ?? [];
  const cota = monthlyCosts.map((m) => m.parliamentaryQuota);
  const gabinete = monthlyCosts.map((m) => m.cabinetQuota);
  const chartSeries = [
    { name: "Cota Parlamentar", data: cota },
    { name: "Verba de Gabinete", data: gabinete },
  ];
  const hasChartData = monthlyCosts.some(
    (m) =>
      (m.parliamentaryQuota != null) || (m.cabinetQuota != null)
  );

  const finance = politician?.finance;
  const profile = politician?.profile;
  const hasFinanceDetail =
    finance?.contractedPeople ||
    finance?.grossSalary ||
    finance?.functionalPropertyUsage ||
    finance?.trips ||
    finance?.diplomaticPassport ||
    finance?.housingAssistant;

  const socialLinks = [
    { label: "Facebook", url: politician?.facebook, icon: "facebook" },
    { label: "Instagram", url: politician?.instagram, icon: "instagram" },
    { label: "YouTube", url: politician?.youtube, icon: "youtube" },
    { label: "TikTok", url: politician?.tiktok, icon: "tiktok" },
  ].filter((s) => s.url);

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

      {loading ? (
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
      ) : !politician ? (
        <Card className="border-gray-100 p-8 text-center text-gray-500">
          Deputado não encontrado.
        </Card>
      ) : (
        <>
          <PageHeader
            title={politician.name}
            subtitle={`${politician.politicalParty} • ${politician.state}`}
            className="flex-wrap gap-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px] border-gray-200 bg-gray-50">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="border-gray-200 bg-gray-50"
                onClick={handleExportPDF}
                title="Exportar PDF"
              >
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Link
                href={`https://www.camara.leg.br/deputados/${politician.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="border-gray-200 bg-gray-50">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Câmara
                </Button>
              </Link>
            </div>
          </PageHeader>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            {/* Card perfil - altura conforme conteúdo, não estica com a coluna direita */}
            <Card className="border-gray-100 p-6 shadow-sm lg:sticky lg:top-20">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                    <AvatarImage
                      src={politician.imageUrl}
                      alt={politician.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-secondary text-4xl text-white">
                      {politician.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h2 className="text-dark text-xl font-bold">{politician.name}</h2>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                  <span className="bg-secondary/10 text-secondary rounded-full px-2 py-0.5 text-xs font-bold uppercase">
                    {politician.politicalParty}
                  </span>
                  <span className="text-sm text-gray-500">{politician.state}</span>
                </div>
                {politician.positions?.[0] && (
                  <p className="mt-2 text-sm text-gray-600">
                    {politician.positions[0].position}
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-3 border-t border-gray-100 pt-6">
                {politician.birthDate && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="text-secondary h-4 w-4 shrink-0" />
                    <span className="text-gray-600">
                      Nascimento:{" "}
                      {new Date(politician.birthDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
                {politician.placeOfBirth && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="text-secondary h-4 w-4 shrink-0" />
                    <span className="text-gray-600">
                      Natural de {politician.placeOfBirth}
                    </span>
                  </div>
                )}
                {politician.email && (
                  <a
                    href={`mailto:${politician.email}`}
                    className="flex items-center gap-3 text-sm text-gray-600 hover:text-secondary"
                  >
                    <Mail className="text-secondary h-4 w-4 shrink-0" />
                    {politician.email}
                  </a>
                )}
                {politician.phone && (
                  <a
                    href={`tel:${politician.phone}`}
                    className="flex items-center gap-3 text-sm text-gray-600 hover:text-secondary"
                  >
                    <Phone className="text-secondary h-4 w-4 shrink-0" />
                    {politician.phone}
                  </a>
                )}
                {politician.address && (
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <Building2 className="text-secondary mt-0.5 h-4 w-4 shrink-0" />
                    <span>{politician.address}</span>
                  </div>
                )}
              </div>

              {socialLinks.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2 border-t border-gray-100 pt-4">
                  {socialLinks.map((s) => (
                    <a
                      key={s.label}
                      href={s.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary hover:text-secondary/80 text-sm font-medium"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </Card>

            {/* Coluna 2: Financeiro + Atuação */}
            <div className="space-y-6 lg:col-span-2">
              {/* Execução financeira */}
              <Card className="overflow-hidden border-gray-100 shadow-sm">
                <div className="border-b border-gray-100/50 p-6 pb-2">
                  <h3 className="text-dark flex items-center gap-2 text-lg font-bold">
                    <BarChart3 className="text-secondary h-5 w-5" />
                    Execução Financeira
                    <span className="bg-secondary/10 text-secondary rounded-full px-2 py-0.5 text-xs font-semibold">
                      {selectedYear}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500">
                    Cota parlamentar e verba de gabinete
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    {hasChartData ? (
                      <ReactApexChart
                        options={chartOptions}
                        series={chartSeries}
                        type="area"
                        height={280}
                        width="100%"
                      />
                    ) : (
                      <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-gray-400">
                        <BarChart3 className="h-10 w-10 opacity-30" />
                        <p className="text-sm">
                          Sem dados financeiros para o ano selecionado
                        </p>
                      </div>
                    )}
                  </div>
                  {finance && (
                    <>
                      <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                        <p className="mb-1 text-xs uppercase tracking-wider text-gray-400">
                          Cota parlamentar utilizada
                        </p>
                        <p className="text-dark text-lg font-bold">
                          R$ {finance.usedParliamentaryQuota?.toLocaleString("pt-BR") ?? "—"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                        <p className="mb-1 text-xs uppercase tracking-wider text-gray-400">
                          Verba de gabinete utilizada
                        </p>
                        <p className="text-dark text-lg font-bold">
                          R$ {finance.usedCabinetQuota?.toLocaleString("pt-BR") ?? "—"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                {hasFinanceDetail && (
                  <div className="border-t border-gray-100 bg-gray-50/30 px-6 py-4">
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Detalhamento
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        finance?.contractedPeople,
                        finance?.grossSalary,
                        finance?.functionalPropertyUsage,
                        finance?.trips,
                        finance?.diplomaticPassport,
                        finance?.housingAssistant,
                      ]
                        .filter(Boolean)
                        .map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-secondary/5 text-secondary rounded-lg px-3 py-1.5 text-xs font-medium"
                          >
                            {item}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Atuação parlamentar */}
              {profile && (
                <Card className="border-gray-100 shadow-sm">
                  <div className="border-b border-gray-100/50 p-6 pb-2">
                    <h3 className="text-dark flex items-center gap-2 text-lg font-bold">
                      <User className="text-secondary h-5 w-5" />
                      Atuação Parlamentar
                      <span className="bg-secondary/10 text-secondary rounded-full px-2 py-0.5 text-xs font-semibold">
                        {profile.year}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500">
                      Presenças, proposições, discursos e votações
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                    <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                      <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400">
                        <Vote className="h-3.5 w-3.5" /> Plenário
                      </p>
                      <p className="text-dark text-sm font-medium">
                        {profile.plenaryPresence ?? "—"}
                      </p>
                      {(profile.plenaryJustifiedAbsences || profile.plenaryUnjustifiedAbsences) && (
                        <p className="mt-1 text-xs text-gray-500">
                          Faltas justificadas: {profile.plenaryJustifiedAbsences ?? "—"} •
                          Injustificadas: {profile.plenaryUnjustifiedAbsences ?? "—"}
                        </p>
                      )}
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                      <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400">
                        <Briefcase className="h-3.5 w-3.5" /> Comissões
                      </p>
                      <p className="text-dark text-sm font-medium">
                        {profile.committeesPresence ?? "—"}
                      </p>
                      {(profile.committeesJustifiedAbsences || profile.committeesUnjustifiedAbsences) && (
                        <p className="mt-1 text-xs text-gray-500">
                          Faltas justificadas: {profile.committeesJustifiedAbsences ?? "—"} •
                          Injustificadas: {profile.committeesUnjustifiedAbsences ?? "—"}
                        </p>
                      )}
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                      <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400">
                        <FileText className="h-3.5 w-3.5" /> Proposições
                      </p>
                      <p className="text-dark text-sm font-medium">
                        Criadas: {profile.createdProposals ?? "—"} • Relacionadas: {profile.relatedProposals ?? "—"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Link
                          href={`/procedures?authorId=${politician.id}`}
                          className="text-secondary hover:text-secondary/80 inline-flex items-center gap-1 text-xs font-medium"
                        >
                          Buscar proposições na LegisAI
                        </Link>
                        {profile.createdProposalsUrl && (
                          <a
                            href={profile.createdProposalsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary hover:text-secondary/80 inline-flex items-center gap-1 text-xs font-medium"
                          >
                            Criadas (Câmara) <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {profile.relatedProposalsUrl && (
                          <a
                            href={profile.relatedProposalsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary hover:text-secondary/80 inline-flex items-center gap-1 text-xs font-medium"
                          >
                            Relacionadas (Câmara) <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                      <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400">
                        <Mic2 className="h-3.5 w-3.5" /> Discursos
                      </p>
                      <p className="text-dark text-sm font-medium">
                        {profile.speeches ?? "—"}
                      </p>
                      {(profile.speechesAudiosUrl || profile.speechesVideosUrl) && (
                        <div className="mt-2 flex gap-2">
                          {profile.speechesAudiosUrl && (
                            <a
                              href={profile.speechesAudiosUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-secondary hover:text-secondary/80 inline-flex items-center gap-1 text-xs font-medium"
                            >
                              Áudios <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {profile.speechesVideosUrl && (
                            <a
                              href={profile.speechesVideosUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-secondary hover:text-secondary/80 inline-flex items-center gap-1 text-xs font-medium"
                            >
                              Vídeos <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 sm:col-span-2">
                      <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400">
                        <Vote className="h-3.5 w-3.5" /> Votações nominais
                      </p>
                      <p className="text-dark text-sm font-medium">
                        {profile.rollCallVotes ?? "—"}
                      </p>
                      {profile.rollCallVotesUrl && (
                        <a
                          href={profile.rollCallVotesUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary hover:text-secondary/80 mt-2 inline-flex items-center gap-1 text-xs font-medium"
                        >
                          Ver votações <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Cargos / mandatos */}
              {politician.positions && politician.positions.length > 0 && (
                <Card className="border-gray-100 shadow-sm">
                  <div className="border-b border-gray-100/50 p-6 pb-2">
                    <h3 className="text-dark flex items-center gap-2 text-lg font-bold">
                      <Globe className="text-secondary h-5 w-5" />
                      Cargos e mandatos
                    </h3>
                  </div>
                  <ul className="divide-y divide-gray-100 p-6">
                    {politician.positions.map((pos) => (
                      <li
                        key={pos.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                      >
                        <span className="text-dark font-medium">
                          {pos.position}
                        </span>
                        <span className="text-sm text-gray-500">
                          Desde {pos.startDate}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Histórico de movimentações */}
              <Card className="border-gray-100 shadow-sm">
                <div className="border-b border-gray-100/50 p-6 pb-2">
                  <h3 className="text-dark flex items-center gap-2 text-lg font-bold">
                    <History className="text-secondary h-5 w-5" />
                    Histórico de movimentações
                  </h3>
                  <p className="text-sm text-gray-500">
                    Comissões, cargos e posse nos últimos anos (fonte: CSV Câmara)
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500">
                        Ano
                      </label>
                      <Select
                        value={historicoYear || "todos"}
                        onValueChange={(v) =>
                          handleHistoricoYearChange(v === "todos" ? "" : v)
                        }
                      >
                        <SelectTrigger className="w-[120px] border-gray-200 bg-gray-50">
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
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500">
                        Buscar na descrição
                      </label>
                      <div className="flex gap-2">
                        <Input
                          className="w-[200px] border-gray-200 bg-gray-50"
                          placeholder="Ex.: comissão, CPI..."
                          value={historicoSearch}
                          onChange={(e) => setHistoricoSearch(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleHistoricoSearchApply()
                          }
                        />
                        <Button
                          variant="outline"
                          className="border-gray-200 bg-gray-50"
                          onClick={handleHistoricoSearchApply}
                        >
                          Filtrar
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500">
                        Itens por página
                      </label>
                      <Select
                        value={String(historicoPageSize)}
                        onValueChange={(v) => {
                          setHistoricoPageSize(Number(v));
                          setHistoricoPage(1);
                        }}
                      >
                        <SelectTrigger className="w-[90px] border-gray-200 bg-gray-50">
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

                  {loadingHistorico ? (
                    <div className="space-y-2 py-8">
                      <SkeletonLoader className="h-4 w-full" />
                      <SkeletonLoader className="h-4 w-full" />
                      <SkeletonLoader className="h-4 w-3/4" />
                    </div>
                  ) : historico && historico.movimentacoes.length > 0 ? (
                    <>
                      <p className="text-sm text-gray-500">
                        {historico.total} movimentação(ões)
                      </p>
                      <ul
                        className="max-h-[420px] overflow-y-auto divide-y divide-gray-100 space-y-0"
                        role="list"
                      >
                        {historico.movimentacoes.map((mov, idx) => (
                          <li
                            key={`${mov.data}-${idx}`}
                            className="py-3 first:pt-0"
                          >
                            <span className="text-xs text-gray-500 font-medium">
                              {mov.data}
                            </span>
                            <p className="text-dark mt-0.5 text-sm">
                              {mov.descricao}
                            </p>
                          </li>
                        ))}
                      </ul>
                      {historico.totalPages > 1 && (
                        <div className="pt-2">
                          <CustomPagination
                            pages={historico.totalPages}
                            currentPage={historicoPage}
                            setCurrentPage={setHistoricoPage}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="py-8 text-center text-sm text-gray-500">
                      Nenhuma movimentação registrada para este deputado.
                      Coloque o CSV em{" "}
                      <code className="rounded bg-gray-100 px-1">
                        legis-api/data/deputados-movimentacoes.csv
                      </code>{" "}
                      para exibir o histórico.
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
