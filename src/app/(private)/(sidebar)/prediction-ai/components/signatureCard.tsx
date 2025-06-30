import { cn } from "@/lib/utils";
import { Check, Hexagon, Star } from "lucide-react";

interface SignatureCardProps {
  name: string;
  price: number;
  description: string;
  isActive: boolean;
  onClick?: () => void;
  setIsActive?: () => void;
  benefits: string[];
  upgrade?: boolean;
  buttonText?: string;
}

export function SignatureCard({
  name,
  price,
  onClick,
  description,
  isActive,
  benefits,
  buttonText,
  upgrade = false,
}: SignatureCardProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col justify-between gap-6 rounded-2xl bg-[#FCFCFC] px-1 pt-1 pb-6 shadow-xl transition-all duration-300 hover:scale-[1.05] md:w-2/3 lg:max-w-96",
      )}
    >
      <div
        className={cn(
          "flex flex-1 flex-col justify-between rounded-2xl p-4",
          !isActive && "shadow-xl",
          isActive && "border border-gray-100",
        )}
      >
        <div className="">
          <div className="flex gap-2">
            {price === 0 ? (
              <Hexagon className="text-dark" />
            ) : (
              <Star className="text-primary" />
            )}
            <span className="font-bold">{name}</span>
          </div>
          <div className="py-4">
            {price === 0 ? (
              <span className="text-primary text-xl font-semibold">
                Gratuito
              </span>
            ) : (
              <div className="flex items-center justify-center">
                <span className="text-dark text-2xl font-medium">
                  R${" "}
                  <span className="text-primary text-4xl font-bold">
                    {price},00
                  </span>
                  /mês
                </span>
              </div>
            )}
          </div>
        </div>
        <p className="text-justify text-sm text-gray-600">{description}</p>

        {isActive ? (
          <button
            onClick={onClick}
            className="bg-primary mt-4 flex h-12 w-5/6 items-center justify-between self-center rounded-2xl px-4 text-base font-bold text-white"
          >
            {buttonText || "Ativo"} <Check className="text-white" />
          </button>
        ) : (
          <button
            onClick={onClick}
            className="bg-dark hover:bg-primary mt-4 flex h-12 w-5/6 items-center justify-center self-center rounded-2xl px-4 text-base font-bold text-white transition-all duration-300"
          >
            {upgrade ? "Upgrade de Plano" : "Escolher Plano"}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 px-4">
        {benefits.map((benefit) => (
          <div key={benefit} className="flex items-center gap-2">
            <div className="bg-primary rounded-full p-[0.1rem]">
              <Check className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
