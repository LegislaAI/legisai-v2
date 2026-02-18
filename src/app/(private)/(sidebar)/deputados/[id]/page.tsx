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
  Receipt,
  Tag,
  User,
  Vote,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const SkeletonLoader = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

const START_YEAR = 2019;
const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
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

interface AgendaResumo {
  countHoje: number;
  countProximos7Dias: number;
  link: string;
}

interface EventoAgenda {
  id: string;
  dt_inicio: string;
  dt_fim: string | null;
  cod_tipo_evento: string;
  descricao_tipo_evento: string;
  cod_situacao_evento: string;
  sigla_orgao: string;
  nome_orgao: string;
  local_evento: string;
  descricao?: string;
  uri?: string;
}

interface ProposicaoDeputado {
  id: string;
  sigla_tipo: string;
  numero: number;
  ano: number;
  ementa: string;
  dt_apresentacao: string;
  situacao_descricao: string;
  uri_proposicao?: string;
}

interface ProposicoesResumo {
  total: number;
  ultimaData: string | null;
  cnt_prop_por_tipo: { sigla_tipo: string; count: number }[];
  link: string;
}

interface Contadores {
  eventos: number;
  proposicoes: number;
  discursos: number;
  votacoes: number;
}

interface Presenca {
  presencas: number;
  ausencias: number;
  dataInicio: string;
  dataFim: string;
}

interface VotacoesIndicadores {
  baseVotosCount: number;
  alinhamentoPct: number | null;
  dataInicio: string;
  dataFim: string;
}

interface TemaItem {
  cod_tema: string;
  tema_nome: string;
  count: number;
}

interface TemasResponse {
  temas: TemaItem[];
}

interface DespesasResumoCEAP {
  total: number;
  ultimaData: string | null;
  topCategorias: {
    tipoDespesa: string;
    descricao?: string;
    valor: number;
    count: number;
  }[];
  link: string;
}

interface DespesaCEAP {
  ano?: number;
  mes?: number;
  tipoDespesa?: string;
  descricao?: string;
  dataDocumento?: string;
  valorDocumento?: number;
  valorLiquido?: number;
  nomeFornecedor?: string;
  urlDocumento?: string;
}

interface DiscursosResumo {
  total: number;
  ultimaData: string | null;
  link: string;
}

