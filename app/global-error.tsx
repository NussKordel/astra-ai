"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white">Etwas ist schiefgelaufen</h2>
          <p className="text-muted-foreground">
            Ein Server-Fehler ist aufgetreten. Bitte überprüfe deine Internetverbindung und versuche es erneut.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono">Fehler-Code: {error.digest}</p>
          )}
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium hover:from-violet-500 hover:to-indigo-500 transition-all"
          >
            Seite neu laden
          </button>
        </div>
      </body>
    </html>
  );
}
