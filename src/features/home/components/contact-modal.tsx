"use client";

import { X, User } from "lucide-react";
import { Pet } from "@/features/home/types";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  pet: Pet | null;
}

export function ContactModal({ open, onClose, pet }: ContactModalProps) {
  if (!open || !pet) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xs rounded-3xl bg-background p-6 text-center shadow-2xl">
        {/* Botón para cerrar solo el modal de contacto */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Foto de perfil (Placeholder) */}
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted text-primary shadow-sm">
          <User className="h-12 w-12" />
        </div>
        
        {/* Nombre e info del dueño */}
        <h3 className="mb-1 text-xl font-bold text-foreground">
          {pet.ownerName || "Usuario anónimo"}
        </h3>
        <p className="mb-6 text-sm text-muted-foreground">
          {pet.ownerPhone || "Número no disponible"}
        </p>
        
        {/* Botones de acción directos */}
        <div className="flex flex-col gap-3">
          <a
            href={pet.ownerPhone ? `https://wa.me/${pet.ownerPhone}` : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-full bg-green-500 px-4 py-3 text-sm font-bold text-white hover:bg-green-600 transition-colors"
          >
            Enviar WhatsApp
          </a>
          
          {/* Botón de Enviar mensaje corregido */}
          <a 
            href={pet.ownerPhone ? `sms:${pet.ownerPhone}` : "#"}
            className="w-full rounded-full bg-primary px-4 py-3 text-sm font-bold !text-white hover:bg-primary/90 transition-colors"
          >
            Enviar mensaje
          </a>
        </div>
      </div>
    </div>
  );
}