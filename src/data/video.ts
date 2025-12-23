export interface VideoProps {
  id: number;
  title: string;
  subtitle: string;
  tags: string[];
  link: string;
  image: string;
}

export const videos: VideoProps[] = [
  {
    id: 1,
    title: "Conhecendo o Dashboard",
    subtitle:
      "Aprenda a navegar pelas principais funcionalidades e métricas do seu painel inicial.",
    tags: ["Iniciante", "Dashboard"],
    link: "https://www.youtube.com/embed/uaS75cHC3iU?si=DzOsb3gKdPMmfhud", // Exemplo genérico
    image: "/thumbnails/dashboard.jpg", // Caminho hipotético
  },
  {
    id: 2,
    title: "Como criar uma nova proposição",
    subtitle:
      "Passo a passo para cadastrar e acompanhar suas proposições no sistema.",
    tags: ["Proposições", "Gestão"],
    link: "https://www.youtube.com/embed/uaS75cHC3iU?si=DzOsb3gKdPMmfhud",
    image: "/thumbnails/proposicao.jpg",
  },
  {
    id: 3,
    title: "Utilizando a IA para análise",
    subtitle:
      "Descubra como nossa inteligência artificial pode acelerar suas análises jurídicas.",
    tags: ["IA", "Avançado"],
    link: "https://www.youtube.com/embed/uaS75cHC3iU?si=DzOsb3gKdPMmfhud",
    image: "/thumbnails/ai.jpg",
  },
];
