"use client";

import { SignaturePlan } from "@/@types/signature";
import { Button } from "@/components/v2/components/ui/Button";
import { Card } from "@/components/v2/components/ui/Card";
import { useSignatureContext } from "@/context/SignatureContext";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PlansPage() {
  const router = useRouter();
  const { plans, isLoading } = useSignatureContext();
  const [isYearly, setIsYearly] = useState(true);

  const handleSelectPlan = (plan: SignaturePlan) => {
    router.push(`/checkout?planId=${plan.id}&yearly=${isYearly}`);
  };

  const calculatePrice = (plan: SignaturePlan, yearly: boolean) => {
    const basePrice = plan.pixPrice;
    if (yearly) {
      const annualPrice = basePrice * 12;
      const discountedPrice = annualPrice * (1 - plan.yearlyDiscount / 100);
      return {
        monthly: discountedPrice / 12,
        total: discountedPrice,
        savings: annualPrice - discountedPrice,
      };
    }
    return {
      monthly: basePrice,
      total: basePrice,
      savings: 0,
    };
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-secondary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full max-w-4xl px-4">
      <div className="mb-10 text-center">
        <h2 className="text-dark text-3xl font-bold">Escolha o seu plano</h2>
        <p className="mt-2 text-gray-500">
          Desbloqueie todo o potencial da inteligência artificial jurídica.
        </p>

        {/* Toggle Anual/Mensal */}
        <div className="bg-surface mt-6 inline-flex items-center gap-3 rounded-full p-1">
          <button
            onClick={() => setIsYearly(false)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              !isYearly
                ? "text-secondary bg-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              isYearly
                ? "text-secondary bg-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Anual
            <span className="ml-1 text-xs font-semibold text-green-600">
              Economize
            </span>
          </button>
        </div>
      </div>

      <div
        className={`grid gap-8 ${
          plans.length === 1
            ? "mx-auto max-w-md grid-cols-1"
            : plans.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {plans
          .filter((p) => p.status === "active")
          .map((plan, index) => {
            const pricing = calculatePrice(plan, isYearly);
            const isHighlighted =
              index === plans.length - 1 || plans.length === 1;

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col transition-all duration-300 hover:shadow-lg ${
                  isHighlighted ? "border-secondary border-2" : ""
                }`}
              >
                {isHighlighted && (
                  <div className="bg-secondary absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold tracking-wide text-white uppercase">
                    Recomendado
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-dark text-xl font-bold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-dark text-4xl font-bold">
                    R${" "}
                    {pricing.monthly.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-sm text-gray-500">/mês</span>

                  {isYearly && pricing.savings > 0 && (
                    <div className="mt-2">
                      <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                        Economia de R${" "}
                        {pricing.savings.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        /ano
                      </span>
                    </div>
                  )}
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  <li className="flex items-start text-sm text-gray-600">
                    <Check className="text-secondary mr-2 h-5 w-5 shrink-0" />
                    Acesso ilimitado à plataforma
                  </li>
                  <li className="flex items-start text-sm text-gray-600">
                    <Check className="text-secondary mr-2 h-5 w-5 shrink-0" />
                    Análises avançadas de IA
                  </li>
                  <li className="flex items-start text-sm text-gray-600">
                    <Check className="text-secondary mr-2 h-5 w-5 shrink-0" />
                    Suporte prioritário
                  </li>
                  <li className="flex items-start text-sm text-gray-600">
                    <Check className="text-secondary mr-2 h-5 w-5 shrink-0" />
                    {plan.userQuantity} usuário
                    {plan.userQuantity > 1 ? "s" : ""}
                  </li>
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan)}
                  variant={isHighlighted ? "primary" : "outline"}
                  className="w-full"
                >
                  Assinar Agora
                </Button>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
