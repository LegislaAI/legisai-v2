"use client";

import { Button } from "@/components/v2/components/ui/Button";
import { Card } from "@/components/v2/components/ui/Card";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  isActive: boolean;
  benefits: string[];
}

const mockPlans: Plan[] = [
  {
    id: "free",
    name: "Gratuito",
    price: 0,
    description: "Para quem está começando",
    isActive: true,
    benefits: [
      "Acesso básico à plataforma",
      "Limite de 5 pesquisas por mês",
      "Suporte via comunidade",
    ],
  },
  {
    id: "pro",
    name: "Profissional",
    price: 99.90,
    description: "Para uso avançado e profissional",
    isActive: true,
    benefits: [
      "Acesso ilimitado",
      "Análises avançadas de IA",
      "Suporte prioritário",
      "Exportação de dados",
      "Acesso antecipado a novas features",
    ],
  },
];

export default function PlansPage() {
  const router = useRouter();

  const handleSelectPlan = (plan: Plan) => {
    if (plan.price === 0) {
      router.push("/"); // Redirect to dashboard/home for free plan
    } else {
      router.push("/checkout"); // Redirect to checkout for paid plan
    }
  };

  return (
    <div className="w-full max-w-4xl px-4 animate-fade-in">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-dark">Escolha o seu plano</h2>
        <p className="mt-2 text-gray-500">
          Desbloqueie todo o potencial da inteligência artificial jurídica.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {mockPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col relative transition-all duration-300 hover:shadow-lg ${
              plan.id === "pro" ? "border-secondary border-2" : ""
            }`}
          >
            {plan.id === "pro" && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Recomendado
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-dark">{plan.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-dark">
                R$ {plan.price.toFixed(2).replace(".", ",")}
              </span>
              <span className="text-gray-500 text-sm">/mês</span>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {plan.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600">
                  <Check className="h-5 w-5 text-secondary mr-2 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleSelectPlan(plan)}
              variant={plan.id === "pro" ? "primary" : "outline"}
              className="w-full"
            >
              {plan.price === 0 ? "Começar Grátis" : "Assinar Agora"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
