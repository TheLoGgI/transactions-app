"use client"

import { useRef, useState } from "react"
import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import { Loader2, Merge } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"

interface Merchant {
  id: string
  name: string
  merchantId: string
  city: string
  country: string
  categoryCode: string
  _count: { transactions: number }
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const mergeMerchants = async (
  url: string,
  { arg }: { arg: { keepId: string; mergeIds: string[] } },
) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  })
  if (!res.ok) throw new Error("Merge failed")
  return res.json() as Promise<{ movedTransactions: number; deletedMerchants: number }>
}

export function MerchantMerge() {
  const { data: merchants, isLoading, mutate } = useSWR<Merchant[]>("/api/merchants", fetcher)
  const { trigger, isMutating } = useSWRMutation("/api/merchants/merge", mergeMerchants)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [keepId, setKeepId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const lastClickedIndexRef = useRef<number | null>(null)

  const filtered = (merchants ?? []).filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.merchantId.toLowerCase().includes(search.toLowerCase()),
  )

  const handleRowClick = (e: React.MouseEvent, index: number, id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (e.shiftKey && lastClickedIndexRef.current !== null) {
        const start = Math.min(lastClickedIndexRef.current, index)
        const end = Math.max(lastClickedIndexRef.current, index)
        filtered.slice(start, end + 1).forEach((m) => next.add(m.id))
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

  const openMergeDialog = () => {
    // Default: keep the one with the most transactions
    const selected = (merchants ?? []).filter((m) => selectedIds.has(m.id))
    const best = selected.reduce((a, b) =>
      a._count.transactions >= b._count.transactions ? a : b,
    )
    setKeepId(best.id)
    setDialogOpen(true)
  }

  const confirmMerge = async () => {
    if (!keepId) return
    const mergeIds = Array.from(selectedIds).filter((id) => id !== keepId)
    try {
      const result = await trigger({ keepId, mergeIds })
      toast.success("Handlende sammenslået", {
        description: `${result.movedTransactions} transaktioner flyttet, ${result.deletedMerchants} handlende slettet.`,
      })
      setSelectedIds(new Set())
      setKeepId(null)
      setDialogOpen(false)
      await mutate()
    } catch {
      toast.error("Kunne ikke sammenslutte handlende")
    }
  }

  const selectedMerchants = (merchants ?? []).filter((m) => selectedIds.has(m.id))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full space-x-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Indlæser handlende...</span>
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sammenslutte handlende</CardTitle>
          <CardDescription>
            Vælg to eller flere handlende og slå dem sammen til én. Alle transaktioner flyttes til den valgte primære.
            <br />
            Klik for at vælge • Shift+klik for at vælge interval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="Søg handlende..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-9 w-full max-w-sm rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {selectedIds.size >= 2 && (
              <Button size="sm" onClick={openMergeDialog} className="ml-auto">
                <Merge className="h-4 w-4 mr-2" />
                Sammenslutte {selectedIds.size} handlende
              </Button>
            )}
            {selectedIds.size > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                Ryd valg
              </Button>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Navn</TableHead>
                <TableHead>Handlende ID</TableHead>
                <TableHead>By</TableHead>
                <TableHead>Land</TableHead>
                <TableHead>Kategori kode</TableHead>
                <TableHead className="text-right">Transaktioner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((merchant, index) => (
                <TableRow
                  key={merchant.id}
                  onClick={(e) => handleRowClick(e, index, merchant.id)}
                  className={`cursor-pointer select-none transition-colors ${
                    selectedIds.has(merchant.id)
                      ? "bg-blue-50 dark:bg-blue-950/40 border-l-2 border-l-blue-500"
                      : "border-l-2 border-l-transparent hover:bg-muted/40"
                  }`}
                >
                  <TableCell className="font-medium">{merchant.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm font-mono">{merchant.merchantId}</TableCell>
                  <TableCell>{merchant.city}</TableCell>
                  <TableCell>{merchant.country}</TableCell>
                  <TableCell>
                    {merchant.categoryCode && (
                      <Badge variant="outline">{merchant.categoryCode}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{merchant._count.transactions}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Ingen handlende fundet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vælg primær handlende</DialogTitle>
            <DialogDescription>
              Alle transaktioner fra de øvrige handlende flyttes til den primære. De øvrige handlende slettes.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh] pr-1">
            {selectedMerchants.map((m) => (
              <button
                key={m.id}
                onClick={() => setKeepId(m.id)}
                className={`flex items-center justify-between rounded-md border p-3 text-left transition-colors ${
                  keepId === m.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{m.merchantId}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold">{m._count.transactions} transaktioner</span>
                  {keepId === m.id && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Primær</p>
                  )}
                </div>
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuller
            </Button>
            <Button onClick={confirmMerge} disabled={!keepId || isMutating}>
              {isMutating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sammenslutte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
