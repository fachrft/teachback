"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Zap,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  RefreshCw,
} from "lucide-react";
import {
  generateFlashcards,
  getFlashcards,
  Flashcard,
} from "../_actions/flashcard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FlashcardDeckProps {
  materiId: string;
  materialName: string;
  fileUrl: string | null;
}

export function FlashcardDeck({
  materiId,
  materialName,
  fileUrl,
}: FlashcardDeckProps) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const res = await getFlashcards(materiId);
        if (res.success && res.flashcards && res.flashcards.length > 0) {
          setCards(res.flashcards);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingInitial(false);
      }
    }
    init();
  }, [materiId]);

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="w-8 h-8 text-slate-300 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Memuat kartu...</p>
      </div>
    );
  }

  const handleGenerate = async () => {
    setLoading(true);
    const res = await generateFlashcards(materiId, materialName, "", fileUrl);
    if (res.success && res.flashcards) {
      setCards(res.flashcards);
      setCurrentIndex(0);
      setIsFlipped(false);
      toast.success("Flashcards berhasil dibuat! Selamat belajar 🚀");
    } else {
      toast.error("Gagal membuat flashcards. Coba lagi nanti.");
    }
    setLoading(false);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed text-center min-h-[400px]">
        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Zap className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-slate-800">
          AI Flashcards
        </h3>
        <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
          Uji ingatanmu! AI akan menyarikan poin-poin penting materi ini menjadi
          kartu soal-jawab interaktif.
        </p>
        <Button
          onClick={handleGenerate}
          disabled={loading}
          size="lg"
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg shadow-amber-200 transition-all hover:scale-105 active:scale-95"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Zap className="w-5 h-5 mr-2" />
          )}
          {loading ? "Sedang Meracik..." : "Buat Kartu Ajaib ✨"}
        </Button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full max-w-3xl mx-auto py-8">
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Kartu {currentIndex + 1} / {cards.length}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setCards([]);
            setCurrentIndex(0);
          }}
          className="text-slate-400 hover:text-slate-600"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Reset
        </Button>
      </div>

      {/* CARD CONTAINER */}
      <div
        className="relative w-full h-[420px] md:h-auto md:aspect-2/1 perspective-1000 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={cn(
            "relative w-full h-full duration-500 preserve-3d transition-transform shadow-xl rounded-2xl",
            isFlipped ? "rotate-y-180" : ""
          )}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT */}
          <div className="absolute w-full h-full backface-hidden bg-white border-2 border-slate-100 rounded-2xl flex flex-col items-center justify-center p-6 md:p-8 text-center shadow-sm">
            <span className="absolute top-4 left-4 md:top-6 md:left-6 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">
              Pertanyaan
            </span>
            <h2 className="text-xl md:text-3xl font-bold text-slate-800 leading-snug select-none">
              {currentCard.front}
            </h2>
            <p className="absolute bottom-6 text-xs md:text-sm text-slate-400 font-medium animate-pulse mt-4">
              (Ketuk untuk balik)
            </p>
          </div>

          {/* BACK */}
          <div
            className="absolute w-full h-full backface-hidden bg-linear-to-br from-indigo-600 to-violet-700 text-white rounded-2xl flex flex-col items-center justify-center p-6 md:p-8 text-center"
            style={{ transform: "rotateY(180deg)" }}
          >
            <span className="absolute top-4 left-4 md:top-6 md:left-6 text-[10px] md:text-xs font-bold text-indigo-200 uppercase tracking-widest bg-white/10 px-2 py-1 rounded-md">
              Jawaban
            </span>
            <h2 className="text-lg md:text-2xl font-medium leading-relaxed select-none overflow-y-auto max-h-[80%] w-full scrollbar-hide">
              {currentCard.back}
            </h2>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex items-center gap-6 mt-8">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrev}
          className="rounded-full w-14 h-14 p-0 border-2 hover:bg-slate-50"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>

        <div className="text-sm font-medium text-slate-400 bg-slate-100 px-4 py-2 rounded-full">
          {isFlipped ? "Jawaban" : "Pertanyaan"}
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={handleNext}
          className="rounded-full w-14 h-14 p-0 border-2 hover:bg-slate-50"
        >
          <ArrowRight className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
