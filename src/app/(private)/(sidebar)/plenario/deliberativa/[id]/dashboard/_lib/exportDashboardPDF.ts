import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { SessionDashboardData } from "./mockSessionDashboard";

type Doc = jsPDF & { lastAutoTable?: { finalY: number } };

export function exportDashboardPDF(data: SessionDashboardData) {
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
  doc.text(data.meta.titulo, 14, 22);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.text(
    `Gerado em ${new Date(data.meta.geradoEm).toLocaleString("pt-BR")} | Duração: ${Math.floor(data.meta.duracaoMinutos / 60)}h${data.meta.duracaoMinutos % 60}m`,
    14,
    34,
  );

  // Síntese
  doc.setTextColor(0);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Síntese executiva", 14, 44);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const sinteseLines = doc.splitTextToSize(data.sintese, 180);
  doc.text(sinteseLines, 14, 50);
  let y = 50 + sinteseLines.length * 5 + 4;

  // KPIs
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Indicadores", 14, y);
  y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: [
      ["Intervenções totais", String(data.kpis.totalIntervencoes)],
      ["Deputados únicos", String(data.kpis.deputadosUnicos)],
      ["Sentimento médio", data.kpis.sentimentoMedio.toFixed(2)],
      ["Tópicos distintos", String(data.kpis.topicosDistintos)],
      [
        "Duração total",
        `${Math.floor(data.kpis.minutosTotais / 60)}h${data.kpis.minutosTotais % 60}m`,
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [116, 156, 91], textColor: 255 },
    styles: { fontSize: 9 },
  });
  y = (doc.lastAutoTable?.finalY ?? y) + 8;

  // Tópicos
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Principais tópicos", 14, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    head: [["Tópico", "Menções", "Sentimento"]],
    body: data.topicos.map((t) => [
      t.nome,
      String(t.mencoes),
      t.sentimentoAssoc.toFixed(2),
    ]),
    theme: "striped",
    headStyles: { fillColor: [116, 156, 91], textColor: 255 },
    styles: { fontSize: 8 },
  });
  y = (doc.lastAutoTable?.finalY ?? y) + 8;

  // Tempos de fala
  if (y > 220) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Tempo de fala — top 10", 14, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    head: [["Deputado", "Partido/UF", "Tempo (min)"]],
    body: data.temposFala
      .slice(0, 10)
      .map((d) => [
        d.deputado,
        `${d.partido}-${d.uf}`,
        (d.segundos / 60).toFixed(1),
      ]),
    theme: "striped",
    headStyles: { fillColor: [116, 156, 91], textColor: 255 },
    styles: { fontSize: 8 },
  });
  y = (doc.lastAutoTable?.finalY ?? y) + 8;

  // Citações
  doc.addPage();
  y = 20;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Citações em destaque", 14, y);
  y += 8;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  for (const c of data.citacoesDestaque) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const lines = doc.splitTextToSize(`"${c.frase}"`, 180);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 1;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`— ${c.autor} (${c.partido}) | ${c.contexto}`, 14, y);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(0);
    y += 8;
  }

  // Blocos
  doc.addPage();
  y = 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Blocos da sessão", 14, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    head: [["Título", "Período", "Resumo"]],
    body: data.blocos.map((b) => [
      b.titulo,
      `${b.inicioMin}–${b.fimMin}min`,
      b.resumoExecutivo,
    ]),
    theme: "grid",
    headStyles: { fillColor: [116, 156, 91], textColor: 255 },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 25 }, 2: { cellWidth: 105 } },
  });
  y = (doc.lastAutoTable?.finalY ?? y) + 8;

  // Previsões
  if (y > 240) {
    doc.addPage();
    y = 20;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Cenários e previsões", 14, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    head: [["Cenário", "Probabilidade", "Racional"]],
    body: data.previsoes.map((p) => [
      p.cenario,
      `${Math.round(p.probabilidade * 100)}%`,
      p.racional,
    ]),
    theme: "grid",
    headStyles: { fillColor: [116, 156, 91], textColor: 255 },
    styles: { fontSize: 8 },
    columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 25 }, 2: { cellWidth: 85 } },
  });

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
    `dashboard-sessao-${data.meta.eventId}-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}
