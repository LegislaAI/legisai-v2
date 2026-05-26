"use client";

import { CustomPagination } from "@/components/ui/CustomPagination";
import { PoliticianAutocomplete, PoliticianRef } from "@/components/v2/components/ui/PoliticianAutocomplete";
import { Card } from "@/components/v2/components/ui/Card";
import { EmptyState } from "@/components/v2/components/ui/EmptyState";
import { DateRangePicker } from "@/components/v2/components/ui/date-range-picker";
import { MultiSelect } from "@/components/v2/components/ui/multi-select";
import { RadioGroup } from "@/components/v2/components/ui/radio-group";
import { SearchableSelect } from "@/components/v2/components/ui/searchable-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/v2/components/ui/tabs";
import { useApiContext } from "@/context/ApiContext";
import { useDebounce } from "@/hooks/useDebounce";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkPlus,
  Calendar,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Link2,
  Search,
  Share2,
  Star,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Ref = { id: string; name: string; acronym?: string };

type SavedSearch = {
  id: string;
  name: string;
  query: string;
  createdAt: string;
};

const SAVED_KEY = "legisai:proposicoes:savedSearches";

type Counters = {
  tramitacoes: number;
  relacionadas: number;
  eventos: number;
  autores: number;
  pareceres: number;
  documentos: number;
  requerimentos: number;
};

type Proposition = {
  id: string;
  description: string;
  typeAcronym: string;
  number: number;
  year: number;
  presentationDate: string;
  fullPropositionUrl?: string;
  regime?: string;
  situationDescription?: string;
  movementDescription?: string;
  lastMovementDate?: string;
  type: Ref;
  situation: Ref | null;
  authors?: { id: string; name: string }[];
  counters?: Counters;
  foundIn?: FoundInField[];
};

type Mode = "basic" | "advanced";
type Tramitacao = "" | "sim" | "nao";
type SearchInField = "ementa" | "indexacao" | "inteiroTeor";
type FoundInField = "ementa" | "indexacao" | "inteiroTeor";

