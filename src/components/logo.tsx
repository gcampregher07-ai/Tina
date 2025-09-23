import Image from 'next/image';
import { cn } from "@/lib/utils";

type TinaLogoProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
  src?: string;
  alt?: string;
};

export function TinaLogo({ 
    className, 
    width = 80, 
    height = 80, 
    src = "/logo.svg",
    alt = "Tina Clothing",
    ...props 
}: TinaLogoProps) {
    return (
        <Image
            src={src}
            alt={alt}
            width={Number(width)}
            height={Number(height)}
            className={cn("object-contain", className)}
            role="img"
            {...props}
        />
    )
}
