"use client";

import { PoliticianDetailsProps } from "@/@types/v2/politician";
import { useApiContext } from "@/context/ApiContext";
import { generatePoliticianReport } from "@/utils/pdfGenerator";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [fetchError, setFetchError] = useState<string | null>(null);
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
  const [, setEventosTotal] = useState(0);
  const [eventosPages, setEventosPages] = useState(0);
  const [eventosPage, setEventosPage] = useState(1);
  const [loadingAgenda, setLoadingAgenda] = useState(false);
  const [loadingEventos, setLoadingEventos] = useState(false);

  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [calendarEvents, setCalendarEvents] = useState<EventoAgenda[]>([]);
  const [loadingCalendarEvents, setLoadingCalendarEvents] = useState(false);

  const [proposicoesResumo, setProposicoesResumo] =
    useState<ProposicoesResumo | null>(null);
  const [proposicoes, setProposicoes] = useState<ProposicaoDeputado[]>([]);
  const [, setProposicoesTotal] = useState(0);
  const [proposicoesPages, setProposicoesPages] = useState(0);
  const [proposicoesPage, setProposicoesPage] = useState(1);
  const [loadingProposicoes, setLoadingProposicoes] = useState(false);

  const [profissoes, setProfissoes] = useState<
    { titulo: string; data?: string }[]
  >([]);
  const [ocupacoes, setOcupacoes] = useState<
    { titulo: string; entidade?: string; periodo?: string }[]
  >([]);
  const [biografia, setBiografia] = useState<{
    escolaridade: string | null;
    sexo: string | null;
    dataNascimento: string | null;
    dataFalecimento: string | null;
    municipioNascimento: string | null;
    ufNascimento: string | null;
    nomeCivil: string | null;
    cpf: string | null;
    urlWebsite: string | null;
    redesSociais: string[];
  } | null>(null);
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
  const [ceapAno, setCeapAno] = useState(selectedYear);
  const [ceapHasMore, setCeapHasMore] = useState(false);
  const [loadingCeapResumo, setLoadingCeapResumo] = useState(false);
  const [loadingCeapDespesas, setLoadingCeapDespesas] = useState(false);

  const [pastEvents, setPastEvents] = useState<EventoAgenda[]>([]);
  const [pastEventsPage, setPastEventsPage] = useState(1);
  const [pastEventsPages, setPastEventsPages] = useState(0);
  const [pastEventsTotal, setPastEventsTotal] = useState(0);
  const [loadingPastEvents, setLoadingPastEvents] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<EventoAgenda[]>([]);
  const [upcomingEventsPage, setUpcomingEventsPage] = useState(1);
  const [upcomingEventsPages, setUpcomingEventsPages] = useState(0);
  const [upcomingEventsTotal, setUpcomingEventsTotal] = useState(0);
  const [loadingUpcomingEvents, setLoadingUpcomingEvents] = useState(false);

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
    setFetchError(null);
    try {
      const res = await GetAPI(
        `/politician/details/${id}?year=${selectedYear}`,
        true,
      );
      if (res.status === 200) {
        setPolitician(res.body ?? null);
        setFetchError(null);
      } else {
        setPolitician(null);
        setFetchError(
          typeof res.body === "string"
            ? res.body
            : "Não foi possível carregar os dados do deputado. Verifique sua conexão ou tente mais tarde.",
        );
      }
    } catch {
      setPolitician(null);
      setFetchError(
        "Não foi possível carregar os dados do deputado. Verifique sua conexão ou tente mais tarde.",
      );
    } finally {
      setLoading(false);
    }
  }, [id, selectedYear, GetAPI]);

  // (orchestrated via wave-based loading below)

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

  // (orchestrated via wave-based loading below)

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

  // (orchestrated via wave-based loading below)

  const fetchCalendarEvents = useCallback(async () => {
    if (!id) return;
    setLoadingCalendarEvents(true);
    try {
      const year = calendarDate.getFullYear();
      const month = calendarDate.getMonth();
      const dataInicio = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const dataFim = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      const params = new URLSearchParams();
      params.set("dataInicio", dataInicio);
      params.set("dataFim", dataFim);
      params.set("pageSize", "200");
      const res = await GetAPI(
        `/politician/${id}/eventos?${params.toString()}`,
        true,
      );
      if (res.status === 200 && res.body) {
        setCalendarEvents(res.body.eventos ?? []);
      } else setCalendarEvents([]);
    } catch {
      setCalendarEvents([]);
    } finally {
      setLoadingCalendarEvents(false);
    }
  }, [id, calendarDate, GetAPI]);

  // (orchestrated via wave-based loading below)

  const PAST_UPCOMING_PAGE_SIZE = 5;

  const fetchPastEvents = useCallback(async () => {
    if (!id) return;
    setLoadingPastEvents(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const params = new URLSearchParams();
      params.set("dataFim", today);
      params.set("pageSize", String(PAST_UPCOMING_PAGE_SIZE));
      params.set("page", String(pastEventsPage));
      const res = await GetAPI(
        `/politician/${id}/eventos?${params.toString()}`,
        true,
      );
      if (res.status === 200 && res.body) {
        const evts: EventoAgenda[] = res.body.eventos ?? [];
        evts.sort(
          (a, b) =>
            new Date(b.dt_inicio).getTime() - new Date(a.dt_inicio).getTime(),
        );
        setPastEvents(evts);
        const total = res.body.total ?? 0;
        setPastEventsTotal(total);
        const pages = (res.body.pages ?? Math.ceil(total / PAST_UPCOMING_PAGE_SIZE)) || 1;
        setPastEventsPages(pages);
      } else {
        setPastEvents([]);
        setPastEventsTotal(0);
        setPastEventsPages(0);
      }
    } catch {
      setPastEvents([]);
      setPastEventsTotal(0);
      setPastEventsPages(0);
    } finally {
      setLoadingPastEvents(false);
    }
  }, [id, pastEventsPage, GetAPI]);

  const fetchUpcomingEvents = useCallback(async () => {
    if (!id) return;
    setLoadingUpcomingEvents(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const params = new URLSearchParams();
      params.set("dataInicio", today);
      params.set("pageSize", String(PAST_UPCOMING_PAGE_SIZE));
      params.set("page", String(upcomingEventsPage));
      const res = await GetAPI(
        `/politician/${id}/eventos?${params.toString()}`,
        true,
      );
      if (res.status === 200 && res.body) {
        const evts: EventoAgenda[] = res.body.eventos ?? [];
        evts.sort(
          (a, b) =>
            new Date(a.dt_inicio).getTime() - new Date(b.dt_inicio).getTime(),
        );
        setUpcomingEvents(evts);
        const totalUp = res.body.total ?? 0;
        setUpcomingEventsTotal(totalUp);
        const pagesUp = (res.body.pages ?? Math.ceil(totalUp / PAST_UPCOMING_PAGE_SIZE)) || 1;
        setUpcomingEventsPages(pagesUp);
      } else {
        setUpcomingEvents([]);
        setUpcomingEventsTotal(0);
        setUpcomingEventsPages(0);
      }
    } catch {
      setUpcomingEvents([]);
      setUpcomingEventsTotal(0);
      setUpcomingEventsPages(0);
    } finally {
      setLoadingUpcomingEvents(false);
    }
  }, [id, upcomingEventsPage, GetAPI]);

  // (orchestrated via wave-based loading below)

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

  // (orchestrated via wave-based loading below)

  const fetchBiografia = useCallback(async () => {
    if (!id) return;
    setLoadingBio(true);
    try {
      const [rProf, rOcup, rBio] = await Promise.all([
        GetAPI(`/politician/${id}/profissoes`, true),
        GetAPI(`/politician/${id}/ocupacoes`, true),
        GetAPI(`/politician/${id}/biografia`, true),
      ]);
      if (rProf.status === 200 && rProf.body?.profissoes)
        setProfissoes(rProf.body.profissoes);
      else setProfissoes([]);
      if (rOcup.status === 200 && rOcup.body?.ocupacoes)
        setOcupacoes(rOcup.body.ocupacoes);
      else setOcupacoes([]);
      if (rBio.status === 200 && rBio.body) setBiografia(rBio.body);
      else setBiografia(null);
    } catch {
      setProfissoes([]);
      setOcupacoes([]);
      setBiografia(null);
    } finally {
      setLoadingBio(false);
    }
  }, [id, GetAPI]);

  // (orchestrated via wave-based loading below)

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

  // (orchestrated via wave-based loading below)

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

  // (orchestrated via wave-based loading below)

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
    setCeapAno(selectedYear);
    setCeapPage(1);
  }, [selectedYear]);

  // (ceapResumo + ceapDespesas orchestrated via wave-based loading below)

  // ─── WAVE-BASED INITIAL LOAD ──────────────────────────────────────
  // Prevents thundering herd: instead of 17 simultaneous API calls,
  // requests are staggered in 3 priority waves.
  const initialLoadDoneRef = useRef(false);
  const prevYearRef = useRef(selectedYear);

  useEffect(() => {
    if (!id) return;
    initialLoadDoneRef.current = false;
    let cancelled = false;

    (async () => {
      // Wave 1: Header data (critical for first paint)
      await Promise.allSettled([fetchDetails(), fetchContadores()]);
      if (cancelled) return;

      // Wave 2: Agenda & events (visible tab content)
      await Promise.allSettled([
        fetchHistorico(),
        fetchAgendaResumo(),
        fetchEventos(),
        fetchCalendarEvents(),
        fetchPastEvents(),
        fetchUpcomingEvents(),
      ]);
      if (cancelled) return;

      // Wave 3: Remaining tabs (loaded in background)
      await Promise.allSettled([
        fetchProposicoesResumo(),
        fetchProposicoes(),
        fetchBiografia(),
        fetchPresenca(),
        fetchVotacoesIndicadores(),
        fetchTemas(),
        fetchDiscursosResumo(),
        fetchCeapResumo(),
        fetchCeapDespesas(),
      ]);

      if (!cancelled) initialLoadDoneRef.current = true;
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ─── YEAR-CHANGE REFETCHES (only year-dependent endpoints) ───────
  useEffect(() => {
    if (!id || !initialLoadDoneRef.current) return;
    if (prevYearRef.current === selectedYear) return;
    prevYearRef.current = selectedYear;
    let cancelled = false;

    (async () => {
      await Promise.allSettled([fetchDetails(), fetchPresenca()]);
      if (cancelled) return;
      await Promise.allSettled([
        fetchVotacoesIndicadores(),
        fetchDiscursosResumo(),
      ]);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  // ─── PAGINATION / USER-INTERACTION REFETCHES ─────────────────────
  useEffect(() => {
    if (initialLoadDoneRef.current) fetchHistorico();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historicoPage, historicoPageSize, historicoYear, historicoSearchApplied]);

  useEffect(() => {
    if (initialLoadDoneRef.current) fetchEventos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventosPage]);

  useEffect(() => {
    if (initialLoadDoneRef.current) fetchCalendarEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarDate]);

  useEffect(() => {
    if (initialLoadDoneRef.current) fetchPastEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pastEventsPage]);

  useEffect(() => {
    if (initialLoadDoneRef.current) fetchUpcomingEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upcomingEventsPage]);

  useEffect(() => {
    if (initialLoadDoneRef.current) fetchProposicoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposicoesPage]);

  useEffect(() => {
    if (initialLoadDoneRef.current) fetchCeapResumo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ceapAno]);

  useEffect(() => {
    if (initialLoadDoneRef.current) fetchCeapDespesas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ceapAno, ceapPage]);

  // ─── END WAVE-BASED LOADING ──────────────────────────────────────

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

    calendarDate,
    setCalendarDate,
    calendarEvents,
    loadingCalendarEvents,

    pastEvents,
    pastEventsPage,
    setPastEventsPage,
    pastEventsPages,
    pastEventsTotal,
    loadingPastEvents,
    upcomingEvents,
    upcomingEventsPage,
    setUpcomingEventsPage,
    upcomingEventsPages,
    upcomingEventsTotal,
    loadingUpcomingEvents,

    proposicoesResumo,
    proposicoes,
    proposicoesPage,
    setProposicoesPage,
    proposicoesPages,
    loadingProposicoes,

    profissoes,
    ocupacoes,
    biografia,
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

    fetchError,
  };
}

export type DeputadoPageData = ReturnType<typeof useDeputadoPage>;