const TRAMITACAO_OPTIONS: { value: Tramitacao; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

const DEPUTADO_AUTHOR_TYPE_HINTS = ["deputado", "deputada"];

function getRegimeTone(regime?: string) {
  if (!regime) return "bg-gray-100 text-gray-600";
  const r = regime.toLowerCase();
  if (r.includes("urg")) return "bg-red-50 text-red-700";
  if (r.includes("prior")) return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function csv(values: string[]): string {
  return values.join(",");
}
function fromCsv(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

export default function PropositionsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { GetAPI } = useApiContext();

  // ── References ──
  const [tiposPrincipais, setTiposPrincipais] = useState<Ref[]>([]);
  const [tiposAcessorios, setTiposAcessorios] = useState<Ref[]>([]);
  const [allTypes, setAllTypes] = useState<Ref[]>([]);
  const [themes, setThemes] = useState<Ref[]>([]);
  const [situations, setSituations] = useState<Ref[]>([]);
  const [authorTypes, setAuthorTypes] = useState<Ref[]>([]);
  const [parties, setParties] = useState<string[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [orgaos, setOrgaos] = useState<string[]>([]);

  // ── Results ──
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingRefs, setLoadingRefs] = useState(true);

  // ── Mode tab ──
  const [mode, setMode] = useState<Mode>(
    (searchParams.get("mode") as Mode) === "advanced" ? "advanced" : "basic"
  );

  // ── Compartilhado (existente) ──
  const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [themeId, setThemeId] = useState<string>(searchParams.get("themeId") ?? "");
  const [situationId, setSituationId] = useState<string>(searchParams.get("situationId") ?? "");
  const [presentedFrom, setPresentedFrom] = useState<string>(searchParams.get("presentedFrom") ?? "");
  const [presentedTo, setPresentedTo] = useState<string>(searchParams.get("presentedTo") ?? "");
  const [partyAcronym, setPartyAcronym] = useState<string>(searchParams.get("partyAcronym") ?? "");
  const [uf, setUf] = useState<string>(searchParams.get("uf") ?? "");
  const [authorTypeId, setAuthorTypeId] = useState<string>(searchParams.get("authorTypeId") ?? "");
  const [hasAttached, setHasAttached] = useState<boolean>(searchParams.get("hasAttached") === "true");
  const [hasAmendment, setHasAmendment] = useState<boolean>(searchParams.get("hasAmendment") === "true");
  const [hasOpinion, setHasOpinion] = useState<boolean>(searchParams.get("hasOpinion") === "true");
  const [hasRequirement, setHasRequirement] = useState<boolean>(searchParams.get("hasRequirement") === "true");
  const [hasDispatch, setHasDispatch] = useState<boolean>(searchParams.get("hasDispatch") === "true");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") ?? "");

  // ── Novos: básica + avançada compartilham ──
  const [typeIds, setTypeIds] = useState<string[]>(
    // Compat: aceita typeIds (CSV) e typeId (single legacy)
    fromCsv(searchParams.get("typeIds")).length
      ? fromCsv(searchParams.get("typeIds"))
      : searchParams.get("typeId")
        ? [searchParams.get("typeId") as string]
        : []
  );
  const [numero, setNumero] = useState<string>(searchParams.get("numero") ?? "");
  const [ano, setAno] = useState<string>(searchParams.get("ano") ?? "");
  // Autor: objeto com id opcional (vem do autocomplete) + name (texto digitado).
  // URL: ?politicianId=… (selecionado) OU ?authorName=… (texto livre).
  const [author, setAuthor] = useState<PoliticianRef>(() => {
    const id = searchParams.get("politicianId");
    const name = searchParams.get("authorName") ?? "";
    return { id: id || undefined, name };
  });
  const [inTramitacao, setInTramitacao] = useState<Tramitacao>(
    (searchParams.get("inTramitacao") as Tramitacao) ?? ""
  );

  // ── Novos: avançada apenas ──
  const [recebidaNoOrgao, setRecebidaNoOrgao] = useState<string>(searchParams.get("recebidaNoOrgao") ?? "");
  const [noOrgaoAtual, setNoOrgaoAtual] = useState<string>(searchParams.get("noOrgaoAtual") ?? "");
  const [allWords, setAllWords] = useState<string>(searchParams.get("allWords") ?? "");
  const [exactPhrase, setExactPhrase] = useState<string>(searchParams.get("exactPhrase") ?? "");
  const [anyWord, setAnyWord] = useState<string>(searchParams.get("anyWord") ?? "");
  const [noneOfWords, setNoneOfWords] = useState<string>(searchParams.get("noneOfWords") ?? "");
  const [searchIn, setSearchIn] = useState<SearchInField[]>(() => {
    const arr = fromCsv(searchParams.get("searchIn"));
    return (arr.length ? arr : ["ementa", "indexacao"]).filter(
      (s): s is SearchInField =>
        s === "ementa" || s === "indexacao" || s === "inteiroTeor"
    );
  });
  // Relator: mesma estrutura do autor. URL: ?reporterId=… (selecionado) ou ?relatorName=… (livre).
  const [relator, setRelator] = useState<PoliticianRef>(() => {
    const id = searchParams.get("reporterId");
    const name = searchParams.get("relatorName") ?? "";
    return { id: id || undefined, name };
  });
  const [relatorParty, setRelatorParty] = useState<string>(searchParams.get("relatorParty") ?? "");
  const [relatorUf, setRelatorUf] = useState<string>(searchParams.get("relatorUf") ?? "");
  const [relatorOrgao, setRelatorOrgao] = useState<string>(searchParams.get("relatorOrgao") ?? "");
  const [relatorFrom, setRelatorFrom] = useState<string>(searchParams.get("relatorFrom") ?? "");
  const [relatorTo, setRelatorTo] = useState<string>(searchParams.get("relatorTo") ?? "");
  const [tramitacaoExpression, setTramitacaoExpression] = useState<string>(
    searchParams.get("tramitacaoExpression") ?? ""
  );
  const [tramitacaoOrgao, setTramitacaoOrgao] = useState<string>(searchParams.get("tramitacaoOrgao") ?? "");
  const [tramitacaoFrom, setTramitacaoFrom] = useState<string>(searchParams.get("tramitacaoFrom") ?? "");
  const [tramitacaoTo, setTramitacaoTo] = useState<string>(searchParams.get("tramitacaoTo") ?? "");

  // ── Adicionais (mai/2026) — só na avançada ──
  const [lastMovementFrom, setLastMovementFrom] = useState<string>(searchParams.get("lastMovementFrom") ?? "");
  const [lastMovementTo, setLastMovementTo] = useState<string>(searchParams.get("lastMovementTo") ?? "");
  const [regime, setRegime] = useState<string>(searchParams.get("regime") ?? "");
  const [apreciacao, setApreciacao] = useState<string>(searchParams.get("apreciacao") ?? "");
  type TramitConjunto = "" | "principal" | "apensada" | "independente";
  const [tramitandoEmConjunto, setTramitandoEmConjunto] = useState<TramitConjunto>(
    (searchParams.get("tramitandoEmConjunto") as TramitConjunto) ?? ""
  );

  // ── Refs: regimes e apreciações servidas pelo backend ──
  const [regimes, setRegimes] = useState<string[]>([]);
  const [apreciacoes, setApreciacoes] = useState<{ value: string; label: string }[]>([]);

  const [copied, setCopied] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  // Busca manual: `appliedQs` é o snapshot dos filtros que foram efetivamente
  // aplicados no último clique em "Buscar" (ou a URL inicial). Pagination usa
  // este snapshot, então editar filtros em draft sem aplicar não afeta a página
  // que será buscada. `dirty` reativa o botão quando há mudanças não aplicadas.
  const [appliedQs, setAppliedQs] = useState<URLSearchParams>(() => {
    const qs = new URLSearchParams(searchParams.toString());
    qs.delete("page");
    return qs;
  });
  const [dirty, setDirty] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 400);
  // Debounce só o texto digitado. Quando o usuário seleciona uma sugestão,
  // `author.id` é setado imediatamente — não esperamos debounce pra isso.
  const debouncedAuthorName = useDebounce(author.name, 400);
  const effectiveAuthor: PoliticianRef = author.id
    ? { id: author.id, name: author.name }
    : { name: debouncedAuthorName };
  const debouncedAllWords = useDebounce(allWords, 400);
  const debouncedExactPhrase = useDebounce(exactPhrase, 400);
  const debouncedAnyWord = useDebounce(anyWord, 400);
  const debouncedNoneOfWords = useDebounce(noneOfWords, 400);
  const debouncedRelatorName = useDebounce(relator.name, 400);
  const effectiveRelator: PoliticianRef = relator.id
    ? { id: relator.id, name: relator.name }
    : { name: debouncedRelatorName };
  const debouncedTramitacaoExpression = useDebounce(tramitacaoExpression, 400);
  const debouncedNumero = useDebounce(numero, 400);
  const debouncedAno = useDebounce(ano, 400);

  // ── Validation ──
  const hasBasicFilters = !!(
    debouncedSearch ||
    typeIds.length ||
    debouncedNumero ||
    debouncedAno ||
    effectiveAuthor.id ||
    effectiveAuthor.name ||
    uf ||
    inTramitacao
  );
  const hasAdvancedFilters = !!(
    typeIds.length ||
    debouncedNumero ||
    debouncedAno ||
    recebidaNoOrgao ||
    presentedFrom ||
    presentedTo ||
    inTramitacao ||
    situationId ||
    noOrgaoAtual ||
    debouncedAllWords ||
    debouncedExactPhrase ||
    debouncedAnyWord ||
    debouncedNoneOfWords ||
    authorTypeId ||
    effectiveAuthor.id ||
    effectiveAuthor.name ||
    partyAcronym ||
    uf ||
    effectiveRelator.id ||
    effectiveRelator.name ||
    relatorParty ||
    relatorUf ||
    relatorOrgao ||
    relatorFrom ||
    relatorTo ||
    debouncedTramitacaoExpression ||
    tramitacaoOrgao ||
    tramitacaoFrom ||
    tramitacaoTo ||
    lastMovementFrom ||
    lastMovementTo ||
    regime ||
    apreciacao ||
    tramitandoEmConjunto
  );
  const canSearch = mode === "basic" ? hasBasicFilters : hasAdvancedFilters;

  // ── Author type "deputado" detection (habilita Partido/UF condicional) ──
  const selectedAuthorType = authorTypes.find((a) => a.id === authorTypeId);
  const isDeputadoAuthorType = useMemo(() => {
    if (!selectedAuthorType) return false;
    const name = (selectedAuthorType.name || "").toLowerCase();
    return DEPUTADO_AUTHOR_TYPE_HINTS.some((h) => name.includes(h));
  }, [selectedAuthorType]);

  const fetchReferences = useCallback(async () => {
    setLoadingRefs(true);
    try {
      const res = await GetAPI("/proposition/references", true);
      if (res.status === 200 && res.body) {
        setAllTypes(res.body.types ?? []);
        setTiposPrincipais(res.body.tiposPrincipais ?? res.body.types ?? []);
        setTiposAcessorios(res.body.tiposAcessorios ?? []);
        setThemes(res.body.themes ?? []);
        setSituations(res.body.situations ?? []);
        setAuthorTypes(res.body.authorTypes ?? []);
        setParties(res.body.parties ?? []);
        setUfs(res.body.ufs ?? []);
        setOrgaos(res.body.orgaos ?? []);
        setRegimes(res.body.regimes ?? []);
        setApreciacoes(res.body.apreciacoes ?? []);
      }
    } catch {
      setAllTypes([]);
      setTiposPrincipais([]);
      setTiposAcessorios([]);
      setThemes([]);
      setSituations([]);
      setAuthorTypes([]);
      setParties([]);
      setUfs([]);
      setOrgaos([]);
      setRegimes([]);
      setApreciacoes([]);
    } finally {
      setLoadingRefs(false);
    }
  }, [GetAPI]);

  const buildQueryString = useCallback(() => {
    const qs = new URLSearchParams();
    if (mode === "advanced") qs.set("mode", "advanced");
    qs.set("page", String(page));
    // Compartilhados
    if (debouncedSearch && mode === "basic") qs.set("q", debouncedSearch);
    if (typeIds.length) qs.set("typeIds", csv(typeIds));
    if (debouncedNumero) qs.set("numero", debouncedNumero);
    if (debouncedAno) qs.set("ano", debouncedAno);
    // Autor: se há ID selecionado via autocomplete, usa politicianId (match exato);
    // senão cai no authorName livre (ILIKE) — cobre autores institucionais.
    if (effectiveAuthor.id) qs.set("politicianId", effectiveAuthor.id);
    else if (effectiveAuthor.name) qs.set("authorName", effectiveAuthor.name);
    if (inTramitacao) qs.set("inTramitacao", inTramitacao);
    if (uf) qs.set("uf", uf);
    // Advanced only
    if (mode === "advanced") {
      if (themeId) qs.set("themeId", themeId);
      if (situationId) qs.set("situationId", situationId);
      if (presentedFrom) qs.set("presentedFrom", presentedFrom);
      if (presentedTo) qs.set("presentedTo", presentedTo);
      if (recebidaNoOrgao) qs.set("recebidaNoOrgao", recebidaNoOrgao);
      if (noOrgaoAtual) qs.set("noOrgaoAtual", noOrgaoAtual);
      if (debouncedAllWords) qs.set("allWords", debouncedAllWords);
      if (debouncedExactPhrase) qs.set("exactPhrase", debouncedExactPhrase);
      if (debouncedAnyWord) qs.set("anyWord", debouncedAnyWord);
      if (debouncedNoneOfWords) qs.set("noneOfWords", debouncedNoneOfWords);
      // Default no backend é ['ementa','indexacao']. Só envia quando diferente.
      const isDefaultSearchIn =
        searchIn.length === 2 &&
        searchIn.includes("ementa") &&
        searchIn.includes("indexacao");
      if (searchIn.length && !isDefaultSearchIn) qs.set("searchIn", csv(searchIn));
      if (authorTypeId) qs.set("authorTypeId", authorTypeId);
      if (isDeputadoAuthorType) {
        if (partyAcronym) qs.set("partyAcronym", partyAcronym);
      }
      // Relator: mesma lógica do autor — ID exato quando selecionado.
      if (effectiveRelator.id) qs.set("reporterId", effectiveRelator.id);
      else if (effectiveRelator.name) qs.set("relatorName", effectiveRelator.name);
      if (relatorParty) qs.set("relatorParty", relatorParty);
      if (relatorUf) qs.set("relatorUf", relatorUf);
      if (relatorOrgao) qs.set("relatorOrgao", relatorOrgao);
      if (relatorFrom) qs.set("relatorFrom", relatorFrom);
      if (relatorTo) qs.set("relatorTo", relatorTo);
      if (debouncedTramitacaoExpression) qs.set("tramitacaoExpression", debouncedTramitacaoExpression);
      if (tramitacaoOrgao) qs.set("tramitacaoOrgao", tramitacaoOrgao);
      if (tramitacaoFrom) qs.set("tramitacaoFrom", tramitacaoFrom);
      if (tramitacaoTo) qs.set("tramitacaoTo", tramitacaoTo);
      if (lastMovementFrom) qs.set("lastMovementFrom", lastMovementFrom);
      if (lastMovementTo) qs.set("lastMovementTo", lastMovementTo);
      if (regime) qs.set("regime", regime);
      if (apreciacao) qs.set("apreciacao", apreciacao);
      if (tramitandoEmConjunto) qs.set("tramitandoEmConjunto", tramitandoEmConjunto);
      if (hasAttached) qs.set("hasAttached", "true");
      if (hasAmendment) qs.set("hasAmendment", "true");
      if (hasOpinion) qs.set("hasOpinion", "true");
      if (hasRequirement) qs.set("hasRequirement", "true");
      if (hasDispatch) qs.set("hasDispatch", "true");
    }
    return qs;
  }, [
    mode,
    page,
    debouncedSearch,
    typeIds,
    debouncedNumero,
    debouncedAno,
    effectiveAuthor.id,
    effectiveAuthor.name,
    inTramitacao,
    uf,
    themeId,
    situationId,
    presentedFrom,
    presentedTo,
    recebidaNoOrgao,
    noOrgaoAtual,
    debouncedAllWords,
    debouncedExactPhrase,
    debouncedAnyWord,
    debouncedNoneOfWords,
    searchIn,
    authorTypeId,
    isDeputadoAuthorType,
    partyAcronym,
    effectiveRelator.id,
    effectiveRelator.name,
    relatorParty,
    relatorUf,
    relatorOrgao,
    relatorFrom,
    relatorTo,
    debouncedTramitacaoExpression,
    tramitacaoOrgao,
    tramitacaoFrom,
    tramitacaoTo,
    lastMovementFrom,
    lastMovementTo,
    regime,
    apreciacao,
    tramitandoEmConjunto,
    hasAttached,
    hasAmendment,
    hasOpinion,
    hasRequirement,
    hasDispatch,
  ]);

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  // Ancora da lista. Usada para fazer smooth-scroll após o usuário clicar
  // "Buscar" ou paginar — evita ter que rolar a tela manualmente. Não dispara
  // no fetch inicial (URL compartilhada ou primeira visita) para não confundir
  // quem chegou na página querendo ler o formulário primeiro.
  const resultsRef = useRef<HTMLDivElement>(null);
  const isInitialFetchRef = useRef(true);

  // Fetch dispara quando o snapshot aplicado muda (Buscar) ou ao paginar.
  // Sem filtros, devolve as proposições mais recentes (ordem cronológica decrescente do backend).
  useEffect(() => {
    let aborted = false;
    const run = async () => {
      setLoading(true);
      const wasInitial = isInitialFetchRef.current;
      try {
        const params = new URLSearchParams(appliedQs);
        params.set("page", String(page));
        const res = await GetAPI(`/proposition?${params.toString()}`, true);
        if (aborted) return;
        if (res.status === 200 && res.body) {
          setPropositions(res.body.propositions ?? []);
          setPages(res.body.pages ?? 0);
        }
      } catch {
        if (!aborted) {
          setPropositions([]);
          setPages(0);
        }
      } finally {
        if (!aborted) {
          setLoading(false);
          isInitialFetchRef.current = false;
          // Espera o DOM atualizar com a nova lista antes de rolar.
          if (!wasInitial) {
            requestAnimationFrame(() => {
              resultsRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            });
          }
        }
      }
    };
    run();
    return () => {
      aborted = true;
    };
  }, [appliedQs, page, GetAPI]);

  // Marca filtros como "sujos" quando o usuário edita algo após o último Buscar.
  // Usa ref para pular o render inicial (URL já carrega o estado aplicado).
  const isFirstFilterRender = useRef(true);
  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }
    setDirty(true);
  }, [
    mode,
    debouncedSearch,
    typeIds,
    debouncedNumero,
    debouncedAno,
    effectiveAuthor.id,
    effectiveAuthor.name,
    inTramitacao,
    uf,
    themeId,
    situationId,
    presentedFrom,
    presentedTo,
    recebidaNoOrgao,
    noOrgaoAtual,
    debouncedAllWords,
    debouncedExactPhrase,
    debouncedAnyWord,
    debouncedNoneOfWords,
    searchIn,
    authorTypeId,
    partyAcronym,
    effectiveRelator.id,
    effectiveRelator.name,
    relatorParty,
    relatorUf,
    relatorOrgao,
    relatorFrom,
    relatorTo,
    debouncedTramitacaoExpression,
    tramitacaoOrgao,
    tramitacaoFrom,
    tramitacaoTo,
    lastMovementFrom,
    lastMovementTo,
    regime,
    apreciacao,
    tramitandoEmConjunto,
    hasAttached,
    hasAmendment,
    hasOpinion,
    hasRequirement,
    hasDispatch,
  ]);

  // Aplica os filtros atuais: snapshot dos filtros vira o estado "aplicado"
  // e dispara a busca via efeito. Reseta para página 1 sempre.
  const handleSearch = useCallback(() => {
    if (!canSearch) return;
    const qs = buildQueryString();
    qs.delete("page");
    setAppliedQs(qs);
    setPage(1);
    setDirty(false);
  }, [canSearch, buildQueryString]);

  // Limpa Partido quando authorType deixa de ser deputado
  useEffect(() => {
    if (!isDeputadoAuthorType && partyAcronym) {
      setPartyAcronym("");
    }
  }, [isDeputadoAuthorType, partyAcronym]);

  // Serializa o estado APLICADO na URL. Draft não vaza.
  useEffect(() => {
    const qs = new URLSearchParams(appliedQs);
    if (page > 1) qs.set("page", String(page));
    const next = qs.toString();
    router.replace(`/proposicoes${next ? `?${next}` : ""}`, { scroll: false });
  }, [appliedQs, page, router]);

  // Carrega pesquisas salvas do localStorage uma vez na montagem
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedSearch[];
        if (Array.isArray(parsed)) setSavedSearches(parsed);
      }
    } catch {
      /* ignora storage indisponível */
    }
  }, []);

  const persistSaved = (next: SavedSearch[]) => {
    setSavedSearches(next);
    try {
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {
      /* ignora quota */
    }
  };

  const handlePropositionClick = (id: string) => {
    router.push(`/proposicoes/${id}`);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setTypeIds([]);
    setThemeId("");
    setSituationId("");
    setPresentedFrom("");
    setPresentedTo("");
    setPartyAcronym("");
    setUf("");
    setAuthorTypeId("");
    setHasAttached(false);
    setHasAmendment(false);
    setHasOpinion(false);
    setHasRequirement(false);
    setHasDispatch(false);
    setNumero("");
    setAno("");
    setAuthor({ id: undefined, name: "" });
    setInTramitacao("");
    setRecebidaNoOrgao("");
    setNoOrgaoAtual("");
    setAllWords("");
    setExactPhrase("");
    setAnyWord("");
    setNoneOfWords("");
    setSearchIn(["ementa", "indexacao"]);
    setRelator({ id: undefined, name: "" });
    setRelatorParty("");
    setRelatorUf("");
    setRelatorOrgao("");
    setRelatorFrom("");
    setRelatorTo("");
    setTramitacaoExpression("");
    setTramitacaoOrgao("");
    setTramitacaoFrom("");
    setTramitacaoTo("");
    setLastMovementFrom("");
    setLastMovementTo("");
    setRegime("");
    setApreciacao("");
    setTramitandoEmConjunto("");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  const handleSaveSearch = () => {
    if (!canSearch) return;
    const suggested = buildSearchLabel({
      typeNames: typeIds
        .map((id) => allTypes.find((t) => t.id === id)?.acronym || allTypes.find((t) => t.id === id)?.name)
        .filter((v): v is string => Boolean(v)),
      themeName: themes.find((t) => t.id === themeId)?.name,
      situationName: situations.find((s) => s.id === situationId)?.name,
      partyAcronym,
      uf,
      query: searchTerm,
    });
    const name = window.prompt("Nome da pesquisa:", suggested);
    if (!name) return;
    const query = window.location.search.replace(/^\?/, "");
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const next: SavedSearch[] = [
      { id, name: name.trim(), query, createdAt: new Date().toISOString() },
      ...savedSearches,
    ].slice(0, 30);
    persistSaved(next);
  };

  const handleApplySaved = (s: SavedSearch) => {
    setShowSaved(false);
    if (typeof window !== "undefined") {
      window.location.assign(`/proposicoes${s.query ? `?${s.query}` : ""}`);
    }
  };

  const handleDeleteSaved = (id: string) => {
    persistSaved(savedSearches.filter((s) => s.id !== id));
  };

  const handleExportCsv = () => {
    if (!propositions.length) return;
    const header = [
      "Identificador",
      "Tipo",
      "Número",
      "Ano",
      "Apresentação",
      "Situação",
      "Regime",
      "Última ação",
      "Autor principal",
      "Ementa",
      "URL",
    ];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v).replace(/\r?\n/g, " ").replace(/"/g, '""');
      return `"${s}"`;
    };
    const rows = propositions.map((p) => [
      `${p.typeAcronym} ${p.number}/${p.year}`,
      p.type?.name,
      p.number,
      p.year,
      p.presentationDate ? new Date(p.presentationDate).toLocaleDateString("pt-BR") : "",
      p.situation?.name ?? p.situationDescription ?? "",
      p.regime ?? "",
      p.lastMovementDate ? new Date(p.lastMovementDate).toLocaleDateString("pt-BR") : "",
      p.authors?.[0]?.name ?? "",
      p.description ?? "",
      p.fullPropositionUrl ?? "",
    ]);
    const csvStr = [header, ...rows].map((r) => r.map(escape).join(";")).join("\r\n");
    const blob = new Blob([`﻿${csvStr}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `proposicoes_${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const typeAcronymById = useMemo(() => {
    const map = new Map<string, string>();
    allTypes.forEach((t) => map.set(t.id, t.acronym || t.name));
    return map;
  }, [allTypes]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full font-sans text-[#1a1d1f] pb-20">
      {/* ── HERO ── */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#5a8a42] via-secondary to-[#8bb574] p-8 text-white shadow-xl md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <FileText size={22} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Proposições</h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            Explore, filtre e acompanhe matérias legislativas com visão processual, documental e
            analítica.
          </p>
        </div>
      </div>

      {/* ── TABS + AÇÕES ── */}
      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as Mode)}
        className="mb-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="basic">Pesquisa Básica</TabsTrigger>
            <TabsTrigger value="advanced">Pesquisa Avançada</TabsTrigger>
          </TabsList>
          <ActionBar
            canSearch={canSearch}
            dirty={dirty}
            loading={loading}
            hasResults={propositions.length > 0}
            copied={copied}
            savedSearches={savedSearches}
            showSaved={showSaved}
            onSearch={handleSearch}
            onToggleSaved={() => setShowSaved((v) => !v)}
            onApplySaved={handleApplySaved}
            onDeleteSaved={handleDeleteSaved}
            onClearAll={clearAllFilters}
            onShare={handleShare}
            onExportCsv={handleExportCsv}
            onSave={handleSaveSearch}
          />
        </div>

        {/* ── PESQUISA BÁSICA ── */}
        <TabsContent value="basic">
          <Card className="border-gray-100 p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FieldLabel>Assunto</FieldLabel>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por número, ementa, autor, relator ou palavra-chave"
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-xs text-gray-900 transition-colors placeholder:text-gray-400 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Tipos mais pesquisados</FieldLabel>
                <MultiSelect
                  values={typeIds.filter((id) => tiposPrincipais.some((t) => t.id === id))}
                  onValuesChange={(next) => {
                    // Substitui só a porção "principal" no array final
                    const acessorios = typeIds.filter((id) => !tiposPrincipais.some((t) => t.id === id));
                    setTypeIds([...next, ...acessorios]);
                  }}
                  options={tiposPrincipais.map((t) => ({ value: t.id, label: t.acronym || t.name }))}
                  placeholder="PEC, PL, MPV…"
                />
              </div>
              <div>
                <FieldLabel>Outros tipos (acessórias)</FieldLabel>
                <MultiSelect
                  values={typeIds.filter((id) => tiposAcessorios.some((t) => t.id === id))}
                  onValuesChange={(next) => {
                    const principais = typeIds.filter((id) => tiposPrincipais.some((t) => t.id === id));
                    setTypeIds([...principais, ...next]);
                  }}
                  options={tiposAcessorios.map((t) => ({ value: t.id, label: t.acronym || t.name }))}
                  placeholder="ADD, ANEXO, APJ…"
                />
              </div>

              <div>
                <FieldLabel>Número</FieldLabel>
                <input
                  type="text"
                  inputMode="numeric"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value.replace(/\D/g, ""))}
                  placeholder="Ex.: 5490"
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                />
              </div>
              <div>
                <FieldLabel>Ano</FieldLabel>
                <input
                  type="text"
                  inputMode="numeric"
                  value={ano}
                  onChange={(e) => setAno(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="Ex.: 2024"
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                />
              </div>

              <div>
                <FieldLabel>Autor</FieldLabel>
                <PoliticianAutocomplete value={author} onChange={setAuthor} />
              </div>
              <div>
                <FieldLabel>UF</FieldLabel>
                <SearchableSelect
                  value={uf}
                  onValueChange={setUf}
                  options={ufs.map((u) => ({ value: u, label: u }))}
                  placeholder="Todas as UFs"
                  searchPlaceholder="Buscar UF..."
                  className="bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <FieldLabel>Em tramitação</FieldLabel>
                <RadioGroup<Tramitacao>
                  value={inTramitacao}
                  onValueChange={setInTramitacao}
                  options={TRAMITACAO_OPTIONS}
                />
              </div>
            </div>
            <ValidationHint canSearch={canSearch} mode="basic" />
          </Card>
        </TabsContent>

        {/* ── PESQUISA AVANÇADA ── */}
        <TabsContent value="advanced">
          <div className="space-y-3">
            {/* IDENTIFICAÇÃO */}
            <Card className="border-gray-100 p-5 shadow-sm">
              <BlockTitle>Identificação</BlockTitle>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Tipos mais pesquisados</FieldLabel>
                  <MultiSelect
                    values={typeIds.filter((id) => tiposPrincipais.some((t) => t.id === id))}
                    onValuesChange={(next) => {
                      const acessorios = typeIds.filter((id) => !tiposPrincipais.some((t) => t.id === id));
                      setTypeIds([...next, ...acessorios]);
                    }}
                    options={tiposPrincipais.map((t) => ({ value: t.id, label: t.acronym || t.name }))}
                    placeholder="PEC, PL, MPV…"
                  />
                </div>
                <div>
                  <FieldLabel>Outros tipos (acessórias)</FieldLabel>
                  <MultiSelect
                    values={typeIds.filter((id) => tiposAcessorios.some((t) => t.id === id))}
                    onValuesChange={(next) => {
                      const principais = typeIds.filter((id) => tiposPrincipais.some((t) => t.id === id));
                      setTypeIds([...principais, ...next]);
                    }}
                    options={tiposAcessorios.map((t) => ({ value: t.id, label: t.acronym || t.name }))}
                    placeholder="ADD, ANEXO, APJ…"
                  />
                </div>
                <div>
                  <FieldLabel>Número</FieldLabel>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value.replace(/\D/g, ""))}
                    placeholder="Ex.: 5490"
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <FieldLabel>Ano</FieldLabel>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={ano}
                    onChange={(e) => setAno(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="Ex.: 2024"
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <FieldLabel>Recebida no órgão</FieldLabel>
                  <SearchableSelect
                    value={recebidaNoOrgao}
                    onValueChange={setRecebidaNoOrgao}
                    options={orgaos.map((o) => ({ value: o, label: o }))}
                    placeholder="Todos os órgãos"
                    searchPlaceholder="Buscar órgão..."
                    className="bg-white"
                  />
                </div>
                <div>
                  <FieldLabel>Data de apresentação</FieldLabel>
                  <DateRangePicker
                    from={presentedFrom}
                    to={presentedTo}
                    onFromChange={setPresentedFrom}
                    onToChange={setPresentedTo}
                  />
                </div>
                <div>
                  <FieldLabel>Última movimentação</FieldLabel>
                  <DateRangePicker
                    from={lastMovementFrom}
                    to={lastMovementTo}
                    onFromChange={setLastMovementFrom}
                    onToChange={setLastMovementTo}
                  />
                </div>
              </div>
            </Card>

            {/* SITUAÇÃO */}
            <Card className="border-gray-100 p-5 shadow-sm">
              <BlockTitle>Situação</BlockTitle>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <FieldLabel>Em tramitação</FieldLabel>
                  <RadioGroup<Tramitacao>
                    value={inTramitacao}
                    onValueChange={setInTramitacao}
                    options={TRAMITACAO_OPTIONS}
                  />
                </div>
                <div>
                  <FieldLabel>Situação atual</FieldLabel>
                  <SearchableSelect
                    value={situationId}
                    onValueChange={setSituationId}
                    options={situations.map((s) => ({ value: s.id, label: s.name }))}
                    placeholder="Todas as situações"
                    searchPlaceholder="Buscar situação..."
                    className="bg-white"
                  />
                </div>
                <div>
                  <FieldLabel>No órgão</FieldLabel>
                  <SearchableSelect
                    value={noOrgaoAtual}
                    onValueChange={setNoOrgaoAtual}
                    options={orgaos.map((o) => ({ value: o, label: o }))}
                    placeholder="Todos os órgãos"
                    searchPlaceholder="Buscar órgão..."
                    className="bg-white"
                  />
                </div>
                <div>
                  <FieldLabel>Regime</FieldLabel>
                  <SearchableSelect
                    value={regime}
                    onValueChange={setRegime}
                    options={regimes.map((r) => ({ value: r, label: r }))}
                    placeholder="Todos os regimes"
                    searchPlaceholder="Buscar regime..."
                    className="bg-white"
                  />
                </div>
                <div>
                  <FieldLabel>Apreciação</FieldLabel>
                  <SearchableSelect
                    value={apreciacao}
                    onValueChange={setApreciacao}
                    options={apreciacoes}
                    placeholder="Todas as apreciações"
                    searchPlaceholder="Buscar apreciação..."
                    className="bg-white"
                  />
                </div>
                <div>
                  <FieldLabel>Tramitação conjunta</FieldLabel>
                  <RadioGroup<TramitConjunto>
                    value={tramitandoEmConjunto}
                    onValueChange={setTramitandoEmConjunto}
                    options={[
                      { value: "", label: "Todas" },
                      { value: "principal", label: "Principal" },
                      { value: "apensada", label: "Apensada" },
                      { value: "independente", label: "Independente" },
                    ]}
                  />
                </div>
              </div>
            </Card>

            {/* ASSUNTO (busca textual avançada) */}
            <Card className="border-gray-100 p-5 shadow-sm">
              <BlockTitle>Assunto</BlockTitle>
              <p className="mb-3 text-[11px] text-gray-500">
                Use <code className="rounded bg-gray-100 px-1 font-mono">*</code> para prefixo (ex.:{" "}
                <code className="rounded bg-gray-100 px-1 font-mono">deficie*</code> acha deficiência, deficiente, deficientes) e
                aspas para frase exata (ex.:{" "}
                <code className="rounded bg-gray-100 px-1 font-mono">&quot;pessoa com deficiência&quot;</code>).
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Todas estas palavras</FieldLabel>
                  <input
                    type="text"
                    value={allWords}
                    onChange={(e) => setAllWords(e.target.value)}
                    placeholder="palavra1 palavra2 ..."
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <FieldLabel>Exatamente esta palavra ou expressão</FieldLabel>
                  <input
                    type="text"
                    value={exactPhrase}
                    onChange={(e) => setExactPhrase(e.target.value)}
                    placeholder="frase exata"
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <FieldLabel>Qualquer uma destas palavras</FieldLabel>
                  <input
                    type="text"
                    value={anyWord}
                    onChange={(e) => setAnyWord(e.target.value)}
                    placeholder="palavra1 palavra2 ..."
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <FieldLabel>Nenhuma destas palavras</FieldLabel>
                  <input
                    type="text"
                    value={noneOfWords}
                    onChange={(e) => setNoneOfWords(e.target.value)}
                    placeholder="palavra1 palavra2 ..."
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>Onde procurar?</FieldLabel>
                  <div className="flex flex-wrap items-center gap-2">
                    <CheckPill
                      label="Ementa"
                      checked={searchIn.includes("ementa")}
                      onToggle={() => toggleSearchIn(searchIn, "ementa", setSearchIn)}
                    />
                    <CheckPill
                      label="Indexação"
                      checked={searchIn.includes("indexacao")}
                      onToggle={() => toggleSearchIn(searchIn, "indexacao", setSearchIn)}
                    />
                    <CheckPill
                      label="Inteiro teor"
                      checked={searchIn.includes("inteiroTeor")}
                      onToggle={() => toggleSearchIn(searchIn, "inteiroTeor", setSearchIn)}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-500">
                    Inteiro teor cobre apenas proposições cujo PDF já foi
                    processado (texto pesquisável). Algumas proposições antigas
                    ou de autoria externa podem não estar indexadas.
                  </p>
                </div>
              </div>
            </Card>

            {/* AUTOR */}
            <Card className="border-gray-100 p-5 shadow-sm">
              <BlockTitle>Autor</BlockTitle>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <FieldLabel>Tipo</FieldLabel>
                  <SearchableSelect
                    value={authorTypeId}
                    onValueChange={setAuthorTypeId}
                    options={authorTypes.map((a) => ({ value: a.id, label: a.name }))}
                    placeholder="Todos os tipos"
                    searchPlaceholder="Buscar tipo..."
                    className="bg-white"
                  />
                </div>
                <div>
                  <FieldLabel>Autor</FieldLabel>
                  <PoliticianAutocomplete value={author} onChange={setAuthor} placeholder="Nome do autor" />
                </div>
                <div>
                  <FieldLabel>
                    Partido do autor
                    {!isDeputadoAuthorType && (
                      <span className="ml-1 text-[10px] font-normal text-gray-400">(só p/ deputados)</span>
                    )}
                  </FieldLabel>
                  <SearchableSelect
                    value={partyAcronym}
                    onValueChange={setPartyAcronym}
                    options={parties.map((p) => ({ value: p, label: p }))}
                    placeholder="Todos os partidos"
                    searchPlaceholder="Buscar partido..."
                    className="bg-white"
                    disabled={!isDeputadoAuthorType}
                  />
                </div>
                <div>
                  <FieldLabel>UF do autor</FieldLabel>
                  <SearchableSelect
                    value={uf}
                    onValueChange={setUf}
                    options={ufs.map((u) => ({ value: u, label: u }))}
                    placeholder="Todas as UFs"
                    searchPlaceholder="Buscar UF..."
                    className="bg-white"
                  />
                </div>
              </div>
            </Card>

            {/* RELATOR */}
            <Card className="border-gray-100 p-5 shadow-sm">
              <BlockTitle>Relator</BlockTitle>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <FieldLabel>Nome do relator</FieldLabel>
                  <PoliticianAutocomplete
                    value={relator}
                    onChange={setRelator}
                    placeholder="Nome do relator"
                    noSuggestionsHint="Nenhum deputado encontrado. Pode digitar livremente para busca por nome."
                  />
                </div>
                <div>
                  <FieldLabel>Partido do relator</FieldLabel>
                  <SearchableSelect
                    value={relatorParty}
                    onValueChange={setRelatorParty}
                    options={parties.map((p) => ({ value: p, label: p }))}
                    placeholder="Todos os partidos"
                    searchPlaceholder="Buscar partido..."
                    className="bg-white"
                  />
                </div>
                <div>
                  <FieldLabel>UF do relator</FieldLabel>
                  <SearchableSelect
                    value={relatorUf}
                    onValueChange={setRelatorUf}
                    options={ufs.map((u) => ({ value: u, label: u }))}
                    placeholder="Todas as UFs"
                    searchPlaceholder="Buscar UF..."
                    className="bg-white"
                  />
                </div>
                <div>
                  <FieldLabel>No órgão</FieldLabel>
                  <SearchableSelect
                    value={relatorOrgao}
                    onValueChange={setRelatorOrgao}
                    options={orgaos.map((o) => ({ value: o, label: o }))}
                    placeholder="Todos os órgãos"
                    searchPlaceholder="Buscar órgão..."
                    className="bg-white"
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-4">
                  <FieldLabel>Período</FieldLabel>
                  <DateRangePicker
                    from={relatorFrom}
                    to={relatorTo}
                    onFromChange={setRelatorFrom}
                    onToChange={setRelatorTo}
                  />
                </div>
              </div>
            </Card>

            {/* TRAMITAÇÃO */}
            <Card className="border-gray-100 p-5 shadow-sm">
              <BlockTitle>Tramitação</BlockTitle>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Expressão textual</FieldLabel>
                  <input
                    type="text"
                    value={tramitacaoExpression}
                    onChange={(e) => setTramitacaoExpression(e.target.value)}
                    placeholder='ex.: arquivad* and 105, "veto total" or "veto parcial"'
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                  <p className="mt-1 text-[10px] text-gray-500">
                    Use <code className="rounded bg-gray-100 px-1 font-mono">and</code>,{" "}
                    <code className="rounded bg-gray-100 px-1 font-mono">or</code>,{" "}
                    <code className="rounded bg-gray-100 px-1 font-mono">not</code> para combinar termos,{" "}
                    <code className="rounded bg-gray-100 px-1 font-mono">*</code> para prefixo e aspas para frase exata.
                  </p>
                </div>
                <div>
                  <FieldLabel>No órgão</FieldLabel>
                  <SearchableSelect
                    value={tramitacaoOrgao}
                    onValueChange={setTramitacaoOrgao}
                    options={orgaos.map((o) => ({ value: o, label: o }))}
                    placeholder="Todos os órgãos"
                    searchPlaceholder="Buscar órgão..."
                    className="bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>Período</FieldLabel>
                  <DateRangePicker
                    from={tramitacaoFrom}
                    to={tramitacaoTo}
                    onFromChange={setTramitacaoFrom}
                    onToChange={setTramitacaoTo}
                  />
                </div>
              </div>
            </Card>

            <ValidationHint canSearch={canSearch} mode="advanced" />

            {/* Cópia da barra de ações no rodapé do form — evita scroll de volta
                ao topo após preencher filtros longos da Pesquisa Avançada. */}
            <Card className="border-gray-100 p-4 shadow-sm">
              <ActionBar
                canSearch={canSearch}
                dirty={dirty}
                loading={loading}
                hasResults={propositions.length > 0}
                copied={copied}
                savedSearches={savedSearches}
                showSaved={showSaved}
                onSearch={handleSearch}
                onToggleSaved={() => setShowSaved((v) => !v)}
                onApplySaved={handleApplySaved}
                onDeleteSaved={handleDeleteSaved}
                onClearAll={clearAllFilters}
                onShare={handleShare}
                onExportCsv={handleExportCsv}
                onSave={handleSaveSearch}
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── CHIPS de filtros ativos ── */}
      <FilterChips
        chips={buildChips({
          mode,
          searchTerm: debouncedSearch,
          typeIds,
          typeAcronymById,
          themeId,
          themeName: themes.find((t) => t.id === themeId)?.name,
          situationId,
          situationName: situations.find((s) => s.id === situationId)?.name,
          presentedFrom,
          presentedTo,
          partyAcronym,
          uf,
          authorTypeId,
          authorTypeName: authorTypes.find((a) => a.id === authorTypeId)?.name,
          hasAttached,
          hasAmendment,
          hasOpinion,
          hasRequirement,
          hasDispatch,
          numero: debouncedNumero,
          ano: debouncedAno,
          author: effectiveAuthor,
          inTramitacao,
          recebidaNoOrgao,
          noOrgaoAtual,
          allWords: debouncedAllWords,
          exactPhrase: debouncedExactPhrase,
          anyWord: debouncedAnyWord,
          noneOfWords: debouncedNoneOfWords,
          relator: effectiveRelator,
          relatorParty,
          relatorUf,
          relatorOrgao,
          relatorFrom,
          relatorTo,
          tramitacaoExpression: debouncedTramitacaoExpression,
          tramitacaoOrgao,
          tramitacaoFrom,
          tramitacaoTo,
          lastMovementFrom,
          lastMovementTo,
          regime,
          apreciacao,
          apreciacaoLabel: apreciacoes.find((a) => a.value === apreciacao)?.label,
          tramitandoEmConjunto,
        })}
        onClear={{
          q: () => setSearchTerm(""),
          typeId: (id) => setTypeIds(typeIds.filter((t) => t !== id)),
          themeId: () => setThemeId(""),
          situationId: () => setSituationId(""),
          dates: () => {
            setPresentedFrom("");
            setPresentedTo("");
          },
          partyAcronym: () => setPartyAcronym(""),
          uf: () => setUf(""),
          authorTypeId: () => setAuthorTypeId(""),
          hasAttached: () => setHasAttached(false),
          hasAmendment: () => setHasAmendment(false),
          hasOpinion: () => setHasOpinion(false),
          hasRequirement: () => setHasRequirement(false),
          hasDispatch: () => setHasDispatch(false),
          numero: () => setNumero(""),
          ano: () => setAno(""),
          authorName: () => setAuthor({ id: undefined, name: "" }),
          inTramitacao: () => setInTramitacao(""),
          recebidaNoOrgao: () => setRecebidaNoOrgao(""),
          noOrgaoAtual: () => setNoOrgaoAtual(""),
          allWords: () => setAllWords(""),
          exactPhrase: () => setExactPhrase(""),
          anyWord: () => setAnyWord(""),
          noneOfWords: () => setNoneOfWords(""),
          relatorName: () => setRelator({ id: undefined, name: "" }),
          relatorParty: () => setRelatorParty(""),
          relatorUf: () => setRelatorUf(""),
          relatorOrgao: () => setRelatorOrgao(""),
          relatorPeriod: () => {
            setRelatorFrom("");
            setRelatorTo("");
          },
          tramitacaoExpression: () => setTramitacaoExpression(""),
          tramitacaoOrgao: () => setTramitacaoOrgao(""),
          tramitacaoPeriod: () => {
            setTramitacaoFrom("");
            setTramitacaoTo("");
          },
          lastMovementPeriod: () => {
            setLastMovementFrom("");
            setLastMovementTo("");
          },
          regime: () => setRegime(""),
          apreciacao: () => setApreciacao(""),
          tramitandoEmConjunto: () => setTramitandoEmConjunto(""),
        }}
      />

      {/* ── HEADER DE RESULTADOS ── */}
      {/* Ancora para o smooth-scroll após Buscar/paginar — fica fora do
          conditional render para existir mesmo durante o loading. */}
      <div ref={resultsRef} aria-hidden className="scroll-mt-4" />
      {!loading && propositions.length > 0 && (
        <div className="mb-5 mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-[#1a1d1f]">{propositions.length}</span> proposições listadas
            {pages > 1 && (
              <span>
                {" · Página "}
                <span className="font-semibold text-[#1a1d1f]">{page}</span>
                {" de "}
                {pages}
              </span>
            )}
          </p>
        </div>
      )}

      {/* ── LISTA ── */}
      {loading || loadingRefs ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 w-3/4 rounded-lg bg-gray-200" />
                  <div className="h-3 w-1/2 rounded-lg bg-gray-100" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full rounded-lg bg-gray-100" />
                    <div className="h-3 w-5/6 rounded-lg bg-gray-100" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : propositions.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {propositions.map((prop) => (
            <PropositionCard key={prop.id} prop={prop} onClick={() => handlePropositionClick(prop.id)} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            variant="no-occurrence"
            title="Nenhuma proposição para esses filtros"
            message={
              searchIn.includes("inteiroTeor")
                ? "Tente afrouxar os filtros ou alterar os termos. Algumas proposições antigas ou de autoria externa podem não ter inteiro teor pesquisável."
                : "Tente afrouxar os filtros ou alterar os termos."
            }
            action={
              <button
                type="button"
                onClick={clearAllFilters}
                className="bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-white transition-colors"
              >
                <X size={13} /> Limpar filtros
              </button>
            }
          />
        </div>
      )}

      {/* ── PAGINAÇÃO ── */}
      {pages > 1 && !loading && propositions.length > 0 && (
        <div className="mt-8 flex justify-center pb-12">
          <CustomPagination pages={pages} currentPage={page} setCurrentPage={setPage} />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────── */

function toggleSearchIn(
  current: SearchInField[],
  field: SearchInField,
  setter: (v: SearchInField[]) => void
) {
  if (current.includes(field)) {
    const next = current.filter((f) => f !== field);
    // Não permitir lista vazia — exige pelo menos um campo
    if (next.length === 0) return;
    setter(next);
  } else {
    setter([...current, field]);
  }
}

function buildSearchLabel(args: {
  typeNames?: string[];
  themeName?: string;
  situationName?: string;
  partyAcronym?: string;
  uf?: string;
  query?: string;
}) {
  const parts: string[] = [];
  if (args.query) parts.push(`"${args.query}"`);
  if (args.typeNames && args.typeNames.length) parts.push(args.typeNames.join("/"));
  if (args.themeName) parts.push(args.themeName);
  if (args.situationName) parts.push(args.situationName);
  if (args.partyAcronym) parts.push(args.partyAcronym);
  if (args.uf) parts.push(args.uf);
  return parts.length ? parts.join(" · ") : "Minha pesquisa";
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-[11px] font-semibold text-gray-600">{children}</label>;
}

function BlockTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[11px] font-bold uppercase tracking-wide text-gray-500">{children}</p>
  );
}

function ValidationHint(_props: { canSearch: boolean; mode: Mode }) {
  // Mantido só para preservar a assinatura — sem filtros agora carregamos as proposições mais recentes.
  return null;
}

function CheckPill({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        checked
          ? "border-secondary/30 bg-secondary/10 text-secondary"
          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${checked ? "bg-secondary" : "bg-gray-300"}`}
      />
      {label}
    </button>
  );
}

function CounterRow({ counters }: { counters: Counters }) {
  const items: { label: string; value: number }[] = [
    { label: "tramitações", value: counters.tramitacoes },
    { label: "autores", value: counters.autores },
    { label: "relacionadas", value: counters.relacionadas },
    { label: "eventos", value: counters.eventos },
  ];
  const visible = items.filter((i) => i.value > 0);
  if (visible.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-gray-50 pt-3">
      {visible.map((i) => (
        <span
          key={i.label}
          className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
        >
          <span className="font-bold text-gray-800">{i.value}</span>
          {i.label}
        </span>
      ))}
    </div>
  );
}

function buildChips(args: {
  mode: Mode;
  searchTerm: string;
  typeIds: string[];
  typeAcronymById: Map<string, string>;
  themeId: string;
  themeName?: string;
  situationId: string;
  situationName?: string;
  presentedFrom: string;
  presentedTo: string;
  partyAcronym: string;
  uf: string;
  authorTypeId: string;
  authorTypeName?: string;
  hasAttached: boolean;
  hasAmendment: boolean;
  hasOpinion: boolean;
  hasRequirement: boolean;
  hasDispatch: boolean;
  numero: string;
  ano: string;
  author: PoliticianRef;
  inTramitacao: Tramitacao;
  recebidaNoOrgao: string;
  noOrgaoAtual: string;
  allWords: string;
  exactPhrase: string;
  anyWord: string;
  noneOfWords: string;
  relator: PoliticianRef;
  relatorParty: string;
  relatorUf: string;
  relatorOrgao: string;
  relatorFrom: string;
  relatorTo: string;
  tramitacaoExpression: string;
  tramitacaoOrgao: string;
  tramitacaoFrom: string;
  tramitacaoTo: string;
  lastMovementFrom: string;
  lastMovementTo: string;
  regime: string;
  apreciacao: string;
  apreciacaoLabel?: string;
  tramitandoEmConjunto: "" | "principal" | "apensada" | "independente";
}): { label: string; key: string; section: string }[] {
  const chips: { label: string; key: string; section: string }[] = [];
  if (args.searchTerm && args.mode === "basic")
    chips.push({ section: "q", key: "q", label: `"${args.searchTerm}"` });
  args.typeIds.forEach((id) => {
    chips.push({
      section: "typeId",
      key: `typeId:${id}`,
      label: args.typeAcronymById.get(id) ?? id,
    });
  });
  if (args.numero) chips.push({ section: "numero", key: "numero", label: `Nº ${args.numero}` });
  if (args.ano) chips.push({ section: "ano", key: "ano", label: `Ano ${args.ano}` });
  if (args.author.id || args.author.name)
    chips.push({
      section: "authorName",
      key: "authorName",
      // ID selecionado mostra só o nome (já é exato); texto livre mostra o que digitou.
      label: `Autor: ${args.author.name || "selecionado"}`,
    });
  if (args.uf) chips.push({ section: "uf", key: "uf", label: `UF: ${args.uf}` });
  if (args.inTramitacao)
    chips.push({
      section: "inTramitacao",
      key: "inTramitacao",
      label: `Em tramitação: ${args.inTramitacao === "sim" ? "Sim" : "Não"}`,
    });

  if (args.mode === "advanced") {
    if (args.themeName) chips.push({ section: "themeId", key: "themeId", label: args.themeName });
    if (args.situationName)
      chips.push({ section: "situationId", key: "situationId", label: args.situationName });
    if (args.presentedFrom || args.presentedTo)
      chips.push({
        section: "dates",
        key: "dates",
        label: `Apresentação: ${args.presentedFrom || "…"} → ${args.presentedTo || "…"}`,
      });
    if (args.recebidaNoOrgao)
      chips.push({
        section: "recebidaNoOrgao",
        key: "recebidaNoOrgao",
        label: `Recebida em: ${args.recebidaNoOrgao}`,
      });
    if (args.noOrgaoAtual)
      chips.push({
        section: "noOrgaoAtual",
        key: "noOrgaoAtual",
        label: `No órgão: ${args.noOrgaoAtual}`,
      });
    if (args.allWords)
      chips.push({ section: "allWords", key: "allWords", label: `Todas: ${args.allWords}` });
    if (args.exactPhrase)
      chips.push({ section: "exactPhrase", key: "exactPhrase", label: `Exato: "${args.exactPhrase}"` });
    if (args.anyWord)
      chips.push({ section: "anyWord", key: "anyWord", label: `Qualquer: ${args.anyWord}` });
    if (args.noneOfWords)
      chips.push({ section: "noneOfWords", key: "noneOfWords", label: `Sem: ${args.noneOfWords}` });
    if (args.authorTypeName)
      chips.push({
        section: "authorTypeId",
        key: "authorTypeId",
        label: `Tipo autor: ${args.authorTypeName}`,
      });
    if (args.partyAcronym)
      chips.push({ section: "partyAcronym", key: "partyAcronym", label: `Partido: ${args.partyAcronym}` });
    if (args.relator.id || args.relator.name)
      chips.push({
        section: "relatorName",
        key: "relatorName",
        label: `Relator: ${args.relator.name || "selecionado"}`,
      });
    if (args.relatorParty)
      chips.push({ section: "relatorParty", key: "relatorParty", label: `Partido relator: ${args.relatorParty}` });
    if (args.relatorUf)
      chips.push({ section: "relatorUf", key: "relatorUf", label: `UF relator: ${args.relatorUf}` });
    if (args.relatorOrgao)
      chips.push({
        section: "relatorOrgao",
        key: "relatorOrgao",
        label: `Órgão relator: ${args.relatorOrgao}`,
      });
    if (args.relatorFrom || args.relatorTo)
      chips.push({
        section: "relatorPeriod",
        key: "relatorPeriod",
        label: `Período relator: ${args.relatorFrom || "…"} → ${args.relatorTo || "…"}`,
      });
    if (args.tramitacaoExpression)
      chips.push({
        section: "tramitacaoExpression",
        key: "tramitacaoExpression",
        label: `Tramitação: ${args.tramitacaoExpression}`,
      });
    if (args.tramitacaoOrgao)
      chips.push({
        section: "tramitacaoOrgao",
        key: "tramitacaoOrgao",
        label: `Órgão tramitação: ${args.tramitacaoOrgao}`,
      });
    if (args.tramitacaoFrom || args.tramitacaoTo)
      chips.push({
        section: "tramitacaoPeriod",
        key: "tramitacaoPeriod",
        label: `Período tramitação: ${args.tramitacaoFrom || "…"} → ${args.tramitacaoTo || "…"}`,
      });
    if (args.lastMovementFrom || args.lastMovementTo)
      chips.push({
        section: "lastMovementPeriod",
        key: "lastMovementPeriod",
        label: `Última mov.: ${args.lastMovementFrom || "…"} → ${args.lastMovementTo || "…"}`,
      });
    if (args.regime)
      chips.push({ section: "regime", key: "regime", label: `Regime: ${args.regime}` });
    if (args.apreciacao)
      chips.push({
        section: "apreciacao",
        key: "apreciacao",
        label: `Apreciação: ${args.apreciacaoLabel ?? args.apreciacao}`,
      });
    if (args.tramitandoEmConjunto)
      chips.push({
        section: "tramitandoEmConjunto",
        key: "tramitandoEmConjunto",
        label: `Tramitação: ${args.tramitandoEmConjunto}`,
      });
    if (args.hasDispatch) chips.push({ section: "hasDispatch", key: "hasDispatch", label: "Tem despacho" });
    if (args.hasAttached) chips.push({ section: "hasAttached", key: "hasAttached", label: "Tem apensados" });
    if (args.hasAmendment) chips.push({ section: "hasAmendment", key: "hasAmendment", label: "Tem emendas" });
    if (args.hasOpinion) chips.push({ section: "hasOpinion", key: "hasOpinion", label: "Tem parecer" });
    if (args.hasRequirement)
      chips.push({ section: "hasRequirement", key: "hasRequirement", label: "Tem requerimento" });
  }
  return chips;
}

function FilterChips({
  chips,
  onClear,
}: {
  chips: { label: string; key: string; section: string }[];
  onClear: Record<string, ((id?: string) => void) | undefined>;
}) {
  if (chips.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {chips.map((c) => {
        const idMatch = c.key.match(/^typeId:(.+)$/);
        const handler =
          idMatch && onClear.typeId
            ? () => onClear.typeId!(idMatch[1])
            : onClear[c.section];
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => handler?.()}
            className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary transition-colors hover:bg-secondary/20"
          >
            {c.label}
            <X size={11} />
          </button>
        );
      })}
    </div>
  );
}

function ActionBar({
  canSearch,
  dirty,
  loading,
  hasResults,
  copied,
  savedSearches,
  showSaved,
  onSearch,
  onToggleSaved,
  onApplySaved,
  onDeleteSaved,
  onClearAll,
  onShare,
  onExportCsv,
  onSave,
}: {
  canSearch: boolean;
  dirty: boolean;
  loading: boolean;
  hasResults: boolean;
  copied: boolean;
  savedSearches: SavedSearch[];
  showSaved: boolean;
  onSearch: () => void;
  onToggleSaved: () => void;
  onApplySaved: (s: SavedSearch) => void;
  onDeleteSaved: (id: string) => void;
  onClearAll: () => void;
  onShare: () => void;
  onExportCsv: () => void;
  onSave: () => void;
}) {
  const searchDisabled = !canSearch || !dirty || loading;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onSearch}
        disabled={searchDisabled}
        title={
          !canSearch
            ? "Defina ao menos um filtro para buscar"
            : !dirty
              ? "Nenhuma alteração desde a última busca"
              : "Aplicar filtros e buscar"
        }
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-secondary px-4 text-xs font-semibold text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Search size={13} />
        {loading ? "Buscando…" : "Buscar"}
      </button>
      <button
        type="button"
        onClick={onClearAll}
        disabled={!canSearch}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <X size={13} />
        Limpar filtros
      </button>
      <button
        type="button"
        onClick={onShare}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
        title="Copia a URL com filtros aplicados"
      >
        <Share2 size={13} />
        {copied ? "Copiado!" : "Compartilhar"}
      </button>
      <button
        type="button"
        onClick={onExportCsv}
        disabled={!hasResults}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        title="Exporta a página atual em CSV"
      >
        <Download size={13} />
        Exportar CSV
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={!canSearch}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        title="Salva os filtros atuais neste dispositivo"
      >
        <BookmarkPlus size={13} />
        Salvar
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={onToggleSaved}
          disabled={!savedSearches.length}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Bookmark size={13} />
          Salvas
          {savedSearches.length > 0 && (
            <span className="rounded-full bg-secondary/10 px-1.5 text-[10px] font-bold text-secondary">
              {savedSearches.length}
            </span>
          )}
        </button>
        {showSaved && savedSearches.length > 0 && (
          <div className="absolute right-0 z-30 mt-2 max-h-80 w-72 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
              Pesquisas neste dispositivo
            </p>
            {savedSearches.map((s) => (
              <div
                key={s.id}
                className="group flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-gray-50"
              >
                <Star size={12} className="shrink-0 text-amber-400" />
                <button
                  type="button"
                  onClick={() => onApplySaved(s)}
                  className="min-w-0 flex-1 truncate text-left text-xs font-medium text-gray-800"
                  title={s.name}
                >
                  {s.name}
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteSaved(s.id)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  title="Excluir"
                >
                  <Trash2 size={12} className="text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PropositionCard({ prop, onClick }: { prop: Proposition; onClick: () => void }) {
  const author = prop.authors?.[0]?.name;
  const presentation = new Date(prop.presentationDate).toLocaleDateString("pt-BR");
  const lastMove = prop.lastMovementDate
    ? new Date(prop.lastMovementDate).toLocaleDateString("pt-BR")
    : null;
  const regimeTone = getRegimeTone(prop.regime);
  const situation = prop.situation?.name || prop.situationDescription;

  return (
    <Card
      className="group relative flex cursor-pointer flex-col border-gray-100 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="bg-secondary absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary/20">
          <FileText size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-[#1a1d1f] transition-colors group-hover:text-secondary">
              {prop.typeAcronym} {prop.number}/{prop.year}
            </h3>
            <ChevronRight
              size={16}
              className="shrink-0 text-secondary transition-all duration-200 group-hover:translate-x-1"
            />
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-gray-500">{prop.type?.name}</p>

          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
            {situation && (
              <span
                className="inline-flex max-w-full items-center truncate rounded-md bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary"
                title={situation}
              >
                {situation}
              </span>
            )}
            {prop.regime && (
              <span
                className={`inline-flex max-w-full items-center truncate rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${regimeTone}`}
                title={prop.regime}
              >
                {prop.regime}
              </span>
            )}
          </div>

          <p
            className="mt-3 line-clamp-2 text-xs leading-relaxed text-gray-600"
            title={prop.description}
          >
            {prop.description || "Sem ementa integrada."}
          </p>

          <div className="mt-3 grid gap-1.5 text-[11px] text-gray-500">
            {author && (
              <div className="flex min-w-0 items-center gap-1.5">
                <User size={11} className="shrink-0 text-gray-400" />
                <span className="min-w-0 flex-1 truncate">{author}</span>
              </div>
            )}
            <div className="flex min-w-0 items-center gap-1.5">
              <Calendar size={11} className="shrink-0 text-gray-400" />
              <span className="min-w-0 flex-1 truncate">Apresentada em {presentation}</span>
            </div>
            {lastMove && (
              <div className="flex min-w-0 items-center gap-1.5">
                <Clock size={11} className="shrink-0 text-gray-400" />
                <span className="min-w-0 flex-1 truncate">
                  Última ação: {lastMove}
                  {prop.movementDescription ? ` — ${prop.movementDescription}` : ""}
                </span>
              </div>
            )}
            {!author && (
              <div className="flex min-w-0 items-center gap-1.5 text-gray-400">
                <User size={11} className="shrink-0" />
                <span className="min-w-0 flex-1 truncate italic">Sem autoria integrada</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {prop.counters && <CounterRow counters={prop.counters} />}

      {prop.foundIn && prop.foundIn.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wide text-gray-400">
            Encontrado em:
          </span>
          {prop.foundIn.map((f) => (
            <span
              key={f}
              className="rounded-md border border-secondary/20 bg-secondary/5 px-1.5 py-0.5 text-[10px] font-medium text-secondary"
            >
              {f === "ementa"
                ? "Ementa"
                : f === "indexacao"
                  ? "Indexação"
                  : "Inteiro teor"}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-gray-50 pt-3">
        {prop.fullPropositionUrl && (
          <a
            href={prop.fullPropositionUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <Link2 size={11} /> Inteiro teor
          </a>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-secondary/90"
        >
          Ver matéria <ArrowUpRight size={11} />
        </button>
      </div>
    </Card>
  );
}
