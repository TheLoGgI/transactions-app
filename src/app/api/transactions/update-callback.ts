import type { Transaction } from './route'
import { PrismaClient, type AgentType } from '@prisma/client'
const prisma = new PrismaClient()

export const updateTransactionsCallback = async (
  transaction: Transaction,
  existingTransaction: {
      id: string
      transactionKey: string
      merchantId: string | null
      senderId: string | null
      agent: AgentType
      transactionType: string
      amount: number
      currencyCode: string
      subcategoryId: number | null
      createdAt: Date
      updatedAt: Date
    },
) => {
    let merchant = null
//   MobilePay - Person to Person
  if (transaction.transactionType === 'mpcp') {
    const MOBILEPAY_PEER = 'MobilePay - Peers'
    merchant = await prisma.merchant.findFirst({
      where: {
        name: MOBILEPAY_PEER,
      },
    })

    if (merchant?.id == null) {
      merchant = await prisma.merchant.create({
        data: {
          merchantId: transaction.cardDetails?.merchant.id ?? '',
          name: MOBILEPAY_PEER,
          categoryCode: transaction.cardDetails?.merchant.categoryCode ?? '',
          city: transaction.cardDetails?.merchant.city ?? '',
          country: transaction.cardDetails?.merchant.country ?? '',
        },
      })
    }
  }

  // MobilePay - Business
  if (transaction.transactionType === 'mppb') {
    const merchantName = transaction.transactionText
    .split(/mobilepay/gi)
    .join('')
    .trim()
    console.log('merchantName: ', merchantName);
    console.log('prisma: ', prisma);
//     merchant = await prisma.merchant.findFirst({
//         where: {
//             name: merchantName,
//         },
//     })
//     // console.log('merchant: ', merchant);

//     if (merchant?.id == null) {
        
//     const potentialMerchantId = transaction.cardDetails?.merchant.id ?? `mppb-${transaction.transactionText.toLowerCase().replace(/\s+/g, '-')}`
//     console.log('potentialMerchantId: ', potentialMerchantId);
//       merchant = await prisma.merchant.create({
//           data: {
//               merchantId: potentialMerchantId,
//               name: merchantName,
//               categoryCode: transaction.cardDetails?.merchant.categoryCode ?? '',
//               city: transaction.cardDetails?.merchant.city ?? '',
//               country: transaction.cardDetails?.merchant.country ?? '',
//             },
//         })
//         console.log('merchant: ', merchant);
//     }
  }

  await prisma.transaction.update({
    where: {
      id: existingTransaction.id,
    },
    data: {
      merchantId: merchant?.id,
    },
  })

}
