
import React from "react";

export function TopBar() {
  return (
    <div
      className="
        fixed top-0 left-0 w-full
        bg-black
        text-white
        font-semibold
        text-center
        px-4 py-1
        z-50
        select-none
        shadow-sm
        text-sm
      "
      style={{ fontSize: "0.75rem" }} // 12px para texto un poco más pequeño
    >
      Envios GRATIS en Rio Cuarto
    </div>
  );
}
