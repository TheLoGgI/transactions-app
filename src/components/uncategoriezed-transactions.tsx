import { Loader2, PlusIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Subcategory {
  id: number;
  name: string;
  code: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  categoryId: number | null;
}

interface Sender {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  key: string;
  createdAt: string;
  updatedAt: string;
}

interface UncategorizedTransaction {
    id: string;
    amount: number;
    createdAt: string;
    currencyCode: string;
    merchant?: {
        id: string;
        name: string;
        categoryCode: string;
        merchantId: string;
        city: string;
    };
    sender: Sender;
    merchantId: string;
    senderId: string | null;
    subcategoryId: string | null;
    transactionKey: string;
    transactionType: string;
    updatedAt: string;
    subcategory: Subcategory
}


const fetcher = (url: string) => fetch(url).then((res) => res.json())

const updateCategory = async (
  url: string,
  { arg }: { arg: { transactionId: string; categoryId: number } }
) => {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transactionId: arg.transactionId,
      categoryId: arg.categoryId,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to update transaction category");
  }
  return res;
};


interface UncategorizedResponse {
  transactions: UncategorizedTransaction[]
  totalCount: number
  displayedCount: number
}

const UncategorizedTransactions = () => {
      const { data: categories } = useSWR<Category[]>(`/api/categories`, fetcher)
  const { data: uncategorizedData, isLoading: uncategorizedIsLoading, isValidating } = useSWR<UncategorizedResponse>(`/api/categories/uncategorized`, fetcher)
  const { trigger: categorizeTransaction } = useSWRMutation(`/api/categories/uncategorized`, updateCategory)
  
  const uncategorizedTransactions = uncategorizedData?.transactions ?? []
  const totalCount = uncategorizedData?.totalCount ?? 0
  

  if (uncategorizedIsLoading || isValidating && uncategorizedTransactions === undefined)  {
        return (<div className="flex items-center justify-center h-full w-full space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Indlæser...</span>
        </div>)
  }

    return (
        <>
            {(uncategorizedTransactions ?? []).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Ukategoriserede transaktioner</CardTitle>
                        <CardDescription>
                            Tildel kategorier til disse transaktioner for at forbedre din forbrugsindsigt.
                            <br />
                            <span className="font-medium">
                                Viser {uncategorizedTransactions.length} af {totalCount} ukategoriserede underkategorier
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Dato</TableHead>
                                    <TableHead>Beskrivelse</TableHead>
                                    <TableHead className="text-right">Beløb</TableHead>
                                    <TableHead>Underkategori</TableHead>
                                    <TableHead className="text-right">Handlinger</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(uncategorizedTransactions ?? []).map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="font-medium">{new Date(transaction.createdAt).toLocaleDateString("da-DK", {dateStyle: "long"})}</TableCell>
                                        <TableCell>{transaction?.merchant?.name ?? transaction?.sender?.name}</TableCell>
                                        <TableCell className="text-right">{transaction.amount.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}</TableCell>
                                        <TableCell>
                                            {transaction?.subcategory?.name &&
                                            <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600">
                                                {transaction.subcategory.name}
                                            </Badge>

                                            }
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <span className="sr-only">Åbn menu</span>
                                                        <PlusIcon className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {(categories ?? []).map((category) => {
                                                        
                                                        return (
                                                        
                                                            <DropdownMenuItem
                                                                key={category.id}
                                                                onClick={async () => {
                                                                    await categorizeTransaction({ transactionId: transaction.id, categoryId: category.id })
                                                                    // await categorizeTransaction(transaction.id, category.id)
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
                                                                    {category.name}
                                                                </div>
                                                            </DropdownMenuItem>
                                                        )})}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </>
    )
}

export default UncategorizedTransactions;