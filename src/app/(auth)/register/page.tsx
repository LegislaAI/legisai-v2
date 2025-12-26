"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    Briefcase,
    Calendar,
    CreditCard,
    Lock,
    Mail,
    Phone,
    User,
} from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

import { RegisterPayload } from "@/@types/v2/auth";
import { Button } from "@/components/v2/components/ui/Button";
import { Card } from "@/components/v2/components/ui/Card";
import { Input } from "@/components/v2/components/ui/Input";
import { useApiContext } from "@/context/ApiContext";
import { maskCpfCnpj, maskDate, maskPhone } from "@/lib/masks";

const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(14, "Telefone incompleto"), // (11) 99999-9999 is 15 chars, (11) 1111-1111 is 14 chars.
  cpfCnpj: z.string().min(14, "Documento inválido"), // CPF is 14, CNPJ is 18
  birthDate: z.string().min(10, "Data inválida"), // DD/MM/YYYY
  profession: z.string().min(3, "Profissão é obrigatória"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register2Page() {
  const { PostAPI } = useApiContext();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const birthDate = moment(data.birthDate, "DD/MM/YYYY").toDate();

      const payload: RegisterPayload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpfCnpj: data.cpfCnpj,
        birthDate: birthDate,
        profession: data.profession,
        password: data.password,
      };
      const response = await PostAPI("/user/signup", payload, false);

      if (response.status === 200 || response.status === 201) {
        toast.success("Conta criada com sucesso! Faça login.");
        router.push("/login");
      } else {
        toast.error(response.body.message || "Falha ao criar conta");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    }
  };

  return (
    <Card className="animate-fade-in w-full max-w-lg">
      <div className="mb-6 text-center">
        <h2 className="text-dark text-2xl font-bold">Crie sua conta</h2>
        <p className="mt-2 text-sm text-gray-500">
          Preencha os dados abaixo para começar.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome Completo"
          placeholder="Seu nome"
          icon={<User className="h-4 w-4" />}
          error={errors.name}
          {...register("name")}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Telefone"
            placeholder="(00) 00000-0000"
            icon={<Phone className="h-4 w-4" />}
            error={errors.phone}
            {...register("phone", {
              onChange: (e) => setValue("phone", maskPhone(e.target.value)),
            })}
          />
          <Input
            label="Data de Nascimento"
            placeholder="DD/MM/AAAA"
            icon={<Calendar className="h-4 w-4" />}
            error={errors.birthDate}
            {...register("birthDate", {
              onChange: (e) => setValue("birthDate", maskDate(e.target.value)),
            })}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="CPF / CNPJ"
            placeholder="000.000.000-00"
            icon={<CreditCard className="h-4 w-4" />}
            error={errors.cpfCnpj}
            {...register("cpfCnpj", {
              onChange: (e) => setValue("cpfCnpj", maskCpfCnpj(e.target.value)),
            })}
          />
          <Input
            label="Profissão"
            placeholder="Ex: Advogado"
            icon={<Briefcase className="h-4 w-4" />}
            error={errors.profession}
            {...register("profession")}
          />
        </div>

        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email}
          {...register("email")}
        />

        <Input
          label="Senha"
          type="password"
          placeholder="********"
          icon={<Lock className="h-4 w-4" />}
          error={errors.password}
          {...register("password")}
        />

        <Button type="submit" className="mt-2 w-full" isLoading={isSubmitting}>
          Cadastrar
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-500">Já tem uma conta? </span>
        <Link
          href="/login"
          className="text-secondary font-medium hover:underline"
        >
          Entrar
        </Link>
      </div>
    </Card>
  );
}
