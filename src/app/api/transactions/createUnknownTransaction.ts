import type { Transaction, TransactionData } from './route'
import { AgentType, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Simple hash function to generate deterministic ID from string
const generateMerchantId = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString();
}

export const createUnknownTransactions = async (
  transaction: Transaction,
): Promise<TransactionData|null> => {

  switch (transaction.transactionType) {
    
    // case 'mppb':  //   MobilePay - Person to Business
    // case 'mpcp':  //   MobilePay - Person to Person
    //   let merchant = null
    //   const mpcpMerchantName = transaction.transactionText
    //     .split(/mobilepay/gi)
    //     .join('')
    //     .trim()
    //   merchant = await prisma.merchant.findFirst({
    //     where: {
    //       name: mpcpMerchantName,
    //     },
    //   })

    //   if (merchant?.id === null) {
    //     merchant = await prisma.merchant.create({
    //       data: {
    //         merchantId: transaction.cardDetails?.merchant.id ?? '',
    //         name: mpcpMerchantName,
    //         categoryCode: transaction.cardDetails?.merchant.categoryCode ?? '',
    //         city: transaction.cardDetails?.merchant.city ?? '',
    //         country: transaction.cardDetails?.merchant.country ?? '',
    //       },
    //     })
    //   }

    //   return {
    //   transactionKey: transaction.transactionCombinedKey,
    //   createdAt: new Date(transaction.originalDate),
    //   amount: transaction.transactionAmount.amount.decimalValue,
    //   merchantId: merchant?.id,
    //   subcategoryId: null,
    //   currencyCode: transaction.transactionAmount.currencyCode,
    //   agent: AgentType.RECEIVER,
    //   senderId: null,
    //   transactionType: transaction.transactionType,
    // }
    
    case 'mppb':  //   MobilePay - Person to Business
    case 'mpcp':  //   MobilePay - Person to Person
    case 'stof': // Standing order from (e.g., "Penge til bil")
    case 'stoi': // Standing orders/internal transfers (e.g., "Nordnet Portefølje", "Køkken penge til Emil")
    case 'btlq': // Bank transfers/automatic payments (e.g., "VILH. KIERS KOLLEGIUM", "HK,HANDELS- OG KONTORF. FORBUND", "CALL ME")
      const btlqMerchantName = transaction.transactionText
      const merchantId = generateMerchantId(btlqMerchantName)
      const unknownMerchant = await prisma.merchant.upsert({
        where: {
          merchantId: merchantId
        },
        create: {
          merchantId: merchantId,
          name: btlqMerchantName,
          categoryCode: transaction.cardDetails?.merchant.categoryCode ?? merchantId,
          city: transaction.cardDetails?.merchant.city ?? '',
          country: transaction.cardDetails?.merchant.country ?? '',
        },
        update: {
          name: btlqMerchantName,
          categoryCode: transaction.cardDetails?.merchant.categoryCode ?? merchantId,
          city: transaction.cardDetails?.merchant.city ?? '',
          country: transaction.cardDetails?.merchant.country ?? '',
        },
        // select: {
        //   id: true,
        //   name: true,
        //   categoryCode: true,
        //   merchantId: true
        // }
      })


      let subCategorie = await prisma.subCategories.findFirst({
        where: {
          OR: [
            {
              code: unknownMerchant.categoryCode
            },
            {
            code: unknownMerchant.id
          }
          ]
        },
        select: {
          id: true
        }
      })

      if (subCategorie == null) {
        const unknownSubcategory = await prisma.subCategories.create({
          data: {
            name: unknownMerchant.name,
            code: unknownMerchant.merchantId,
            description: "Custom"
          }
        })

        subCategorie = unknownSubcategory
      }
      
      
      console.log('subCategorie: ', subCategorie);
      console.log('unknownMerchant: ', unknownMerchant);


    return {
      transactionKey: transaction.transactionCombinedKey,
      createdAt: new Date(transaction.originalDate),
      amount: transaction.transactionAmount.amount.decimalValue,
      merchantId: unknownMerchant?.id,
      subcategoryId: subCategorie?.id,
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
