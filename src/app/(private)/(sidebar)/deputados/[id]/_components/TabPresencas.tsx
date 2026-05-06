"use client";

import { Card } from "@/components/v2/components/ui/Card";
import SingleDonutChart from "@/components/SingleItemDonnutChart";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileWarning,
  Info,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

type AttendanceStatus = "PRESENT" | "ABSENT" | "JUSTIFIED";

interface PresenceEvent {
  eventId: string;
  data: string;
  tipo: string;
  titulo: string;
  attendanceStatus: AttendanceStatus;
}

interface CommitteeStat {
  departmentId: string;
  sigla: string;
  nome: string;
  percentage: number | null;
  present: number;
  absent: number;
  justified: number;
  total: number;
  eventos: PresenceEvent[];
}

interface PresencasResponse {
  overall: {
    percentage: number | null;
    totalPresent: number;
    totalAbsent: number;
    totalJustified: number;
    totalEvents: number;
  };
  perCommittee: CommitteeStat[];
  period: { dataInicio: string; dataFim: string };
}

// MOCK — substituir por GetAPI(`/politician/${id}/presencas`) quando o backend entregar
// (ver BACKEND_TODO.md, Tarefa 2)
const MOCK_PRESENCAS: PresencasResponse = {
  overall: {
    percentage: 87.5,
    totalPresent: 35,
    totalAbsent: 5,
    totalJustified: 4,
    totalEvents: 44,
  },
  perCommittee: [
    {
      departmentId: "2003",
      sigla: "CCJC",
      nome: "Comissão de Constituição e Justiça e de Cidadania",
      percentage: 92.3,
      present: 12,
      absent: 1,
      justified: 2,
      total: 15,
      eventos: [
        {
          eventId: "ev-1",
          data: "2026-04-22",
          tipo: "Reunião deliberativa ordinária",
          titulo: "Apreciação de proposições",
          attendanceStatus: "PRESENT",
        },
        {
          eventId: "ev-2",
          data: "2026-04-15",
          tipo: "Reunião deliberativa ordinária",
          titulo: "Audiência pública e deliberação",
          attendanceStatus: "PRESENT",
        },
        {
          eventId: "ev-3",
          data: "2026-04-08",
          tipo: "Reunião deliberativa ordinária",
          titulo: "Pauta especial PEC 32/2024",
          attendanceStatus: "JUSTIFIED",
        },
        {
          eventId: "ev-4",
          data: "2026-04-01",
          tipo: "Reunião deliberativa extraordinária",
          titulo: "Sessão extraordinária",
          attendanceStatus: "ABSENT",
        },
        {
          eventId: "ev-5",
          data: "2026-03-25",
          tipo: "Reunião deliberativa ordinária",
          titulo: "Apreciação de pareceres",
          attendanceStatus: "PRESENT",
        },
      ],
    },
    {
      departmentId: "2007",
      sigla: "CFT",
      nome: "Comissão de Finanças e Tributação",
      percentage: 85.7,
      present: 12,
      absent: 2,
      justified: 1,
      total: 15,
      eventos: [
        {
          eventId: "ev-6",
          data: "2026-04-23",
          tipo: "Reunião deliberativa ordinária",
          titulo: "PLP 108/2024 – reforma tributária regulamentação",
          attendanceStatus: "PRESENT",
        },
        {
          eventId: "ev-7",
          data: "2026-04-16",
          tipo: "Reunião deliberativa ordinária",
          titulo: "MPV 1.245/2026",
          attendanceStatus: "ABSENT",
        },
        {
          eventId: "ev-8",
          data: "2026-04-09",
          tipo: "Reunião deliberativa ordinária",
          titulo: "Audiência pública – execução orçamentária",
          attendanceStatus: "PRESENT",
        },
      ],
    },
    {
      departmentId: "2014",
      sigla: "CDHM",
      nome: "Comissão de Direitos Humanos e Minorias",
      percentage: 81.8,
      present: 9,
      absent: 2,
      justified: 1,
      total: 12,
      eventos: [
        {
          eventId: "ev-9",
          data: "2026-04-17",
          tipo: "Reunião deliberativa ordinária",
          titulo: "Apreciação de relatórios",
          attendanceStatus: "PRESENT",
        },
        {
          eventId: "ev-10",
          data: "2026-04-10",
          tipo: "Reunião deliberativa ordinária",
          titulo: "Pauta de proposições",
          attendanceStatus: "JUSTIFIED",
        },
      ],
    },
    {
      departmentId: "2010",
      sigla: "CME",
      nome: "Comissão de Minas e Energia",
      percentage: 100,
      present: 2,
      absent: 0,
      justified: 0,
      total: 2,
      eventos: [
        {
          eventId: "ev-11",
          data: "2026-03-12",
          tipo: "Reunião deliberativa ordinária",
          titulo: "Discussão de PL energético",
          attendanceStatus: "PRESENT",
        },
      ],
    },
  ],
  period: { dataInicio: "2026-01-01", dataFim: "2026-05-03" },
};

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const map = {
    PRESENT: {
      label: "Presente",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Icon: CheckCircle2,
    },
    ABSENT: {
      label: "Ausente",
      cls: "bg-red-50 text-red-700 border-red-200",
      Icon: XCircle,
    },
    JUSTIFIED: {
      label: "Justificada",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
      Icon: FileWarning,
    },
  } as const;
  const { label, cls, Icon } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        cls,
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function KpiCard({
  label,
  value,
  Icon,
  color,
}: {
  label: string;
  value: number;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          color,
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </Card>
  );
}

