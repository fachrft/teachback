import { redirect } from "next/navigation";
import IsiProfilePage from "./isiProfile.client";
import { db } from "@/lib/db";
import { profile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/get-user";

export default async function IsiProfile() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const checkUserProfile = await db.query.profile.findFirst({
    where: eq(profile.user_id, user.id),
  });

  if (checkUserProfile) {
    if (checkUserProfile.role === "guru") {
      redirect("/guru");
    } else {
      redirect("/siswa");
    }
  }

  return <IsiProfilePage user={user} />;
}
