"use client";

import { cn } from "@/lib/utils";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Guru Menyiapkan Kelas",
      desc: "Guru membuat kelas, membagikan kode unik, dan mengunggah materi pembelajaran yang relevan.",
    },
    {
      num: "02",
      title: "Siswa Belajar & Teachback",
      desc: "Siswa membaca materi lalu memulai sesi chat dengan AI untuk menjelaskan ulang pemahaman mereka.",
    },
    {
      num: "03",
      title: "AI & Rubric Assessment",
      desc: "AI memberikan pertanyaan kritis dan menilai jawaban siswa berdasarkan rubrik (Akurasi, Struktur, Konteks).",
    },
    {
      num: "04",
      title: "Final Feedback",
      desc: "Guru mereview log percakapan dan nilai AI, lalu memberikan umpan balik final yang personal.",
    },
  ];

  return (
    <section
      className="py-24 bg-slate-900 text-white overflow-hidden"
      id="how-it-works"
    >
      <div className="container mx-auto px-4 md:px-6 relative">
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute right-0 top-0 w-96 h-96 bg-primary rounded-full blur-[128px]" />
          <div className="absolute left-0 bottom-0 w-96 h-96 bg-secondary rounded-full blur-[128px]" />
        </div>

        <div className="relative z-10 text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Alur Pembelajaran
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Sistem yang terintegrasi dari persiapan hingga evaluasi akhir.
          </p>
        </div>

        <div className="relative z-10 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative p-6 pt-12 border border-slate-700 bg-slate-800/50 rounded-2xl backdrop-blur-sm"
              data-aos="fade-up"
              data-aos-delay={i * 150}
            >
              <div className="absolute -top-6 left-6 size-12 bg-primary text-slate-900 font-bold text-xl flex items-center justify-center rounded-xl shadow-lg shadow-primary/20">
                {step.num}
              </div>
              <h3 className="text-xl font-bold mb-3 mt-2">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
