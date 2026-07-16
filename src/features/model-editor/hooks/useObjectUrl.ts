"use client";

import { useEffect, useState } from "react";

export function useObjectUrl(blob: Blob | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const nextUrl = blob ? URL.createObjectURL(blob) : null;
    queueMicrotask(() => {
      if (active) setUrl(nextUrl);
    });
    return () => {
      active = false;
      if (nextUrl) URL.revokeObjectURL(nextUrl);
    };
  }, [blob]);

  return url;
}
