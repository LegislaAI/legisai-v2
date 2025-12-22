"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronLeft, ChevronRight, Copy, CreditCard, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

import { Button } from "@/components/v2/components/ui/Button";
import { Card } from "@/components/v2/components/ui/Card";
import { Input } from "@/components/v2/components/ui/Input";
import { maskCVC, maskCard, maskCep, maskCpfCnpj, maskExpiryDate, maskPhone } from "@/lib/masks";
import { copyToClipboard } from "@/lib/utils";

// Mock Data
const MOCK_PLAN = {
  id: "pro",
  name: "Profissional",
  price: 99.90,
  creditCardPrice: 99.90, // Assuming same price for now
};

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

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  
  // Card Stepper State
  const [currentStep, setCurrentStep] = useState(0);
  const [installments, setInstallments] = useState(1);
  const [pixPayload, setPixPayload] = useState<{ encodedImage: string, payload: string } | null>(null);

  // Forms
  const cardForm = useForm<z.infer<typeof cardSchema>>({ resolver: zodResolver(cardSchema) });
  const holderForm = useForm<z.infer<typeof holderSchema>>({ resolver: zodResolver(holderSchema) });

  // Handlers
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
    // Mock API Call
    // const payload = { ...cardForm.getValues(), ...holderForm.getValues(), installments };
    // await PostAPI('/signature/credit/new', payload);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Pagamento realizado com sucesso!");
    router.push("/v2/");
  };

  const generatePix = async () => {
     // Mock API Call
     // const response = await PostAPI(`/signature/pix/${MOCK_PLAN.id}`, {});
     
     // Mock Response
     const mockPix = {
         encodedImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", // 1x1 pixel mock
         payload: "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913LegisAi Ltd6008Brasilia62070503***6304ABCD"
     };
     setPixPayload(mockPix);
  };

  return (
    <div className="w-full max-w-5xl px-4 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Resumo do Pedido */}
      <div className="lg:col-span-1 order-2 lg:order-1">
        <Card className="sticky top-6">
            <h3 className="text-lg font-bold text-dark mb-4">Resumo do Pedido</h3>
            <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Plano {MOCK_PLAN.name}</span>
                <span className="font-semibold">R$ {MOCK_PLAN.price.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-100 my-4 pt-4 flex justify-between items-center text-lg font-bold text-secondary">
                <span>Total</span>
                <span>R$ {MOCK_PLAN.price.toFixed(2)}</span>
            </div>
            <ul className="text-sm text-gray-500 space-y-2 mt-4">
                <li>• Cobrança mensal</li>
                <li>• Cancele a qualquer momento</li>
            </ul>
        </Card>
      </div>

      {/* Área de Pagamento */}
      <div className="lg:col-span-2 order-1 lg:order-2">
         <div className="mb-6 flex gap-4">
            <button
                onClick={() => setPaymentMethod("card")}
                className={`flex-1 p-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
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
                    if(!pixPayload) generatePix();
                }}
                className={`flex-1 p-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
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
                     <div className="flex justify-between mb-8 px-2">
                        {["Dados do Cartão", "Titular", "Confirmação"].map((label, idx) => (
                            <div key={idx} className={`flex flex-col items-center gap-1 ${idx <= currentStep ? "text-secondary" : "text-gray-300"}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                    idx <= currentStep ? "bg-secondary text-white" : "bg-gray-100 text-gray-400"
                                }`}>
                                    {idx + 1}
                                </div>
                                <span className="text-xs font-medium hidden sm:block">{label}</span>
                            </div>
                        ))}
                     </div>

                     {/* Step 0: Card Info */}
                     {currentStep === 0 && (
                        <div className="space-y-4 animate-fade-in">
                            <Input
                                label="Número do Cartão"
                                placeholder="0000 0000 0000 0000"
                                icon={<CreditCard className="h-4 w-4" />}
                                error={cardForm.formState.errors.number}
                                {...cardForm.register("number", {
                                    onChange: (e) => cardForm.setValue("number", maskCard(e.target.value))
                                })}
                            />
                            <Input
                                label="Nome impresso no cartão"
                                placeholder="COMO NO CARTÃO"
                                error={cardForm.formState.errors.holderName}
                                {...cardForm.register("holderName", {
                                    onChange: (e) => cardForm.setValue("holderName", e.target.value.toUpperCase())
                                })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Validade"
                                    placeholder="MM/AA"
                                    error={cardForm.formState.errors.expiryDate}
                                    {...cardForm.register("expiryDate", {
                                        onChange: (e) => cardForm.setValue("expiryDate", maskExpiryDate(e.target.value))
                                    })}
                                />
                                <Input
                                    label="CVV"
                                    placeholder="123"
                                    error={cardForm.formState.errors.ccv}
                                    {...cardForm.register("ccv", {
                                        onChange: (e) => cardForm.setValue("ccv", maskCVC(e.target.value))
                                    })}
                                />
                            </div>
                            <Button onClick={handleNextStep} className="w-full mt-4">
                                Próximo <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                     )}

                     {/* Step 1: Holder Info */}
                     {currentStep === 1 && (
                        <div className="space-y-4 animate-fade-in">
                             <Input
                                label="Nome Completo (Titular)"
                                placeholder="Seu nome"
                                error={holderForm.formState.errors.name}
                                {...holderForm.register("name")}
                            />
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="CPF/CNPJ"
                                    placeholder="000.000.000-00"
                                    error={holderForm.formState.errors.cpfCnpj}
                                    {...holderForm.register("cpfCnpj", {
                                        onChange: (e) => holderForm.setValue("cpfCnpj", maskCpfCnpj(e.target.value))
                                    })}
                                />
                                <Input
                                    label="Telefone"
                                    placeholder="(00) 00000-0000"
                                    error={holderForm.formState.errors.phone}
                                    {...holderForm.register("phone", {
                                        onChange: (e) => holderForm.setValue("phone", maskPhone(e.target.value))
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
                                <LinkInputPostalCode holderForm={holderForm} />
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
                                <Button variant="outline" onClick={handlePrevStep} className="flex-1">
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
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <label className="block text-sm font-medium text-dark mb-2">Parcelamento</label>
                                <select 
                                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                                    value={installments}
                                    onChange={(e) => setInstallments(Number(e.target.value))}
                                >
                                    {[...Array(10)].map((_, i) => (
                                        <option key={i} value={i + 1}>
                                            {i + 1}x de R$ {(MOCK_PLAN.price / (i + 1)).toFixed(2)} sem juros
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-surface p-4 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Portador:</span>
                                    <span className="font-medium">{cardForm.getValues("holderName")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Cartão:</span>
                                    <span className="font-medium">•••• •••• •••• {cardForm.getValues("number")?.slice(-4)}</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={handlePrevStep} className="flex-1">
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                                </Button>
                                <Button onClick={handleSubmitCard} className="flex-1">
                                    Finalizar Pagamento <Check className="ml-2 h-4 w-4" />
                                </Button>
                             </div>
                        </div>
                     )}

                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                     {pixPayload ? (
                        <>
                            <div className="bg-surface p-4 rounded-xl mb-6">
                                {/* Mock QR Code Image - In real app use <img src={pixPayload.encodedImage} /> */}
                                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded-lg text-gray-400 text-xs">
                                    QR Code Mock
                                </div>
                            </div>
                            <div className="w-full max-w-sm space-y-4">
                                <div className="flex items-center gap-2 p-3 bg-surface rounded-lg border border-dashed border-gray-300">
                                    <span className="text-xs text-gray-500 truncate flex-1 font-mono">{pixPayload.payload}</span>
                                    <button 
                                        onClick={() => {
                                            copyToClipboard(pixPayload.payload);
                                            toast.success("Código Pix copiado!");
                                        }}
                                        className="text-secondary hover:text-secondary/80"
                                    >
                                        <Copy className="h-5 w-5" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Escaneie o QR Code ou copie a chave acima para pagar no app do seu banco.
                                </p>
                                <Button onClick={() => { toast.success("Pagamento confirmado!"); router.push("/v2/"); }} className="w-full">
                                    Já fiz o pagamento
                                </Button>
                            </div>
                        </>
                     ) : (
                         <div className="py-12">Gerando Pix...</div>
                     )}
                </div>
            )}
         </Card>
      </div>
    </div>
  );
}

// Helper component for postal code with side-effect (could be extracted)
function LinkInputPostalCode({ holderForm }: { holderForm: any }) {
    return (
        <div className="col-span-2">
            <Input
                label="CEP"
                placeholder="00000-000"
                error={holderForm.formState.errors.postalCode}
                {...holderForm.register("postalCode", {
                    onChange: (e: any) => holderForm.setValue("postalCode", maskCep(e.target.value))
                })}
            />
        </div>
    )
}
