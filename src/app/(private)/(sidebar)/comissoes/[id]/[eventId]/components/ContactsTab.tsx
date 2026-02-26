"use client";

import { useApiContext } from "@/context/ApiContext";
import { ExternalLink, Info, Mail } from "lucide-react";
import { useEffect, useState } from "react";

interface Contacts {
  uri: string | null;
  eventUri: string | null;
}

interface ContactsTabProps {
  eventId: string;
}

export function ContactsTab({ eventId }: ContactsTabProps) {
  const { GetAPI } = useApiContext();
  const [contacts, setContacts] = useState<Contacts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContacts() {
      setLoading(true);
      const response = await GetAPI(`/event/${eventId}/contacts`, true);
      if (response.status === 200) {
        setContacts(response.body.contacts);
      }
      setLoading(false);
    }

    if (eventId) {
      fetchContacts();
    }
  }, [eventId, GetAPI]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#749c5b] border-t-transparent" />
      </div>
    );
  }

  if (!contacts || (!contacts.uri && !contacts.eventUri)) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <Info className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h3 className="text-lg font-bold text-[#1a1d1f]">
          Informações de contato não disponíveis
        </h3>
        <p className="mx-auto mt-2 max-w-xs text-sm text-[#6f767e]">
          As informações de contato deste evento não estão disponíveis no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-xl font-bold text-[#1a1d1f]">
          Informações de Contato
        </h3>

        <div className="space-y-4">
          {contacts.eventUri && (
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#749c5b]/10 text-[#749c5b]">
                <ExternalLink size={20} />
              </div>
              <div className="flex-1">
                <h4 className="mb-1 text-sm font-bold text-[#1a1d1f]">
                  Página Oficial do Evento
                </h4>
                <a
                  href={contacts.eventUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#749c5b] hover:underline break-all"
                >
                  {contacts.eventUri}
                </a>
              </div>
            </div>
          )}

          {contacts.uri && (
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#749c5b]/10 text-[#749c5b]">
                <Mail size={20} />
              </div>
              <div className="flex-1">
                <h4 className="mb-1 text-sm font-bold text-[#1a1d1f]">
                  Página Oficial da Comissão
                </h4>
                <a
                  href={contacts.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#749c5b] hover:underline break-all"
                >
                  {contacts.uri}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


