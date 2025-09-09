"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import type { BudgetCategory } from "@/app/budget/budget"

interface BudgetFormDialogProps {
  categories: BudgetCategory[]
  onSave: (budgetData: {
    categoryId: number
    amount: number
    period: string
    startDate?: string
    endDate?: string
  }) => void
  trigger?: React.ReactNode
}

export function BudgetFormDialog({ categories, onSave, trigger }: BudgetFormDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    const categoryId = parseInt(formData.get('category') as string)
    const amount = parseFloat(formData.get('amount') as string)
    const period = formData.get('period') as string
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string

    const budgetData = { 
      categoryId, 
      amount, 
      period,
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    }

    console.log('Budget data:', budgetData)

    onSave(budgetData)
    setOpen(false)
  }
  
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {false ? "Edit Budget" : "Create New Budget"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSaveBudget} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              name="category"
              // value={formData.categoryId.toString()}
              // defaultValue=""
              // onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: parseInt(value) }))}
              // disabled={!!existingBudget}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category"  />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Budget (kr)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              // value={formData.amount}
              // onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              placeholder="Enter budget amount"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Select
              name="period"
              defaultValue="MONTHLY"
              // value={formData.period}
              // onValueChange={(value) => setFormData(prev => ({ ...prev, period: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY" >Monthly</SelectItem>
                <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date (Optional)</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              // defaultValue={new Date().toISOString().split('T')[0]}
              // value={formData.startDate}
              // onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">Leave empty to start from budget creation date</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              // value={formData.endDate}
              // onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              placeholder="Leave empty for ongoing budget"
            />
            <p className="text-xs text-muted-foreground">Leave empty for an ongoing budget with no end date</p>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              // disabled={formData.categoryId === 0 || formData.amount <= 0}
            >
              {false ? "Update Budget" : "Create Budget"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
