import { NextAuthOptions } from "next-auth";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import LinkedInProvider, {
  LinkedInProfile,
} from "next-auth/providers/linkedin";
import prisma from "@/lib";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
      client: { token_endpoint_auth_method: "client_secret_post" },
      issuer: "https://www.linkedin.com",
      profile: (profile: LinkedInProfile) => ({
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        role: "student",
        image: profile.picture,
      }),
      wellKnown:
        "https://www.linkedin.com/oauth/.well-known/openid-configuration",
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // const url = account?.url as string;
      // console.log(url)
      // const isRecruiter = url?.includes("role=recruiter");
      // user.role = isRecruiter ? "RECRUITER" : "STUDENT";
      return true;
    },
    // async session({ session, token }) {
    //   if (token) {
    //     session.user = {
    //       id: token.id as string,
    //       email: token.email as string,
    //       name: token.name as string,
    //       role: token.role as string, // Ensure role is included
    //       image: token.picture as string,
    //     };
    //   }
    //   return session;
    // },
    // async jwt({ token, account, user }) {
    //   if (account && user) token.role = user.role || "STUDENT";
    //   return token;
    // },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET as string,
};
