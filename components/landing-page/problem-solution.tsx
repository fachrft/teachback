"use client";

import { X, Check, ArrowDown, Lightbulb } from "lucide-react";

export function ProblemSolution() {
  const problems = [
    {
      title: "Hanya Menghafal",
      description:
        "Siswa seringkali hanya menghafal definisi tanpa memahami konsep, sehingga gugup saat diminta menjelaskan.",
    },
    {
      title: "Guru Kewalahan",
      description:
        "Tidak mungkin bagi guru untuk melakukan ujian lisan satu per satu kepada puluhan siswa setiap hari.",
    },
    {
      title: "Penilaian Searah",
      description:
        "Penilaian konvensional seringkali hanya berupa angka tanpa feedback kualitatif yang membangun.",
    },
  ];

  return (
    <section className="py-20 bg-slate-50" id="problem">
      <div className="container mx-auto px-4 md:px-6">
        {/* Problem Section */}
        <div className="text-center mb-16 space-y-4" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Masalah Pembelajaran Saat Ini
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Metode konvensional seringkali meninggalkan celah dalam pemahaman
            siswa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {problems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <div className="size-12 rounded-full bg-red-100 flex items-center justify-center mb-6">
                <X className="size-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Transition Arrow */}
        <div className="flex justify-center mb-20" data-aos="zoom-in">
          <div className="bg-white p-4 rounded-full shadow-lg border border-border animate-bounce">
            <ArrowDown className="size-6 text-primary" />
          </div>
        </div>

        {/* Solution Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center" id="solution">
          <div data-aos="fade-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Lightbulb className="size-4" />
              <span>Solusi Kami</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Teachback Lewat Chatbot AI
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Siswa diwawancara oleh AI, ditanya konsep inti, diberikan
              pertanyaan follow-up untuk menguji pemahaman (High Order Thinking
              Skills), bukan sekadar mengingat.
            </p>

            <ul className="space-y-4">
              {[
                "Siswa menjelaskan dengan bahasa sendiri",
                "AI menggali pemahaman dengan pertanyaan lanjutan",
                "Penilaian otomatis berbasis Rubrik",
                "Feedback kualitatif instan untuk siswa",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <span className="text-foreground font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative" data-aos="fade-left">
            {/* Visual Representation of Solution Benefits */}
            <div className="relative aspect-square md:aspect-auto md:h-[500px] w-full bg-slate-100 rounded-3xl p-6 overflow-hidden border border-slate-200">
              {/* Decorative Gradient Blob */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-200/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-blue-200/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

              {/* Staggered Cards */}
              <div className="relative z-10 h-full flex flex-col justify-center gap-4">
                {/* Card 1: Confidence */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 w-[90%] self-end animate-in slide-in-from-right duration-700 fade-in">
                  <div className="size-12 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <Check className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Percaya Diri</h4>
                    <p className="text-xs text-slate-500">
                      Berani bicara & berargumen.
                    </p>
                  </div>
                </div>

                {/* Card 2: Deep Understanding (Main Focus) */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-primary/20 flex flex-col gap-3 w-full animate-in zoom-in duration-500 delay-150 relative z-20">
                  <div className="flex items-center justify-between mb-1">
                    <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white">
                      <Lightbulb className="size-5" />
                    </div>
                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Scoring A+
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      Pemahaman Mendalam
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Siswa tidak hanya menghafal, tapi memahami konsep inti
                      karena terus ditantang oleh pertanyaan AI.
                    </p>
                  </div>
                  {/* Mini Progress Bar Visual */}
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-primary h-full w-[85%] rounded-full" />
                  </div>
                </div>

                {/* Card 3: Articulation */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 w-[90%] animate-in slide-in-from-left duration-700 delay-300 fade-in">
                  <div className="size-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Check className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">
                      Artikulasi Jelas
                    </h4>
                    <p className="text-xs text-slate-500">
                      Menyusun kalimat terstruktur.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
