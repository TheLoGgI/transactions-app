import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const paramFrom = url.searchParams.get("from");
  const paramTo = url.searchParams.get("to");

  let fromDate = paramFrom ? new Date(paramFrom) : null;
  let toDate = paramTo ? new Date(paramTo) : null;

  if (!fromDate || !toDate) {
    const today = new Date();
    fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    toDate = new Date(today.getFullYear(), today.getMonth(), 0);
  }
  
  const subCategories = await prisma.transaction.findMany({
    // orderBy: {
    //   subcategory: {
    //     name: "asc",
    //   },
    // },
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
      agent: "RECEIVER",
    },
    select: {
      id: true,
      amount: true,
      currencyCode: true,
      category: {
        select: {
            id: true,
            name: true,
            description: true,
            color: true,
          },
      },
      // merchant: {
      //   select: {
      //     id: true,
      //     name: true,
      //   },
      // },
      subcategory: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true,
              color: true,
            },
          },
        }
      },
    },
  });

  interface CombinedCategory {
    id: number;
    name: string;
    color: string;
    category: {
      totalExpenses: number;
      transactionsCount: number;
    };
  }

  // console.log('subCategories: ', subCategories.length, subCategories.slice(0, 10));
  const combinedCategories = new Map<string, CombinedCategory>();
  subCategories.forEach((transaction) => {
    // if (transaction.subcategory && transaction.subcategory.category) {
      
      const categoryIdStr = String(transaction.subcategory?.categoryId ?? 0) ;
      const transactionsCategoryIdStr = String(transaction?.category?.id ?? 0) ;
      
      const existingCategory = combinedCategories.get(categoryIdStr) ?? combinedCategories.get(transactionsCategoryIdStr);
      
      if (existingCategory) {

        if (String(existingCategory.id) == '0') {
          console.log("Uden kategori", transaction);
        }
        // console.log('existingCategory: ', existingCategory);
        existingCategory.category.totalExpenses += Math.abs(transaction.amount);
        existingCategory.category.transactionsCount += 1;
      } else {
        // TODO: FIX UNCATEGOIREZED
        // if (transaction.subcategory == null) {
        //   console.log('transaction: ', transaction);
        //   return 
        // }
        // console.log('Unknown categoryIdStr: ', categoryIdStr, transaction);

        combinedCategories.set(categoryIdStr, {
          id: transaction.subcategory?.categoryId ?? 0,
          name: transaction.subcategory?.category?.name ?? "Uden kategori",
          color: transaction.subcategory?.category?.color ?? "#d1d5dc",
          category: {
            totalExpenses: Math.abs(transaction.amount),
            transactionsCount: 1,
          },
        });
      }
  });

  // console.log('combinedCategories: ', combinedCategories);
  // console.log("Uden kategori", combinedCategories.get('0'));
  
  // console.log('combinedCategories: ', combinedCategories);
  const mappedCategories: CombinedCategory[] = Array.from(combinedCategories.values());
  const sortedCategories = mappedCategories.sort((a, b) => {
    return b.category.totalExpenses - a.category.totalExpenses;
  });

  return new Response(JSON.stringify(sortedCategories), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
