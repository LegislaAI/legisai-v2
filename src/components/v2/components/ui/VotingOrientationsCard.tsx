"use client";

import { useApiContext } from "@/context/ApiContext";
import { useEffect, useState } from "react";

interface OrientationItem {
    id: string;
    votingId: string;
    bancadaSigla: string;
    orientacao: string;
    bancadaTipo: string | null;
}

interface OrientationSummary {
    votingId: string;
    total: number;
    summary: Record<string, string[]>;
}

const ORIENTACAO_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    Sim: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    Não: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    Liberado: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    Obstrução: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
};

const getOrientacaoStyle = (orientacao: string) => {
    return (
        ORIENTACAO_COLORS[orientacao] || {
            bg: "bg-gray-50",
            text: "text-gray-700",
            border: "border-gray-200",
        }
    );
};

export function VotingOrientationsCard({ votingId }: { votingId: string }) {
    const { GetAPI } = useApiContext();
    const [summary, setSummary] = useState<OrientationSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [hasSynced, setHasSynced] = useState(false);

    const fetchOrientations = async () => {
        if (!votingId) return;
        setLoading(true);
        try {
            const res = await GetAPI(`/voting-orientation/${votingId}/summary`, true);
            if (res.status === 200 && res.body) {
                setSummary(res.body);
            }
        } catch {
            // Silently fail
        } finally {
            setLoading(false);
        }
    };

    const syncOrientations = async () => {
        if (!votingId || syncing) return;
        setSyncing(true);
        try {
            await GetAPI(`/voting-orientation/${votingId}/sync`, true);
            setHasSynced(true);
            await fetchOrientations();
        } catch {
            // Silently fail
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        fetchOrientations();
    }, [votingId]);

    // Auto-sync if no data found
    useEffect(() => {
        if (!loading && summary && summary.total === 0 && !hasSynced) {
            syncOrientations();
        }
    }, [loading, summary, hasSynced]);

    if (loading || syncing) {
        return (
            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#749c5b] border-t-transparent" />
                    {syncing ? "Buscando orientações das bancadas..." : "Carregando orientações..."}
                </div>
            </div>
        );
    }

    if (!summary || summary.total === 0) {
        return null; // Don't show anything if no orientations
    }

    const orientacoes = Object.entries(summary.summary).sort(
        (a, b) => b[1].length - a[1].length
    );

    return (
        <div className="mt-4 rounded-lg border border-[#749c5b]/20 bg-white p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1a1d1f]">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#749c5b]"
                >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Orientação das Bancadas
                <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    {summary.total} bancadas
                </span>
            </h4>

            <div className="space-y-3">
                {orientacoes.map(([orientacao, bancadas]) => {
                    const style = getOrientacaoStyle(orientacao);
                    return (
                        <div key={orientacao}>
                            <div className="mb-1.5 flex items-center gap-2">
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${style.bg} ${style.text} border ${style.border}`}
                                >
                                    {orientacao}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {bancadas.length} {bancadas.length === 1 ? "bancada" : "bancadas"}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {bancadas.map((bancada) => (
                                    <span
                                        key={bancada}
                                        className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700"
                                    >
                                        {bancada}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
