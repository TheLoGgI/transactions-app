import { PrismaClient, AgentType } from '@prisma/client'
import { updateTransactionsCallback } from './update-callback'
import { createUnknownTransactions } from './createUnknownTransaction'
const prisma = new PrismaClient()

export interface Transaction {
  accountCombinedKey: string
  transactionCombinedKey: string
  bookingDate: string
  valueDate: string
  originalDate: string
  availableDate: string
  transactionText: string
  individualText: string
  statementText: string
  postingConditionRelationshipText: string
  transactionAmount: {
    amount: {
      decimalValue: number
      integerValue: number
      noOfDecimals: number
    }
    currencyCode: string
  }
  originalAmount: {
    amount: {
      decimalValue: number
      integerValue: number
      noOfDecimals: number
    }
    currencyCode: string
  }
  transactionType: string
  corebankTimestamp: string
  cardDetails?: {
    cardTransactionTime: string
    cardProductType: string
    terminalId: string
    merchant: {
      id: string
      categoryCode: string
      name: string
      city: string
      country: string
    }
  }
  balance: {
    decimalValue: number
    integerValue: number
    noOfDecimals: number
  }
  isReconciled: boolean
  isCombinedPosting: boolean
  sortingKey: string
  postingStandardIdentifier: string
  senderInfo?: {
    senderAddress1: string
    senderAddress2: string
    senderAddress3: string
    senderAddress4: string
    senderAddress5: string
    senderMessage: string
    isSenderMessageCutOff: boolean
  }
}

export interface TransactionData {
  transactionKey: string
  createdAt: Date
  amount: number
  merchantId?: string | null
  subcategoryId?: number | null
  currencyCode: string
  agent: AgentType
  senderId?: string | null
  transactionType: string
}

export interface TransactionJSON {
  transactionList: Transaction[]
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const paramFrom = url.searchParams.get('from')
  const paramTo = url.searchParams.get('to')

  let fromDate = paramFrom ? new Date(paramFrom) : null
  let toDate = paramTo ? new Date(paramTo) : null

  if (!fromDate || !toDate) {
    const today = new Date()
    fromDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    toDate = today
  }

  const firstInRange = await prisma.transaction.findFirst({
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  const lastInRange = await prisma.transaction.findFirst({
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const totalExpenses = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    _count: {
      amount: true,
    },
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
      merchant: { isNot: null },
      // amount: {
      //   lt: 0,
      // },
    },
  })

  const totalIncome = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    _count: {
      amount: true,
    },
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
      Sender: { isNot: null },
      // amount: {
      //   gt: 0,
      // },
    },
  })

  return new Response(
    JSON.stringify({
      expenses: {
        totalExpenses: totalExpenses._sum.amount,
        transactionsCount: totalExpenses._count.amount,
      },
      income: {
        totalIncome: totalIncome._sum.amount,
        transactionsCount: totalIncome._count.amount,
      },
      firstInRange: firstInRange?.createdAt ?? null,
      lastInRange: lastInRange?.createdAt ?? null,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}

export async function POST(request: Request) {
  const formdata = await request.formData()
  const uploadedFile = formdata.get('transactions')
  if (!uploadedFile) {
    return new Response('No file uploaded', {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (uploadedFile instanceof File) {
    if (uploadedFile.name.endsWith('.csv')) {
      return new Response(
        'CSV files are not supported, upload a JSON file instead.',
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    const fileContent = await uploadedFile.text()
    const json = JSON.parse(fileContent) as TransactionJSON
    const transactions = json.transactionList
    if (!Array.isArray(transactions)) {
      return new Response('Invalid JSON format', {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    try {
      const transactionData: TransactionData[] = []
      for (const transaction of transactions) {
        // Check if transaction already exists
        const existingTransaction = await prisma.transaction.findUnique({
          where: {
            transactionKey: transaction.transactionCombinedKey,
          },
        })

        // Skip if transaction already exists
        if (
          existingTransaction?.merchantId === null &&
          existingTransaction?.senderId === null
        ) {
          await updateTransactionsCallback(transaction, existingTransaction)
        } else {
          continue
        }

        // Check if merchant exists by unique key (e.g., id + name)
        if (
          transaction.cardDetails !== undefined &&
          transaction.cardDetails.merchant.id !== ''
        ) {
          const merchant = await prisma.merchant.upsert({
            where: {
              merchantId: transaction.cardDetails.merchant.id,
            },
            create: {
              merchantId: transaction.cardDetails.merchant.id,
              name:
                transaction.cardDetails.merchant.name ||
                transaction.transactionText,
              categoryCode: transaction.cardDetails.merchant.categoryCode,
              city: transaction.cardDetails.merchant.city,
              country: transaction.cardDetails.merchant.country,
            },
            update: {},
          })

          const categoryCode = await prisma.subCategories.findFirst({
            where: {
              code: transaction.cardDetails.merchant.categoryCode,
            },
          })

          transactionData.push({
            transactionKey: transaction.transactionCombinedKey,
            createdAt: new Date(transaction.originalDate),
            amount: transaction.transactionAmount.amount.decimalValue,
            merchantId: merchant.id,
            subcategoryId: categoryCode?.id,
            currencyCode: transaction.transactionAmount.currencyCode,
            agent: AgentType.RECEIVER,
            senderId: null,
            transactionType: transaction.transactionType,
          })
        } else if (transaction.senderInfo) {
          let sender = await prisma.sender.findFirst({
            where: {
              name: transaction.senderInfo.senderAddress1,
              city: transaction.senderInfo.senderAddress2,
            },
          })

          sender ??= await prisma.sender.create({
            data: {
              name: transaction.senderInfo.senderAddress1,
              city: transaction.senderInfo.senderAddress2,
              key: `${transaction.senderInfo.senderAddress1}-${transaction.senderInfo.senderAddress2}-${transaction.senderInfo.senderAddress3}`,
            },
          })

          transactionData.push({
            transactionKey: transaction.transactionCombinedKey,
            createdAt: new Date(transaction.originalDate),
            amount: transaction.transactionAmount.amount.decimalValue,
            currencyCode: transaction.transactionAmount.currencyCode,
            senderId: sender.id,
            agent: AgentType.SENDER,
            transactionType: transaction.transactionType,
            subcategoryId: null,
            merchantId: null,
          })
        } else {

          const knownTranaction = await createUnknownTransactions(transaction)
          if (knownTranaction !== null) {
            transactionData.push(knownTranaction)
          }

        }

        // Add for moveing money
        // EKS VILH. KIERS KOLLEGIUM Aftalenr. 955279300
      }

      let insertedCount = 0
      for (const transaction of transactionData) {
        const res = await prisma.transaction.upsert({
          create: transaction,
          where: {
            transactionKey: transaction.transactionKey,
          },
          update: {},
        })

        if (res) {
          insertedCount++
        }
      }

      console.log('Inserted transactions count:', insertedCount)

      return new Response(
        JSON.stringify({
          message: 'Transactions processed successfully',
          totalTransactions: transactions.length,
          newTransactions: insertedCount,
          skippedTransactions: transactions.length - transactionData.length,
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    } catch (error) {
      console.log('error: ', error)
      return new Response('Error saving transactions to the database', {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
}
