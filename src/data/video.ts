export interface VideoProps {
  id: number;
  title: string;
  subtitle: string;
  tags: string[];
  link: string; // URL do embed do YouTube
  image?: string; // Thumbnail (opcional)
}

export const videos: VideoProps[] = [
  {
    id: 1,
    title: "Conhecendo o Dashboard",
    subtitle:
      "Aprenda a navegar pelas principais funcionalidades e métricas do seu painel inicial.",
    tags: ["Iniciante", "Dashboard"],
    link: "https://www.youtube.com/embed/XI0tXO4-nu8?si=4cg_Ff5u14g2VpV5",
    image: "/static/thumb_dashboard.png",
  },
  {
    id: 2,
    title: "Como utilizar a nossa IA",
    subtitle:
      "Passo a passo de como utilizar a nossa IA para analisar e gerar informações.",
    tags: ["IA", "Intermediário"],
    link: "https://www.youtube.com/embed/JzqX76GgcLk?si=5UzrvJCXkyzvkmr0",
    image: "/static/thumb_ia.png",
  },
  {
    id: 3,
    title: "Conheça a nossa base de eventos",
    subtitle:
      "Entenda como a nossa base de dados apresenta o detalhamento de cada evento parlamentar.",
    tags: ["Eventos", "Avançado"],
    link: "https://www.youtube.com/embed/jrOqmBVvgeo?si=bUmMXZ8KPBnFc0WB",
    image: "/static/thumb_eventos.png",
  },
  {
    id: 4,
    title: "Aprenda sobre a nossa base de notícias",
    subtitle:
      "Descubra o potencial da nossa base de notícias para sua análise jurídica.",
    tags: ["Notícias", "Iniciante"],
    link: "https://www.youtube.com/embed/FVKbZUoIFu8?si=T9o-sji87jpzuFwl",
    image: "/static/thumb_noticias.png",
  },
];
