import { PoliticianDetailsProps } from "@/@types/v2/politician";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePoliticianReport = (
  politician: PoliticianDetailsProps,
  year: string,
) => {
  const doc = new jsPDF();

  // --- Title Section ---
  doc.setFontSize(22);
  doc.setTextColor(26, 29, 31); // Dark color
  doc.text("Relatório do Político", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 26);

  // --- Profile Summary ---
  doc.setLineWidth(0.5);
  doc.line(14, 30, 196, 30); // Horizontal line

  const profileY = 40;

  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(politician?.name || "N/A", 14, profileY);

  doc.setFontSize(12);
  doc.setTextColor(80);
  doc.text(
    `${politician?.politicalParty || "N/A"} - ${politician?.state || "N/A"}`,
    14,
    profileY + 6,
  );
  doc.text(`Ano Base: ${year}`, 14, profileY + 12);

  let currentY = profileY + 25;

  // --- Financial Summary ---
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Resumo Financeiro", 14, currentY);
  currentY += 8;

  const finance = politician?.finance;

  const financeData = [
    ["Pessoal Contratado", finance?.contractedPeople || "N/A"],
    ["Salário Bruto", finance?.grossSalary || "N/A"],
    ["Uso de Imóvel Funcional", finance?.functionalPropertyUsage || "N/A"],
    ["Viagens", finance?.trips || "N/A"],
    ["Passaporte Diplomático", finance?.diplomaticPassport || "N/A"],
    ["Auxílio Moradia", finance?.housingAssistant || "N/A"],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Item", "Valor / Descrição"]],
    body: financeData,
    theme: "striped",
    headStyles: { fillColor: [116, 156, 91] }, // Secondary color #749c5b
    margin: { left: 14, right: 14 },
  });

  // Update Y position after first table
  currentY = (doc as any).lastAutoTable.finalY + 15;

  // --- Monthly Costs Table ---
  doc.setFontSize(14);
  doc.text("Detalhamento Mensal de Gastos", 14, currentY);
  currentY += 8;

  const monthlyCosts = finance?.monthlyCosts || [];

  if (monthlyCosts.length > 0) {
    const monthlyCostsData = monthlyCosts
      .sort((a, b) => a.month - b.month)
      .map((cost) => [
        cost.month.toString(),
        cost.parliamentaryQuota
          ? `R$ ${cost.parliamentaryQuota.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}`
          : "-",
        cost.cabinetQuota
          ? `R$ ${cost.cabinetQuota.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}`
          : "-",
      ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Mês", "Cota Parlamentar", "Verba de Gabinete"]],
      body: monthlyCostsData,
      theme: "grid",
      headStyles: { fillColor: [26, 29, 31] }, // Dark color
      margin: { left: 14, right: 14 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Nenhum dado financeiro mensal disponível.", 14, currentY + 5);
    currentY += 15;
  }

  // Check if we need a new page
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }

  // --- Activity Summary ---
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Atividade Parlamentar", 14, currentY);
  currentY += 8;

  const profile = politician?.profile;

  const activityData = [
    ["Presença em Plenário", profile?.plenaryPresence || "N/A"],
    [
      "Ausências Justificadas (Plenário)",
      profile?.plenaryJustifiedAbsences || "N/A",
    ],
    [
      "Ausências Não Justificadas (Plenário)",
      profile?.plenaryUnjustifiedAbsences || "N/A",
    ],
    ["Presença em Comissões", profile?.committeesPresence || "N/A"],
    [
      "Ausências Justificadas (Comissões)",
      profile?.committeesJustifiedAbsences || "N/A",
    ],
    [
      "Ausências Não Justificadas (Comissões)",
      profile?.committeesUnjustifiedAbsences || "N/A",
    ],
    ["Propostas Criadas", profile?.createdProposals || "N/A"],
    ["Propostas Relacionadas", profile?.relatedProposals || "N/A"],
    ["Discursos", profile?.speeches || "N/A"],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Atividade", "Total"]],
    body: activityData,
    theme: "striped",
    headStyles: { fillColor: [116, 156, 91] },
    margin: { left: 14, right: 14 },
  });

  // Save the PDF
  const safeName = politician?.name
    ? politician.name.replace(/\s+/g, "_")
    : "Relatorio";
  doc.save(`${safeName}_${year}.pdf`);
};

