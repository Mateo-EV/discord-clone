import { prisma } from "@/lib/db"
import type { NextAuthOptions, DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { ImageableType } from "@prisma/client"

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      name: string
      email: string
      image?: string
      // ...other properties
      // role: UserRole;
    }
  }

  interface User {
    // ...other properties
    // role: UserRole;
  }
}

const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5, "Password should be minimun 5 characters")
})

const registeredUserSchema = loginUserSchema.extend({
  name: z.string().min(1).max(50)
})

export const options: NextAuthOptions = {
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id,
        name: token.name,
        email: token.email
      }
    }),
    jwt: ({ token, account, user }) => {
      if (account) {
        token.accessToken = account.access_token
        token.id = user.id
        token.name = user.name
        token.email = user.email
      }

      return token
    }
  },
  session: {
    strategy: "jwt"
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "login",
      name: "Login",
      credentials: {
        email: { type: "email" },
        password: { type: "password" }
      },
      async authorize(credentials) {
        const { email, password } = loginUserSchema.parse(credentials)
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            image: {
              select: { url: true },
              where: { imageableType: ImageableType.User }
            }
          }
        })

        if (user == null) return null

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) return null

        const userSession = { ...user, image: user.image?.url }

        return userSession
      }
    }),
    CredentialsProvider({
      id: "register",
      name: "Register",
      credentials: {
        name: { type: "text", placeholder: "Mateo" },
        email: { type: "email" },
        password: { type: "password", placeholder: "******" }
      },
      async authorize(credentials) {
        const { email, password, name } =
          registeredUserSchema.parse(credentials)

        const user = await prisma.user.findUnique({ where: { email } })

        if (user) return null

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword
          }
        })

        return newUser
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET
}
