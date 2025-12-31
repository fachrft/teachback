"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center text-primary-foreground">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
          Mulai Transformasi Kelas Anda Hari Ini
        </h2>
        <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto">
          Coba gratis untuk satu kelas pertama. Rasakan bedanya ketika siswa
          benar-benar memahami materi, bukan sekadar menghafal.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            variant="secondary"
            className="gap-2 text-primary font-bold"
          >
            Daftar Sekarang
            <ArrowRight className="size-4" />
          </Button>

        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">
                T
              </div>
              <span className="text-xl font-bold text-white">TeachBack</span>
            </Link>
            <p className="max-w-xs text-sm">
              Platform pembelajaran konversasional berbasis AI untuk membantu
              siswa memahami konsep lebih dalam.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Untuk Guru
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Untuk Siswa
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Harga
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Keamanan
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs">
          <p>
            &copy; {new Date().getFullYear()} TeachBack Platform. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
