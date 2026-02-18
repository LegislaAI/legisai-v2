"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { Button } from "@/components/v2/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/v2/components/ui/select";
import { BarChart3, Receipt } from "lucide-react";
import dynamic from "next/dynamic";
import type { DeputadoPageData } from "./useDeputadoPage";
import { SkeletonLoader } from "./SkeletonLoader";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function TabDespesasFinanceiro({ data }: { data: DeputadoPageData }) {
  const {
    selectedYear,
    chartOptions,
    chartSeries,
    hasChartData,
    finance,
    hasFinanceDetail,
    availableYears,
    ceapAno,
    setCeapAno,
    ceapPage,
    setCeapPage,
    ceapResumo,
    despesasCeap,
    loadingCeapResumo,
    loadingCeapDespesas,
    ceapHasMore,
  } = data;

  return (
    <div className="space-y-6">
      <Card className="hover:border-secondary/10 overflow-hidden border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="border-b border-gray-100/50 p-6 pb-2">
          <h3 className="text-dark flex items-center gap-2 text-lg font-bold">
            <BarChart3 className="text-secondary h-5 w-5" />
            Execução Financeira
            <span className="bg-secondary/10 text-secondary rounded-full px-2 py-0.5 text-xs font-semibold">
              {selectedYear}
            </span>
          </h3>
          <p className="text-sm text-gray-500">
            Cota parlamentar e verba de gabinete
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
          <div className="md:col-span-2">
            {hasChartData ? (
              <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type="area"
                height={280}
                width="100%"
              />
            ) : (
              <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-gray-400">
                <BarChart3 className="h-10 w-10 opacity-30" />
                <p className="text-sm">
                  Sem dados financeiros para o ano selecionado
                </p>
              </div>
            )}
          </div>
          {finance && (
            <>
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                <p className="mb-1 text-xs tracking-wider text-gray-400 uppercase">
                  Cota parlamentar utilizada
                </p>
                <p className="text-dark text-lg font-bold">
                  R${" "}
                  {finance.usedParliamentaryQuota?.toLocaleString("pt-BR") ??
                    "—"}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                <p className="mb-1 text-xs tracking-wider text-gray-400 uppercase">
                  Verba de gabinete utilizada
                </p>
                <p className="text-dark text-lg font-bold">
                  R${" "}
                  {finance.usedCabinetQuota?.toLocaleString("pt-BR") ?? "—"}
                </p>
              </div>
            </>
          )}
        </div>
        {hasFinanceDetail && finance && (
          <div className="border-t border-gray-100 bg-gray-50/30 px-6 py-4">
            <h4 className="mb-3 text-xs font-bold tracking-wider text-gray-500 uppercase">
              Detalhamento
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                finance.contractedPeople,
                finance.grossSalary,
                finance.functionalPropertyUsage,
                finance.trips,
                finance.diplomaticPassport,
                finance.housingAssistant,
              ]
                .filter(Boolean)
                .map((item, idx) => (
                  <span
                    key={idx}
                    className="bg-secondary/5 text-secondary rounded-lg px-3 py-1.5 text-xs font-medium"
                  >
                    {item}
                  </span>
                ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="hover:border-secondary/10 border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="border-b border-gray-100/50 p-6 pb-2">
          <h3 className="text-dark flex items-center gap-2 text-lg font-bold">
            <Receipt className="text-secondary h-5 w-5" />
            CEAP (Cota Parlamentar)
          </h3>
          <p className="text-sm text-gray-500">
            Despesas com cota para exercício da atividade parlamentar
          </p>
        </div>
        <div className="space-y-4 p-6">
          <Select
            value={ceapAno}
            onValueChange={(v) => {
              setCeapAno(v);
              setCeapPage(1);
            }}
          >
            <SelectTrigger className="w-[100px] border-gray-200 bg-gray-50">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {loadingCeapResumo ? (
            <div className="flex gap-4">
              <SkeletonLoader className="h-14 w-28" />
            </div>
          ) : ceapResumo ? (
            <>
              <div className="flex flex-wrap gap-4">
                <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                  <p className="text-xs tracking-wider text-gray-500 uppercase">
                    Total no período
                  </p>
                  <p className="text-dark text-xl font-bold">
                    R${" "}
                    {ceapResumo.total.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                {ceapResumo.ultimaData && (
                  <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                    <p className="text-xs tracking-wider text-gray-500 uppercase">
                      Último lançamento
                    </p>
                    <p className="text-dark text-sm font-bold">
                      {new Date(
                        ceapResumo.ultimaData,
                      ).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
                <a
                  href={ceapResumo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-secondary/80 self-center text-sm font-medium"
                >
                  Ver na Câmara →
                </a>
              </div>
              {ceapResumo.topCategorias.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">
                    Top categorias
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {ceapResumo.topCategorias.slice(0, 8).map((c) => (
                      <span
                        key={c.tipoDespesa}
                        className="hover:border-secondary/20 hover:bg-secondary/5 rounded-lg border border-gray-100 bg-gray-50/50 px-2.5 py-1.5 text-xs transition-colors"
                      >
                        {c.descricao || c.tipoDespesa}: R${" "}
                        {c.valor.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">
              Linhas (detalhes)
            </h4>
            {loadingCeapDespesas ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <SkeletonLoader key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : despesasCeap.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                        <th className="pr-2 pb-2">Data</th>
                        <th className="pr-2 pb-2">Tipo</th>
                        <th className="pr-2 pb-2">Fornecedor</th>
                        <th className="pr-2 pb-2">Valor</th>
                        <th className="pb-2 pl-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {despesasCeap.map((d, i) => (
                        <tr
                          key={i}
                          className="hover:bg-secondary/5 border-b border-gray-50 transition-colors"
                        >
                          <td className="py-2 pr-2 text-gray-700">
                            {d.dataDocumento
                              ? new Date(
                                  d.dataDocumento,
                                ).toLocaleDateString("pt-BR")
                              : "—"}
                          </td>
                          <td className="py-2 pr-2">
                            {d.descricao || d.tipoDespesa || "—"}
                          </td>
                          <td
                            className="max-w-[180px] truncate py-2 pr-2"
                            title={d.nomeFornecedor}
                          >
                            {d.nomeFornecedor || "—"}
                          </td>
                          <td className="py-2 pr-2 font-medium">
                            R${" "}
                            {Number(
                              d.valorLiquido ?? d.valorDocumento ?? 0,
                            ).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="py-2 pl-2">
                            {d.urlDocumento && (
                              <a
                                href={d.urlDocumento}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary hover:text-secondary/80 text-xs font-medium"
                              >
                                Doc
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(ceapHasMore || ceapPage > 1) && (
                  <div className="mt-3 flex gap-2">
                    {ceapPage > 1 && (
                      <Button
                        variant="outline"
                        className="border-gray-200"
                        onClick={() =>
                          setCeapPage((p) => Math.max(1, p - 1))
                        }
                      >
                        Anterior
                      </Button>
                    )}
                    {ceapHasMore && (
                      <Button
                        variant="outline"
                        className="border-gray-200"
                        onClick={() => setCeapPage((p) => p + 1)}
                      >
                        Próxima
                      </Button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="py-4 text-center text-sm text-gray-500">
                Nenhuma despesa encontrada para o ano selecionado.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
