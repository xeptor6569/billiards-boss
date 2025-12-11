import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthCheck() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }
  return null;
}
