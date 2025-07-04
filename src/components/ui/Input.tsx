import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Input({ className, ...rest }: InputProps) {
  return (
    <>
      <input
        className={cn(
          "border-secondary bg-surface h-10 w-full rounded-xl border-2 p-1",
          className,
        )}
        {...rest}
      />
    </>
  );
}
