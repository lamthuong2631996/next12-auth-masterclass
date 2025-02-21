import { useSession } from "next-auth/react";

export const useCurrenRole = () => {
    const session = useSession()
    return session.data?.user?.role
}