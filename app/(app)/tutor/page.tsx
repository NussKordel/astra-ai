import Link from "next/link";
import { BookOpen } from "lucide-react";
import { SUBJECTS } from "@/lib/constants";

export default function TutorPage() {
  return (
    <div className="h-full flex flex-col px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">KI-Tutor</h1>
        <p className="text-muted-foreground mt-1">Wähle ein Fach und starte deine Lernsitzung</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {SUBJECTS.map((subject) => (
          <Link key={subject} href={`/tutor/${encodeURIComponent(subject)}`}>
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-violet-500/20 hover:bg-white/[0.05] transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3 group-hover:bg-violet-500/20 transition-colors">
                <BookOpen className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="font-medium text-white">{subject}</h3>
              <p className="text-sm text-muted-foreground mt-1">KI-Nachhilfe</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
