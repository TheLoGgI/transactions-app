"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface BudgetFormDialogProps {
  categories: Array<{
    id: number
    name: string
    color: string
  }>
  existingBudget?: {
    id: number
    categoryId: number
    amount: number
    period: string
  }
  onSave: (budgetData: {
    categoryId: number
    amount: number
    period: string
  }) => void
  trigger?: React.ReactNode
}

export function BudgetFormDialog({ categories, existingBudget, onSave, trigger }: BudgetFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    categoryId: existingBudget?.categoryId ?? 0,
    amount: existingBudget?.amount ?? 0,
    period: existingBudget?.period ?? "MONTHLY"
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.categoryId === 0 || formData.amount <= 0) return
    
    onSave(formData)
    setOpen(false)
    
    // Reset form if creating new budget
    if (!existingBudget) {
      setFormData({
        categoryId: 0,
        amount: 0,
        period: "MONTHLY"
      })
    }
  }

  const availableCategories = existingBudget 
    ? categories 
    : categories.filter(_cat => !categories.some(c => c.id === formData.categoryId))

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
            {existingBudget ? "Edit Budget" : "Create New Budget"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.categoryId.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: parseInt(value) }))}
              disabled={!!existingBudget}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
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
            <Label htmlFor="amount">Budget Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              placeholder="Enter budget amount"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Select
              value={formData.period}
              onValueChange={(value) => setFormData(prev => ({ ...prev, period: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={formData.categoryId === 0 || formData.amount <= 0}
            >
              {existingBudget ? "Update Budget" : "Create Budget"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
