import type { Transaction, TransactionData } from './route'
import { AgentType, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const createUnknownTransactions = async (
  transaction: Transaction,
): Promise<TransactionData|null> => {

  switch (transaction.transactionType) {
    
    case 'mppb':  //   MobilePay - Person to Business
    case 'mpcp':  //   MobilePay - Person to Person
      let merchant = null
      const mpcpMerchantName = transaction.transactionText
        .split(/mobilepay/gi)
        .join('')
        .trim()
      merchant = await prisma.merchant.findFirst({
        where: {
          name: mpcpMerchantName,
        },
      })

      if (merchant?.id === null) {
        merchant = await prisma.merchant.create({
          data: {
            merchantId: transaction.cardDetails?.merchant.id ?? '',
            name: mpcpMerchantName,
            categoryCode: transaction.cardDetails?.merchant.categoryCode ?? '',
            city: transaction.cardDetails?.merchant.city ?? '',
            country: transaction.cardDetails?.merchant.country ?? '',
          },
        })
      }

      return {
      transactionKey: transaction.transactionCombinedKey,
      createdAt: new Date(transaction.originalDate),
      amount: transaction.transactionAmount.amount.decimalValue,
      merchantId: merchant?.id,
      subcategoryId: null,
      currencyCode: transaction.transactionAmount.currencyCode,
      agent: AgentType.RECEIVER,
      senderId: null,
      transactionType: transaction.transactionType,
    }

    case 'btlq':
      const btlqMerchantName = transaction.transactionText
      merchant = await prisma.merchant.upsert({
        where: {
          merchantId: transaction.cardDetails?.merchant.id ?? '',
        },
        create: {
          merchantId: transaction.cardDetails?.merchant.id ?? '',
          name: btlqMerchantName,
          categoryCode: transaction.cardDetails?.merchant.categoryCode ?? '',
          city: transaction.cardDetails?.merchant.city ?? '',
          country: transaction.cardDetails?.merchant.country ?? '',
        },
        update: {
          name: btlqMerchantName,
          categoryCode: transaction.cardDetails?.merchant.categoryCode ?? '',
          city: transaction.cardDetails?.merchant.city ?? '',
          country: transaction.cardDetails?.merchant.country ?? '',
        }
      })


    return {
      transactionKey: transaction.transactionCombinedKey,
      createdAt: new Date(transaction.originalDate),
      amount: transaction.transactionAmount.amount.decimalValue,
      merchantId: merchant?.id,
      subcategoryId: null,
      currencyCode: transaction.transactionAmount.currencyCode,
      agent: AgentType.RECEIVER,
      senderId: null,
      transactionType: transaction.transactionType,
    }

    default:
      console.error("Transaction Failed Migration: ",transaction);
      return null
  }
}
