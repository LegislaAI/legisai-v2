"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import type { SessionDashboardData } from "../_lib/mockSessionDashboard";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const PALETTE = ["#749c5b", "#4E9F3D", "#2d5a3d", "#5a8c4a", "#8ab86e"];

function sentimentColor(score: number): string {
  if (score > 0.2) return "#4E9F3D";
  if (score > 0) return "#8ab86e";
  if (score > -0.2) return "#f59e0b";
  if (score > -0.4) return "#f97316";
  return "#dc2626";
}

export function SentimentTimelineChart({
  data,
}: {
  data: SessionDashboardData["sentimento"];
}) {
  const series = [
    {
      name: "Sentimento",
      data: data.porTrecho.map((t) => ({ x: t.minuto, y: t.score })),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true },
    },
    stroke: { curve: "smooth", width: 3, colors: ["#749c5b"] },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100],
        colorStops: [
          { offset: 0, color: "#749c5b", opacity: 0.4 },
          { offset: 100, color: "#749c5b", opacity: 0.05 },
        ],
      },
    },
    xaxis: {
      type: "numeric",
      title: { text: "Minuto da sessão", style: { fontSize: "11px", fontWeight: 500 } },
      labels: { formatter: (v) => `${Math.round(Number(v))}'` },
    },
    yaxis: {
      min: -1,
      max: 1,
      title: { text: "Sentimento", style: { fontSize: "11px", fontWeight: 500 } },
      labels: { formatter: (v) => v.toFixed(1) },
    },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    annotations: {
      yaxis: [
        {
          y: 0,
          borderColor: "#94a3b8",
          strokeDashArray: 4,
          label: { text: "Neutro", style: { color: "#64748b", background: "transparent" } },
        },
      ],
      points: data.porTrecho.map((t) => ({
        x: t.minuto,
        y: t.score,
        marker: {
          size: 5,
          fillColor: sentimentColor(t.score),
          strokeColor: "#fff",
          strokeWidth: 2,
        },
        label: {
          text: t.label,
          offsetY: t.score > 0 ? -15 : 25,
          style: {
            background: "#1f2937",
            color: "#fff",
            fontSize: "10px",
            padding: { left: 6, right: 6, top: 3, bottom: 3 },
          },
        },
      })),
    },
    tooltip: { theme: "dark", y: { formatter: (v) => v.toFixed(2) } },
  };

  return (
    <ReactApexChart options={options} series={series} type="area" height={320} />
  );
}

export function SpeakingTimeBarChart({
  data,
}: {
  data: SessionDashboardData["temposFala"];
}) {
  const top10 = [...data].slice(0, 10);
  const series = [
    {
      name: "Tempo (min)",
      data: top10.map((d) => +(d.segundos / 60).toFixed(1)),
    },
  ];

  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: "70%",
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (v) => `${v} min`,
      style: { fontSize: "11px", colors: ["#1a1d1f"], fontWeight: 600 },
      offsetX: 30,
    },
    colors: top10.map((_, i) => PALETTE[i % PALETTE.length]),
    legend: { show: false },
    xaxis: {
      categories: top10.map((d) => `${d.deputado.replace("Dep. ", "")} (${d.partido}-${d.uf})`),
      labels: { style: { fontSize: "11px" } },
    },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    tooltip: { theme: "dark", y: { formatter: (v) => `${v} minutos` } },
  };

  return (
    <ReactApexChart options={options} series={series} type="bar" height={400} />
  );
}

export function TopicsBubbleChart({
  data,
}: {
  data: SessionDashboardData["topicos"];
}) {
  const series = [
    {
      name: "Tópicos",
      data: data.map((t, i) => ({
        x: i + 1,
        y: t.mencoes,
        z: Math.abs(t.sentimentoAssoc) * 100 + 20,
        nome: t.nome,
        sentimento: t.sentimentoAssoc,
      })),
    },
  ];

  const options: ApexOptions = {
    chart: { type: "bubble", toolbar: { show: false } },
    dataLabels: { enabled: false },
    fill: { opacity: 0.85 },
    colors: data.map((t) => sentimentColor(t.sentimentoAssoc)),
    plotOptions: { bubble: { zScaling: true } },
    xaxis: {
      title: { text: "Tópicos", style: { fontSize: "11px", fontWeight: 500 } },
      labels: {
        formatter: (v) => {
          const idx = parseInt(v) - 1;
          return data[idx]?.nome.split(" ").slice(0, 2).join(" ") ?? "";
        },
        rotate: -30,
        style: { fontSize: "10px" },
      },
      tickAmount: data.length,
    },
    yaxis: {
      title: { text: "Menções", style: { fontSize: "11px", fontWeight: 500 } },
    },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    tooltip: {
      theme: "dark",
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const point = w.config.series[seriesIndex].data[dataPointIndex];
        return `<div style="padding: 8px;">
          <strong>${point.nome}</strong><br/>
          ${point.y} menções<br/>
          Sentimento: ${point.sentimento.toFixed(2)}
        </div>`;
      },
    },
    legend: { show: false },
  };

  return (
    <ReactApexChart options={options} series={series} type="bubble" height={340} />
  );
}
