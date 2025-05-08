import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Input({ className, ...rest }: InputProps) {
  return (
    <>
      <input
        className={cn(
          "border-primary bg-surface h-12 w-full rounded-xl border-2 p-1 text-xl",
          className,
        )}
        {...rest}
      />
    </>
  );
}