export default function DeputadoDetalhesPage() {
  const params = useParams();
  const id = params?.id as string;
  const { GetAPI } = useApiContext();

  const [politician, setPolitician] = useState<PoliticianDetailsProps | null>(
    null,
  );
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

  const [agendaResumo, setAgendaResumo] = useState<AgendaResumo | null>(null);
  const [eventos, setEventos] = useState<EventoAgenda[]>([]);
  const [eventosTotal, setEventosTotal] = useState(0);
  const [eventosPages, setEventosPages] = useState(0);
  const [eventosPage, setEventosPage] = useState(1);
  const [loadingAgenda, setLoadingAgenda] = useState(false);
  const [loadingEventos, setLoadingEventos] = useState(false);

  const [proposicoesResumo, setProposicoesResumo] =
    useState<ProposicoesResumo | null>(null);
  const [proposicoes, setProposicoes] = useState<ProposicaoDeputado[]>([]);
  const [proposicoesTotal, setProposicoesTotal] = useState(0);
  const [proposicoesPages, setProposicoesPages] = useState(0);
  const [proposicoesPage, setProposicoesPage] = useState(1);
  const [loadingProposicoes, setLoadingProposicoes] = useState(false);

  const [profissoes, setProfissoes] = useState<
    { titulo: string; data?: string }[]
  >([]);
  const [ocupacoes, setOcupacoes] = useState<
    { titulo: string; entidade?: string; periodo?: string }[]
  >([]);
  const [loadingBio, setLoadingBio] = useState(false);

  const [contadores, setContadores] = useState<Contadores | null>(null);
  const [presenca, setPresenca] = useState<Presenca | null>(null);
  const [votacoesIndicadores, setVotacoesIndicadores] =
    useState<VotacoesIndicadores | null>(null);
  const [temas, setTemas] = useState<TemasResponse | null>(null);
  const [loadingContadores, setLoadingContadores] = useState(false);
  const [loadingPresenca, setLoadingPresenca] = useState(false);
  const [loadingVotacoes, setLoadingVotacoes] = useState(false);
  const [loadingTemas, setLoadingTemas] = useState(false);

  const [ceapResumo, setCeapResumo] = useState<DespesasResumoCEAP | null>(null);
  const [despesasCeap, setDespesasCeap] = useState<DespesaCEAP[]>([]);
  const [ceapPage, setCeapPage] = useState(1);
  const [ceapAno, setCeapAno] = useState(new Date().getFullYear().toString());
  const [ceapHasMore, setCeapHasMore] = useState(false);
  const [loadingCeapResumo, setLoadingCeapResumo] = useState(false);
  const [loadingCeapDespesas, setLoadingCeapDespesas] = useState(false);

  const [discursosResumo, setDiscursosResumo] =
    useState<DiscursosResumo | null>(null);
  const [loadingDiscursos, setLoadingDiscursos] = useState(false);

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
      const res = await GetAPI(
        `/politician/details/${id}?year=${selectedYear}`,
        true,
      );
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
      if (historicoSearchApplied.trim())
        params.set("search", historicoSearchApplied.trim());
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

  const fetchAgendaResumo = useCallback(async () => {
    if (!id) return;
    setLoadingAgenda(true);
    try {
      const res = await GetAPI(`/politician/${id}/agenda/resumo`, true);
      if (res.status === 200 && res.body) setAgendaResumo(res.body);
      else setAgendaResumo(null);
    } catch {
      setAgendaResumo(null);
    } finally {
      setLoadingAgenda(false);
    }
  }, [id, GetAPI]);

  const fetchEventos = useCallback(async () => {
    if (!id) return;
    setLoadingEventos(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(eventosPage));
      const res = await GetAPI(
        `/politician/${id}/eventos?${params.toString()}`,
        true,
      );
      if (res.status === 200 && res.body) {
        setEventos(res.body.eventos ?? []);
        setEventosTotal(res.body.total ?? 0);
        setEventosPages(res.body.pages ?? 0);
      } else {
        setEventos([]);
      }
    } catch {
      setEventos([]);
    } finally {
      setLoadingEventos(false);
    }
  }, [id, eventosPage, GetAPI]);

  useEffect(() => {
    fetchAgendaResumo();
  }, [fetchAgendaResumo]);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  const fetchProposicoesResumo = useCallback(async () => {
    if (!id) return;
    const res = await GetAPI(`/politician/${id}/proposicoes/resumo`, true);
    if (res.status === 200 && res.body) setProposicoesResumo(res.body);
    else setProposicoesResumo(null);
  }, [id, GetAPI]);

  const fetchProposicoes = useCallback(async () => {
    if (!id) return;
    setLoadingProposicoes(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(proposicoesPage));
      const res = await GetAPI(
        `/politician/${id}/proposicoes?${params.toString()}`,
        true,
      );
      if (res.status === 200 && res.body) {
        setProposicoes(res.body.proposicoes ?? []);
        setProposicoesTotal(res.body.total ?? 0);
        setProposicoesPages(res.body.pages ?? 0);
      } else {
        setProposicoes([]);
      }
    } catch {
      setProposicoes([]);
    } finally {
      setLoadingProposicoes(false);
    }
  }, [id, proposicoesPage, GetAPI]);

  useEffect(() => {
    fetchProposicoesResumo();
  }, [fetchProposicoesResumo]);

  useEffect(() => {
    fetchProposicoes();
  }, [fetchProposicoes]);

  const fetchBiografia = useCallback(async () => {
    if (!id) return;
    setLoadingBio(true);
    try {
      const [rProf, rOcup] = await Promise.all([
        GetAPI(`/politician/${id}/profissoes`, true),
        GetAPI(`/politician/${id}/ocupacoes`, true),
      ]);
      if (rProf.status === 200 && rProf.body?.profissoes)
        setProfissoes(rProf.body.profissoes);
      else setProfissoes([]);
      if (rOcup.status === 200 && rOcup.body?.ocupacoes)
        setOcupacoes(rOcup.body.ocupacoes);
      else setOcupacoes([]);
    } catch {
      setProfissoes([]);
      setOcupacoes([]);
    } finally {
      setLoadingBio(false);
    }
  }, [id, GetAPI]);

  useEffect(() => {
    fetchBiografia();
  }, [fetchBiografia]);

  const fetchContadores = useCallback(async () => {
    if (!id) return;
    setLoadingContadores(true);
    try {
      const res = await GetAPI(`/politician/${id}/contadores`, true);
      if (res.status === 200 && res.body) setContadores(res.body);
      else setContadores(null);
    } catch {
      setContadores(null);
    } finally {
      setLoadingContadores(false);
    }
  }, [id, GetAPI]);

  const fetchPresenca = useCallback(async () => {
    if (!id) return;
    setLoadingPresenca(true);
    try {
      const dataInicio = `${selectedYear}-01-01`;
      const dataFim = `${selectedYear}-12-31`;
      const res = await GetAPI(
        `/politician/${id}/presenca?dataInicio=${dataInicio}&dataFim=${dataFim}`,
        true,
      );
      if (res.status === 200 && res.body) setPresenca(res.body);
      else setPresenca(null);
    } catch {
      setPresenca(null);
    } finally {
      setLoadingPresenca(false);
    }
  }, [id, selectedYear, GetAPI]);

  const fetchVotacoesIndicadores = useCallback(async () => {
    if (!id) return;
    setLoadingVotacoes(true);
    try {
      const dataInicio = `${selectedYear}-01-01`;
      const dataFim = `${selectedYear}-12-31`;
      const res = await GetAPI(
        `/politician/${id}/votacoes/indicadores?dataInicio=${dataInicio}&dataFim=${dataFim}`,
        true,
      );
      if (res.status === 200 && res.body) setVotacoesIndicadores(res.body);
      else setVotacoesIndicadores(null);
    } catch {
      setVotacoesIndicadores(null);
    } finally {
      setLoadingVotacoes(false);
    }
  }, [id, selectedYear, GetAPI]);

  const fetchTemas = useCallback(async () => {
    if (!id) return;
    setLoadingTemas(true);
    try {
      const res = await GetAPI(`/politician/${id}/temas`, true);
      if (res.status === 200 && res.body) setTemas(res.body);
      else setTemas(null);
    } catch {
      setTemas(null);
    } finally {
      setLoadingTemas(false);
    }
  }, [id, GetAPI]);

  useEffect(() => {
    fetchContadores();
  }, [fetchContadores]);

  useEffect(() => {
    fetchPresenca();
  }, [fetchPresenca]);

  useEffect(() => {
    fetchVotacoesIndicadores();
  }, [fetchVotacoesIndicadores]);

  useEffect(() => {
    fetchTemas();
  }, [fetchTemas]);

  const fetchDiscursosResumo = useCallback(async () => {
    if (!id) return;
    setLoadingDiscursos(true);
    try {
      const dataInicio = `${selectedYear}-01-01`;
      const dataFim = `${selectedYear}-12-31`;
      const res = await GetAPI(
        `/politician/${id}/discursos/resumo?dataInicio=${dataInicio}&dataFim=${dataFim}`,
        true,
      );
      if (res.status === 200 && res.body) setDiscursosResumo(res.body);
      else setDiscursosResumo(null);
    } catch {
      setDiscursosResumo(null);
    } finally {
      setLoadingDiscursos(false);
    }
  }, [id, selectedYear, GetAPI]);

  useEffect(() => {
    fetchDiscursosResumo();
  }, [fetchDiscursosResumo]);

  const fetchCeapResumo = useCallback(async () => {
    if (!id) return;
    setLoadingCeapResumo(true);
    try {
      const params = new URLSearchParams();
      params.set("ano", ceapAno);
      const res = await GetAPI(
        `/politician/${id}/despesas/resumo?${params.toString()}`,
        true,
      );
      if (res.status === 200 && res.body) setCeapResumo(res.body);
      else setCeapResumo(null);
    } catch {
      setCeapResumo(null);
    } finally {
      setLoadingCeapResumo(false);
    }
  }, [id, ceapAno, GetAPI]);

  const fetchCeapDespesas = useCallback(async () => {
    if (!id) return;
    setLoadingCeapDespesas(true);
    try {
      const params = new URLSearchParams();
      params.set("ano", ceapAno);
      params.set("page", String(ceapPage));
      params.set("pageSize", "20");
      const res = await GetAPI(
        `/politician/${id}/despesas?${params.toString()}`,
        true,
      );
      if (res.status === 200 && res.body) {
        setDespesasCeap(res.body.despesas ?? []);
        setCeapHasMore(res.body.hasMore ?? false);
      } else {
        setDespesasCeap([]);
      }
    } catch {
      setDespesasCeap([]);
    } finally {
      setLoadingCeapDespesas(false);
    }
  }, [id, ceapAno, ceapPage, GetAPI]);

  useEffect(() => {
    fetchCeapResumo();
  }, [fetchCeapResumo]);

  useEffect(() => {
    fetchCeapDespesas();
  }, [fetchCeapDespesas]);

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
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
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
    (m) => m.parliamentaryQuota != null || m.cabinetQuota != null,
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
    {
      label: "Facebook",
      url: politician?.facebook ?? undefined,
      icon: "facebook",
    },
    {
      label: "Instagram",
      url: politician?.instagram ?? undefined,
      icon: "instagram",
    },
    {
      label: "YouTube",
      url: politician?.youTube ?? politician?.youtube ?? undefined,
      icon: "youtube",
    },
    {
      label: "TikTok",
      url: politician?.tikTok ?? politician?.tiktok ?? undefined,
      icon: "tiktok",
    },
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
            title={
              politician.situacaoExercicio
                ? `${politician.name} (${politician.situacaoExercicio})`
                : politician.name
            }
            subtitle={`${politician.politicalPartyAcronym || politician.politicalParty} • ${politician.state}`}
            className="flex-wrap gap-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px] border-gray-200 bg-gray-50">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
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
                <Button
                  variant="outline"
                  className="border-gray-200 bg-gray-50"
                >
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
                <h2 className="text-dark text-xl font-bold">
                  {politician.name}
                </h2>
                {politician.fullName &&
                  politician.fullName.trim() !== politician.name?.trim() && (
                    <p className="mt-1 text-sm text-gray-600">
                      Nome civil: {politician.fullName}
                    </p>
                  )}
                <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                  <span className="bg-secondary/10 text-secondary rounded-full px-2 py-0.5 text-xs font-bold uppercase">
                    {politician.politicalPartyAcronym ||
                      politician.politicalParty}
                  </span>
                  <span className="text-sm text-gray-500" title="UF">
                    {politician.state}
                  </span>
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
                      {new Date(politician.birthDate).toLocaleDateString(
                        "pt-BR",
                      )}
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
                    className="hover:text-secondary flex items-center gap-3 text-sm text-gray-600"
                  >
                    <Mail className="text-secondary h-4 w-4 shrink-0" />
                    {politician.email}
                  </a>
                )}
                {politician.phone && (
                  <a
                    href={`tel:${politician.phone}`}
                    className="hover:text-secondary flex items-center gap-3 text-sm text-gray-600"
                  >
                    <Phone className="text-secondary h-4 w-4 shrink-0" />
                    {politician.phone}
                  </a>
                )}
                {(politician.gabinetePredio ||
                  politician.gabineteAndar ||
                  politician.gabineteSala) && (
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <Building2 className="text-secondary mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      Gabinete:{" "}
                      {[
                        politician.gabinetePredio,
                        politician.gabineteAndar,
                        politician.gabineteSala,
                      ]
                        .filter(Boolean)
                        .join(" / ")}
                    </span>
                  </div>
                )}
                {politician.mandatoDataInicio && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="text-secondary h-4 w-4 shrink-0" />
                    <span>
                      Início do exercício:{" "}
                      {new Date(
                        politician.mandatoDataInicio,
                      ).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
                {politician.address && (
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <Building2 className="text-secondary mt-0.5 h-4 w-4 shrink-0" />
                    <span>{politician.address}</span>
                  </div>
                )}
              </div>

              {(profissoes.length > 0 ||
                ocupacoes.length > 0 ||
                loadingBio) && (
                <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Biografia
                  </h4>
                  {loadingBio ? (
                    <SkeletonLoader className="h-12 w-full" />
                  ) : (
                    <>
                      {profissoes.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500">
                            Profissões declaradas
                          </p>
                          <ul className="mt-0.5 flex flex-wrap gap-1">
                            {profissoes.map((p, i) => (
                              <li
                                key={i}
                                className="bg-secondary/5 text-secondary rounded px-2 py-0.5 text-xs"
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
                          <p className="text-xs text-gray-500">
                            Ocupações declaradas
                          </p>
                          <ul className="mt-0.5 space-y-0.5 text-xs text-gray-700">
                            {ocupacoes.map((o, i) => (
                              <li key={i}>
                                {o.titulo}
                                {(o.entidade || o.periodo) &&
                                  ` — ${[o.entidade, o.periodo].filter(Boolean).join(" • ")}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

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

              {(loadingContadores || contadores) && (
                <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Resumo
                  </h4>
                  {loadingContadores ? (
                    <div className="flex gap-2">
                      <SkeletonLoader className="h-10 w-16" />
                      <SkeletonLoader className="h-10 w-16" />
                      <SkeletonLoader className="h-10 w-16" />
                    </div>
                  ) : contadores ? (
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="rounded border border-gray-100 bg-gray-50/50 px-2 py-1.5">
                        <p className="text-lg font-bold text-gray-800">
                          {contadores.eventos}
                        </p>
                        <p className="text-xs text-gray-500">Eventos</p>
                      </div>
                      <div className="rounded border border-gray-100 bg-gray-50/50 px-2 py-1.5">
                        <p className="text-lg font-bold text-gray-800">
                          {contadores.proposicoes}
                        </p>
                        <p className="text-xs text-gray-500">Proposições</p>
                      </div>
                      <div className="rounded border border-gray-100 bg-gray-50/50 px-2 py-1.5">
                        <p className="text-lg font-bold text-gray-800">
                          {contadores.discursos}
                        </p>
                        <p className="text-xs text-gray-500">Discursos</p>
                      </div>
                      <div className="rounded border border-gray-100 bg-gray-50/50 px-2 py-1.5">
                        <p className="text-lg font-bold text-gray-800">
                          {contadores.votacoes}
                        </p>
                        <p className="text-xs text-gray-500">Votações</p>
                      </div>
                    </div>
                  ) : null}
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
                        <p className="mb-1 text-xs tracking-wider text-gray-400 uppercase">
                          Cota parlamentar utilizada
                        </p>
                        <p className="text-dark text-lg font-bold">
                          R${" "}
                          {finance.usedParliamentaryQuota?.toLocaleString(
                            "pt-BR",
                          ) ?? "—"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                        <p className="mb-1 text-xs tracking-wider text-gray-400 uppercase">
                          Verba de gabinete utilizada
                        </p>
                        <p className="text-dark text-lg font-bold">
                          R${" "}
                          {finance.usedCabinetQuota?.toLocaleString("pt-BR") ??
                            "—"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                {hasFinanceDetail && (
                  <div className="border-t border-gray-100 bg-gray-50/30 px-6 py-4">
                    <h4 className="mb-3 text-xs font-bold tracking-wider text-gray-500 uppercase">
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
                      <p className="mb-1 flex items-center gap-2 text-xs tracking-wider text-gray-400 uppercase">
                        <Vote className="h-3.5 w-3.5" /> Plenário
                      </p>
                      <p className="text-dark text-sm font-medium">
                        {profile.plenaryPresence ?? "—"}
                      </p>
                      {(profile.plenaryJustifiedAbsences ||
                        profile.plenaryUnjustifiedAbsences) && (
                        <p className="mt-1 text-xs text-gray-500">
                          Faltas justificadas:{" "}
                          {profile.plenaryJustifiedAbsences ?? "—"} •
                          Injustificadas:{" "}
                          {profile.plenaryUnjustifiedAbsences ?? "—"}
                        </p>
                      )}
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                      <p className="mb-1 flex items-center gap-2 text-xs tracking-wider text-gray-400 uppercase">
                        <Briefcase className="h-3.5 w-3.5" /> Comissões
                      </p>
                      <p className="text-dark text-sm font-medium">
                        {profile.committeesPresence ?? "—"}
                      </p>
                      {(profile.committeesJustifiedAbsences ||
                        profile.committeesUnjustifiedAbsences) && (
                        <p className="mt-1 text-xs text-gray-500">
                          Faltas justificadas:{" "}
                          {profile.committeesJustifiedAbsences ?? "—"} •
                          Injustificadas:{" "}
                          {profile.committeesUnjustifiedAbsences ?? "—"}
                        </p>
                      )}
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                      <p className="mb-1 flex items-center gap-2 text-xs tracking-wider text-gray-400 uppercase">
                        <FileText className="h-3.5 w-3.5" /> Proposições
                      </p>
                      <p className="text-dark text-sm font-medium">
                        Criadas: {profile.createdProposals ?? "—"} •
                        Relacionadas: {profile.relatedProposals ?? "—"}
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
                            Criadas (Câmara){" "}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {profile.relatedProposalsUrl && (
                          <a
                            href={profile.relatedProposalsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary hover:text-secondary/80 inline-flex items-center gap-1 text-xs font-medium"
                          >
                            Relacionadas (Câmara){" "}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                      <p className="mb-1 flex items-center gap-2 text-xs tracking-wider text-gray-400 uppercase">
                        <Mic2 className="h-3.5 w-3.5" /> Discursos
                      </p>
                      <p className="text-dark text-sm font-medium">
                        {profile.speeches ?? "—"}
                      </p>
                      {(profile.speechesAudiosUrl ||
                        profile.speechesVideosUrl) && (
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
                      <p className="mb-1 flex items-center gap-2 text-xs tracking-wider text-gray-400 uppercase">
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

              {/* Agenda / Eventos do deputado */}
              <Card
                id="agenda"
                className="scroll-mt-20 border-gray-100 shadow-sm"
              >
                <div className="border-b border-gray-100/50 p-6 pb-2">
                  <h3 className="text-dark flex items-center gap-2 text-lg font-bold">
                    <Calendar className="text-secondary h-5 w-5" />
                    Agenda
                  </h3>
                  <p className="text-sm text-gray-500">
                    Eventos em que o deputado participa
                  </p>
                </div>
                <div className="space-y-4 p-6">
                  {loadingAgenda ? (
                    <div className="flex gap-4">
                      <SkeletonLoader className="h-14 w-32" />
                      <SkeletonLoader className="h-14 w-36" />
                    </div>
                  ) : agendaResumo ? (
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-2">
                        <span className="text-xs text-gray-500">
                          Agenda hoje
                        </span>
                        <p className="text-dark text-lg font-bold">
                          {agendaResumo.countHoje}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-2">
                        <span className="text-xs text-gray-500">
                          Próximos 7 dias
                        </span>
                        <p className="text-dark text-lg font-bold">
                          {agendaResumo.countProximos7Dias}
                        </p>
                      </div>
                      <a
                        href={agendaResumo.link}
                        className="text-secondary hover:text-secondary/80 text-sm font-medium"
                      >
                        Ver detalhes ↓
                      </a>
                    </div>
                  ) : null}

                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-gray-700">
                      Eventos
                    </h4>
                    {loadingEventos ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <SkeletonLoader key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : eventos.length > 0 ? (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                                <th className="pr-2 pb-2">Início</th>
                                <th className="pr-2 pb-2">Fim</th>
                                <th className="pr-2 pb-2">Tipo</th>
                                <th className="pr-2 pb-2">Situação</th>
                                <th className="pr-2 pb-2">Órgão</th>
                                <th className="pr-2 pb-2">Local</th>
                                <th className="pb-2 pl-2"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {eventos.map((ev) => (
                                <tr
                                  key={ev.id}
                                  className="border-b border-gray-50"
                                >
                                  <td className="py-2 pr-2 text-gray-700">
                                    {new Date(ev.dt_inicio).toLocaleString(
                                      "pt-BR",
                                      {
                                        dateStyle: "short",
                                      },
                                    )}
                                  </td>
                                  <td className="py-2 pr-2 text-gray-700">
                                    {ev.dt_fim
                                      ? new Date(ev.dt_fim).toLocaleString(
                                          "pt-BR",
                                          {
                                            dateStyle: "short",
                                          },
                                        )
                                      : "—"}
                                  </td>
                                  <td className="py-2 pr-2">
                                    {ev.descricao_tipo_evento ||
                                      ev.cod_tipo_evento ||
                                      "—"}
                                  </td>
                                  <td className="py-2 pr-2">
                                    {ev.cod_situacao_evento || "—"}
                                  </td>
                                  <td className="py-2 pr-2">
                                    {ev.sigla_orgao || ev.nome_orgao || "—"}
                                  </td>
                                  <td
                                    className="max-w-[120px] truncate py-2 pr-2"
                                    title={ev.local_evento}
                                  >
                                    {ev.local_evento || "—"}
                                  </td>
                                  <td className="py-2 pl-2">
                                    <Link
                                      href={`/eventos/${ev.id}`}
                                      className="text-secondary hover:text-secondary/80 text-xs font-medium"
                                    >
                                      Ver pauta
                                    </Link>
                                    {ev.uri && (
                                      <a
                                        href={ev.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-secondary hover:text-secondary/80 ml-2 text-xs font-medium"
                                      >
                                        Câmara
                                      </a>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {eventosPages > 1 && (
                          <div className="pt-3">
                            <CustomPagination
                              pages={eventosPages}
                              currentPage={eventosPage}
                              setCurrentPage={setEventosPage}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="py-4 text-center text-sm text-gray-500">
                        Nenhum evento encontrado para este deputado no período.
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Proposições do deputado */}
              <Card
                id="proposicoes"
                className="scroll-mt-20 border-gray-100 shadow-sm"
              >
                <div className="border-b border-gray-100/50 p-6 pb-2">
                  <h3 className="text-dark flex items-center gap-2 text-lg font-bold">
                    <FileText className="text-secondary h-5 w-5" />
                    Proposições
                  </h3>
                  <p className="text-sm text-gray-500">Autoria e coautoria</p>
                </div>
                <div className="space-y-4 p-6">
                  {proposicoesResumo && (
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-2">
                        <span className="text-xs text-gray-500">Total</span>
                        <p className="text-dark text-lg font-bold">
                          {proposicoesResumo.total}
                        </p>
                      </div>
                      {proposicoesResumo.ultimaData && (
                        <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-2">
                          <span className="text-xs text-gray-500">Última</span>
                          <p className="text-dark text-sm font-bold">
                            {new Date(
                              proposicoesResumo.ultimaData,
                            ).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      )}
                      {proposicoesResumo.cnt_prop_por_tipo
                        ?.slice(0, 5)
                        .map((t) => (
                          <span
                            key={t.sigla_tipo}
                            className="bg-secondary/10 text-secondary rounded-full px-2 py-0.5 text-xs font-semibold"
                          >
                            {t.sigla_tipo}: {t.count}
                          </span>
                        ))}
                      <a
                        href={proposicoesResumo.link}
                        className="text-secondary hover:text-secondary/80 text-sm font-medium"
                      >
                        Ver detalhes ↓
                      </a>
                    </div>
                  )}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-gray-700">
                      Lista (autor/coautor)
                    </h4>
                    {loadingProposicoes ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <SkeletonLoader key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : proposicoes.length > 0 ? (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                                <th className="pr-2 pb-2">Sigla / Nº / Ano</th>
                                <th className="pr-2 pb-2">Ementa</th>
                                <th className="pr-2 pb-2">Apresentação</th>
                                <th className="pr-2 pb-2">Situação</th>
                                <th className="pb-2 pl-2"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {proposicoes.map((prop) => (
                                <tr
                                  key={prop.id}
                                  className="border-b border-gray-50"
                                >
                                  <td className="py-2 pr-2 font-medium">
                                    {prop.sigla_tipo} {prop.numero}/{prop.ano}
                                  </td>
                                  <td
                                    className="max-w-xs truncate py-2 pr-2 text-gray-700"
                                    title={prop.ementa}
                                  >
                                    {prop.ementa || "—"}
                                  </td>
                                  <td className="py-2 pr-2 text-gray-600">
                                    {new Date(
                                      prop.dt_apresentacao,
                                    ).toLocaleDateString("pt-BR")}
                                  </td>
                                  <td className="py-2 pr-2">
                                    {prop.situacao_descricao || "—"}
                                  </td>
                                  <td className="py-2 pl-2">
                                    <Link
                                      href={`/propositions/${prop.id}`}
                                      className="text-secondary hover:text-secondary/80 text-xs font-medium"
                                    >
                                      Ver proposição
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {proposicoesPages > 1 && (
                          <div className="pt-3">
                            <CustomPagination
                              pages={proposicoesPages}
                              currentPage={proposicoesPage}
                              setCurrentPage={setProposicoesPage}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="py-4 text-center text-sm text-gray-500">
                        Nenhuma proposição encontrada para este deputado.
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Presença (período) */}
              <Card
                id="presenca"
                className="scroll-mt-20 border-gray-100 shadow-sm"
              >
                <div className="border-b border-gray-100/50 p-6 pb-2">
                  <h3 className="text-dark flex items-center gap-2 text-lg font-bold">
                    <Calendar className="text-secondary h-5 w-5" />
                    Presença
                  </h3>
                  <p className="text-sm text-gray-500">
                    Eventos em que o deputado participou e ausências em plenário
                    (período)
                  </p>
                </div>
                <div className="p-6">
                  {loadingPresenca ? (
                    <div className="flex gap-4">
                      <SkeletonLoader className="h-14 w-28" />
                      <SkeletonLoader className="h-14 w-28" />
                    </div>
                  ) : presenca ? (
                    <div className="flex flex-wrap gap-4">
                      <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                        <p className="text-xs tracking-wider text-gray-500 uppercase">
                          Presenças
                        </p>
                        <p className="text-dark text-xl font-bold">
                          {presenca.presencas}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                        <p className="text-xs tracking-wider text-gray-500 uppercase">
                          Ausências (plenário)
                        </p>
                        <p className="text-dark text-xl font-bold">
                          {presenca.ausencias}
                        </p>
                      </div>
                      <p className="self-end text-xs text-gray-500">
                        Período:{" "}
                        {new Date(presenca.dataInicio).toLocaleDateString(
                          "pt-BR",
                        )}{" "}
                        a{" "}
                        {new Date(presenca.dataFim).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Sem dados de presença para o período.
                    </p>
                  )}
                </div>
              </Card>

              {/* Votações indicadores */}
              <Card
                id="votacoes"
                className="scroll-mt-20 border-gray-100 shadow-sm"
              >
                <div className="border-b border-gray-100/50 p-6 pb-2">
                  <h3 className="text-dark flex items-center gap-2 text-lg font-bold">
                    <Vote className="text-secondary h-5 w-5" />
                    Votações
                  </h3>
                  <p className="text-sm text-gray-500">
                    Votações nominais no período
                  </p>
                </div>
                <div className="p-6">
                  {loadingVotacoes ? (
                    <div className="flex gap-4">
                      <SkeletonLoader className="h-14 w-36" />
                    </div>
                  ) : votacoesIndicadores ? (
                    <div className="flex flex-wrap gap-4">
                      <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                        <p className="text-xs tracking-wider text-gray-500 uppercase">
                          Votações no período
                        </p>
                        <p className="text-dark text-xl font-bold">
                          {votacoesIndicadores.baseVotosCount}
                        </p>
                      </div>
                      {votacoesIndicadores.alinhamentoPct != null && (
                        <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                          <p className="text-xs tracking-wider text-gray-500 uppercase">
                            Alinhamento
                          </p>
                          <p className="text-dark text-xl font-bold">
                            {votacoesIndicadores.alinhamentoPct}%
                          </p>
                        </div>
                      )}
                      <p className="self-end text-xs text-gray-500">
                        Período:{" "}
                        {new Date(
                          votacoesIndicadores.dataInicio,
                        ).toLocaleDateString("pt-BR")}{" "}
                        a{" "}
                        {new Date(
                          votacoesIndicadores.dataFim,
                        ).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Sem dados de votações para o período.
                    </p>
                  )}
                </div>
              </Card>

              {/* Discursos */}
              <Card
                id="discursos"
                className="scroll-mt-20 border-gray-100 shadow-sm"
              >
                <div className="border-b border-gray-100/50 p-6 pb-2">
                  <h3 className="text-dark flex items-center gap-2 text-lg font-bold">
                    <Mic2 className="text-secondary h-5 w-5" />
                    Discursos
                  </h3>
                  <p className="text-sm text-gray-500">
                    Discursos no período (fonte: API Câmara)
                  </p>
                </div>
                <div className="p-6">
                  {loadingDiscursos ? (
                    <div className="flex gap-4">
                      <SkeletonLoader className="h-14 w-28" />
                      <SkeletonLoader className="h-14 w-28" />
                    </div>
                  ) : discursosResumo ? (
                    <div className="flex flex-wrap gap-4">
                      <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                        <p className="text-xs tracking-wider text-gray-500 uppercase">
                          Total no período
                        </p>
                        <p className="text-dark text-xl font-bold">
                          {discursosResumo.total}
                        </p>
                      </div>
                      {discursosResumo.ultimaData && (
                        <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                          <p className="text-xs tracking-wider text-gray-500 uppercase">
                            Último
                          </p>
                          <p className="text-dark text-sm font-bold">
                            {new Date(
                              discursosResumo.ultimaData,
                            ).toLocaleDateString("pt-BR", {
                              dateStyle: "short",
                            })}
                          </p>
                        </div>
                      )}
                      <a
                        href={discursosResumo.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary hover:text-secondary/80 self-center text-sm font-medium"
                      >
                        Ver na Câmara →
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Sem dados de discursos para o período.
                    </p>
                  )}
                </div>
              </Card>

              {/* Temas (proposições) */}
              <Card
                id="temas"
                className="scroll-mt-20 border-gray-100 shadow-sm"
              >
                <div className="border-b border-gray-100/50 p-6 pb-2">
                  <h3 className="text-dark flex items-center gap-2 text-lg font-bold">
                    <Tag className="text-secondary h-5 w-5" />
                    Temas
                  </h3>
                  <p className="text-sm text-gray-500">
                    Temas mais presentes nas proposições (autor/coautor)
                  </p>
                </div>
                <div className="p-6">
                  {loadingTemas ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <SkeletonLoader key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : temas?.temas && temas.temas.length > 0 ? (
                    <ul className="space-y-2">
                      {temas.temas.map((t) => (
                        <li
                          key={t.cod_tema}
                          className="flex items-center justify-between rounded border border-gray-100 bg-gray-50/50 px-3 py-2"
                        >
                          <span className="text-dark text-sm font-medium">
                            {t.tema_nome}
                          </span>
                          <span className="bg-secondary/10 text-secondary rounded-full px-2 py-0.5 text-xs font-semibold">
                            {t.count}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Nenhum tema encontrado nas proposições.
                    </p>
                  )}
                </div>
              </Card>

              {/* CEAP (despesas) */}
              <Card
                id="ceap"
                className="scroll-mt-20 border-gray-100 shadow-sm"
              >
                <div className="border-b border-gray-100/50 p-6 pb-2">
                  <h3 className="text-dark flex items-center gap-2 text-lg font-bold">
                    <Receipt className="text-secondary h-5 w-5" />
                    CEAP (Cota Parlamentar)
                  </h3>
                  <p className="text-sm text-gray-500">
                    Despesas com cota para exercício da atividade parlamentar
                  </p>
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <Select
                      value={ceapAno}
                      onValueChange={(v) => {
                        setCeapAno(v);
                        setCeapPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[100px] border-gray-200 bg-gray-50">
                        <SelectValue placeholder="Ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {loadingCeapResumo ? (
                    <div className="flex gap-4">
                      <SkeletonLoader className="h-14 w-28" />
                      <SkeletonLoader className="h-14 w-28" />
                    </div>
                  ) : ceapResumo ? (
                    <>
                      <div className="flex flex-wrap gap-4">
                        <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                          <p className="text-xs tracking-wider text-gray-500 uppercase">
                            Total no período
                          </p>
                          <p className="text-dark text-xl font-bold">
                            R${" "}
                            {ceapResumo.total.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        {ceapResumo.ultimaData && (
                          <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                            <p className="text-xs tracking-wider text-gray-500 uppercase">
                              Último lançamento
                            </p>
                            <p className="text-dark text-sm font-bold">
                              {new Date(
                                ceapResumo.ultimaData,
                              ).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        )}
                        <a
                          href={ceapResumo.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary hover:text-secondary/80 self-center text-sm font-medium"
                        >
                          Ver na Câmara →
                        </a>
                      </div>
                      {ceapResumo.topCategorias.length > 0 && (
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-gray-700">
                            Top categorias
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {ceapResumo.topCategorias.slice(0, 8).map((c) => (
                              <span
                                key={c.tipoDespesa}
                                className="rounded border border-gray-100 bg-gray-50/50 px-2 py-1 text-xs"
                              >
                                {c.descricao || c.tipoDespesa}: R${" "}
                                {c.valor.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : null}

                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-gray-700">
                      Linhas (detalhes)
                    </h4>
                    {loadingCeapDespesas ? (
                      <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <SkeletonLoader key={i} className="h-10 w-full" />
                        ))}
                      </div>
                    ) : despesasCeap.length > 0 ? (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                                <th className="pr-2 pb-2">Data</th>
                                <th className="pr-2 pb-2">Tipo</th>
                                <th className="pr-2 pb-2">Fornecedor</th>
                                <th className="pr-2 pb-2">Valor</th>
                                <th className="pb-2 pl-2"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {despesasCeap.map((d, i) => (
                                <tr key={i} className="border-b border-gray-50">
                                  <td className="py-2 pr-2 text-gray-700">
                                    {d.dataDocumento
                                      ? new Date(
                                          d.dataDocumento,
                                        ).toLocaleDateString("pt-BR")
                                      : "—"}
                                  </td>
                                  <td className="py-2 pr-2">
                                    {d.descricao || d.tipoDespesa || "—"}
                                  </td>
                                  <td
                                    className="max-w-[180px] truncate py-2 pr-2"
                                    title={d.nomeFornecedor}
                                  >
                                    {d.nomeFornecedor || "—"}
                                  </td>
                                  <td className="py-2 pr-2 font-medium">
                                    R${" "}
                                    {Number(
                                      d.valorLiquido ?? d.valorDocumento ?? 0,
                                    ).toLocaleString("pt-BR", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </td>
                                  <td className="py-2 pl-2">
                                    {d.urlDocumento && (
                                      <a
                                        href={d.urlDocumento}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-secondary hover:text-secondary/80 text-xs font-medium"
                                      >
                                        Doc
                                      </a>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {(ceapHasMore || ceapPage > 1) && (
                          <div className="mt-3 flex gap-2">
                            {ceapPage > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-200"
                                onClick={() =>
                                  setCeapPage((p) => Math.max(1, p - 1))
                                }
                              >
                                Anterior
                              </Button>
                            )}
                            {ceapHasMore && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-200"
                                onClick={() => setCeapPage((p) => p + 1)}
                              >
                                Próxima
                              </Button>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="py-4 text-center text-sm text-gray-500">
                        Nenhuma despesa encontrada para o ano selecionado.
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Histórico de movimentações */}
              <Card className="border-gray-100 shadow-sm">
                <div className="border-b border-gray-100/50 p-6 pb-2">
                  <h3 className="text-dark flex items-center gap-2 text-lg font-bold">
                    <History className="text-secondary h-5 w-5" />
                    Histórico de movimentações
                  </h3>
                  <p className="text-sm text-gray-500">
                    Comissões, cargos e posse nos últimos anos (fonte: CSV
                    Câmara)
                  </p>
                </div>
                <div className="space-y-4 p-6">
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
                        className="max-h-[420px] space-y-0 divide-y divide-gray-100 overflow-y-auto"
                        role="list"
                      >
                        {historico.movimentacoes.map((mov, idx) => (
                          <li
                            key={`${mov.data}-${idx}`}
                            className="py-3 first:pt-0"
                          >
                            <span className="text-xs font-medium text-gray-500">
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
                      Não encontramos movimentações para este deputado.
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
