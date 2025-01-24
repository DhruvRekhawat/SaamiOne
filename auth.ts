import NextAuth from "next-auth";
import Google from "next-auth/providers/google";


export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "openid email profile https://mail.google.com/ https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/contacts.readonly",
        },
      },
      
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the access token to the token right after signin
      if (account) {
        token.accessToken = account.access_token as string;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string,
      };
    },
  },
});
