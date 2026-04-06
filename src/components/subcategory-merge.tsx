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

interface Subcategory {
  id: number
  name: string
  code: string
  description: string | null
  categoryId: number | null
  category: { id: number; name: string; color: string } | null
  _count: { transactions: number }
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const mergeSubcategories = async (
  url: string,
  { arg }: { arg: { keepId: number; mergeIds: number[] } },
) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  })
  if (!res.ok) throw new Error("Merge failed")
  return res.json() as Promise<{ movedTransactions: number; deletedSubcategories: number }>
}

export function SubcategoryMerge() {
  const { data: subcategories, isLoading, mutate } = useSWR<Subcategory[]>("/api/subcategories", fetcher)
  const { trigger, isMutating } = useSWRMutation("/api/subcategories/merge", mergeSubcategories)

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState("")
  const [keepId, setKeepId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const lastClickedIndexRef = useRef<number | null>(null)

  const filtered = (subcategories ?? []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    (s.category?.name ?? "").toLowerCase().includes(search.toLowerCase()),
  )

  const handleRowClick = (e: React.MouseEvent, index: number, id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (e.shiftKey && lastClickedIndexRef.current !== null) {
        const start = Math.min(lastClickedIndexRef.current, index)
        const end = Math.max(lastClickedIndexRef.current, index)
        filtered.slice(start, end + 1).forEach((s) => next.add(s.id))
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
    const selected = (subcategories ?? []).filter((s) => selectedIds.has(s.id))
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
      toast.success("Underkategorier sammenslået", {
        description: `${result.movedTransactions} transaktioner flyttet, ${result.deletedSubcategories} underkategorier slettet.`,
      })
      setSelectedIds(new Set())
      setKeepId(null)
      setDialogOpen(false)
      await mutate()
    } catch {
      toast.error("Kunne ikke sammenslutte underkategorier")
    }
  }

  const selectedSubcategories = (subcategories ?? []).filter((s) => selectedIds.has(s.id))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full space-x-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Indlæser underkategorier...</span>
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sammenslutte underkategorier</CardTitle>
          <CardDescription>
            Vælg to eller flere underkategorier og slå dem sammen til én. Alle transaktioner flyttes til den valgte primære.
            <br />
            Klik for at vælge • Shift+klik for at vælge interval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="Søg underkategorier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-9 w-full max-w-sm rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {selectedIds.size >= 2 && (
              <Button size="sm" onClick={openMergeDialog} className="ml-auto">
                <Merge className="h-4 w-4 mr-2" />
                Sammenslutte {selectedIds.size} underkategorier
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
                <TableHead>Kode</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Beskrivelse</TableHead>
                <TableHead className="text-right">Transaktioner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sub, index) => (
                <TableRow
                  key={sub.id}
                  onClick={(e) => handleRowClick(e, index, sub.id)}
                  className={`cursor-pointer select-none transition-colors ${
                    selectedIds.has(sub.id)
                      ? "bg-blue-50 dark:bg-blue-950/40 border-l-2 border-l-blue-500"
                      : "border-l-2 border-l-transparent hover:bg-muted/40"
                  }`}
                >
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm font-mono">{sub.code}</TableCell>
                  <TableCell>
                    {sub.category && (
                      <Badge
                        variant="outline"
                        style={{ borderColor: sub.category.color, color: sub.category.color }}
                      >
                        <span
                          className="mr-1.5 h-2 w-2 rounded-full inline-block"
                          style={{ backgroundColor: sub.category.color }}
                        />
                        {sub.category.name}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-xs truncate">{sub.description}</TableCell>
                  <TableCell className="text-right font-semibold">{sub._count.transactions}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Ingen underkategorier fundet
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
            <DialogTitle>Vælg primær underkategori</DialogTitle>
            <DialogDescription>
              Alle transaktioner fra de øvrige underkategorier flyttes til den primære. De øvrige underkategorier slettes.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh] pr-1">
            {selectedSubcategories.map((s) => (
              <button
                key={s.id}
                onClick={() => setKeepId(s.id)}
                className={`flex items-center justify-between rounded-md border p-3 text-left transition-colors ${
                  keepId === s.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{s.code}</p>
                  {s.category && (
                    <p className="text-xs mt-0.5" style={{ color: s.category.color }}>
                      {s.category.name}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold">{s._count.transactions} transaktioner</span>
                  {keepId === s.id && (
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
