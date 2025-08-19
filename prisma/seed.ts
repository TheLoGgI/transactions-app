/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from '@prisma/client'
import categoriesData from './seeddata/categories.json'
import subCategoriesData from './seeddata/sub-categories.json'
const prisma = new PrismaClient()
async function main() {

  // Categories
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const categoriesRes = await prisma.categories.createMany({
    data: categoriesData,
    // skipDuplicates: true, // Skip duplicates if any
  })
  console.log('categoriesRes: ', categoriesRes);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const res = await prisma.subCategories.createMany({
    data: subCategoriesData,

    // skipDuplicates: true, // Skip duplicates if any
  })
  console.log('res: ', res);


}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })