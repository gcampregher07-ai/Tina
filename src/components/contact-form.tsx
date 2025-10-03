"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Lógica para enviar el formulario (p. ej., a una API o servicio)
    console.log("Formulario enviado", formData);

    // Simular una llamada a la API
    setTimeout(() => {
      toast({
        title: "Mensaje enviado",
        description:
          "Gracias por contactarnos. Te responderemos a la brevedad.",
      });
      setFormData({ name: "", email: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>O envíanos un mensaje</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="name"
              placeholder="Tu nombre"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <Input
              name="email"
              type="email"
              placeholder="Tu email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <Textarea
            name="message"
            placeholder="Escribe tu mensaje aquí..."
            value={formData.message}
            onChange={handleChange}
            required
            disabled={loading}
            rows={5}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enviando..." : "Enviar Mensaje"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
