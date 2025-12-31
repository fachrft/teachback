import { z } from "zod";

export const signInSchema = z.object({
  email: z.email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

export const signUpSchema = z
  .object({
    email: z.email({ message: "Email tidak valid" }),
    password: z.string().min(6, { message: "Password minimal 6 karakter" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

export const isiProfileSchema = z.object({
  name: z.string().min(3, { message: "Nama minimal 3 karakter" }),
  role: z.enum(["guru", "siswa"]),
})

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type IsiProfileValues = z.infer<typeof isiProfileSchema>;