// --- Interfaces for Session Report ---

export interface SessionReportData {
  title: string;
  date: string;
  time: string;
  endTime?: string;
  local: string;
  status: string;
  description: string;
  presences: number;
  propositionsCount: number;
  votingCount: number;
  votingApprovalRate?: string;
  votings: {
    description: string;
    result: boolean;
    approvedCount: number;
    rejectedCount: number;
  }[];
  orderOfDay: {
    title: string;
    topic: string;
    status: string;
  }[];
  presenceList: {
    name: string;
    party: string;
    state: string;
  }[];
  speakers?: {
    name: string;
    party: string;
    state: string;
    status: string;
  }[];
  speeches?: Array<{
    speakerName: string;
    speakerParty?: string;
    speakerState?: string;
    transcription: string;
    timeStart?: string;
    timeEnd?: string;
  }>;
  brevesComunicacoes?: {
    speakers: Array<{
      name: string;
      time: string;
      party?: string;
      speechSummary?: string;
    }>;
  };
  hideStats?: boolean;
}

export const generateSessionReport = (data: SessionReportData) => {
  const doc = new jsPDF();

  // --- Header ---
  doc.setFontSize(22);
  doc.setTextColor(26, 29, 31);
  const titleLines = doc.splitTextToSize(
    data.title || "Relatório da Sessão",
    180,
  );
  doc.text(titleLines, 14, 20);

  let currentY = 20 + titleLines.length * 10;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, currentY);

  // Status Badge-like text
  doc.setFontSize(12);
  doc.setTextColor(116, 156, 91); // Secondary color
  doc.text(data.status.toUpperCase(), 150, 20);

  currentY += 10;
  doc.setLineWidth(0.5);
  doc.setDrawColor(200);
  doc.line(14, currentY, 196, currentY);
  currentY += 10;

  // --- Session Info ---
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Informações Gerais", 14, currentY);
  currentY += 8;

  const infoData = [
    ["Data", new Date(data.date).toLocaleDateString("pt-BR")],
    ["Horário", `${data.time}${data.endTime ? " - " + data.endTime : ""}`],
    ["Local", data.local],
    ["Descrição", data.description],
  ];

  autoTable(doc, {
    startY: currentY,
    body: infoData,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // --- Stats ---
  if (!data.hideStats) {
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Estatísticas", 14, currentY);
    currentY += 8;

    const statsData = [
      ["Parlamentares Presentes", data.presences.toString()],
      ["Proposições em Pauta", data.propositionsCount.toString()],
      ["Votações Realizadas", data.votingCount.toString()],
      ["Taxa de Aprovação", data.votingApprovalRate || "N/A"],
    ];

    autoTable(doc, {
      startY: currentY,
      body: statsData,
      theme: "striped",
      headStyles: { fillColor: [116, 156, 91] },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  // --- Voting Results (if any) ---
  if (data.votings && data.votings.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Resultados das Votações", 14, currentY);
    currentY += 8;

    const votingTableData = data.votings.map((v) => [
      v.description,
      v.result ? "APROVADA" : "REJEITADA",
      v.approvedCount,
      v.rejectedCount,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Descrição", "Resultado", "Sim", "Não"]],
      body: votingTableData,
      theme: "striped",
      headStyles: { fillColor: [26, 29, 31] },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  // --- Order of Day (Propositions) ---
  if (data.orderOfDay && data.orderOfDay.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Ordem do Dia / Requerimentos", 14, currentY);
    currentY += 8;

    const orderData = data.orderOfDay.map((p) => [
      p.title,
      p.topic || "-",
      p.status,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Item", "Tópico", "Situação"]],
      body: orderData,
      theme: "grid",
      headStyles: { fillColor: [116, 156, 91] },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  // --- Speakers (if any - mostly for Solemn) ---
  if (data.speakers && data.speakers.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Oradores", 14, currentY);
    currentY += 8;

    const speakersData = data.speakers.map((s) => [
      s.name,
      `${s.party}/${s.state}`,
      s.status,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Nome", "Partido/UF", "Status"]],
      body: speakersData,
      theme: "striped",
      headStyles: { fillColor: [116, 156, 91] },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  // --- Speeches with Full Transcriptions (for Solemn Sessions) ---
  if (data.speeches && data.speeches.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Falas dos Oradores - Transcrições Completas", 14, currentY);
    currentY += 12;

    data.speeches.forEach((speech, index) => {
      // Check if we need a new page before adding a new speech
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      // Speaker identification header
      doc.setFontSize(12);
      doc.setTextColor(116, 156, 91); // Secondary color
      doc.setFont("helvetica", "bold");
      const speakerInfo = `${index + 1}. ${speech.speakerName}`;
      if (speech.speakerParty || speech.speakerState) {
        const partyState = [speech.speakerParty, speech.speakerState]
          .filter(Boolean)
          .join("/");
        doc.text(`${speakerInfo} (${partyState})`, 14, currentY);
      } else {
        doc.text(speakerInfo, 14, currentY);
      }
      currentY += 6;

      // Time information if available
      if (speech.timeStart || speech.timeEnd) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        const timeInfo = speech.timeEnd
          ? `${speech.timeStart} - ${speech.timeEnd}`
          : speech.timeStart || "";
        doc.text(`Horário: ${timeInfo}`, 14, currentY);
        currentY += 5;
      }

      // Transcription text
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.setFont("helvetica", "normal");
      
      // Split text to fit page width (180mm width, 14mm margins on each side = 168mm)
      const maxWidth = 168;
      const transcriptionLines = doc.splitTextToSize(
        speech.transcription || "Transcrição não disponível",
        maxWidth,
      );

      // Add some spacing before the text
      currentY += 3;

      // Add transcription text line by line
      transcriptionLines.forEach((line: string) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(line, 14, currentY);
        currentY += 5;
      });

      // Add spacing between speeches
      currentY += 10;

      // Add a subtle separator line
      if (data.speeches && index < data.speeches.length - 1) {
        doc.setDrawColor(200);
        doc.setLineWidth(0.3);
        doc.line(14, currentY, 196, currentY);
        currentY += 10;
      }
    });
  }

  // --- Breves Comunicações ---
  if (data.brevesComunicacoes && data.brevesComunicacoes.speakers.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Breves Comunicações", 14, currentY);
    currentY += 8;

    const brevesData = data.brevesComunicacoes.speakers.map((s) => [
      s.name,
      s.party || "-",
      s.time,
      s.speechSummary || "Sem resumo disponível",
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Orador", "Partido", "Tempo", "Resumo"]],
      body: brevesData,
      theme: "striped",
      headStyles: { fillColor: [116, 156, 91] },
      columnStyles: {
        3: { cellWidth: 80 }, // Defina uma largura maior para a coluna de resumo
      },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  // --- Presence List ---
  if (data.presenceList && data.presenceList.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Lista de Presença", 14, currentY);
    currentY += 8;

    // Split presence into columns if too many? For now, simple list.
    const presenceTableData = data.presenceList.map((p) => [
      p.name,
      p.party,
      p.state,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Nome", "Partido", "UF"]],
      body: presenceTableData,
      theme: "plain", // Simple list
      headStyles: { fillColor: [200, 200, 200], textColor: 0 },
      margin: { left: 14, right: 14 },
    });
  }

  const safeTitle = data.title.replace(/[^a-z0-9]/gi, "_").substring(0, 30);
  doc.save(
    `Sessao_${safeTitle}_${new Date(data.date).toISOString().split("T")[0]}.pdf`,
  );
};
