"use client";
import { useCallback } from "react";
export function ReferenceImageView({blob,alt,className}:{blob:Blob;alt:string;className?:string}){
  const setImageRef = useCallback((image: HTMLImageElement | null) => {
    if (!image) {
      return;
    }

    const objectUrl = URL.createObjectURL(blob);
    image.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [blob]);

  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={setImageRef} alt={alt} className={className}/>;
}
