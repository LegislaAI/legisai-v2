"use client";

import React, { Fragment, useState } from "react";
import { ChevronDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTION_HEADERS = [
  "ABERTURA DA SESSÃO",
  "LEITURA DA ATA",
  "EXPEDIENTE",
  "BREVES COMUNICAÇÕES",
  "ORDEM DO DIA",
  "ENCERRAMENTO",
  "PEQUENO EXPEDIENTE",
  "GRANDE EXPEDIENTE",
  "COMUNICAÇÕES PARLAMENTARES",
  "COMUNICAÇÕES DE LIDERANÇAS",
  "HOMENAGENS",
  "EXPLICAÇÃO PESSOAL",
  "DISCUSSÃO EM TURNO ÚNICO",
  "VOTAÇÃO EM TURNO ÚNICO",
  "DISCUSSÃO EM PRIMEIRO TURNO",
  "VOTAÇÃO EM PRIMEIRO TURNO",
  "DISCUSSÃO EM SEGUNDO TURNO",
  "VOTAÇÃO EM SEGUNDO TURNO",
];

/* ─── Preprocessing ────────────────────────────────────────────────────── */

export function preprocessSessionText(rawText: string): string {
  let text = rawText;

  const marker = "(Texto com redação final)";
  const markerIdx = text.indexOf(marker);
  let preamble = "";

  if (markerIdx !== -1) {
    preamble = text.slice(0, markerIdx).trim();
    text = text.slice(markerIdx);
  }

  text = text.replace(/\(Texto com redação final\)/, "\n\n(Texto com redação final)\n\n");

  for (const header of SECTION_HEADERS) {
    const esc = header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(esc, "g"), `\n\n${header}\n\n`);
  }

  text = text.replace(/((?:O SR\.|A SRA\.)\s+[^(]{1,80}\([^)]+\)\s*[–\-])/g, "\n\n$1");

  text = text.replace(/(Tem a palavra\b)/g, "\n\n$1");

  text = text.replace(/(\d{1,2}:\d{2}\s+RF\b)/g, "\n\n$1");

  if (preamble) {
    text = preamble + "\n\n" + text;
  }

  return text;
}

/* ─── Classification ───────────────────────────────────────────────────── */

type ParagraphType =
  | "section_header"
  | "sub_header"
  | "speaker"
  | "moderator_note"
  | "timestamp"
  | "preamble_label"
  | "speaker_timeline"
  | "text";

function classifyParagraph(text: string): ParagraphType {
  const t = text.trim();

  if (t === "(Texto com redação final)") return "preamble_label";

  const tsCount = (t.match(/\(\d{1,2}:\d{2}\)/g) ?? []).length;
  if (tsCount > 3) return "speaker_timeline";

  for (const h of SECTION_HEADERS) {
    if (t === h) return "section_header";
  }

  if (/^\([^)]+\)$/.test(t) && t.length < 300) return "sub_header";

  if (/^(?:O SR\.|A SRA\.)\s+[^(]{1,80}\([^)]+\)\s*[–\-]/.test(t)) return "speaker";

  if (/^Tem a palavra\b/.test(t)) return "moderator_note";

  if (/^\d{1,2}:\d{2}\s*(RF)?\s/.test(t)) return "timestamp";

  return "text";
}

