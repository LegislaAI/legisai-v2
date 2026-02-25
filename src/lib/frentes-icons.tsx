import {
  Users,
  Heart,
  BookOpen,
  Leaf,
  Shield,
  Sprout,
  TrendingUp,
  Scale,
  Baby,
  Palette,
  Building2,
  Car,
  Landmark,
  type LucideIcon,
} from "lucide-react";

/** Retorna ícone baseado em palavras-chave do nome da frente parlamentar */
export function getIconForFrente(titulo: string): LucideIcon {
  const t = (titulo || "").toLowerCase();
  if (/\bsaúde\b|saude\b|hospital\b|medic|enferm/.test(t)) return Heart;
  if (/\beduca|escola\b|universidade\b|ensino\b/.test(t)) return BookOpen;
  if (/\bmeio\s*ambiente\b|ambiental\b|sustentab|clima\b|floresta\b/.test(t)) return Leaf;
  if (/\bdefesa\b|militar\b|segurança\b|seguranca\b/.test(t)) return Shield;
  if (/\bagricult|agrária|agraria\b|rural\b|alimenta/.test(t)) return Sprout;
  if (/\beconomia\b|econôm|trabalho\b|emprego\b|desenvolvimento\b/.test(t)) return TrendingUp;
  if (/\bdireitos\b|direito\b|justiça|justica\b|jurídic|humano\b/.test(t)) return Scale;
  if (/\bcriança|crianca\b|infância|infancia\b|juvenil\b/.test(t)) return Baby;
  if (/\bcultura\b|artes\b|patrimônio|patrimonio\b/.test(t)) return Palette;
  if (/\bhabitação|habitacao\b|moradia\b|urbano\b|cidade\b/.test(t)) return Building2;
  if (/\btransporte\b|mobilidade\b|trânsito|transito\b/.test(t)) return Car;
  if (/\bmutualismo\b|cooperat|sindical\b/.test(t)) return Users;
  return Landmark;
}
