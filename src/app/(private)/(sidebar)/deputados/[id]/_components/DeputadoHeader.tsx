"use client";

import { PoliticianDetailsProps } from "@/@types/v2/politician";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/v2/components/ui/avatar";
import { Button } from "@/components/v2/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/v2/components/ui/select";
import {
  Building2,
  Calendar,
  Download,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
interface DeputadoHeaderProps {
  politician: PoliticianDetailsProps;
  selectedYear: string;
  availableYears: string[];
  onYearChange: (year: string) => void;
  onExportPDF: () => void;
}

export function DeputadoHeader({
  politician,
  selectedYear,
  availableYears,
  onYearChange,
  onExportPDF,
}: DeputadoHeaderProps) {
  return (
    <header>
      <div className="relative overflow-hidden rounded-2xl shadow-lg">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "linear-gradient(135deg, #1B3B2B 0%, #2d5a3d 38%, #749c5b 65%, #5a8c4a 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #fff 0%, transparent 70%)",
          }}
          aria-hidden
        />
        <Image
          src="/static/camara.jpg"
          alt=""
          width={1000}
          height={1000}
          className="absolute inset-0 h-full w-full object-cover opacity-10"
        />
        <div className="relative z-20 rounded-2xl bg-white/92 p-6 backdrop-blur-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <Avatar className="h-24 w-24 border-2 border-gray-200 shadow-md sm:h-28 sm:w-28">
                <AvatarImage
                  src={politician.imageUrl}
                  alt={politician.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-secondary/20 text-2xl font-semibold text-gray-900 sm:text-3xl">
                  {politician.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {politician.situacaoExercicio
                    ? `${politician.name} (${politician.situacaoExercicio})`
                    : politician.name}
                </h1>
                <p className="mt-1 text-base text-gray-800">
                  {politician.politicalPartyAcronym ||
                    politician.politicalParty}{" "}
                  • {politician.state}
                </p>
                {politician.positions?.[0] && (
                  <p className="mt-0.5 text-sm text-gray-700">
                    {politician.positions[0].position}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/deputados">
                <Button
                  variant="outline"
                  className="border-secondary/50 hover:bg-secondary/20 text-gray-900"
                  title="Escolher outro parlamentar"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Alterar parlamentar
                </Button>
              </Link>
              <Select value={selectedYear} onValueChange={onYearChange}>
                <SelectTrigger className="h-10 w-[110px] border-gray-300 bg-white text-gray-900">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                onClick={onExportPDF}
                title="Exportar PDF"
              >
                <Download className="mr-2 h-5 w-5" />
                PDF
              </Button>
              <Link
                href={`https://www.camara.leg.br/deputados/${politician.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Câmara
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 border-t border-gray-200 pt-5 text-base text-gray-900">
            {politician.birthDate && (
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-700" />
                {new Date(politician.birthDate).toLocaleDateString("pt-BR")}
              </span>
            )}
            {politician.placeOfBirth && (
              <span className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-700" />
                {politician.placeOfBirth}
              </span>
            )}
            {politician.email && (
              <a
                href={`mailto:${politician.email}`}
                className="hover:text-secondary flex items-center gap-2 text-gray-900 transition-colors"
              >
                <Mail className="h-5 w-5 text-gray-700" />
                {politician.email}
              </a>
            )}
            {politician.phone && (
              <a
                href={`tel:${politician.phone}`}
                className="hover:text-secondary flex items-center gap-2 text-gray-900 transition-colors"
              >
                <Phone className="h-5 w-5 text-gray-700" />
                {politician.phone}
              </a>
            )}
            {(politician.gabinetePredio ||
              politician.gabineteAndar ||
              politician.gabineteSala) && (
              <span className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gray-700" />
                Gabinete:{" "}
                {[
                  politician.gabinetePredio,
                  politician.gabineteAndar,
                  politician.gabineteSala,
                ]
                  .filter(Boolean)
                  .join(" / ")}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
