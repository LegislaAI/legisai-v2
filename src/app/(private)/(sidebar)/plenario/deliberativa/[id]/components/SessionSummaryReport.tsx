"use client";

import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMemo, useState } from "react";
import {
  BarChart3,
  Swords,
  MessageSquareText,
  ClipboardList,
  Microscope,
  Lightbulb,
  Pin,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SessionSummaryReportProps {
  content: string;
  className?: string;
}

type TabKey = "panorama" | "analise";

interface ParsedSection {
  title: string;
  body: string;
  slug: string;
  tab: TabKey;
  icon: LucideIcon;
  accent: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
}

const SECTION_CONFIG: {
  match: (t: string) => boolean;
  tab: TabKey;
  icon: LucideIcon;
  accent: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
}[] = [
  {
    match: (t) => t.includes("contexto") && t.includes("clima"),
    tab: "panorama",
    icon: BarChart3,
    accent: "text-blue-600",
    accentBg: "bg-blue-50/70",
    accentBorder: "border-blue-200",
    accentText: "text-blue-700",
  },
  {
    match: (t) => t.includes("dinâmica") || t.includes("poder"),
    tab: "panorama",
    icon: Swords,
    accent: "text-amber-600",
    accentBg: "bg-amber-50/70",
    accentBorder: "border-amber-200",
    accentText: "text-amber-700",
  },
  {
    match: (t) => t.includes("discurso") || t.includes("posicionamento"),
    tab: "panorama",
    icon: MessageSquareText,
    accent: "text-violet-600",
    accentBg: "bg-violet-50/70",
    accentBorder: "border-violet-200",
    accentText: "text-violet-700",
  },
  {
    match: (t) => t.includes("pauta") || t.includes("resultado"),
    tab: "panorama",
    icon: ClipboardList,
    accent: "text-[#749c5b]",
    accentBg: "bg-[#749c5b]/10",
    accentBorder: "border-[#749c5b]/30",
    accentText: "text-[#5a8045]",
  },
  {
    match: (t) => t.includes("dimensõ") || t.includes("dimensões") || t.includes("dimensao"),
    tab: "analise",
    icon: Microscope,
    accent: "text-cyan-600",
    accentBg: "bg-cyan-50/70",
    accentBorder: "border-cyan-200",
    accentText: "text-cyan-700",
  },
  {
    match: (t) => t.includes("insight"),
    tab: "analise",
    icon: Lightbulb,
    accent: "text-orange-500",
    accentBg: "bg-orange-50/70",
    accentBorder: "border-orange-200",
    accentText: "text-orange-700",
  },
  {
    match: (t) => t.includes("síntese") || t.includes("sintese"),
    tab: "analise",
    icon: Pin,
    accent: "text-rose-500",
    accentBg: "bg-rose-50/70",
    accentBorder: "border-rose-200",
    accentText: "text-rose-700",
  },
];

const DEFAULT_CONFIG = {
  tab: "panorama" as TabKey,
  icon: ClipboardList,
  accent: "text-gray-500",
  accentBg: "bg-gray-50/70",
  accentBorder: "border-gray-200",
  accentText: "text-gray-600",
};

function stripEmoji(text: string): string {
  return text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();
}

function toSlug(title: string): string {
  return stripEmoji(title)
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 80) || "section";
}

function parseSections(content: string): ParsedSection[] {
  if (!content?.trim()) return [];

  const parts = content.trim().split(/^###\s+/m);
  const sections: ParsedSection[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;

    const firstNewline = part.indexOf("\n");
    const title = (firstNewline === -1 ? part : part.slice(0, firstNewline)).trim();
    const body = firstNewline === -1 ? "" : part.slice(firstNewline + 1).trim();

    if (!title) continue;

    const tLower = title.toLowerCase();
    const cfg = SECTION_CONFIG.find((c) => c.match(tLower)) ?? DEFAULT_CONFIG;

    sections.push({
      title: stripEmoji(title),
      body,
      slug: toSlug(title) || `section-${i}`,
      tab: cfg.tab,
      icon: cfg.icon,
      accent: cfg.accent,
      accentBg: cfg.accentBg,
      accentBorder: cfg.accentBorder,
      accentText: cfg.accentText,
    });
  }

  return sections;
}

function MarkdownBody({
  body,
  accentText,
}: {
  body: string;
  accentText: string;
}) {
  return (
    <div className="text-sm text-[#33373b] leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          ul: ({ children, ...props }) => (
            <ul
              className="list-disc pl-5 space-y-1.5 my-2 text-[#33373b]"
              {...props}
            >
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol
              className="list-decimal pl-5 space-y-1.5 my-2 text-[#33373b]"
              {...props}
            >
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-[#33373b]" {...props}>
              {children}
            </li>
          ),
          strong: ({ children, ...props }) => (
            <strong className={cn("font-semibold", accentText)} {...props}>
              {children}
            </strong>
          ),
          p: ({ children, ...props }) => (
            <p className="my-2 text-[#33373b]" {...props}>
              {children}
            </p>
          ),
          table: ({ children, ...props }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-500" {...props}>
              {children}
            </thead>
          ),
          th: ({ children, ...props }) => (
            <th className="px-4 py-2 text-left" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border-t border-gray-100 px-4 py-2" {...props}>
              {children}
            </td>
          ),
        }}
      >
        {body || "*Sem ocorrências relevantes nesta sessão.*"}
      </ReactMarkdown>
    </div>
  );
}

function SectionCard({ section }: { section: ParsedSection }) {
  const Icon = section.icon;

  return (
    <div
      className={cn(
        "rounded-xl border bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md",
        section.accentBorder
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 px-5 py-4 border-b",
          section.accentBg,
          section.accentBorder
        )}
      >
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            section.accentBg
          )}
        >
          <Icon className={section.accent} size={20} />
        </div>
        <h4 className="text-base font-bold text-[#1a1d1f]">{section.title}</h4>
      </div>
      <div className="px-5 py-4">
        <MarkdownBody body={section.body} accentText={section.accentText} />
      </div>
    </div>
  );
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "panorama", label: "Panorama factual" },
  { key: "analise", label: "Leitura analítica" },
];

export function SessionSummaryReport({
  content,
  className,
}: SessionSummaryReportProps) {
  const sections = useMemo(() => parseSections(content), [content]);
  const [activeTab, setActiveTab] = useState<TabKey>("panorama");

  if (sections.length === 0) {
    return (
      <div className={cn("prose prose-sm max-w-none", className)}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    );
  }

  const panoramaSections = sections.filter((s) => s.tab === "panorama");
  const analiseSections = sections.filter((s) => s.tab === "analise");
  const activeSections =
    activeTab === "panorama" ? panoramaSections : analiseSections;

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
        {TABS.map(({ key, label }) => {
          const count =
            key === "panorama"
              ? panoramaSections.length
              : analiseSections.length;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                activeTab === key
                  ? "bg-white text-[#1a1d1f] shadow-sm"
                  : "text-[#6f767e] hover:text-[#1a1d1f]"
              )}
            >
              {label}
              {count > 0 && (
                <span
                  className={cn(
                    "ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                    activeTab === key
                      ? "bg-[#749c5b]/15 text-[#749c5b]"
                      : "bg-gray-200 text-gray-500"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-4">
        {activeSections.map((section) => (
          <SectionCard key={section.slug} section={section} />
        ))}
        {activeSections.length === 0 && (
          <p className="py-8 text-center text-sm text-[#6f767e]">
            Nenhuma informação disponível nesta seção.
          </p>
        )}
      </div>
    </div>
  );
}
