"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit2, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface Category {
  id: number
  name: string
  color: string
  type?: "income" | "expense"
}

interface CategoryManagerProps {
  categories: Category[]
  onCategoriesChange: (categories: Category[]) => void
}

const predefinedColors = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8C471",
  "#82E0AA",
  "#F1948A",
  "#85C1E9",
  "#D7BDE2",
  "#A3E4D7",
  "#FAD7A0",
  "#D5A6BD",
]

export function CategoryManager({ categories, onCategoriesChange }: CategoryManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState(predefinedColors[0])
  const [newCategoryType, setNewCategoryType] = useState<"income" | "expense">("expense")
//   const { toast } = useToast()

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.warning("Invalid category name", {
        description: "Please enter a category name.",
      })
      return
    }

    // Check if category name already exists
    if (categories.some((cat) => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      toast.warning("Category already exists", {
        description: "A category with this name already exists.",
      })
      return
    }

    const newCategory: Category = {
      id: Math.max(...categories.map((c) => c.id), 0) + 1,
      name: newCategoryName.trim(),
      color: newCategoryColor ?? predefinedColors[0],
      type: newCategoryType,
    }

    onCategoriesChange([...categories, newCategory])

    toast.success("Category added successfully!", {
      description: `"${newCategory.name}" has been added to your categories.`,
    })

    // Reset form
    setNewCategoryName("")
    setNewCategoryColor(predefinedColors[0])
    setNewCategoryType("expense")
    setIsDialogOpen(false)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setNewCategoryName(category.name)
    setNewCategoryColor(category.color)
    setNewCategoryType(category.type ?? "expense")
    setIsDialogOpen(true)
  }

  const handleUpdateCategory = () => {
    if (!editingCategory) return

    if (!newCategoryName.trim()) {
      toast.warning( "Invalid category name",{
        description: "Please enter a category name.",
      })
      return
    }

    // Check if category name already exists (excluding current category)
    if (
      categories.some(
        (cat) => cat.id !== editingCategory.id && cat.name.toLowerCase() === newCategoryName.trim().toLowerCase(),
      )
    ) {
      toast.warning("Category already exists", {
        description: "A category with this name already exists.",
      })
      return
    }

    const updatedCategories = categories.map((cat) =>
      cat.id === editingCategory.id
        ? { ...cat, name: newCategoryName.trim(), color: newCategoryColor ?? predefinedColors[0], type: newCategoryType }
        : cat,
    )

    onCategoriesChange(updatedCategories as Category[])

    toast.success("Category updated successfully!", {
      description: `"${newCategoryName}" has been updated.`,
    })

    // Reset form
    setEditingCategory(null)
    setNewCategoryName("")
    setNewCategoryColor(predefinedColors[0])
    setNewCategoryType("expense")
    setIsDialogOpen(false)
  }

  const handleDeleteCategory = (categoryId: number) => {
    const categoryToDelete = categories.find((cat) => cat.id === categoryId)
    if (!categoryToDelete) return

    const updatedCategories = categories.filter((cat) => cat.id !== categoryId)
    onCategoriesChange(updatedCategories)

    toast.success("Category deleted", {
      description: `"${categoryToDelete.name}" has been removed from your categories.`,
    })
  }

  const resetForm = () => {
    setEditingCategory(null)
    setNewCategoryName("")
    setNewCategoryColor(predefinedColors[0])
    setNewCategoryType("expense")
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const expenseCategories = categories.filter((cat) => cat.type !== "income")
  const incomeCategories = categories.filter((cat) => cat.type === "income")

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manage Categories</CardTitle>
            <CardDescription>Add, edit, or remove transaction categories</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                <DialogDescription>
                  {editingCategory
                    ? "Update the category details below."
                    : "Create a new category for organizing your transactions."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category-type">Category Type</Label>
                  <Select
                    value={newCategoryType}
                    onValueChange={(value: "income" | "expense") => setNewCategoryType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category-color">Category Color</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          newCategoryColor === color ? "border-gray-800" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewCategoryColor(color)}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: newCategoryColor }} />
                    <span className="text-sm text-muted-foreground">Selected color</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button onClick={editingCategory ? handleUpdateCategory : handleAddCategory}>
                  {editingCategory ? "Update Category" : "Add Category"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Expense Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Expense Categories</h3>
            <div className="grid gap-2">
              {expenseCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {expenseCategories.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No expense categories yet. Add one to get started!
                </p>
              )}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
