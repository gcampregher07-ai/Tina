
"use client";

import React, { useState } from "react";
import { ChromePicker, ColorResult } from "react-color";

interface ColorPickerProps {
  initialColor?: string;
  onColorChange: (color: string) => void;
}

export default function ColorPicker({ initialColor = "#ffffff", onColorChange }: ColorPickerProps) {
  const [color, setColor] = useState(initialColor);

  const handleChangeComplete = (colorResult: ColorResult) => {
    setColor(colorResult.hex);
    onColorChange(colorResult.hex);
  };

  return (
    <div>
      <ChromePicker color={color} onChangeComplete={handleChangeComplete} disableAlpha={true} />
      <p className="mt-2 text-sm">
        Color seleccionado: <span style={{ color: color, textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>{color}</span>
      </p>
    </div>
  );
}
