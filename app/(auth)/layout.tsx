import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
      
      {/* Card Container */}
      <div className="w-full max-w-[400px] relative z-10">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          {children}
        </div>
      </div>
    </div>
  );
}
