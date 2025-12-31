"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isiProfileSchema, IsiProfileValues } from "@/lib/validator/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { createProfile } from "./_action";

export default function IsiProfilePage({ user }: { user: any }) {
  const router = useRouter();

  const form = useForm<IsiProfileValues>({
    resolver: zodResolver(isiProfileSchema),
    defaultValues: {
      name: "",
      role: "guru",
    },
  });

  async function onSubmit(data: IsiProfileValues) {
    const result = await createProfile(user.id, data);
    if (result) {
      toast.success("Profil berhasil disimpan");
      if(result?.role === 'guru') {
        router.push('/guru');
      } else {
        router.push('/siswa');
      }
    }
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Lengkapi Profil
        </h1>
        <p className="text-sm text-muted-foreground">
          Pilih peran Anda dan isi nama lengkap untuk melanjutkan
        </p>
      </div>

      <div className="grid py-6 gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Budi Santoso" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Saya adalah seorang...</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem
                            value="guru"
                            className="peer sr-only"
                          />
                        </FormControl>
                        <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                          <GraduationCap className="mb-3 h-6 w-6" />
                          Guru
                        </FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem
                            value="siswa"
                            className="peer sr-only"
                          />
                        </FormControl>
                        <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                          <User className="mb-3 h-6 w-6" />
                          Siswa
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Simpan & Lanjutkan
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
