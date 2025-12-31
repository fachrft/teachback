"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, SignInValues } from "@/lib/validator/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { loginAction } from "./_action";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignInValues) {
    const result = await loginAction(data);
    if (result instanceof Error) {
      toast.error(result.message);
    } else {
      toast.success("Login berhasil");
      if (result?.role === "guru") {
        router.push("/guru");
      } else {
        router.push("/siswa");
      }
    }
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <div className="flex justify-center mb-2">
          <div className="relative size-10 rounded-lg overflow-hidden shadow-sm">
            <Image
              width={100}
              height={100}
              src="/logo.png"
              alt="TeachBack Logo"
              className="object-cover size-full"
            />
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Masuk Akun</h1>
        <p className="text-sm text-muted-foreground">
          Masukkan email dan password untuk melanjutkan
        </p>
      </div>

      <div className="grid py-7 gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="nama@sekolah.sch.id" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Masuk
            </Button>
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Atau lanjut dengan
            </span>
          </div>
        </div>

        <OAuthButtons />
      </div>

      <p className="px-8 text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="underline underline-offset-4 hover:text-primary"
        >
          Daftar Sekarang
        </Link>
      </p>
    </>
  );
}
