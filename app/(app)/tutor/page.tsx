import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBJECTS } from "@/lib/constants";

export default function TutorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">KI-Tutor</h1>
        <p className="text-muted-foreground mt-2">
          Wähle ein Fach und starte deine Lernsitzung
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {SUBJECTS.map((subject) => (
          <Link key={subject} href={`/tutor/${encodeURIComponent(subject)}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{subject}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  KI-Nachhilfe für {subject}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
