import NextAuth from "next-auth";
  import GoogleProvider from "next-auth/providers/google";
  import GitHubProvider from "next-auth/providers/github";
  import { PrismaAdapter } from "@next-auth/prisma-adapter";
  import { PrismaClient } from "@prisma/client";

  const prisma = new PrismaClient();

  export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      }),
    ],
    session: {
      strategy: "jwt" as const,
    },
    callbacks: {
      async session({ session, token }: { session: any; token: any }) {
        session.user.id = token.sub;
        return session;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  };

  const handler = NextAuth(authOptions);
  export { handler as GET, handler as POST };