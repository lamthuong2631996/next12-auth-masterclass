"use server"
import * as z from 'zod'
import { LoginSchema } from "@/schemas";
import { signIn } from '@/auth';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { AuthError } from 'next-auth';
import { getUserByEmail } from '@/data/user';
import generateVerificationToken, { generateTwoFactorToken } from '@/lib/token';
import { sendTwoFactorTokenEmail, sendVerificationEmail } from '@/lib/mail';
import { getTwoFactorTokeByEmail } from './two-factor-token';
import { db } from '@/lib/db';
import { getTwoFactorConfirmationByUserId} from './two-factor-confirmation';
export  const Login = async (value:z.infer<typeof LoginSchema>, callbackUrl?: string) => {
    const validatedFields = LoginSchema.safeParse(value)
    if(!validatedFields.success){
        return {error : "Invalid fields"}
    }
    const {email, password, code} = validatedFields.data
    const existingUser = await getUserByEmail(email)
    if(!existingUser || !existingUser.email || !existingUser.password){
        return { error: "Email does not exist"}
    }
    if(!existingUser.emailVerified){
        const verificationToken = await generateVerificationToken(existingUser.email)
        await sendVerificationEmail(
            verificationToken.email,
            verificationToken.token
        )
        return { success: "Confirmation email sent!"}
    }
    if(existingUser.isTwoFactorEnabled && existingUser.email){
        if(code){
            const twoFactorToken = await getTwoFactorTokeByEmail(existingUser.email)
            if(!twoFactorToken){
                return { error: "Invalid code"}
            }
            if(twoFactorToken.token !== code){
                return { error: "Invalid code"}
            }
            const hasExpired = new Date(twoFactorToken.expires) < new Date()
            if(hasExpired){
                return { error: "Code expired"}
            }
            await db.twoFactorToken.delete({
                where: { id: twoFactorToken.id }
            })
            const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id)
            if(existingConfirmation){
                await db.twoFactorConfirmation.delete({
                    where: { id: existingConfirmation.id}
                })
            }
            await db.twoFactorConfirmation.create({
                data: { userId: existingUser.id}
            })
        }
        else{
        const twoFactorToken = await generateTwoFactorToken(existingUser.email)

        await sendTwoFactorTokenEmail(
            twoFactorToken.email,
            twoFactorToken.token,
        )
        
        return {twoFactor: true}
        }  
    }

    try {
        await signIn("credentials", {
            
            email, password, redirectTo: callbackUrl ||DEFAULT_LOGIN_REDIRECT
        })
    } catch (error) {
        if(error instanceof AuthError){
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid Credential!!"}
                default:
                    return { error: "Something went wrong"}
            }
        }
        throw error
    }
} 


