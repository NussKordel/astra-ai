"use client";

import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UpgradeCard() {
  const router = useRouter();

  return (
    <div className="w-72 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">a</span>
        </div>
        <span className="font-semibold text-white">astra</span>
        <span className="text-xs bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded">AI+</span>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Lernen ohne Grenzen mit AI.
      </p>
      
      <Button
        onClick={() => router.push("/settings")}
        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0"
      >
        <Zap className="w-4 h-4 mr-2" />
        Kaufen
      </Button>
    </div>
  );
}
