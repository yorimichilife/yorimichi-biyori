import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { AuthUser } from "@/lib/types";
import { getFreshSessionUser } from "@/lib/mypage-store";

export async function getSessionUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const typedUser = session.user as typeof session.user & { id?: string };
  if (!typedUser.id) return null;
  const freshUser = await getFreshSessionUser(typedUser.id);
  if (freshUser) {
    return freshUser;
  }
  return {
    id: typedUser.id,
    name: typedUser.name || "旅人",
    email: typedUser.email ?? undefined,
    avatar:
      typedUser.image ||
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
  };
}
