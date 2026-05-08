"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import type { AiDashboardJson } from "../../components/types";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const PALETTE = ["#749c5b", "#4E9F3D", "#2d5a3d", "#5a8c4a", "#8ab86e", "#a8d18d", "#c4e4ad"];

// Conversão dos rótulos qualitativos do schema (alto/parcial/fluida…) em 0–100
// para visualização em radial. Ver StructuredDashboard.tsx (oficial) — mesma lógica.
export function dimensionScore(
  key: "conflito" | "efetividade" | "fluidez",
  value?: string,
): number {
  const v = (value ?? "").toLowerCase();
  if (key === "conflito") {
    if (v.includes("alto")) return 85;
    if (v.includes("moderado")) return 55;
    if (v.includes("baixo")) return 20;
  }
  if (key === "efetividade") {
    if (v.includes("alta")) return 85;
    if (v.includes("parcial") || v.includes("moderada")) return 55;
    if (v.includes("baixa")) return 20;
  }
  if (key === "fluidez") {
    if (v.includes("fluida")) return 85;
    if (v.includes("interrompida")) return 55;
    if (v.includes("fragmentada") || v.includes("travada")) return 20;
  }
  return 0;
}

function dimensionHex(score: number): string {
  if (score >= 70) return "#10b981";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

export function DimensoesRadialChart({
  dimensoes,
}: {
  dimensoes: NonNullable<AiDashboardJson["dimensoes"]>;
}) {
  const series = [
    dimensionScore("conflito", dimensoes.conflito),
    dimensionScore("efetividade", dimensoes.efetividade),
    dimensionScore("fluidez", dimensoes.fluidez),
  ];
  const colors = series.map(dimensionHex);

  const options: ApexOptions = {
    chart: { type: "radialBar", sparkline: { enabled: true } },
    colors,
    plotOptions: {
      radialBar: {
        track: { background: "#f3f4f6", margin: 6 },
        dataLabels: {
          name: { fontSize: "11px", color: "#6f767e", offsetY: 4 },
          value: {
            fontSize: "16px",
            color: "#1a1d1f",
            fontWeight: 600,
            offsetY: -4,
            formatter: (v) => `${Math.round(Number(v))}%`,
          },
          total: {
            show: true,
            label: "Sessão",
            color: "#1a1d1f",
            fontSize: "12px",
            fontWeight: 600,
            formatter: () => {
              const avg = series.reduce((a, b) => a + b, 0) / Math.max(series.length, 1);
              return `${Math.round(avg)}%`;
            },
          },
        },
        hollow: { size: "40%" },
      },
    },
    labels: ["Conflito", "Efetividade", "Fluidez"],
    legend: {
      show: true,
      position: "bottom",
      fontSize: "11px",
      labels: { colors: "#1a1d1f" },
      markers: { size: 5 },
    },
    stroke: { lineCap: "round" },
  };

  return (
    <ReactApexChart options={options} series={series} type="radialBar" height={300} />
  );
}

export function DecisoesPorTipoChart({
  decisoes,
}: {
  decisoes: NonNullable<AiDashboardJson["principaisDecisoes"]>;
}) {
  const counts = new Map<string, number>();
  for (const d of decisoes) {
    counts.set(d.tipo, (counts.get(d.tipo) ?? 0) + 1);
  }
  const labels = Array.from(counts.keys());
  const series = Array.from(counts.values());

  const options: ApexOptions = {
    chart: { type: "donut" },
    labels,
    colors: PALETTE.slice(0, labels.length),
    legend: { position: "bottom", fontSize: "11px" },
    dataLabels: {
      style: { fontSize: "12px", fontWeight: 600 },
      formatter: (val) => `${Math.round(Number(val))}%`,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              color: "#1a1d1f",
              fontSize: "12px",
              formatter: () => `${decisoes.length}`,
            },
            value: { color: "#1a1d1f", fontSize: "20px", fontWeight: 700 },
          },
        },
      },
    },
    stroke: { width: 2, colors: ["#fff"] },
  };

  return <ReactApexChart options={options} series={series} type="donut" height={300} />;
}

export function EmbatesAtoresChart({
  embates,
}: {
  embates: NonNullable<AiDashboardJson["embates"]>;
}) {
  const series = [
    {
      name: "Atores envolvidos",
      data: embates.map((e) => e.atores?.length ?? 0),
    },
  ];

  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: "65%",
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (v) => `${v}`,
      style: { fontSize: "11px", colors: ["#1a1d1f"], fontWeight: 600 },
      offsetX: 14,
    },
    colors: embates.map((_, i) => PALETTE[i % PALETTE.length]),
    legend: { show: false },
    xaxis: {
      categories: embates.map((e) =>
        e.tema.length > 48 ? e.tema.slice(0, 45) + "…" : e.tema,
      ),
      labels: { style: { fontSize: "11px" } },
    },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    tooltip: {
      theme: "dark",
      y: { formatter: (v) => `${v} ator${Number(v) === 1 ? "" : "es"}` },
    },
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={Math.max(220, embates.length * 60)}
    />
  );
}

export function InsightsPorTipoChart({
  insights,
}: {
  insights: NonNullable<AiDashboardJson["insights"]>;
}) {
  const counts = new Map<string, number>();
  for (const it of insights) {
    counts.set(it.tipo, (counts.get(it.tipo) ?? 0) + 1);
  }
  const labels = Array.from(counts.keys());
  const series = Array.from(counts.values());

  const options: ApexOptions = {
    chart: { type: "donut" },
    labels,
    colors: ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#fef3c7"].slice(0, labels.length),
    legend: { position: "bottom", fontSize: "11px" },
    dataLabels: {
      style: { fontSize: "12px", fontWeight: 600 },
      formatter: (val) => `${Math.round(Number(val))}%`,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: "Insights",
              color: "#1a1d1f",
              fontSize: "12px",
              formatter: () => `${insights.length}`,
            },
            value: { color: "#1a1d1f", fontSize: "20px", fontWeight: 700 },
          },
        },
      },
    },
    stroke: { width: 2, colors: ["#fff"] },
  };

  return <ReactApexChart options={options} series={series} type="donut" height={300} />;
}
