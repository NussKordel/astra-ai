"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md px-4">
        <h2 className="text-2xl font-semibold">Etwas ist schiefgelaufen</h2>
        <p className="text-muted-foreground">
          KI momentan nicht verfügbar, bitte versuche es erneut.
        </p>
        <Button onClick={reset}>Erneut versuchen</Button>
      </div>
    </div>
  );
}