function CommitteeRow({ committee }: { committee: CommitteeStat }) {
  const [open, setOpen] = useState(false);
  const pct = committee.percentage ?? 0;
  const pctColor =
    pct >= 90
      ? "bg-emerald-500"
      : pct >= 75
        ? "bg-lime-500"
        : pct >= 60
          ? "bg-amber-500"
          : "bg-red-500";

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid w-full grid-cols-12 items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-gray-50"
      >
        <div className="col-span-1 text-gray-400">
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
        <div className="col-span-3">
          <p className="text-sm font-semibold text-gray-900">
            {committee.sigla}
          </p>
          <p className="line-clamp-1 text-xs text-gray-500">{committee.nome}</p>
        </div>
        <div className="col-span-3 flex items-center gap-2">
          <div className="h-2 w-32 rounded-full bg-gray-100">
            <div
              className={cn("h-full rounded-full", pctColor)}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <span className="text-sm font-medium tabular-nums text-gray-700">
            {committee.percentage !== null
              ? `${committee.percentage.toFixed(1)}%`
              : "—"}
          </span>
        </div>
        <div className="col-span-1 text-center">
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            {committee.present}
          </span>
        </div>
        <div className="col-span-1 text-center">
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
            {committee.absent}
          </span>
        </div>
        <div className="col-span-1 text-center">
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
            {committee.justified}
          </span>
        </div>
        <div className="col-span-2 text-right text-xs text-gray-500">
          {committee.total} reuniões
        </div>
      </button>

      {open && (
        <div className="bg-gray-50/50 px-4 py-3">
          <ul className="space-y-2">
            {committee.eventos.map((ev) => (
              <li
                key={ev.eventId}
                className="grid grid-cols-12 items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm shadow-sm"
              >
                <div className="col-span-2 flex items-center gap-1.5 text-gray-600">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs tabular-nums">
                    {new Date(ev.data).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="col-span-7">
                  <p className="line-clamp-1 text-xs font-medium text-gray-800">
                    {ev.titulo}
                  </p>
                  <p className="text-xs text-gray-500">{ev.tipo}</p>
                </div>
                <div className="col-span-3 flex justify-end">
                  <StatusBadge status={ev.attendanceStatus} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface TabPresencasProps {
  // data?: DeputadoPageData;  // virá quando ligar no backend real
}

export function TabPresencas(_props: TabPresencasProps = {}) {
  // TODO[backend]: substituir MOCK por
  //   const { GetAPI } = useApiContext();
  //   const [data, setData] = useState<PresencasResponse | null>(null);
  //   useEffect(() => { GetAPI(`/politician/${id}/presencas`).then(setData) }, [id]);
  const data = MOCK_PRESENCAS;

  const ordered = useMemo(
    () =>
      [...data.perCommittee].sort(
        (a, b) => (b.percentage ?? 0) - (a.percentage ?? 0),
      ),
    [data],
  );

  const overall = data.overall;
  const denominator = overall.totalPresent + overall.totalAbsent;
  const pct = overall.percentage ?? 0;

  return (
    <div className="space-y-6">
      {/* Hero — % geral + KPIs */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="flex flex-col items-center justify-center lg:col-span-4">
          <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
            Presença em comissões deliberativas
          </p>
          <SingleDonutChart current={overall.totalPresent} total={denominator} />
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-semibold text-[#749c5b]">
              {overall.totalPresent}
            </span>{" "}
            de {denominator} reuniões deliberativas
          </p>
        </Card>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-8">
          <KpiCard
            label="Presentes"
            value={overall.totalPresent}
            Icon={CheckCircle2}
            color="bg-emerald-50 text-emerald-600"
          />
          <KpiCard
            label="Ausentes"
            value={overall.totalAbsent}
            Icon={XCircle}
            color="bg-red-50 text-red-600"
          />
          <KpiCard
            label="Justificadas"
            value={overall.totalJustified}
            Icon={FileWarning}
            color="bg-amber-50 text-amber-600"
          />

          <Card className="sm:col-span-3 bg-amber-50/50 border-amber-200/60">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  Como calculamos
                </p>
                <p className="mt-1 text-xs leading-relaxed text-amber-800">
                  Consideramos apenas reuniões{" "}
                  <strong>deliberativas</strong> das comissões em que o deputado
                  é (ou foi) membro. Faltas{" "}
                  <strong>justificadas não entram no cálculo</strong> — não
                  contam como presença nem como ausência (regra regimental).
                  Período: {new Date(data.period.dataInicio).toLocaleDateString("pt-BR")}{" "}
                  a {new Date(data.period.dataFim).toLocaleDateString("pt-BR")}.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tabela por comissão */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">
            Detalhe por comissão
          </h3>
          <p className="text-xs text-gray-500">
            Clique em uma comissão para ver as reuniões e o status de cada uma
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
          <div className="col-span-1" />
          <div className="col-span-3">Comissão</div>
          <div className="col-span-3">% presença</div>
          <div className="col-span-1 text-center">P</div>
          <div className="col-span-1 text-center">A</div>
          <div className="col-span-1 text-center">J</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        <div>
          {ordered.map((c) => (
            <CommitteeRow key={c.departmentId} committee={c} />
          ))}
        </div>
      </Card>

      <p className="text-center text-xs text-gray-400">
        Dados de demonstração — integração com backend pendente (ver{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-[10px]">
          BACKEND_TODO.md
        </code>
        , Tarefa 2). Percentual atual mockado: {pct.toFixed(1)}%.
      </p>
    </div>
  );
}
