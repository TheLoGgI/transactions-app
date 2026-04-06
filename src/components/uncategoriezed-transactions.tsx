"use client"
import { ChevronDown, Loader2, PlusIcon } from "lucide-react";
import { useRef, useState } from "react";
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
    console.log('categories: ', categories);
  const { data: uncategorizedData, isLoading: uncategorizedIsLoading, isValidating } = useSWR<UncategorizedResponse>(`/api/categories/uncategorized`, fetcher)
  const { trigger: categorizeTransaction } = useSWRMutation(`/api/categories/uncategorized`, updateCategory)
  
  const uncategorizedTransactions = uncategorizedData?.transactions ?? []
  const totalCount = uncategorizedData?.totalCount ?? 0

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const lastClickedIndexRef = useRef<number | null>(null)

  const handleRowClick = (e: React.MouseEvent, index: number, id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (e.shiftKey && lastClickedIndexRef.current !== null) {
        const start = Math.min(lastClickedIndexRef.current, index)
        const end = Math.max(lastClickedIndexRef.current, index)
        uncategorizedTransactions.slice(start, end + 1).forEach(t => next.add(t.id))
      } else {
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        lastClickedIndexRef.current = index
      }
      return next
    })
  }

  const handleBulkCategorize = async (categoryId: number) => {
    await Promise.all(
      Array.from(selectedIds).map(transactionId =>
        categorizeTransaction({ transactionId, categoryId })
      )
    )
    setSelectedIds(new Set())
    lastClickedIndexRef.current = null
  }

  const someSelected = selectedIds.size > 0

  if (uncategorizedIsLoading || isValidating && uncategorizedTransactions === undefined)  {
        return (<div className="flex items-center justify-center h-full w-full space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Indlæser...</span>
        </div>)
  }

    return (
        <>
            {(uncategorizedTransactions ?? []).length > 0 && (
                <Card >
                    <CardHeader >
                        <CardTitle className="text-amber-900 dark:text-amber-300 flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                                {totalCount}
                            </span>
                            Ukategoriserede transaktioner
                        </CardTitle>
                        <CardDescription>
                            Tildel kategorier til disse transaktioner for at forbedre din forbrugsindsigt.
                            <br />
                            <span className="font-medium text-amber-700 dark:text-amber-400">
                                Viser {uncategorizedTransactions.length} af {totalCount} ukategoriserede underkategorier
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {someSelected && (
                            <div className="flex items-center gap-3 mb-3 p-2 bg-muted rounded-md">
                                <span className="text-sm font-medium">{selectedIds.size} valgt</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            Kategoriser valgte <ChevronDown className="ml-1 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        {(categories ?? []).map((category) => (
                                            <DropdownMenuItem
                                                key={category.id}
                                                onClick={() => handleBulkCategorize(category.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
                                                    {category.name}
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                                    Ryd valg
                                </Button>
                            </div>
                        )}
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
                                {(uncategorizedTransactions ?? []).map((transaction, index) => (
                                    <TableRow
                                        key={transaction.id}
                                        className={`cursor-pointer select-none transition-colors ${selectedIds.has(transaction.id) ? "bg-blue-50 dark:bg-blue-950/40 border-l-2 border-l-blue-500" : "border-l-2 border-l-transparent hover:bg-muted/40"}`}
                                        onClick={(e) => {
                                            // Prevent row toggle when clicking the category dropdown
                                            const target = e.target as HTMLElement
                                            if (target.closest('[role="menuitem"]') || target.closest('button')) return
                                            handleRowClick(e, index, transaction.id)
                                        }}
                                    >
                                        <TableCell className="font-medium text-muted-foreground">{new Date(transaction.createdAt).toLocaleDateString("da-DK", {dateStyle: "long"})}</TableCell>
                                        <TableCell className="font-medium">{transaction?.merchant?.name ?? transaction?.sender?.name}</TableCell>
                                        <TableCell className="text-right font-semibold text-red-600 dark:text-red-400">{transaction.amount.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}</TableCell>
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