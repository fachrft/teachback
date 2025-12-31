"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  MessageSquare,
  ArrowRight,
  BrainCircuit,
  Sparkles,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-secondary/50 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/4" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8" data-aos="fade-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
              <Sparkles className="size-4 text-primary" />
              <span>Cara Baru Belajar di 2026</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Belajar dengan Menjelaskan, <br />
              <span className="text-primary">Bukan Menghafal.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Platform teachback dua arah untuk guru dan siswa. Jelaskan
              materimu kepada Chatbot AI, dapatkan feedback instan, dan pahami
              konsep lebih dalam.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2 text-base">
                Mulai Teachback Sekarang
                <ArrowRight className="size-4" />
              </Button>
            </div>

            <div className="pt-4 flex items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-green-500" />
                <span>AI-Powered Feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-blue-500" />
                <span>Guru Terbantu</span>
              </div>
            </div>
          </div>

          {/* Visual Content */}
          <div className="relative" data-aos="fade-left">
            <div className="relative z-10 bg-white border border-border rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
              {/* Chat Mockup */}
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <BrainCircuit className="size-6 text-primary" />
                </div>
                <div className="bg-secondary/50 rounded-2xl rounded-tl-none p-4 text-sm text-foreground max-w-[85%]">
                  <p className="font-semibold text-primary mb-1">Coach AI</p>
                  <p>
                    Halo! Coba jelaskan apa yang kamu pahami tentang
                    Fotosintesis dengan bahasamu sendiri?
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 flex-row-reverse">
                <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <div className="font-bold text-slate-600">S</div>
                </div>
                <div className="bg-slate-50 border border-border rounded-2xl rounded-tr-none p-4 text-sm text-foreground max-w-[85%]">
                  <p className="font-semibold text-slate-600 mb-1 text-right">
                    Siswa
                  </p>
                  <p>
                    Fotosintesis itu proses tumbuhan masak makanan pake sinar
                    matahari, air, sama karbondioksida.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <BrainCircuit className="size-6 text-primary" />
                </div>
                <div className="bg-secondary/50 rounded-2xl rounded-tl-none p-4 text-sm text-foreground max-w-[85%]">
                  <p className="font-semibold text-primary mb-1">Coach AI</p>
                  <p>Benar! Lalu apa yang dihasilkan dari proses tersebut?</p>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-border animate-bounce duration-[3000ms]">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <MessageSquare className="size-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Interactive</p>
                    <p className="font-bold text-sm">Real-time Chat</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative blob */}
            <div className="absolute top-1/2 left-1/2 -px-10 -py-10 w-[110%] h-[110%] bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full blur-3xl -z-10 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </section>
  );
}
