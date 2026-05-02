"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { uploadAbiturExam, extractTasksFromExam } from "./actions";

interface Exam {
  id: string;
  year: number;
  state: string;
  file_url: string;
  processed_at: string | null;
  created_at: string;
}

export default function AdminAbiturPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    const { data } = await supabase
      .from("abitur_exams")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setExams(data);
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    try {
      await uploadAbiturExam(formData);
      await loadExams();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload fehlgeschlagen. Bitte versuche es erneut.");
    }

    setUploading(false);
  };

  const handleExtract = async (examId: string) => {
    setExtracting(examId);
    try {
      await extractTasksFromExam(examId);
      await loadExams();
      alert("Extraktion abgeschlossen!");
    } catch (error) {
      console.error("Extraction failed:", error);
      alert("Extraktion fehlgeschlagen.");
    }
    setExtracting(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Abitur-Verwaltung</h1>
        <p className="text-muted-foreground mt-2">
          Lade Abitur-PDFs hoch und extrahiere Aufgaben mit KI
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Neues Abitur-PDF hochladen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Jahr</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  placeholder="2024"
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">Bundesland</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="Bayern"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="file">PDF-Datei</Label>
              <Input
                id="file"
                name="file"
                type="file"
                accept=".pdf"
                required
              />
            </div>
            <Button type="submit" disabled={uploading}>
              {uploading ? "Wird hochgeladen..." : "Hochladen"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hochgeladene Prüfungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Jahr</th>
                  <th className="text-left p-4 font-medium">Bundesland</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Hochgeladen</th>
                  <th className="text-left p-4 font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">{exam.year}</td>
                    <td className="p-4">{exam.state}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          exam.processed_at
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {exam.processed_at ? "Extrahiert" : "Nicht verarbeitet"}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(exam.created_at).toLocaleDateString("de-DE")}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {!exam.processed_at && (
                          <Button
                            size="sm"
                            onClick={() => handleExtract(exam.id)}
                            disabled={extracting === exam.id}
                          >
                            {extracting === exam.id
                              ? "Wird extrahiert..."
                              : "Extrahieren"}
                          </Button>
                        )}
                        <Link href={`/admin/abitur/${exam.id}`}>
                          <Button size="sm" variant="outline">
                            Bearbeiten
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
