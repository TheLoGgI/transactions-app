import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

interface Category {
    id: number
    name: string
    color: string
}

interface CategoryDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    editingCategory: Category | null
    onSubmit: (formData: FormData) => void
    onCancel: () => void
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

export function CategoryDialog({ isOpen, onOpenChange, editingCategory, onSubmit, onCancel }: CategoryDialogProps) {
    const [selectedColor, setSelectedColor] = useState(editingCategory?.color ?? predefinedColors[0])

    // Update selected color when editing category changes
    useEffect(() => {
        setSelectedColor(editingCategory?.color ?? predefinedColors[0])
    }, [editingCategory])

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
                <form action={onSubmit}>
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
                                        className={`w-8 h-8 rounded-full border-2 ${
                                            selectedColor === color ? "border-gray-800" : "border-gray-300"
                                        }`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setSelectedColor(color)}
                                    />
                                ))}
                            </div>
                            <input
                                type="hidden"
                                name="category-color"
                                value={selectedColor}
                            />
                            <input
                                type="hidden"
                                name="category-id"
                                value={editingCategory?.id}
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: selectedColor }} />
                                <span className="text-sm text-muted-foreground">Selected color</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="reset" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingCategory ? "Update Category" : "Add Category"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
