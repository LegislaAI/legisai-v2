import { Check, Hexagon, Star } from "lucide-react";

interface SignatureCardProps {
  name: string;
  price: number;
  description: string;
  isActive: boolean;
  benefits: string[];
}

export function SignatureCard({ name, price, benefits }: SignatureCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl px-2 py-6 shadow-xl">
      <div className="flex gap-2">
        {price === 0 ? (
          <Hexagon className="text-dark" />
        ) : (
          <Star className="text-primary" />
        )}
        <span className="font-bold">{name}</span>
      </div>
      <div>{price === 0 ? <></> : <></>}</div>

      <button></button>
      {benefits.map((benefit) => (
        <div key={benefit} className="flex items-center gap-2">
          <div className="bg-primary rounded-full p-[0.1rem]">
            <Check className="h-4 w-4 text-white" />
          </div>
          <span>{benefit}</span>
        </div>
      ))}
    </div>
  );
}
