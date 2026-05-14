import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { AiDashboardJson } from "../../components/types";

type Doc = jsPDF & { lastAutoTable?: { finalY: number } };

interface ExportArgs {
  titulo: string;
  geradoEm?: string | null;
  eventId: string;
  dashboard: AiDashboardJson;
}

export function exportDashboardPDF({
  titulo,
  geradoEm,
  eventId,
  dashboard,
}: ExportArgs) {
  const doc = new jsPDF() as Doc;

  // Cabeçalho
  doc.setFillColor(116, 156, 91);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Dashboard de IA — Sessão Plenária", 14, 15);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(titulo, 14, 22);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  const sub: string[] = [];
  if (geradoEm) sub.push(`Gerado em ${new Date(geradoEm).toLocaleString("pt-BR")}`);
  if (dashboard.meta?.duracaoEstimada)
    sub.push(`Duração: ${dashboard.meta.duracaoEstimada}`);
  if (dashboard.meta?.tom) sub.push(`Tom: ${dashboard.meta.tom}`);
  doc.text(sub.join(" | "), 14, 34);

  let y = 44;

  // Síntese executiva
  if (dashboard.resumoExecutivo) {
    doc.setTextColor(0);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Síntese executiva", 14, y);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(dashboard.resumoExecutivo, 180);
    doc.text(lines, 14, y + 6);
    y += 6 + lines.length * 5 + 4;
  }

  // KPIs derivados
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Indicadores", 14, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: [
      ["Decisões registradas", String(dashboard.principaisDecisoes?.length ?? 0)],
      ["Embates", String(dashboard.embates?.length ?? 0)],
      ["Insights", String(dashboard.insights?.length ?? 0)],
      [
        "Oradores únicos",
        dashboard.meta?.oradoresUnicos != null
          ? String(dashboard.meta.oradoresUnicos)
          : "—",
      ],
      ["Duração estimada", dashboard.meta?.duracaoEstimada ?? "—"],
    ],
    theme: "grid",
    headStyles: { fillColor: [116, 156, 91], textColor: 255 },
    styles: { fontSize: 9 },
  });
  y = (doc.lastAutoTable?.finalY ?? y) + 8;

  // Dimensões
  if (dashboard.dimensoes) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Dimensões qualitativas", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Dimensão", "Avaliação"]],
      body: [
        ["Conflito", dashboard.dimensoes.conflito ?? "—"],
        ["Efetividade", dashboard.dimensoes.efetividade ?? "—"],
        ["Fluidez", dashboard.dimensoes.fluidez ?? "—"],
      ],
      theme: "striped",
      headStyles: { fillColor: [116, 156, 91], textColor: 255 },
      styles: { fontSize: 9 },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 4;
    if (dashboard.dimensoes.justificativa) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100);
      const lines = doc.splitTextToSize(dashboard.dimensoes.justificativa, 180);
      doc.text(lines, 14, y);
      y += lines.length * 4.5 + 4;
      doc.setTextColor(0);
      doc.setFont("helvetica", "normal");
    }
  }

  // Decisões
  if (dashboard.principaisDecisoes?.length) {
    if (y > 220) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Principais decisões", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Título", "Tipo", "Tema", "Detalhe"]],
      body: dashboard.principaisDecisoes.map((d) => [
        d.titulo,
        d.tipo,
        d.tema,
        d.detalhe,
      ]),
      theme: "grid",
      headStyles: { fillColor: [116, 156, 91], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 28 },
        2: { cellWidth: 28 },
        3: { cellWidth: 74 },
      },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 8;
  }

  // Embates
  if (dashboard.embates?.length) {
    if (y > 220) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Embates", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Tema", "Atores", "Resumo"]],
      body: dashboard.embates.map((e) => [
        e.tema,
        e.atores?.join(" × ") ?? "",
        e.resumo,
      ]),
      theme: "grid",
      headStyles: { fillColor: [220, 38, 38], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 50 }, 2: { cellWidth: 80 } },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 8;
  }

  // Destaques de discursos
  if (dashboard.destaquesDiscursos?.length) {
    doc.addPage();
    y = 20;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Destaques de discursos", 14, y);
    y += 8;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    for (const c of dashboard.destaquesDiscursos) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const lines = doc.splitTextToSize(`"${c.trecho}"`, 180);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 1;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `— ${c.deputado}${c.partido ? ` (${c.partido})` : ""}`,
        14,
        y,
      );
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(0);
      y += 8;
    }
  }

  // Insights
  if (dashboard.insights?.length) {
    doc.addPage();
    y = 20;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Insights analíticos", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Título", "Tipo", "Interpretação", "Evidência"]],
      body: dashboard.insights.map((it) => [
        it.titulo,
        it.tipo,
        it.interpretacao,
        it.evidencia,
      ]),
      theme: "grid",
      headStyles: { fillColor: [245, 158, 11], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 25 },
        2: { cellWidth: 55 },
        3: { cellWidth: 55 },
      },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 8;
  }

  // Síntese final
  if (dashboard.sinteseFinal) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Síntese final", 14, y);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(dashboard.sinteseFinal, 180);
    doc.text(lines, 14, y + 6);
  }

  // Rodapé com paginação
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `LegisDados | Página ${i}/${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" },
    );
  }

  doc.save(
    `dashboard-sessao-${eventId}-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}
