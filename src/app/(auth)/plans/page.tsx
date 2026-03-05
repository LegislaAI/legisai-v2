"use client";

import { SignaturePlan } from "@/@types/signature";
import { Button } from "@/components/v2/components/ui/Button";
import { Card } from "@/components/v2/components/ui/Card";
import { useSignatureContext } from "@/context/SignatureContext";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PlansPage() {
  const router = useRouter();
  const { plans, isLoading } = useSignatureContext();

  const handleSelectPlan = (plan: SignaturePlan) => {
    router.push(`/checkout?planId=${plan.id}&yearly=false`);
  };

  const monthlyPrice = (plan: SignaturePlan) => plan.creditCardPrice;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-secondary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full max-w-6xl px-4">
      <div className="mb-10 text-center">
        <h2 className="text-dark text-3xl font-bold">Escolha o seu plano</h2>
        <p className="mt-2 text-gray-500">
          Desbloqueie todo o potencial da inteligência artificial jurídica.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans
          .filter((p) => p.status === "active")
          .map((plan, index) => {
            const price = monthlyPrice(plan);
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
                    {price.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-sm text-gray-500">/mês</span>
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
