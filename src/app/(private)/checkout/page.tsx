"use client";
import { AuthHeader } from "@/components/ui/AuthHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { useApiContext } from "@/context/ApiContext";
import {
  maskCard,
  maskCep,
  maskCpfCnpj,
  maskExpiryDate,
  maskPhone,
} from "@/lib/masks";
import { cn, copyToClipboard } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { SignatureCard } from "../(sidebar)/prediction-ai/components/signatureCard";

const CardFormSchema = z.object({
  holderName: z.string().min(5, {
    message: "Nome do titular deve ter pelo menos 5 caracteres.",
  }),
  number: z.string().min(16, {
    message: "Número inválido",
  }),
  expiryDate: z.string().min(4, {
    message: "Data inválida",
  }),
  ccv: z.string().min(3, {
    message: "CVC deve ter pelo menos 3 caracteres.",
  }),
});

const CardHolderFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome completo deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  cpfCnpj: z.string().min(14, {
    message: "CPF ou CNPJ inválido.",
  }),
  postalCode: z.string().min(8, {
    message: "CEP inválido.",
  }),
  addressNumber: z.string().min(1, {
    message: "Número inválido.",
  }),
  phone: z.string().min(11, {
    message: "Telefone inválido.",
  }),
});

const FormSchema = CardHolderFormSchema.merge(CardFormSchema);

interface PlanProps {
  creditCardPrice: number;
  description: string;
  id: string;
  name: string;
  pixPrice: number;
}

