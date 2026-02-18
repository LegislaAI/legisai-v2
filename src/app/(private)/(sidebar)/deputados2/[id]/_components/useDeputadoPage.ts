"use client";

import { PoliticianDetailsProps } from "@/@types/v2/politician";
import { useApiContext } from "@/context/ApiContext";
import { generatePoliticianReport } from "@/utils/pdfGenerator";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApexOptions } from "apexcharts";
import type {
  AgendaResumo,
  Contadores,
  DespesaCEAP,
  DespesasResumoCEAP,
  DiscursosResumo,
  EventoAgenda,
  HistoricoResponse,
  Presenca,
  ProposicaoDeputado,
  ProposicoesResumo,
  TemasResponse,
  VotacoesIndicadores,
} from "./types";
import { MONTHS, START_YEAR } from "./constants";
import type { SocialLink } from "./types";

export function useDeputadoPage(id: string | undefined) {
  const { GetAPI } = useApiContext();
  const [politician, setPolitician] = useState<PoliticianDetailsProps | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
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
      if (res.status === 200 && res.body) setPolitician(res.body);
      else setPolitician(null);
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
      if (res.status === 200 && res.body) setHistorico(res.body);
      else setHistorico(null);
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
      } else setEventos([]);
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
      } else setProposicoes([]);
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
      } else setDespesasCeap([]);
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

  const handleHistoricoYearChange = useCallback((value: string) => {
    setHistoricoYear(value === "todos" ? "" : value);
    setHistoricoPage(1);
  }, []);

  const handleHistoricoSearchApply = useCallback(() => {
    setHistoricoSearchApplied(historicoSearch);
    setHistoricoPage(1);
  }, [historicoSearch]);

  const handleExportPDF = useCallback(() => {
    if (politician) generatePoliticianReport(politician, selectedYear);
  }, [politician, selectedYear]);

  const chartOptions: ApexOptions = useMemo(
    () => ({
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
          formatter: (value: number) =>
            `R$ ${value && value > 1000 ? (value / 1000).toFixed(0) + "k" : value?.toFixed(0)}`,
        },
      },
      grid: { borderColor: "#f1f1f1" },
      legend: { show: true, position: "top" },
    }),
    [],
  );

  const monthlyCosts = politician?.finance?.monthlyCosts ?? [];
  const cota = monthlyCosts.map((m) => m.parliamentaryQuota);
  const gabinete = monthlyCosts.map((m) => m.cabinetQuota);
  const chartSeries = useMemo(
    () => [
      { name: "Cota Parlamentar", data: cota },
      { name: "Verba de Gabinete", data: gabinete },
    ],
    [cota, gabinete],
  );
  const hasChartData = monthlyCosts.some(
    (m) => m.parliamentaryQuota != null || m.cabinetQuota != null,
  );

  const finance = politician?.finance;
  const profile = politician?.profile;
  const hasFinanceDetail = !!(
    finance?.contractedPeople ||
    finance?.grossSalary ||
    finance?.functionalPropertyUsage ||
    finance?.trips ||
    finance?.diplomaticPassport ||
    finance?.housingAssistant
  );

  const socialLinks: SocialLink[] = useMemo(
    () =>
      [
        { label: "Facebook", url: politician?.facebook ?? undefined },
        { label: "Instagram", url: politician?.instagram ?? undefined },
        {
          label: "YouTube",
          url: politician?.youTube ?? politician?.youtube ?? undefined,
        },
        {
          label: "TikTok",
          url: politician?.tikTok ?? politician?.tiktok ?? undefined,
        },
      ].filter((s): s is SocialLink => !!s.url),
    [politician],
  );

  return {
    politician,
    loading,
    selectedYear,
    setSelectedYear,
    availableYears,
    handleExportPDF,

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

    agendaResumo,
    eventos,
    eventosPage,
    setEventosPage,
    eventosPages,
    loadingAgenda,
    loadingEventos,

    proposicoesResumo,
    proposicoes,
    proposicoesPage,
    setProposicoesPage,
    proposicoesPages,
    loadingProposicoes,

    profissoes,
    ocupacoes,
    loadingBio,

    contadores,
    presenca,
    votacoesIndicadores,
    temas,
    loadingContadores,
    loadingPresenca,
    loadingVotacoes,
    loadingTemas,

    ceapResumo,
    despesasCeap,
    ceapPage,
    setCeapPage,
    ceapAno,
    setCeapAno,
    ceapHasMore,
    loadingCeapResumo,
    loadingCeapDespesas,

    discursosResumo,
    loadingDiscursos,

    profile,
    finance,
    chartOptions,
    chartSeries,
    hasChartData,
    hasFinanceDetail,
    socialLinks,
  };
}

export type DeputadoPageData = ReturnType<typeof useDeputadoPage>;
