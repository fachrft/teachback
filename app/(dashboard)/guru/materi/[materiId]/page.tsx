import { getMaterialDetail, getQuizByMaterialId } from "../_action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Clock, FileText, HelpCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BreadcrumbUpdater } from "./_components/breadcrumb-updater";
import { QuizListEditor } from "./_components/quiz-list-editor";

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ materiId: string }>;
}) {
  const { materiId } = await params;
  const material = await getMaterialDetail(materiId);
  const quizData = await getQuizByMaterialId(materiId);

  if (!material) {
    return notFound();
  }

  const renderFilePreview = () => {
    if (!material.fileUrl) return null;
    return (
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(
          material.fileUrl
        )}&embedded=true`}
        className="w-full h-[600px] border rounded-md"
      />
    );
  };

  return (
    <div className="space-y-6 pt-4 md:p-4">
      {/* Client Component Trigger for Breadcrumb */}
      <BreadcrumbUpdater
        items={[
          { label: "Materi", href: "/guru/materi" },
          { label: material.name, href: `/guru/materi/${materiId}` },
        ]}
      />

      {/* Header */}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/guru/materi">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {material.name}
              {material.flags?.quiz && (
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-700"
                >
                  Quiz 
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(material.createdAt).toLocaleDateString("id-ID", {
                  dateStyle: "long",
                })}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Material Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Materi Pembelajaran
              </CardTitle>
            </CardHeader>
            <CardContent>{renderFilePreview()}</CardContent>
          </Card>
        </div>

        {/* Right Column: Quiz Preview */}
        <div className="space-y-6 h-full">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Daftar Kuis (AI Generated)
                </div>
                {quizData && (
                  <Badge variant="outline">
                    {quizData.questions.length} Soal
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto max-h-[600px] pr-2">
              {!quizData ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Materi ini tidak memiliki kuis.</p>
                </div>
              ) : (
                <QuizListEditor quizData={quizData} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
