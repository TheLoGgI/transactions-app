"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Plus, Trash2 } from "lucide-react"
import { useState, type ComponentProps } from "react"
import { toast } from "sonner"
import useSWRMutation from "swr/mutation"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar"

interface Category {
    id: number
    name: string
    color: string
}

interface CategoryManagerProps extends ComponentProps<typeof Sidebar> {
    categoriesData: Category[]
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
    "#D7BDE2",
    "#A3E4D7",
    "#FAD7A0",
    "#FF6346",
    "#D5A6BD",
]

const handleCategories = async (url: string, { arg }: { arg: { id?: string; name: string; color: string } }) => {
    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            categoryName: arg.name,
            categoryColor: arg.color,
            categoryId: arg.id,
        }),
    })
    if (!res.ok) {
        throw new Error("Failed to create or update category")
    }

    return res

}


const deleteCategoryMutation = async (url: string, { arg }: { arg: string }) => {
    const res = await fetch(url, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            categoryName: arg,
        }),
    })
    if (!res.ok) {
        throw new Error("Failed to delete category")
    }

    return res

}

export function SidebarCategoryManager({ categoriesData, ...props }: CategoryManagerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [categories, setCategories] = useState(categoriesData)
    // const [newCategoryName, setNewCategoryName] = useState("")
    const [newCategoryColor, setNewCategoryColor] = useState(predefinedColors[0])
    // const [newCategoryType, setNewCategoryType] = useState<"income" | "expense">("expense")
    //   const { toast } = useToast()
    const { trigger } = useSWRMutation('/api/categories', handleCategories)
    const { trigger: deleteCategory } = useSWRMutation('/api/categories', deleteCategoryMutation)

    const handleMutateCategories = async (formData: FormData) => {
        const name = formData.get('category-name') as string | null
        const newColor = formData.get('category-color') as string
        const id = formData.get('category-id') as string

        if (typeof name !== "string" || !name.trim()) {
            toast.warning("Invalid category name", {
                description: "Please enter a category name.",
            })
            return
        }

        const newCategory: { name: string; color: string; id?: string } = {
            ...(id && id.trim() !== "" ? { id: id } : {}),
            name: name.trim(),
            color: newColor,
        }
        // console.log('newCategory: ', newCategory);

        const confirmedCategory = await trigger(newCategory)
        if (confirmedCategory.ok) {
            const response = await confirmedCategory.json() as Category
            toast.success("Category added successfully!", {
                description: `"${response.name}" has been added to your categories.`,
            })
        }
        setIsDialogOpen(false)

    }


    const handleEditCategory = (category: Category) => {
        setEditingCategory(category)
        // setNewCategoryName(category.name)
        setNewCategoryColor(category.color)
        // setNewCategoryType(category.type ?? "expense")
        setIsDialogOpen(true)
    }

    const handleDeleteCategory = async (categoryId: number) => {
        const categoryToDelete = categories.find((cat) => cat.id === categoryId)
        if (!categoryToDelete) return

        await deleteCategory(categoryToDelete.name)
        const filtedCategoires = categories.filter((cat) => cat.id !== categoryId)
        setCategories(filtedCategoires)

        toast.success("Category deleted", {
            description: `"${categoryToDelete.name}" has been removed from your categories.`,
        })
    }

    const resetForm = () => {
        setEditingCategory(null)
        // setNewCategoryName("")
        setNewCategoryColor(predefinedColors[0])
        // setNewCategoryType("expense")
    }

    const handleDialogClose = () => {
        setIsDialogOpen(false)
        setEditingCategory(null)
        resetForm()
    }

    return (
        <Sidebar {...props}>
            <SidebarHeader className="p-4 block">
                <h3 className="text-lg font-semibold">Manage Categories</h3>
                <p className="text-muted-foreground text-sm">Add, edit, or remove transaction categories</p>
            </SidebarHeader>
            <SidebarContent className="p-4 mb-4 no-scrollbar">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
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
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">
                            No expense categories yet. Add one to get started!
                        </p>
                    )}

            </SidebarContent>
            <SidebarFooter>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setIsDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
                            <form action={handleMutateCategories}>
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
                                            name="category-name"
                                            defaultValue={editingCategory?.name}
                                            // onChange={(e) => setNewCategoryName(e.target.value)}
                                            placeholder="Enter category name"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category-color">Category Color</Label>
                                        <div className="grid grid-cols-8 gap-2">
                                            {predefinedColors.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${newCategoryColor === color ? "border-gray-800 dark:border-gray-200" : "border-gray-300 dark:border-gray-600"
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => setNewCategoryColor(color)}
                                                />
                                            ))}
                                        </div>
                                        <input
                                            type="hidden"
                                            name="category-color"
                                            value={newCategoryColor}
                                        />
                                        <input
                                            type="hidden"
                                            name="category-id"
                                            value={editingCategory?.id}
                                        />
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: newCategoryColor }} />
                                            <span className="text-sm text-muted-foreground">Selected color</span>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="reset" variant="outline" onClick={handleDialogClose}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" onClick={() => handleMutateCategories}>
                                        {editingCategory ? "Update Category" : "Add Category"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
            </SidebarFooter>
            {/* <SidebarRail /> */}
        </Sidebar>
    )
}
