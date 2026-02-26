"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/v2/components/ui/accordion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMemo } from "react";

export interface SessionSummaryReportProps {
  content: string;
  className?: string;
}

interface ParsedSection {
  title: string;
  body: string;
  slug: string;
  colorKey: "blue" | "amber" | "violet" | "green" | "gray";
}

const SECTION_COLORS: Record<
  ParsedSection["colorKey"],
  { border: string; bg: string; highlight: string }
> = {
  blue: { border: "border-l-blue-500", bg: "bg-blue-50/60", highlight: "text-blue-600" },
  amber: { border: "border-l-amber-500", bg: "bg-amber-50/60", highlight: "text-amber-700" },
  violet: { border: "border-l-violet-500", bg: "bg-violet-50/60", highlight: "text-violet-600" },
  green: { border: "border-l-[#749c5b]", bg: "bg-[#749c5b]/10", highlight: "text-[#749c5b]" },
  gray: { border: "border-l-gray-400", bg: "bg-gray-50/80", highlight: "text-gray-600" },
};

function getColorKey(title: string): ParsedSection["colorKey"] {
  const t = title.toLowerCase();
  if (t.includes("contexto") && t.includes("clima")) return "blue";
  if (t.includes("dinâmicas") || t.includes("poder") || t.includes("articulações")) return "amber";
  if (t.includes("discursos") || t.includes("posicionamentos")) return "violet";
  if (t.includes("evolução") || t.includes("pauta") || t.includes("ações práticas")) return "green";
  if (t.includes("notas do analista")) return "gray";
  return "gray";
}

function toSlug(title: string): string {
  return title
    .replace(/\s*[\u{1F300}-\u{1F9FF}]/gu, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 80) || "section";
}

function parseSections(content: string): ParsedSection[] {
  if (!content?.trim()) return [];
  const raw = content.trim();
  const parts = raw.split(/###\s+/);
  const sections: ParsedSection[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;
    const firstNewline = part.indexOf("\n");
    const title = firstNewline === -1 ? part : part.slice(0, firstNewline);
    const body = firstNewline === -1 ? "" : part.slice(firstNewline + 1).trim();
    const slug = toSlug(title) || `section-${i}`;
    sections.push({
      title,
      body,
      slug,
      colorKey: getColorKey(title),
    });
  }

  return sections;
}

export function SessionSummaryReport({ content, className }: SessionSummaryReportProps) {
  const sections = useMemo(() => parseSections(content), [content]);

  if (sections.length === 0) {
    return (
      <div className={cn("prose prose-sm max-w-none", className)}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Accordion
          type="multiple"
          defaultValue={sections.map((s) => s.slug)}
          className="flex flex-col gap-5"
        >
          {sections.map((section) => {
            const colors = SECTION_COLORS[section.colorKey];
            return (
              <AccordionItem
                key={section.slug}
                value={section.slug}
                id={section.slug}
                className={cn(
                  "rounded-xl border border-gray-100 overflow-hidden shadow-sm border-b border-b-gray-100",
                  colors.border,
                  "border-l-4",
                  colors.bg,
                  "px-0 [&>button]:px-5 [&>button]:py-4",
                  "mb-5 last:mb-0"
                )}
              >
                <AccordionTrigger className="text-lg font-bold text-[#1a1d1f] hover:no-underline hover:text-[#1a1d1f] [&[data-state=open]>svg]:rotate-180">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-0">
                  <div className="session-summary-body text-sm text-[#1a1d1f] leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        ul: ({ children, ...props }) => (
                          <ul className="list-disc pl-5 space-y-1.5 my-2 text-[#1a1d1f]" {...props}>
                            {children}
                          </ul>
                        ),
                        ol: ({ children, ...props }) => (
                          <ol className="list-decimal pl-5 space-y-1.5 my-2 text-[#1a1d1f]" {...props}>
                            {children}
                          </ol>
                        ),
                        li: ({ children, ...props }) => (
                          <li className="text-[#1a1d1f]" {...props}>
                            {children}
                          </li>
                        ),
                        strong: ({ children, ...props }) => (
                          <strong
                            className={cn("font-semibold", colors.highlight)}
                            {...props}
                          >
                            {children}
                          </strong>
                        ),
                        p: ({ children, ...props }) => (
                          <p className="my-2 text-[#1a1d1f]" {...props}>
                            {children}
                          </p>
                        ),
                      }}
                    >
                      {section.body || "*Sem ocorrências relevantes nesta sessão.*"}
                    </ReactMarkdown>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
      </Accordion>
    </div>
  );
}
