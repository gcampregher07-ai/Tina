
"use client";

import React from "react";
import { FaWhatsapp } from "react-icons/fa";

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
}

export function WhatsAppButton({ phoneNumber, message = "Hola! Quisiera hacer una consulta sobre un producto." }: WhatsAppButtonProps) {
  if (!phoneNumber) {
    return null;
  }
  
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="
        fixed right-5
        bottom-5
        bg-[#25D366] text-white
        rounded-full
        w-14 h-14
        flex justify-center items-center
        shadow-lg
        text-3xl
        cursor-pointer
        hover:bg-green-600
        transition-colors duration-200
        z-50
      "
    >
      <FaWhatsapp />
    </a>
  );
}
