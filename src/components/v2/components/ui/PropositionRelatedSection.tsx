"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { useApiContext } from "@/context/ApiContext";
import { FileText, GitBranch, Link2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface RelatedItem {
    id: string;
    propositionBaseId: string;
    propositionRelatedId: string;
    relationType: string | null;
    siglaRelated: string | null;
    ementaRelated: string | null;
}

interface GroupedRelated {
    propositionId: string;
    total: number;
    byType: Record<string, RelatedItem[]>;
}

const RELATION_ICONS: Record<string, string> = {
    Emenda: "📝",
    Substitutivo: "🔄",
    Parecer: "📋",
    Recurso: "⚖️",
    "Voto em Separado": "🗳️",
    Requerimento: "📩",
    Apensada: "📎",
};

export function PropositionRelatedSection({
    propositionId,
}: {
    propositionId: string;
}) {
    const { GetAPI, PostAPI } = useApiContext();
    const [grouped, setGrouped] = useState<GroupedRelated | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [hasSynced, setHasSynced] = useState(false);

    const fetchRelated = async () => {
        if (!propositionId) return;
        setLoading(true);
        try {
            const res = await GetAPI(
                `/proposition-related/${propositionId}/grouped`,
                true
            );
            if (res.status === 200 && res.body) {
                setGrouped(res.body);
            }
        } catch {
            // Silently fail
        } finally {
            setLoading(false);
        }
    };

    const syncRelated = async () => {
        if (!propositionId || syncing) return;
        setSyncing(true);
        try {
            await PostAPI(`/proposition-related/${propositionId}/sync`, {}, true);
            setHasSynced(true);
            await fetchRelated();
        } catch {
            // Silently fail
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        fetchRelated();
    }, [propositionId]);

    // Auto-sync if no data
    useEffect(() => {
        if (!loading && grouped && grouped.total === 0 && !hasSynced) {
            syncRelated();
        }
    }, [loading, grouped, hasSynced]);

    if (loading || syncing) {
        return (
            <Card className="border-gray-100 p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#749c5b] border-t-transparent" />
                    {syncing
                        ? "Buscando proposições relacionadas..."
                        : "Carregando..."}
                </div>
            </Card>
        );
    }

    if (!grouped || grouped.total === 0) {
        return null;
    }

    const types = Object.entries(grouped.byType);

    return (
        <Card className="border-gray-100 p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                <GitBranch className="h-4 w-4" />
                Proposições Relacionadas
                <span className="ml-auto rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-bold text-secondary">
                    {grouped.total}
                </span>
            </h3>

            <div className="space-y-4">
                {types.map(([type, items]) => (
                    <div key={type}>
                        <div className="mb-2 flex items-center gap-2">
                            <span className="text-base">{RELATION_ICONS[type] || "📄"}</span>
                            <span className="text-sm font-semibold text-gray-700">
                                {type}
                            </span>
                            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                                {items.length}
                            </span>
                        </div>
                        <div className="space-y-2 pl-6">
                            {items.slice(0, 5).map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                                >
                                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                    <div className="min-w-0 flex-1">
                                        {item.siglaRelated && (
                                            <Link
                                                href={`/propositions/${item.propositionRelatedId}`}
                                                className="text-sm font-semibold text-secondary hover:underline"
                                            >
                                                {item.siglaRelated}
                                            </Link>
                                        )}
                                        {item.ementaRelated && (
                                            <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">
                                                {item.ementaRelated}
                                            </p>
                                        )}
                                    </div>
                                    <Link
                                        href={`/propositions/${item.propositionRelatedId}`}
                                        className="shrink-0 text-gray-400 hover:text-secondary"
                                    >
                                        <Link2 className="h-4 w-4" />
                                    </Link>
                                </div>
                            ))}
                            {items.length > 5 && (
                                <p className="text-xs text-gray-400">
                                    +{items.length - 5} mais...
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
