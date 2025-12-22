"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/v2/components/ui/avatar";
import { Badge } from "@/components/v2/components/ui/badge";
import { Button } from "@/components/v2/components/ui/Button";
import { Card } from "@/components/v2/components/ui/Card";
import { Input } from "@/components/v2/components/ui/Input";
import { Label } from "@/components/v2/components/ui/label";
import { useApiContext } from "@/context/ApiContext";
import { useUserContext } from "@/context/UserContext";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Briefcase,
    Calendar,
    Camera,
    Edit2,
    Lock,
    Mail,
    Phone,
    Save,
    User
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

// Schemas
const profileSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().min(10, "Telefone inválido"),
  profession: z.string().optional(),
  birthDate: z.string().optional(),
});

const codeSchema = z.object({
  code: z.string().min(4, "Código inválido"),
});

const passwordSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export default function ProfilePage() {
  const { user, setUser } = useUserContext();
  const { PutAPI, PostAPI, GetAPI } = useApiContext();
  const [isEditing, setIsEditing] = useState(false);

  // Password Change State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState(0); // 0: Confirm, 1: Code, 2: New Password
  const [resetCode, setResetCode] = useState("");

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      profession: user?.profession || "",
      birthDate: user?.birthDate || "",
    },
  });

  // Update form values when user loads
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        phone: user.phone,
        profession: user.profession || "",
        birthDate: user.birthDate || "",
      });
    }
  }, [user, profileForm]);

  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (!user) return;

    try {
      const response = await PutAPI(
        `/user/profile/${user.id}`,
        {
          name: data.name,
          phone: data.phone,
          profession: data.profession,
          birthDate: data.birthDate,
        },
        true
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Perfil atualizado com sucesso!");
        setIsEditing(false);
        setUser({ ...user, ...data } as any); // Optimistic update or refetch
      } else {
        toast.error(response.body.message || "Erro ao atualizar perfil");
      }
    } catch (error) {
      toast.error("Erro inesperado ao salvar perfil");
    }
  };

  // Password Change Handlers
  const startPasswordChange = () => {
    setIsPasswordModalOpen(true);
    setPasswordStep(0);
  };

  const confirmSendCode = async () => {
    if (!user?.email) return;
    try {
      const response = await PostAPI(
        "/password-code",
        { email: user.email },
        false
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("Código enviado para seu e-mail!");
        setPasswordStep(1);
      } else {
        toast.error(response.body.message || "Erro ao enviar código");
      }
    } catch (error) {
      toast.error("Erro ao solicitar código");
    }
  };

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
  });

  const onCodeSubmit = async (data: z.infer<typeof codeSchema>) => {
    try {
      const response = await GetAPI(`/password-code/${data.code}`, false);
      if (response.status === 200) {
        setResetCode(data.code);
        toast.success("Código validado!");
        setPasswordStep(2);
      } else {
        toast.error(response.body.message || "Código inválido");
      }
    } catch (error) {
      toast.error("Erro ao validar código");
    }
  };

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      const response = await PostAPI(
        "/influencer/password",
        {
          code: resetCode,
          password: data.password,
        },
        false
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Senha alterada com sucesso!");
        setIsPasswordModalOpen(false);
        passwordForm.reset();
        codeForm.reset();
        setPasswordStep(0);
      } else {
        toast.error(response.body.message || "Erro ao alterar senha");
      }
    } catch (error) {
      toast.error("Erro inesperado");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-6 text-[#1a1d1f]">
      <div className="w-full space-y-8">
        <h1 className="text-3xl font-bold text-[#1a1d1f]">Meu Perfil</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Main Info */}
          <div className="md:col-span-1 space-y-6">
            <Card className="p-6 flex flex-col items-center text-center border-gray-100 shadow-sm">
              <div className="relative mb-4 group cursor-pointer">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                  <AvatarImage src="" />
                  {user && (
                    <AvatarFallback className="bg-[#749c5b] text-white text-4xl">
                      {user?.name?.split(" ")[0][0] +
                        user?.name?.split(" ")[1][0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>

              <h2 className="text-xl font-bold text-[#1a1d1f] mb-1">
                {user?.name}
              </h2>
              {/* <p className="text-sm text-gray-500 mb-4">Parlamentar / Assessor</p> */}

              <Badge className="bg-[#f0fdf4] text-green-700 hover:bg-[#dcfce7] mb-2 cursor-default">
                Conta Verificada
              </Badge>
            </Card>

            {/* Support Card */}
            <Card className="p-6 border-gray-100 shadow-sm bg-[#1a1d1f] text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2">Precisa de Ajuda?</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Entre em contato com nosso suporte especializado.
                </p>
                <Button
                  variant="outline"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 w-full"
                  onClick={() =>
                    window.open("https://wa.me/556100000000", "_blank")
                  }
                >
                  Falar no WhatsApp
                </Button>
              </div>
              {/* Abstract background shape */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-[#749c5b] rounded-full opacity-20 blur-2xl"></div>
            </Card>
          </div>

          {/* Right Column: Edit Form & Plan */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="p-6 border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <User className="text-[#749c5b]" size={20} /> Informações
                  Pessoais
                </h3>
                <Button
                  variant="ghost"
                  className="text-[#749c5b] hover:text-[#749c5b]/80 hover:bg-[#749c5b]/10"
                  onClick={() => {
                    if (isEditing) {
                      profileForm.handleSubmit(onProfileSubmit)();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  {isEditing ? (
                    <>
                      <Save size={16} className="mr-2" /> Salvar
                    </>
                  ) : (
                    <>
                      <Edit2 size={16} className="mr-2" /> Editar
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <Input
                        className="pl-9"
                        disabled={!isEditing}
                        {...profileForm.register("name")}
                      />
                    </div>
                    {profileForm.formState.errors.name && (
                      <p className="text-xs text-red-500">
                        {profileForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <Input
                        className="pl-9"
                        disabled={!isEditing}
                        {...profileForm.register("phone")}
                      />
                    </div>
                    {profileForm.formState.errors.phone && (
                      <p className="text-xs text-red-500">
                        {profileForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Profissão</Label>
                    <div className="relative">
                      <Briefcase
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <Input
                        className="pl-9"
                        disabled={!isEditing}
                        {...profileForm.register("profession")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Nascimento</Label>
                    <div className="relative">
                      <Calendar
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <Input
                        type="date"
                        className="pl-9"
                        disabled={!isEditing}
                        {...profileForm.register("birthDate")}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      className="pl-9 bg-gray-50"
                      value={user?.email || ""}
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    O e-mail não pode ser alterado manualmente.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Senha</Label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      className="pl-9"
                      type="password"
                      value="********"
                      disabled
                    />
                  </div>
                  <Button
                    variant="link"
                    className="px-0 text-[#749c5b] h-auto text-sm"
                    onClick={startPasswordChange}
                  >
                    Alterar senha
                  </Button>
                </div>
              </div>
            </Card>

            {/* Plan Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1a1d1f] to-[#2d3238] p-6 text-white shadow-lg">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">
                    Seu Plano Atual
                  </p>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Plano Preditivo{" "}
                    <Badge className="bg-[#749c5b] hover:bg-[#749c5b] ml-2">
                      PRO
                    </Badge>
                  </h3>
                  <p className="text-gray-400 text-sm max-w-md">
                    Acesso total às ferramentas de Inteligência Artificial,
                    Análise de Dados e Monitoramento Legislativo.
                  </p>
                </div>
                <Button className="bg-[#749c5b] hover:bg-[#658a4e] text-white border-0">
                  Gerenciar Assinatura
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              {passwordStep === 0 &&
                "Você tem certeza que deseja alterar sua senha? Enviaremos um código de verificação para o seu e-mail."}
              {passwordStep === 1 &&
                "Digite o código de verificação enviado para o seu e-mail."}
              {passwordStep === 2 && "Crie sua nova senha."}
            </DialogDescription>
          </DialogHeader>

          {passwordStep === 0 && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsPasswordModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={confirmSendCode}>Sim, alterar senha</Button>
            </DialogFooter>
          )}

          {passwordStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Código de verificação"
                  {...codeForm.register("code")}
                />
                {codeForm.formState.errors.code && (
                  <p className="text-xs text-red-500">
                    {codeForm.formState.errors.code.message}
                  </p>
                )}
              </div>
              <Button
                className="w-full"
                onClick={codeForm.handleSubmit(onCodeSubmit)}
                isLoading={codeForm.formState.isSubmitting}
              >
                Verificar Código
              </Button>
            </div>
          )}

          {passwordStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nova Senha</Label>
                <Input type="password" {...passwordForm.register("password")} />
                {passwordForm.formState.errors.password && (
                  <p className="text-xs text-red-500">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Confirmar Senha</Label>
                <Input
                  type="password"
                  {...passwordForm.register("confirmPassword")}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button
                className="w-full"
                onClick={passwordForm.handleSubmit(onPasswordSubmit)}
                isLoading={passwordForm.formState.isSubmitting}
              >
                Alterar Senha
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
