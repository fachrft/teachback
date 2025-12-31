import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getAuthUser } from "@/lib/auth/get-user";

const f = createUploadthing();

export const ourFileRouter = {
  materiUploader: f({
    pdf: { maxFileSize: "32MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const user = await getAuthUser();
      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  assignmentUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    blob: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const user = await getAuthUser();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
