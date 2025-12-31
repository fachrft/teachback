"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Send,
  Bot,
  User,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Brain,
} from "lucide-react";
import { toast } from "sonner";
import {
  startTeachbackSession,
  sendTeachbackMessage,
  finishTeachbackSession,
} from "../_actions/teachback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface TeachbackSessionProps {
  material: any;
  classId: string;
  initialSession: any;
  user: any;
}

interface Message {
  role: "user" | "model" | "system_context";
  text: string;
}

export function TeachbackSession({
  material,
  classId,
  initialSession,
  user,
}: TeachbackSessionProps) {
  const [session, setSession] = useState<any>(initialSession);
  const [messages, setMessages] = useState<Message[]>(
    initialSession?.transcript || []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!initialSession);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isReviewed =
    session?.status === "REVIEWED" || session?.status === "COMPLETED";
  const isSubmitted = session?.score !== null && session?.score !== undefined;

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages]);

  // Initialize Session if not exists
  useEffect(() => {
    if (!session && isInitializing) {
      const init = async () => {
        try {
          const res = await startTeachbackSession(
            material.id,
            classId,
            material.name,
            material.description || "",
            material.fileUrl
          );
          if (res.success && res.session) {
            setSession(res.session);
            setMessages((res.session.transcript as Message[]) || []);
          } else {
            toast.error("Gagal memulai sesi Teachback.");
          }
        } catch (e) {
          toast.error("Terjadi kesalahan sistem.");
        } finally {
          setIsInitializing(false);
        }
      };
      init();
    }
  }, [
    session,
    material.id,
    classId,
    material.name,
    material.description,
    material.fileUrl,
    isInitializing,
  ]);

  const handleSendMessage = async () => {
    if (!input.trim() || !session) return;

    const userMsg = input.trim();
    setInput("");
    setIsLoading(true);

    // Optimistic Update
    const newMessages: Message[] = [
      ...messages,
      { role: "user", text: userMsg },
    ];
    setMessages(newMessages);

    try {
      const res = await sendTeachbackMessage(
        session.id,
        userMsg,
        messages,
        material.description || material.name
      );

      if (res.success && res.newTranscript) {
        setMessages(res.newTranscript);
        setSession({ ...session, transcript: res.newTranscript });
      } else {
        toast.error("Gagal mengirim pesan.");
      }
    } catch (e) {
      toast.error("Gagal terhubung ke AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishClick = () => {
    if (messages.filter((m) => m.role !== "system_context").length < 3) {
      toast.warning(
        "Lakukan percakapan lebih panjang agar AI bisa menilai pemahamanmu."
      );
      return;
    }
    setIsDialogOpen(true);
  };

  const handleFinishConfirm = async () => {
    if (!session) return;
    setIsDialogOpen(false);
    setIsFinishing(true);

    try {
      const res = await finishTeachbackSession(
        session.id,
        messages,
        material.description || material.name
      );

      if (res.success) {
        setSession({
          ...session,
          score: res.score,
          feedback: res.feedback,
        });
        toast.success(`Sesi Teachback dikirim!`);
        router.refresh();
      } else {
        toast.error("Gagal menilai sesi.");
      }
    } catch (e) {
      toast.error("Error finalizing.");
    } finally {
      setIsFinishing(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-4" />
        <p className="text-muted-foreground">Menyiapkan Guru AI...</p>
      </div>
    );
  }

  if (isSubmitted && !isReviewed) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-full">
        <div className="h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6 mx-auto">
          <CheckCircle2 className="h-10 w-10 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Terkirim!</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          Jawaban teachback kamu sudah kami terima dan sedang menunggu penilaian
          dari Guru.
        </p>
        <Button
          variant="outline"
          disabled
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          Menunggu Review Guru
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <Brain className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Coach AI</h3>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
        {!isReviewed && !isSubmitted && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleFinishClick}
            disabled={isLoading || isFinishing}
          >
            {isFinishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Selesai & Nilai"
            )}
          </Button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
        <div className="space-y-6 pb-4">
          {messages.map((msg, idx) => {
            if (msg.role === "system_context") return null;
            const isBot = msg.role === "model";
            return (
              <div
                key={idx}
                className={`flex gap-4 ${
                  isBot ? "items-start" : "items-start flex-row-reverse"
                }`}
              >
                {/* Avatar */}
                <Avatar className="h-10 w-10 border-0">
                  {isBot ? (
                    <div className="h-full w-full bg-emerald-100 flex items-center justify-center rounded-full">
                      <Brain className="h-5 w-5 text-emerald-600" />
                    </div>
                  ) : (
                    <>
                      <AvatarImage src={user?.image} />
                      <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                        S
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>

                {/* Content */}
                <div
                  className={`flex flex-col max-w-[80%] ${
                    isBot ? "items-start" : "items-end"
                  }`}
                >
                  <span
                    className={`text-xs font-bold mb-1.5 ${
                      isBot ? "text-emerald-600" : "text-slate-500"
                    }`}
                  >
                    {isBot ? "Coach AI" : "Siswa"}
                  </span>

                  <div
                    className={`px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                      isBot
                        ? "bg-emerald-50/80 text-slate-800 rounded-tl-none"
                        : "bg-white border border-slate-200 text-slate-700 rounded-tr-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-start">
              <Avatar className="h-8 w-8 border">
                <AvatarFallback className="bg-purple-100">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none border shadow-sm flex items-center gap-1 w-16 justify-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}

          {/* HASIL REVIEW CARD */}
          {isReviewed && (
            <div className="flex flex-col items-center justify-center p-6 text-center bg-white rounded-xl border shadow-sm mx-4 mt-8">
              <Trophy className="h-16 w-16 mb-4 text-yellow-500" />

              <div className="bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200 mb-6">
                <span className="font-semibold text-emerald-700 text-sm">
                  Sesi telah dinilai oleh Guru
                </span>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border w-full text-left">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                  <Bot className="h-4 w-4 text-purple-600" /> Hasil Review:
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {session.feedback}
                </p>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area */}
      {!isReviewed && !isSubmitted && (
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Jelaskan pemahamanmu di sini..."
              className="min-h-[50px] resize-none focus-visible:ring-green-500"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="h-[50px] w-[50px] rounded-xl bg-emerald-600 hover:bg-emerald-700 p-0"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Tekan Enter untuk mengirim. Jelaskan dengan bahasamu sendiri.
          </p>
        </div>
      )}

      {(isReviewed || isSubmitted) && (
        <div className="p-4 bg-white border-t">
          <div className="p-4 bg-slate-50 border rounded-xl text-center">
            <p className="text-slate-500 text-sm font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {isReviewed
                ? "Sesi ini telah ditutup. Riwayat chat bersifat read-only."
                : "Menunggu review guru..."}
            </p>
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selesaikan Sesi Teachback?</DialogTitle>
            <DialogDescription>
              Kamu akan mengakhiri sesi ini. AI akan memberikan penilaian dan
              feedback berdasarkan penjelasanmu. Pastikan kamu sudah menjelaskan
              materi dengan cukup detail.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleFinishConfirm} disabled={isFinishing}>
              {isFinishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Selesaikan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