/* ─── Inline formatting ────────────────────────────────────────────────── */

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\(Pausa\.\))/gi);
  if (parts.length <= 1) return text;
  return parts.map((p, i) =>
    /^\(Pausa\.\)$/i.test(p) ? (
      <em key={i} className="text-[#9ca3af]">
        {p}
      </em>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
}

function withSearch(content: string, searchTerm?: string): React.ReactNode {
  if (!searchTerm?.trim()) return formatInline(content);

  const esc = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = content.split(new RegExp(`(${esc})`, "gi"));

  return parts.map((part, i) =>
    part.toLowerCase() === searchTerm.trim().toLowerCase() ? (
      <mark key={i} className="rounded bg-amber-200/80 px-0.5 text-[#1a1d1f]">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{formatInline(part)}</Fragment>
    ),
  );
}

/* ─── Component ────────────────────────────────────────────────────────── */

interface SessionParagraphProps {
  text: string;
  searchTerm?: string;
  readingMode?: boolean;
  isHighlighted?: boolean;
  animationDelay?: number;
}

export function SessionParagraph({
  text,
  searchTerm,
  readingMode,
  isHighlighted,
  animationDelay = 0,
}: SessionParagraphProps) {
  const type = classifyParagraph(text);
  const [expanded, setExpanded] = useState(false);

  const anim = {
    animationDelay: `${animationDelay}ms`,
    animationFillMode: "backwards" as const,
  };

  switch (type) {
    case "preamble_label":
      return (
        <div
          className="py-3 text-center animate-in fade-in slide-in-from-bottom-1"
          style={anim}
        >
          <span className="inline-block rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-[#6f767e]">
            {text}
          </span>
        </div>
      );

    case "speaker_timeline": {
      const entries = text.match(/[\p{L}\s.]+?\s*\(\d{1,2}:\d{2}\)/gu) ?? [];
      return (
        <div
          className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50/50 animate-in fade-in slide-in-from-bottom-1"
          style={anim}
        >
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-100/50"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-[#6f767e]">
              <Clock size={14} />
              Ordem dos oradores ({entries.length} registros)
            </span>
            <ChevronDown
              size={16}
              className={cn(
                "text-[#6f767e] transition-transform duration-200",
                expanded && "rotate-180",
              )}
            />
          </button>
          {expanded && (
            <div className="border-t border-gray-200 px-4 py-3">
              <div className="flex flex-wrap gap-1.5">
                {entries.map((entry, i) => {
                  const m = entry.match(
                    /([\p{L}\s.]+?)\s*\((\d{1,2}:\d{2})\)/u,
                  );
                  if (!m) return null;
                  return (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs"
                    >
                      <span className="font-medium text-[#1a1d1f]">
                        {m[1].trim()}
                      </span>
                      <span className="text-[#9ca3af]">{m[2]}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    case "section_header":
      return (
        <div
          className="pb-2 pt-6 animate-in fade-in slide-in-from-bottom-1"
          style={anim}
        >
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#749c5b]/30 to-transparent" />
            <h3 className="shrink-0 text-center text-sm font-bold uppercase tracking-wider text-[#1a1d1f]">
              {withSearch(text, searchTerm)}
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#749c5b]/30 to-transparent" />
          </div>
        </div>
      );

    case "sub_header":
      return (
        <div
          className="py-1 text-center animate-in fade-in slide-in-from-bottom-1"
          style={anim}
        >
          <p className="text-sm font-semibold text-[#6f767e]">
            {withSearch(text, searchTerm)}
          </p>
        </div>
      );

    case "speaker": {
      const match = text.match(
        /^((?:O SR\.|A SRA\.)\s+[^(]+\([^)]+\))\s*[–\-]\s*([\s\S]*)/,
      );
      if (match) {
        const [, ident, speech] = match;
        return (
          <div
            className={cn(
              "rounded-lg border-l-4 border-l-[#749c5b] py-3 pl-4 animate-in fade-in slide-in-from-bottom-1",
              isHighlighted && "border border-amber-200/60 bg-amber-50 border-l-4 border-l-[#749c5b]",
            )}
            style={anim}
          >
            <p
              className={cn(
                readingMode
                  ? "text-stone-700"
                  : "text-sm leading-relaxed text-gray-700",
              )}
            >
              <strong className="text-[#2d6a1e]">
                {withSearch(ident, searchTerm)}
              </strong>
              <span className="text-[#2d6a1e]"> – </span>
              {withSearch(speech, searchTerm)}
            </p>
          </div>
        );
      }
      return (
        <div
          className={cn(
            "rounded-lg border-l-4 border-l-[#749c5b] py-3 pl-4 animate-in fade-in slide-in-from-bottom-1",
            isHighlighted && "border border-amber-200/60 bg-amber-50 border-l-4 border-l-[#749c5b]",
          )}
          style={anim}
        >
          <p
            className={cn(
              readingMode
                ? "text-stone-700"
                : "text-sm leading-relaxed text-gray-700",
            )}
          >
            <strong className="text-[#2d6a1e]">
              {withSearch(text, searchTerm)}
            </strong>
          </p>
        </div>
      );
    }

    case "moderator_note":
      return (
        <p
          className={cn(
            "border-l-2 border-[#749c5b]/30 py-2 pl-4 italic text-[#6f767e] animate-in fade-in slide-in-from-bottom-1",
            readingMode ? "text-base" : "text-sm",
            isHighlighted && "bg-amber-50 not-italic",
          )}
          style={anim}
        >
          {withSearch(text, searchTerm)}
        </p>
      );

    case "timestamp": {
      const tsMatch = text.match(/^(\d{1,2}:\d{2})\s*(RF)?\s*([\s\S]*)/);
      if (tsMatch) {
        const [, time, , rest] = tsMatch;
        return (
          <div
            className="flex items-start gap-3 pt-4 animate-in fade-in slide-in-from-bottom-1"
            style={anim}
          >
            <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md bg-[#749c5b]/10 px-2.5 py-1 text-xs font-semibold tabular-nums text-[#749c5b]">
              <Clock size={12} />
              {time}
            </span>
            {rest.trim() && (
              <p
                className={cn(
                  readingMode ? "text-stone-700" : "text-sm text-gray-700",
                )}
              >
                {withSearch(rest.trim(), searchTerm)}
              </p>
            )}
          </div>
        );
      }
      return (
        <p
          className="text-sm text-gray-700 animate-in fade-in slide-in-from-bottom-1"
          style={anim}
        >
          {withSearch(text, searchTerm)}
        </p>
      );
    }

    default:
      return (
        <p
          className={cn(
            "rounded-lg px-3 py-2 transition-colors duration-200 animate-in fade-in slide-in-from-bottom-1",
            readingMode
              ? "text-stone-700"
              : "text-sm leading-relaxed text-gray-700",
            isHighlighted
              ? "border border-amber-200/60 bg-amber-50 text-[#1a1d1f]"
              : "odd:bg-gray-50/50",
          )}
          style={anim}
        >
          {withSearch(text, searchTerm)}
        </p>
      );
  }
}
