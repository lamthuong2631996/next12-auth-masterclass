import { getUserById } from './data/user';
import authConfig from "@/auth.config"
import {PrismaAdapter} from '@auth/prisma-adapter'
import { db } from "@/lib/db"
import NextAuth from "next-auth";
import { getTwoFactorConfirmationByUserId} from './action/two-factor-confirmation';
import getAcountByUser from './data/account';

export const { auth, handlers: {GET, POST}, signIn, signOut,} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  },
  events: {
    async linkAccount({user}){
      await db.user.update({
        where: {id: user.id},
        data: {emailVerified: new Date()}
      })
    }
  },
  callbacks: {
    async signIn({user, account}){
      if(account?.provider !== "credentials") return true
      const existingUser = await getUserById(user.id)

      if(!existingUser?.emailVerified) return false
      
      if(existingUser.isTwoFactorEnabled){
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id)
        if(!twoFactorConfirmation) return false
        
        await db.twoFactorConfirmation.delete({
          where: {id: twoFactorConfirmation.id}
        })
      }
      
      return true
    },
    async session({ token, session}) {
      if(session.user){
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
      }
      if(session.user){
        session.user.name = token.name
        session.user.email = token.email as string
        session.user.isOAuth = token.isOAuth as boolean
      }
      return session
    },
    async jwt ({token}) {
      if(!token.sub) return token
      const existingUser = await getUserById(token.sub)
      if(!existingUser) return token
      const existingAccount = await getAcountByUser(existingUser.id)
      token.isOAuth = !! existingAccount
      token.name = existingUser.name 
      token.email = existingUser.email
      token.role = existingUser.role
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled
      return token
    }},
  secret: process.env.AUTH_SECRET,
  adapter:PrismaAdapter(db),
  session: {strategy: 'jwt'},
  ...authConfig
})