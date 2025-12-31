"use client";

import {
  Users,
  BookOpen,
  MessageSquareText,
  BarChart3,
  LogIn,
  UserCheck,
  History,
  BrainCircuit,
} from "lucide-react";

export function Features() {
  const teacherFeatures = [
    {
      icon: Users,
      title: "Manajemen Kelas",
      description:
        "Buat kelas tak terbatas dengan kode unik dan kelola siswa dengan mudah.",
    },
    {
      icon: BookOpen,
      title: "Manajemen Materi",
      description:
        "Upload materi pembelajaran yang terhubung langsung dengan sesi Teachback.",
    },
    {
      icon: MessageSquareText,
      title: "Log Percakapan",
      description:
        "Pantau transkrip percakapan siswa dan AI untuk mendeteksi miskonsepsi.",
    },
    {
      icon: BarChart3,
      title: "AI Rubric Scoring",
      description:
        "Penilaian otomatis berbasis rubrik: Akurasi, Struktur, Reasoning, dan Contoh.",
    },
  ];

  const studentFeatures = [
    {
      icon: LogIn,
      title: "Mudah Gabung",
      description:
        "Cukup masukkan kode kelas dari guru dan langsung akses materi.",
    },
    {
      icon: BrainCircuit,
      title: "Teachback via Chat",
      description:
        "Diskusi interaktif dengan AI yang menguji pemahaman secara mendalam.",
    },
    {
      icon: UserCheck,
      title: "Feedback Personal",
      description:
        "Dapatkan analisis kekuatan dan kelemahan serta saran perbaikan instan.",
    },
    {
      icon: History,
      title: "Riwayat Belajar",
      description:
        "Akses kembali percakapan lampau untuk melihat perkembangan diri.",
    },
  ];

  return (
    <section className="py-24 bg-background" id="features">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Fitur Lengkap untuk Ekosistem Belajar
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Dirancang khusus untuk kebutuhan Guru dan Siswa dalam era digital.
          </p>
        </div>

        {/* Teacher Section */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-border flex-1" />
            <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
              Untuk Guru
            </span>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teacherFeatures.map((feat, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all"
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <feat.icon className="size-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Student Section */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-border flex-1" />
            <span className="bg-secondary text-secondary-foreground px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
              Untuk Siswa
            </span>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentFeatures.map((feat, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-secondary-foreground/20 hover:shadow-lg transition-all"
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                <div className="size-12 rounded-xl bg-secondary flex items-center justify-center text-secondary-foreground mb-4 group-hover:scale-110 transition-transform">
                  <feat.icon className="size-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