export default function Checkout() {
  const router = useRouter();
  const { GetAPI, PostAPI } = useApiContext();
  const [selectedPlan, setSelectedPlan] = useState<PlanProps | null>(null);
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [activeStep, setActiveStep] = useState(0);
  const [isPixBeingGenerated, setIsPixBeingGenerated] = useState(false);
  const [isPixGenerated, setIsPixGenerated] = useState(false);
  const [copiedQrCode, setCopiedQrCode] = useState(false);
  const [qrCode, setQrCode] = useState({
    encodedImage: "",
    payload: "",
  });
  const [isPaying, setIsPaying] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(1);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      holderName: "",
      number: "",
      expiryDate: "",
      ccv: "",
      name: "",
      email: "",
      cpfCnpj: "",
      postalCode: "",
      addressNumber: "",
      phone: "",
    },
  });

  const useFormSteps = (form: UseFormReturn<z.infer<typeof FormSchema>>) => {
    const [activeStep, setActiveStep] = useState(0);

    const stepFields = {
      0: ["holderName", "number", "expiryDate", "ccv"] as const,
      1: [
        "name",
        "email",
        "cpfCnpj",
        "postalCode",
        "addressNumber",
        "phone",
      ] as const,
    };

    const validateStep = async (step: number) => {
      const fields = stepFields[step as keyof typeof stepFields];
      if (!fields) return true;
      return await form.trigger(fields);
    };

    return { activeStep, validateStep, setActiveStep };
  };

  const { validateStep } = useFormSteps(form);

  const handleNext = async (
    form: UseFormReturn<z.infer<typeof FormSchema>>,
  ) => {
    if (selectedPayment === "card") {
      if (activeStep === 0) {
        const isValid = await validateStep(activeStep);
        if (!isValid) {
          const errors = form.formState.errors;

          // Define field labels with proper typing
          const fieldLabels: Record<
            keyof z.infer<typeof CardFormSchema>,
            string
          > = {
            holderName: "Nome no Cartão",
            number: "Número do Cartão",
            expiryDate: "Data de Expiração",
            ccv: "CCV",
          };

          // Get first error with type safety
          const firstErrorField = Object.keys(
            errors,
          )[0] as keyof typeof fieldLabels;
          const firstError = errors[firstErrorField];

          if (firstError?.message && firstErrorField in fieldLabels) {
            const fieldLabel = fieldLabels[firstErrorField];
            return toast.error(`${fieldLabel}: ${firstError.message}`);
          }

          return toast.error("Por favor, corrija os erros no formulário.");
        } else {
          setActiveStep(activeStep + 1);
        }
      } else if (activeStep === 1) {
        const isValid = await validateStep(activeStep);
        if (!isValid) {
          const errors = form.formState.errors;

          // Define field labels with proper typing
          const fieldLabels: Record<
            keyof z.infer<typeof CardHolderFormSchema>,
            string
          > = {
            name: "Nome",
            email: "Email",
            cpfCnpj: "CPF/CNPJ",
            postalCode: "CEP",
            addressNumber: "Número",
            phone: "Telefone",
          };

          // Get first error with type safety
          const firstErrorField = Object.keys(
            errors,
          )[0] as keyof typeof fieldLabels;
          const firstError = errors[firstErrorField];

          if (firstError?.message && firstErrorField in fieldLabels) {
            const fieldLabel = fieldLabels[firstErrorField];
            return toast.error(`${fieldLabel}: ${firstError.message}`);
          }

          return toast.error("Por favor, corrija os erros no formulário.");
        } else {
          setActiveStep(activeStep + 1);
        }
      } else if (activeStep === 2) {
        router.push("/");
      } else if (activeStep === 3) {
        HandleCard();
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  async function GetPlans() {
    const plans = await GetAPI("/signature-plan", true);
    if (plans.status === 200) {
      return setSelectedPlan(plans.body.plans[0]);
    }
  }

  async function HandleCard() {
    setIsPaying(true);
    const card = await PostAPI(
      "/signature/credit/new",
      {
        planId: selectedPlan?.id,
        creditCard: {
          holderName: form.control._formValues.holderName,
          number: form.control._formValues.number,
          expiryMonth: form.control._formValues.expiryDate.slice(0, 2),
          expiryYear: form.control._formValues.expiryDate.slice(3, 5),
          ccv: form.control._formValues.ccv,
        },
        creditCardHolderInfo: {
          name: form.control._formValues.name,
          email: form.control._formValues.email,
          cpfCnpj: form.control._formValues.cpfCnpj,
          postalCode: form.control._formValues.postalCode,
          addressNumber: form.control._formValues.addressNumber,
          phone: form.control._formValues.phone,
        },
        installmentCount: selectedInstallment,
      },
      true,
    );
    if (card.status === 200) {
      router.push("/");
      return setIsPaying(false);
    }
    alert(card.body.message);
    return setIsPaying(false);
  }

  async function HandleQrCode() {
    return router.push("/");
    setIsPixBeingGenerated(true);
    const qrCode = await PostAPI(
      `/signature/pix/${selectedPlan?.id}`,
      {},
      true,
    );
    if (qrCode.status === 200) {
      setQrCode(qrCode.body.payment);
      setIsPixGenerated(true);
      return setIsPixBeingGenerated(false);
    }
    alert(qrCode.body.message);
    return setIsPixBeingGenerated(false);
  }

  useEffect(() => {
    GetPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white pb-10 md:pb-0">
      <Image
        src={"/static/register2.png"}
        className="absolute top-0 right-0 z-10 hidden h-[95%] w-[40%] rounded-bl-lg object-cover md:block"
        alt=""
        width={1000}
        height={2500}
      />
      <div className="relative z-10 flex min-h-[100vh] w-full flex-col overflow-hidden px-8 xl:px-20">
        <AuthHeader />
        <div className="z-20 mt-32 flex w-full flex-col gap-2 pb-8 md:w-[45%] xl:mt-40 xl:ml-[10%] xl:w-[60%] xl:gap-4">
          <button
            onClick={() => router.back()}
            className="text-secondary static top-4 left-4 flex flex-row items-center justify-center gap-2 self-start text-xs underline md:absolute md:text-base"
          >
            <ChevronLeft size={16} /> Voltar
          </button>
          <h1 className="text-2xl font-bold md:text-3xl">Checkout</h1>
          <div className="flex w-full flex-col-reverse gap-6 xl:flex-row xl:gap-4">
            <div className="flex h-full w-full flex-col gap-2 xl:h-96 xl:w-7/12 xl:gap-4">
              <label
                className={cn(
                  "relative flex w-full flex-col rounded-md border bg-white p-2 opacity-60 shadow-sm transition-all duration-300",
                  selectedPayment === "card" &&
                    "border-secondary bg-zinc-50 opacity-100",
                )}
                htmlFor="card"
              >
                <input
                  id="card"
                  name="payment"
                  className="transparent absolute top-0 left-0 h-full w-full cursor-pointer opacity-0"
                  type="radio"
                  checked={selectedPayment === "card"}
                  onChange={() => setSelectedPayment("card")}
                />
                <div className="flex items-center gap-2">
                  <Check
                    className={cn(
                      "opacity-0 transition duration-200",
                      selectedPayment === "card" &&
                        "text-secondary opacity-100",
                    )}
                  />
                  <div className="flex flex-col text-black">
                    <span className="font-semibold">Pagar com Cartão</span>
                    <span className="text-sm">
                      Insira os dados do seu cartão para concluir o pagamento.
                    </span>
                  </div>
                </div>
              </label>
              <label
                className={cn(
                  "relative flex w-full flex-col rounded-md border bg-white p-2 opacity-60 shadow-sm transition-all duration-300",
                  selectedPayment === "pix" &&
                    "border-secondary bg-zinc-50 opacity-100",
                )}
                htmlFor="pix"
              >
                <input
                  id="pix"
                  name="payment"
                  className="transparent absolute top-0 left-0 h-full w-full cursor-pointer opacity-0"
                  type="radio"
                  checked={selectedPayment === "pix"}
                  onChange={() => setSelectedPayment("pix")}
                />
                <div className="flex items-center gap-2">
                  <Check
                    className={cn(
                      "opacity-0 transition duration-200",
                      selectedPayment === "pix" && "text-secondary opacity-100",
                    )}
                  />
                  <div className="flex flex-col text-black">
                    <span className="font-semibold">Pagar com Pix</span>
                    <span className="text-sm">
                      Pague rapidamente escaneando o QR Code ou copiando a chave
                      Pix.
                    </span>
                  </div>
                </div>
              </label>

              <div className="relative flex h-px w-full bg-white">
                <div className="absolute left-1/2 h-full w-20 -translate-x-1/2 rounded-full bg-white"></div>
              </div>
              <div className="rounded-md bg-white p-1 shadow">
                <Form {...form}>
                  <div
                    className={cn(
                      "gap-2",
                      selectedPayment === "card"
                        ? "grid grid-cols-12"
                        : "flex flex-col items-center justify-center bg-white",
                    )}
                  >
                    {selectedPayment === "card" ? (
                      activeStep === 0 ? (
                        <>
                          <div className="col-span-12 mb-4">
                            <div className="flex flex-row items-center gap-1">
                              <Image
                                alt=""
                                width={100}
                                height={100}
                                src={"/icons/card.png"}
                                className="h-6 w-max object-contain"
                              />
                              <h4 className="text-sm font-semibold text-black uppercase">
                                Preencha os dados do seu Cartão
                              </h4>
                            </div>
                            <p className="text-text-50 mt-1 text-xs">
                              Insira corretamente todos os Dados
                            </p>
                          </div>
                          <div className="col-span-12 lg:col-span-6">
                            <FormField
                              key="holderName"
                              control={form.control}
                              name="holderName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-text-100">
                                    Nome no Cartão
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Nome no Cartão..."
                                      type="text"
                                      {...field}
                                      className={cn("", {
                                        "text-text-100 rounded-md border-red-500 focus:border-red-500":
                                          form.formState.errors.holderName,
                                      })}
                                      autoComplete="off"
                                    />
                                  </FormControl>
                                  <FormMessage className="font-base inline-flex h-[22px] items-center justify-center rounded-sm px-2 text-xs text-red-500" />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-span-12 lg:col-span-6">
                            <FormField
                              key="number"
                              control={form.control}
                              name="number"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-text-100">
                                    Número do Cartão
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      maxLength={19}
                                      placeholder="XXXX XXXX XXXX XXXX"
                                      className={cn("", {
                                        "rounded-md border-red-500 focus:border-red-500":
                                          form.formState.errors.number,
                                      })}
                                      value={maskCard(field.value)}
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                      autoComplete="off"
                                    />
                                  </FormControl>
                                  <FormMessage className="font-base inline-flex h-[22px] items-center justify-center rounded-sm px-2 text-xs text-red-500" />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-span-12 lg:col-span-6">
                            <FormField
                              key="expiryDate"
                              control={form.control}
                              name="expiryDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-text-100">
                                    Data de Expiração
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Data de Expiração"
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                      className={cn("", {
                                        "rounded-md border-red-500 focus:border-red-500":
                                          form.formState.errors.expiryDate,
                                      })}
                                      maxLength={5}
                                      value={maskExpiryDate(field.value)}
                                      autoComplete="off"
                                    />
                                  </FormControl>
                                  <FormMessage className="font-base inline-flex h-[22px] items-center justify-center rounded-sm px-2 text-xs text-red-500" />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-span-12 lg:col-span-6">
                            <FormField
                              key="ccv"
                              control={form.control}
                              name="ccv"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-text-100">
                                    CVC
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="XXX"
                                      className={cn("", {
                                        "rounded-md border-red-500 focus:border-red-500":
                                          form.formState.errors.ccv,
                                      })}
                                      maxLength={4}
                                      autoComplete="off"
                                    />
                                  </FormControl>
                                  <FormMessage className="font-base inline-flex h-[22px] items-center justify-center rounded-sm px-2 text-xs text-red-500" />
                                </FormItem>
                              )}
                            />
                          </div>
                        </>
                      ) : activeStep === 1 ? (
                        <>
                          <div className="col-span-12 mb-4">
                            <div className="flex flex-row items-center gap-1">
                              <Image
                                alt=""
                                width={100}
                                height={100}
                                src={"/icons/card.png"}
                                className="h-6 w-max object-contain"
                              />
                              <h4 className="text-text-100 text-sm font-medium">
                                Preencha os dados do Proprietário do Cartão
                              </h4>
                            </div>
                            <p className="text-text-50 mt-1 text-xs">
                              Insira corretamente todos os Dados
                            </p>
                          </div>
                          <div className="col-span-12 lg:col-span-4">
                            <FormField
                              key="name"
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-text-100">
                                    Nome Completo*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="text"
                                      placeholder="Nome Completo..."
                                      {...field}
                                      className={cn("", {
                                        "border-red-500 focus:border-red-500":
                                          form.formState.errors.name,
                                      })}
                                      autoComplete="off"
                                    />
                                  </FormControl>
                                  <FormMessage className="font-base inline-flex h-[22px] items-center justify-center rounded-sm px-2 text-xs text-red-500" />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-span-12 lg:col-span-4">
                            <FormField
                              key="email"
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-text-100">
                                    Email*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="email"
                                      placeholder="email@email.com"
                                      {...field}
                                      className={cn("", {
                                        "border-red-500 focus:border-red-500":
                                          form.formState.errors.email,
                                      })}
                                      autoComplete="off"
                                    />
                                  </FormControl>
                                  <FormMessage className="font-base inline-flex h-[22px] items-center justify-center rounded-sm px-2 text-xs text-red-500" />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-span-12 lg:col-span-4">
                            <FormField
                              key="phone"
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-text-100">
                                    Telefone
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="(xx)xxxxx-xxxx"
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                      className={cn("", {
                                        "border-red-500 focus:border-red-500":
                                          form.formState.errors.phone,
                                      })}
                                      value={maskPhone(field.value)}
                                      maxLength={15}
                                      autoComplete="off"
                                    />
                                  </FormControl>
                                  <FormMessage className="font-base inline-flex h-[22px] items-center justify-center rounded-sm px-2 text-xs text-red-500" />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-span-12 lg:col-span-4">
                            <FormField
                              key="cpfCnpj"
                              control={form.control}
                              name="cpfCnpj"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-text-100">
                                    CPF/CNPJ*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="xxx.xxx.xxx-xx"
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                      className={cn("", {
                                        "border-red-500 focus:border-red-500":
                                          form.formState.errors.cpfCnpj,
                                      })}
                                      maxLength={18}
                                      value={maskCpfCnpj(field.value)}
                                      autoComplete="off"
                                    />
                                  </FormControl>
                                  <FormMessage className="font-base inline-flex h-[22px] items-center justify-center rounded-sm px-2 text-xs text-red-500" />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-span-12 lg:col-span-4">
                            <FormField
                              key="postalCode"
                              control={form.control}
                              name="postalCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-text-100">
                                    CEP*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="xxxxx-xxx"
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                      className={cn("", {
                                        "border-red-500 focus:border-red-500":
                                          form.formState.errors.postalCode,
                                      })}
                                      maxLength={9}
                                      value={maskCep(field.value)}
                                      autoComplete="off"
                                    />
                                  </FormControl>
                                  <FormMessage className="font-base inline-flex h-[22px] items-center justify-center rounded-sm px-2 text-xs text-red-500" />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-span-12 lg:col-span-4">
                            <FormField
                              key="addressNumber"
                              control={form.control}
                              name="addressNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-text-100">
                                    Número*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      className={cn("", {
                                        "border-red-500 focus:border-red-500":
                                          form.formState.errors.addressNumber,
                                      })}
                                      placeholder="999"
                                      autoComplete="off"
                                    />
                                  </FormControl>
                                  <FormMessage className="font-base inline-flex h-[22px] items-center justify-center rounded-sm px-2 text-xs text-red-500" />
                                </FormItem>
                              )}
                            />
                          </div>
                        </>
                      ) : activeStep === 2 ? (
                        <>
                          {selectedPlan && (
                            <>
                              <h1 className="text-secondary text-sm font-bold md:text-base">
                                Parcelamento
                              </h1>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="bg-secondary relative col-span-12 w-full rounded-lg p-2 text-white">
                                    <span className="font-semibold">
                                      {selectedInstallment +
                                        " x " +
                                        (
                                          selectedPlan?.creditCardPrice /
                                          selectedInstallment
                                        ).toLocaleString("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                        })}
                                    </span>
                                    <ChevronDown className="absolute top-1/2 right-2 -translate-y-1/2" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-white">
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                                    (item) => (
                                      <DropdownMenuItem
                                        className={cn(
                                          "hover:bg-secondary text-black hover:text-white",
                                          selectedInstallment === item &&
                                            "bg-secondary text-white",
                                        )}
                                        onSelect={() =>
                                          setSelectedInstallment(item)
                                        }
                                        key={item}
                                      >
                                        <span>
                                          {item +
                                            " x " +
                                            (
                                              selectedPlan?.creditCardPrice /
                                              item
                                            ).toLocaleString("pt-BR", {
                                              style: "currency",
                                              currency: "BRL",
                                            })}
                                        </span>
                                      </DropdownMenuItem>
                                    ),
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          )}
                        </>
                      ) : (
                        <></>
                      )
                    ) : selectedPayment === "pix" ? (
                      <>
                        <button
                          onClick={HandleQrCode}
                          className="bg-secondary mx-auto flex h-12 w-full items-center gap-2 rounded-lg p-2 py-4 font-semibold text-white transition-all duration-300 hover:scale-[1.005]"
                        >
                          {isPixBeingGenerated ? (
                            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                          ) : isPixGenerated ? (
                            <span className="mx-auto">Pix Gerado!</span>
                          ) : (
                            <>
                              <Image
                                src="/Icons/pix.png"
                                alt=""
                                width={200}
                                height={200}
                                className="h-max w-10 object-contain"
                              />
                              <span className="underline">
                                Clique aqui para Gerar o Pix
                              </span>
                            </>
                          )}
                        </button>
                        <>
                          {isPixGenerated && (
                            <>
                              <Image
                                src={`data:img/png;base64, ${qrCode.encodedImage}`}
                                width={300}
                                height={300}
                                alt=""
                                className="bg-secondary h-max w-1/3 self-center rounded-2xl object-contain p-2"
                              />
                              <button
                                className="bg-pix bg-secondary m-auto flex w-max items-center gap-2 rounded-lg p-1 text-sm text-white transition-all duration-300 hover:scale-[1.005]"
                                onClick={() => {
                                  copyToClipboard(qrCode.payload);
                                  setCopiedQrCode(true);
                                }}
                              >
                                <span className={`${copiedQrCode && "italic"}`}>
                                  {copiedQrCode
                                    ? "Link copiado com sucesso!"
                                    : "Clique aqui para Copiar"}
                                </span>
                                <CheckCheck />
                              </button>
                            </>
                          )}
                        </>
                        <button
                          onClick={() => router.push("/")}
                          className={cn(
                            "bg-secondary mx-auto flex h-12 w-60 items-center justify-center gap-2 rounded-lg p-2 font-semibold text-white transition-all duration-300 hover:scale-[1.005]",
                            !isPixGenerated && "hidden",
                          )}
                        >
                          <span>Pagamento Realizado</span>
                        </button>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </Form>
              </div>

              <div
                className={cn(
                  "flex gap-4 pt-2",
                  selectedPayment === "pix" && "hidden",
                )}
              >
                <button
                  className={cn(
                    "border-secondary text-secondary w-full rounded-md border bg-white p-2 font-bold",
                    {
                      hidden: activeStep === 0,
                    },
                  )}
                  onClick={handleBack}
                >
                  Voltar
                </button>
                <button
                  // type="submit"
                  type="button"
                  disabled={isPaying}
                  onClick={() => handleNext(form)}
                  className="bg-secondary w-full rounded-md border p-2 font-bold text-white"
                >
                  {activeStep === 2
                    ? "Finalizar"
                    : isPaying
                      ? "Pagando..."
                      : "Próximo"}
                </button>
              </div>
            </div>
            <div className="flex h-full w-full flex-1 flex-col items-end justify-end gap-2 xl:gap-4">
              <SignatureCard
                benefits={[
                  "Tudo do Plano Gratuito",
                  "Analise Profunda de Politicos",
                  "Geração de Documentos Avançados",
                  "Análise Preditiva de Votações",
                ]}
                description="Uma tecnologia revolucionária que permite prever votações em Projetos de Lei, analisar as intenções dos parlamentares, entender seus votos."
                isActive={true}
                buttonText="Plano Selecionado"
                name="Preditivo"
                price={997}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
