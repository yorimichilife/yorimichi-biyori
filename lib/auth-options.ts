import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import InstagramProvider from "next-auth/providers/instagram";
import TwitterProvider from "next-auth/providers/twitter";
import { loginUser, upsertOAuthUser } from "@/lib/auth-store";

function resolveProviderAccountId(profile: Record<string, unknown>, fallback?: string | null) {
  if (fallback) return fallback;
  if (typeof profile.sub === "string") return profile.sub;
  if (typeof profile.id === "string") return profile.id;
  if (typeof profile.id === "number") return String(profile.id);
  const data = profile.data as { id?: string } | undefined;
  if (typeof data?.id === "string") return data.id;
  return null;
}

function resolveProviderImage(profile: Record<string, unknown>, fallback?: string | null) {
  if (fallback) return fallback;
  if (typeof profile.picture === "string") return profile.picture;
  if (typeof profile.profile_image_url === "string") return profile.profile_image_url;
  const data = profile.data as { profile_image_url?: string } | undefined;
  if (typeof data?.profile_image_url === "string") return data.profile_image_url;
  return null;
}

function resolveProviderName(profile: Record<string, unknown>, fallback?: string | null) {
  if (fallback) return fallback;
  if (typeof profile.name === "string") return profile.name;
  const data = profile.data as { name?: string; username?: string } | undefined;
  return data?.name ?? data?.username ?? "旅人";
}

const credentialsProvider = CredentialsProvider({
  name: "メールアドレス",
  credentials: {
    email: { label: "メールアドレス", type: "email" },
    password: { label: "パスワード", type: "password" }
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials.password) return null;
    try {
      const user = await loginUser({
        email: credentials.email,
        password: credentials.password
      });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.avatar
      };
    } catch {
      return null;
    }
  }
});

const providers: AuthOptions["providers"] = [
  credentialsProvider,
  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
    ? [
        GoogleProvider({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET
        })
      ]
    : []),
  ...(process.env.AUTH_X_ID && process.env.AUTH_X_SECRET
    ? [
        TwitterProvider({
          clientId: process.env.AUTH_X_ID,
          clientSecret: process.env.AUTH_X_SECRET
        })
      ]
    : []),
  ...(process.env.AUTH_INSTAGRAM_ID && process.env.AUTH_INSTAGRAM_SECRET
    ? [
        InstagramProvider({
          clientId: process.env.AUTH_INSTAGRAM_ID,
          clientSecret: process.env.AUTH_INSTAGRAM_SECRET
        })
      ]
    : [])
];

export const authOptions: AuthOptions = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-only-change-this-secret",
  pages: {
    signIn: "/auth"
  },
  session: {
    strategy: "jwt"
  },
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account) return false;
      if (account.provider === "credentials") return true;
      const profileObject = (profile ?? {}) as Record<string, unknown>;
      const providerAccountId = resolveProviderAccountId(profileObject, account.providerAccountId);
      if (!providerAccountId) return false;
      const localUser = await upsertOAuthUser({
        provider: account.provider,
        providerAccountId,
        name: resolveProviderName(profileObject, user.name),
        email: user.email,
        avatar: resolveProviderImage(profileObject, user.image)
      });
      user.id = localUser.id;
      user.name = localUser.name;
      user.email = localUser.email ?? null;
      user.image = localUser.avatar;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub;
        session.user.name = token.name;
        session.user.email = token.email as string | null | undefined;
        session.user.image = token.picture as string | null | undefined;
      }
      return session;
    }
  }
};
