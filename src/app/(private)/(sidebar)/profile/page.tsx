"use client";
import { ProfileProps } from "@/@types/user";

// import { useApiContext } from "@/context/ApiContext";

// import { useUserContext } from "@/context/userContext";
import { cn } from "@/lib/utils";
import { Dock, Lock, Mail, Phone, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
export interface PlanProps {
  id: string;
  name: string;
  description: string;
  price: number;
  support: string;
  usageLimit: string;
  imageUrl: string;
  iconUrl: string;
  socialMediaQuantity: number;
}

// Importando a fonte Nunito

export default function Profile() {
  // const { profile, setProfile, creditCard } = useUserContext();
  const [visibleSections, setVisibleSections] = useState<number[]>([]);
  //  const {PutAPI} = useApiContext();

  const [isEditing] = useState(false);
  const [localProfile, setLocalProfile] = useState<ProfileProps | null>({
    id: "01",
    name: "Arthur Santos",
    email: "arthursantos@ig.com.br",
    mobilePhone: "61999999999",
    avatar: "",
    description: "Governador do Estado de Santa Catarina",
  });

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    // Função que adiciona visibilidade a cada seção com atraso
    for (let i = 0; i < 6; i++) {
      const timeout = setTimeout(() => {
        setVisibleSections((prev) => [...prev, i]);
      }, i * 100); // 1 segundo de delay por seção

      timeouts.push(timeout);
    }

    return () => {
      // Limpa os timeouts ao desmontar o componente
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  // async function HandleEditProfile() {

  //   const editProfile = await PutAPI(
  //     "/influencer/profile",
  //     localProfile,
  //     true,
  //   );
  //   if (editProfile.status === 200) {
  //     toast.success("Perfil editado com sucesso");
  //     // setProfile(localProfile);
  //     return setIsEditing(false);
  //   }
  //   return toast.error("Erro ao editar perfil");
  // }

  // useEffect(() => {
  //   if (profile) {
  //     setLocalProfile(profile);
  //   }
  // }, [profile]);

  return (
    <>
      <div className="relative flex h-full w-full flex-col overflow-hidden p-4 pb-24">
        <section className="z-20 mt-6 grid w-full flex-grow grid-cols-12 gap-2 px-1 lg:grid-rows-12">
          <div
            className={`col-span-12 md:col-span-6 ${
              visibleSections.includes(0)
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            } flex flex-col items-center justify-around overflow-hidden rounded-lg bg-white bg-[url(/PeopleOnComputer.png)] bg-cover bg-center bg-no-repeat shadow-lg transition-all duration-300 lg:col-span-4 lg:row-span-8`}
          >
            <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 bg-white/80 p-4 lg:gap-0 lg:p-0">
              <Image
                width={2000}
                height={2000}
                alt=""
                src={"/static/plenary.png"}
                className="absolute h-full w-full object-cover"
              />
              <div className="bg-secondary/80 hover:bg-secondary z-[1] flex h-32 w-40 flex-col items-center justify-center gap-2 rounded-lg p-2 transition-all duration-300">
                <Image
                  alt=""
                  width={1000}
                  height={1000}
                  className="h-12 w-12"
                  src={"/logos/small-logo.png"}
                />
                <span className="text-sm font-bold text-white">
                  Plano Preditivo
                </span>
              </div>
              <div className="bg-secondary/80 hover:bg-secondary bottom-4 z-[1] rounded-full p-2 px-10 py-1 font-bold text-white transition-all duration-300 hover:scale-[1.005] lg:absolute">
                Em breve mais planos
              </div>
            </div>
          </div>
          <div
            className={`col-span-12 ${
              visibleSections.includes(1)
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            } flex flex-col gap-4 rounded-lg bg-white p-2 px-4 pb-8 shadow-lg transition-all duration-300 md:col-span-6 lg:col-span-4 lg:row-span-8`}
          >
            <div className="flex w-full flex-row items-center justify-between">
              <span className="text-default-900 text-secondary text-lg font-black">
                Seus Dados
              </span>
              <div className="flex flex-row items-center gap-2">
                <button className="bg-secondary flex h-8 items-center justify-center rounded-md p-2 text-white">
                  Editar
                </button>
              </div>
            </div>

            <div className="flex flex-1 flex-col items-start justify-between gap-2">
              <div className="flex w-full flex-row items-center gap-4 px-1">
                <User className="text-secondary h-6 w-6" />
                <div className="flex w-full flex-col gap-0.5">
                  <span className="text-[#8C8C8C]">Nome Completo:</span>
                  <input
                    value={localProfile?.name || ""}
                    onChange={(e) => {
                      if (localProfile) {
                        setLocalProfile({
                          ...localProfile,
                          name: e.target.value,
                        });
                      }
                    }}
                    className={cn(
                      "border p-1 font-bold transition duration-200 focus:outline-none",
                      isEditing
                        ? "border-secondary bg-secondary rounded-md bg-clip-text text-transparent"
                        : "border-transparent bg-transparent text-black",
                    )}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="flex w-full flex-row items-center gap-4 px-1">
                <Phone className="text-secondary h-6 w-6" />
                <div className="flex w-full flex-col gap-0.5">
                  <span className="text-[#8C8C8C]">Telefone:</span>
                  <input
                    value={localProfile?.mobilePhone || ""}
                    onChange={(e) => {
                      if (localProfile) {
                        setLocalProfile({
                          ...localProfile,
                          mobilePhone: e.target.value,
                        });
                      }
                    }}
                    className={cn(
                      "border p-1 font-bold transition duration-200 focus:outline-none",
                      isEditing
                        ? "border-secondary bg-secondary rounded-md bg-clip-text text-transparent"
                        : "border-transparent bg-transparent text-black",
                    )}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="flex w-full flex-row items-center gap-4 px-1">
                <Dock className="text-secondary h-6 w-6" />
                <div className="flex w-full flex-col gap-0.5 transition duration-200">
                  <span className="text-[#8C8C8C]">Descrição:</span>
                  <input
                    value={localProfile?.description || ""}
                    onChange={(e) => {
                      if (localProfile) {
                        setLocalProfile({
                          ...localProfile,
                          description: e.target.value,
                        });
                      }
                    }}
                    className={cn(
                      "border p-1 font-bold focus:outline-none",
                      isEditing
                        ? "border-secondary bg-secondary rounded-md bg-clip-text text-transparent"
                        : "border-transparent bg-transparent text-black",
                    )}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="flex w-full flex-row items-center gap-4 px-1">
                <Mail className="text-secondary h-6 w-6" />
                <div className="flex w-full flex-col gap-0.5">
                  <span className="text-[#8C8C8C]">Email:</span>
                  <input
                    value={localProfile?.email || ""}
                    className="w-full bg-transparent font-bold text-black focus:outline-none"
                    disabled
                  />
                </div>
              </div>
              <div className="flex w-full flex-row items-center gap-4 px-1">
                <Lock className="text-secondary h-6 w-6" />
                <div className="flex w-full flex-col gap-0.5">
                  <span className="text-[#8C8C8C]">Senha:</span>
                  <input
                    value={"*******"}
                    onChange={(e) => {
                      if (localProfile) {
                        setLocalProfile({
                          ...localProfile,
                          name: e.target.value,
                        });
                      }
                    }}
                    className={cn(
                      "border p-1 font-bold transition duration-200 focus:outline-none",
                      isEditing
                        ? "border-secondary bg-secondary rounded-md bg-clip-text text-transparent"
                        : "border-transparent bg-transparent text-black",
                    )}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className={`col-span-12 ${
              visibleSections.includes(4)
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            } flex flex-col justify-between gap-4 rounded-lg bg-[url(/static/card.png)] bg-cover bg-center p-2 px-4 text-white shadow-lg transition-all duration-300 md:col-span-7 lg:col-span-4 lg:row-span-4`}
          >
            <div className="flex flex-row items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-md bg-white object-cover">
                <Image
                  src={`/icons/support.svg`}
                  alt="logo"
                  width={100}
                  height={100}
                  className="h-12 w-12"
                />
              </div>
              <span className="text-lg font-bold">Solicitar suporte</span>
            </div>
            <div
              className={`col-span-12 ${
                visibleSections.includes(5)
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              } flex flex-col self-end rounded-lg p-2 px-4 transition-all duration-300 md:col-span-12 lg:col-span-4 lg:row-span-4`}
            >
              <button
                onClick={() =>
                  window.open("https://api.whatsapp.com", "_blank")
                }
                className="bg-secondary self-center rounded-md border border-white p-2 text-white transition-all duration-300 hover:scale-[1.005]"
              >
                Solicitar suporte
              </button>
            </div>
          </div>
          <div
            className={`col-span-12 ${
              visibleSections.includes(4)
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            } border-secondary flex flex-col justify-between gap-4 rounded-lg border bg-white bg-cover bg-center p-2 px-4 text-white shadow-lg transition-all duration-300 md:col-span-7 lg:col-span-4 lg:row-span-4`}
          >
            <div className="flex flex-row items-center gap-4">
              <div className="border-secondary flex h-20 w-20 items-center justify-center rounded-md border bg-white object-cover">
                <Image
                  src={`/icons/money.svg`}
                  alt="logo"
                  width={100}
                  height={100}
                  className="h-12 w-12"
                />
              </div>
              <span className="text-lg font-bold text-black">Financeiro</span>
            </div>
            <div
              className={`col-span-12 ${
                visibleSections.includes(5)
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              } flex flex-col self-end rounded-lg p-2 px-4 transition-all duration-300 md:col-span-12 lg:col-span-4 lg:row-span-4`}
            >
              <button
                // onClick={() =>
                //   window.open(
                //     "https://api.whatsapp.com/send?phone=",
                //     "_blank",
                //   )
                // }
                className="bg-secondary self-center rounded-md border border-white p-2 text-white transition-all duration-300 hover:scale-[1.005]"
              >
                Notas fiscais
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
