import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import  bcryptjs  from "bcryptjs";
import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import Github from "next-auth/providers/github"
import Google from "next-auth/providers/google"
export default {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Github({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
        Credentials({
            async authorize (credentials){
                const validatedFiels = LoginSchema.safeParse(credentials)
                if(validatedFiels.success){
                    const {email, password} = validatedFiels.data
                    const user = await getUserByEmail(email)
                    if(!user || !user.password) return null
                    const passwordsMatch = await bcryptjs.compare(
                        password, user.password
                    )
                    if(passwordsMatch) return user
                }
                return null
            }
        })
    ],
    
    
} satisfies NextAuthConfig