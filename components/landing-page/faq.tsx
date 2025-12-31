"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  const faqs = [
    {
      q: "Apakah platform ini menggantikan peran guru?",
      a: "Tidak. AI hanya membantu mengelola percakapan rutin dan memberi analisis awal (first-pass grading). Keputusan akhir nilai, arahan moral, dan konteks pembelajaran yang lebih luas tetap dipegang penuh oleh guru.",
    },
    {
      q: "Apakah ini hanya untuk pelajaran TIK / RPL?",
      a: "Tidak sama sekali. Teachback bisa digunakan untuk Matematika (jelaskan konsep), Bahasa (jelaskan struktur teks), IPA (jelaskan fenomena alam), hingga IPS. Kuncinya adalah 'menjelaskan pemahaman'.",
    },
    {
      q: "Apakah siswa harus selalu online?",
      a: "Ya, sesi Teachback dilakukan secara real-time dengan server AI kami, sehingga membutuhkan koneksi internet. Namun, materi pembelajaran (jika diunduh) mungkin bisa diakses offline tergantung pengaturan.",
    },
    {
      q: "Apakah data percakapan aman?",
      a: "Log percakapan bersifat privat antara Siswa bersangkutan dan Guru di kelas tersebut. Kami memprioritaskan privasi data pendidikan.",
    },
  ];

  return (
    <section className="py-24 bg-background" id="faq">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-muted-foreground">
            Jawaban untuk keraguan Anda tentang metode Teachback.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-medium text-lg">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
