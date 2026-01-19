"use client";

import { PixPaymentResponse, SignaturePlan } from "@/@types/signature";
import { Button } from "@/components/v2/components/ui/Button";
import { Card } from "@/components/v2/components/ui/Card";
import { Input } from "@/components/v2/components/ui/Input";
import { useApiContext } from "@/context/ApiContext";
import { useSignatureContext } from "@/context/SignatureContext";
import {
  maskCVC,
  maskCard,
  maskCep,
  maskCpfCnpj,
  maskExpiryDate,
  maskPhone,
} from "@/lib/masks";
import { copyToClipboard } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  Loader2,
  QrCode,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

// Schemas
const cardSchema = z.object({
  holderName: z.string().min(3, "Nome inválido"),
  number: z.string().min(16, "Número inválido"),
  expiryDate: z.string().min(5, "Data inválida"),
  ccv: z.string().min(3, "CVV inválido"),
});

const holderSchema = z.object({
  name: z.string().min(3, "Nome completo obrigatório"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  cpfCnpj: z.string().min(11, "Documento inválido"),
  postalCode: z.string().min(8, "CEP inválido"),
  addressNumber: z.string().min(1, "Número obrigatório"),
});

type PaymentMethod = "card" | "pix";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { PostAPI } = useApiContext();
  const { plans, checkSubscription } = useSignatureContext();

  const planId = searchParams.get("planId");
  const isYearly = searchParams.get("yearly") === "true";

  const [plan, setPlan] = useState<SignaturePlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [currentStep, setCurrentStep] = useState(0);
  const [installments, setInstallments] = useState(1);
  const [pixPayload, setPixPayload] = useState<PixPaymentResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardForm = useForm<z.infer<typeof cardSchema>>({
    resolver: zodResolver(cardSchema),
  });
  const holderForm = useForm<z.infer<typeof holderSchema>>({
    resolver: zodResolver(holderSchema),
  });

  useEffect(() => {
    if (planId && plans.length > 0) {
      const foundPlan = plans.find((p) => p.id === planId);
      if (foundPlan) {
        setPlan(foundPlan);
      } else {
        toast.error("Plano não encontrado");
        router.push("/plans");
      }
    }
  }, [planId, plans, router]);

  const calculatePrice = () => {
    if (!plan) return { monthly: 0, total: 0 };
    const basePrice =
      paymentMethod === "pix" ? plan.pixPrice : plan.creditCardPrice;
    if (isYearly) {
      const annualPrice = basePrice * 12;
      const discountedPrice = annualPrice * (1 - plan.yearlyDiscount / 100);
      return {
        monthly: discountedPrice / 12,
        total: discountedPrice,
      };
    }
    return {
      monthly: basePrice,
      total: basePrice,
    };
  };

  const pricing = calculatePrice();

  const handleNextStep = async () => {
    if (currentStep === 0) {
      const isValid = await cardForm.trigger();
      if (isValid) setCurrentStep(1);
    } else if (currentStep === 1) {
      const isValid = await holderForm.trigger();
      if (isValid) setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmitCard = async () => {
    if (!plan) return;

    setIsSubmitting(true);

    const cardData = cardForm.getValues();
    const holderData = holderForm.getValues();
    const [expiryMonth, expiryYear] = cardData.expiryDate.split("/");

    const payload = {
      planId: plan.id,
      yearly: isYearly,
      installmentCount: isYearly ? installments : 1,
      creditCard: {
        holderName: cardData.holderName,
        number: cardData.number.replace(/\s/g, ""),
        expiryMonth,
        expiryYear,
        ccv: cardData.ccv,
      },
      creditCardHolderInfo: {
        name: holderData.name,
        email: holderData.email,
        cpfCnpj: holderData.cpfCnpj.replace(/\D/g, ""),
        postalCode: holderData.postalCode.replace(/\D/g, ""),
        addressNumber: holderData.addressNumber,
        phone: holderData.phone.replace(/\D/g, ""),
      },
    };

    try {
      const response = await PostAPI("/signature/credit/new", payload, true);

      if (response.status === 200 || response.status === 201) {
        await checkSubscription();
        toast.success("Pagamento realizado com sucesso!");
        router.push("/");
      } else {
        toast.error(response.body?.message || "Erro ao processar pagamento");
      }
    } catch {
      toast.error("Erro ao processar pagamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePixPaymentMade = async () => {
    await checkSubscription();
    router.push("/");
  };

  const generatePix = async () => {
    if (!plan) return;

    setIsSubmitting(true);

    try {
      const response = await PostAPI(
        `/signature/pix/${plan.id}`,
        { yearly: isYearly },
        true,
      );

      if (response.status === 200 || response.status === 201) {
        setPixPayload(response.body);
      } else {
        toast.error(response.body?.message || "Erro ao gerar PIX");
      }
    } catch {
      toast.error("Erro ao gerar PIX");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!plan) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-secondary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in grid w-full max-w-5xl grid-cols-1 gap-8 px-4 lg:grid-cols-3">
      {/* Resumo do Pedido */}
      <div className="order-2 lg:order-1 lg:col-span-1">
        <Card className="sticky top-6">
          <h3 className="text-dark mb-4 text-lg font-bold">Resumo do Pedido</h3>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-gray-600">Plano {plan.name}</span>
            <span className="font-semibold">
              R${" "}
              {pricing.monthly.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
              /mês
            </span>
          </div>
          {isYearly && (
            <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
              <span>Período</span>
              <span>Anual</span>
            </div>
          )}
          <div className="text-secondary my-4 flex items-center justify-between border-t border-gray-100 pt-4 text-lg font-bold">
            <span>Total</span>
            <span>
              R${" "}
              {pricing.total.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-gray-500">
            <li>• Cobrança {isYearly ? "anual" : "mensal"}</li>
            <li>• Cancele a qualquer momento</li>
          </ul>
        </Card>
      </div>

      {/* Área de Pagamento */}
      <div className="order-1 lg:order-2 lg:col-span-2">
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setPaymentMethod("card")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-4 transition-all ${
              paymentMethod === "card"
                ? "border-secondary bg-secondary/5 text-secondary font-medium"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <CreditCard className="h-5 w-5" />
            Cartão de Crédito
          </button>
          <button
            onClick={() => {
              setPaymentMethod("pix");
              if (!pixPayload) generatePix();
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-4 transition-all ${
              paymentMethod === "pix"
                ? "border-secondary bg-secondary/5 text-secondary font-medium"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <QrCode className="h-5 w-5" />
            Pix
          </button>
        </div>

        <Card>
          {paymentMethod === "card" ? (
            <div>
              {/* Stepper Indicator */}
              <div className="mb-8 flex justify-between px-2">
                {["Dados do Cartão", "Titular", "Confirmação"].map(
                  (label, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col items-center gap-1 ${idx <= currentStep ? "text-secondary" : "text-gray-300"}`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          idx <= currentStep
                            ? "bg-secondary text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span className="hidden text-xs font-medium sm:block">
                        {label}
                      </span>
                    </div>
                  ),
                )}
              </div>

              {/* Step 0: Card Info */}
              {currentStep === 0 && (
                <div className="animate-fade-in space-y-4">
                  <Input
                    label="Número do Cartão"
                    placeholder="0000 0000 0000 0000"
                    icon={<CreditCard className="h-4 w-4" />}
                    error={cardForm.formState.errors.number}
                    {...cardForm.register("number", {
                      onChange: (e) =>
                        cardForm.setValue("number", maskCard(e.target.value)),
                    })}
                  />
                  <Input
                    label="Nome impresso no cartão"
                    placeholder="COMO NO CARTÃO"
                    error={cardForm.formState.errors.holderName}
                    {...cardForm.register("holderName", {
                      onChange: (e) =>
                        cardForm.setValue(
                          "holderName",
                          e.target.value.toUpperCase(),
                        ),
                    })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Validade"
                      placeholder="MM/AA"
                      error={cardForm.formState.errors.expiryDate}
                      {...cardForm.register("expiryDate", {
                        onChange: (e) =>
                          cardForm.setValue(
                            "expiryDate",
                            maskExpiryDate(e.target.value),
                          ),
                      })}
                    />
                    <Input
                      label="CVV"
                      placeholder="123"
                      error={cardForm.formState.errors.ccv}
                      {...cardForm.register("ccv", {
                        onChange: (e) =>
                          cardForm.setValue("ccv", maskCVC(e.target.value)),
                      })}
                    />
                  </div>
                  <Button onClick={handleNextStep} className="mt-4 w-full">
                    Próximo <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Step 1: Holder Info */}
              {currentStep === 1 && (
                <div className="animate-fade-in space-y-4">
                  <Input
                    label="Nome Completo (Titular)"
                    placeholder="Seu nome"
                    error={holderForm.formState.errors.name}
                    {...holderForm.register("name")}
                  />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      label="CPF/CNPJ"
                      placeholder="000.000.000-00"
                      error={holderForm.formState.errors.cpfCnpj}
                      {...holderForm.register("cpfCnpj", {
                        onChange: (e) =>
                          holderForm.setValue(
                            "cpfCnpj",
                            maskCpfCnpj(e.target.value),
                          ),
                      })}
                    />
                    <Input
                      label="Telefone"
                      placeholder="(00) 00000-0000"
                      error={holderForm.formState.errors.phone}
                      {...holderForm.register("phone", {
                        onChange: (e) =>
                          holderForm.setValue(
                            "phone",
                            maskPhone(e.target.value),
                          ),
                      })}
                    />
                  </div>
                  <Input
                    label="E-mail"
                    type="email"
                    placeholder="seu@email.com"
                    error={holderForm.formState.errors.email}
                    {...holderForm.register("email")}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Input
                        label="CEP"
                        placeholder="00000-000"
                        error={holderForm.formState.errors.postalCode}
                        {...holderForm.register("postalCode", {
                          onChange: (e) =>
                            holderForm.setValue(
                              "postalCode",
                              maskCep(e.target.value),
                            ),
                        })}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        label="Número"
                        placeholder="123"
                        error={holderForm.formState.errors.addressNumber}
                        {...holderForm.register("addressNumber")}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={handlePrevStep}
                      className="flex-1"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <Button onClick={handleNextStep} className="flex-1">
                      Próximo <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Confirmation / Installments */}
              {currentStep === 2 && (
                <div className="animate-fade-in space-y-6">
                  {isYearly && (
                    <div>
                      <label className="text-dark mb-2 block text-sm font-medium">
                        Parcelamento
                      </label>
                      <select
                        className="focus:ring-secondary h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:outline-none"
                        value={installments}
                        onChange={(e) =>
                          setInstallments(Number(e.target.value))
                        }
                      >
                        {[...Array(12)].map((_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1}x de R${" "}
                            {(pricing.total / (i + 1)).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}{" "}
                            sem juros
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="bg-surface space-y-2 rounded-lg p-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Portador:</span>
                      <span className="font-medium">
                        {cardForm.getValues("holderName")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cartão:</span>
                      <span className="font-medium">
                        •••• •••• •••• {cardForm.getValues("number")?.slice(-4)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handlePrevStep}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <Button
                      onClick={handleSubmitCard}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Finalizar Pagamento <Check className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fade-in flex flex-col items-center justify-center py-8 text-center">
              {isSubmitting ? (
                <div className="flex flex-col items-center gap-2 py-12">
                  <Loader2 className="text-secondary h-8 w-8 animate-spin" />
                  <span className="text-gray-500">Gerando PIX...</span>
                </div>
              ) : pixPayload?.payment ? (
                <>
                  <div className="bg-surface mb-6 rounded-xl p-4">
                    <img
                      src={`data:image/png;base64,${pixPayload.payment.encodedImage}`}
                      alt="QR Code PIX"
                      className="h-48 w-48 rounded-lg"
                    />
                  </div>
                  <div className="w-full max-w-sm space-y-4">
                    <div className="bg-surface flex items-center gap-2 rounded-lg border border-dashed border-gray-300 p-3">
                      <span className="flex-1 truncate font-mono text-xs text-gray-500">
                        {pixPayload.payment.payload}
                      </span>
                      <button
                        onClick={() => {
                          copyToClipboard(pixPayload.payment.payload);
                          toast.success("Código Pix copiado!");
                        }}
                        className="text-secondary hover:text-secondary/80"
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Escaneie o QR Code ou copie a chave acima para pagar no
                      app do seu banco.
                    </p>
                    <p className="text-xs text-gray-400">
                      Após o pagamento, clique no botão abaixo para confirmar.
                    </p>
                    <Button onClick={handlePixPaymentMade} className="w-full">
                      Pagamento já realizado
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 py-12">
                  <p className="text-gray-500">
                    Erro ao gerar PIX. Tente novamente.
                  </p>
                  <Button onClick={generatePix}>Gerar PIX</Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="text-secondary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
