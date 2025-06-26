import { cn } from "@/lib/utils";

interface ModalProps {
  className?: string;
  children?: React.ReactNode;
  isOpen: boolean;
  close: () => void;
}

export function Modal({ className, children, isOpen, close }: ModalProps) {
  return (
    <div
      className={cn(
        "fixed top-0 left-0 z-50 flex h-screen w-full items-center justify-center",
        !isOpen && "hidden",
      )}
    >
      <button
        onClick={close}
        className="bg-dark/30 absolute z-10 h-full w-full"
      />
      <div className={cn("z-20 h-80 w-80 rounded-xl bg-white", className)}>
        {children}
      </div>
    </div>
  );
}
