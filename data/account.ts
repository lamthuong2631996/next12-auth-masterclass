
import { db } from '@/lib/db'


const getAcountByUser = async (userId: string) => {
  try {
    const account = await db.account.findFirst({
        where: {userId}
    })
    return account
  } catch{
    return null
  }
  
}

export default getAcountByUser