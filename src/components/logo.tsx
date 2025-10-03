
import Image from 'next/image';
import { cn } from "@/lib/utils";

type TinaLogoProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
  src?: string;
  alt?: string;
  priority?: boolean;
};

export function TinaLogo({ 
    className, 
    width = 180, 
    height = 60, 
    src = "/logo.svg",
    alt = "Tina Clothing",
    priority = true,
    ...props 
}: TinaLogoProps) {
    return (
        <Image
            src={src}
            alt={alt}
            width={Number(width)}
            height={Number(height)}
            priority={priority}
            className={cn("object-contain", className)}
            role="img"
            style={{ height: 'auto' }}
            {...props}
        />
    )
}
