"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Folder, FolderOpen } from "lucide-react"

interface Category {
  CategoryID: number
  Name: string
  Description: string
  icon: string
  ParentCategoryID: number | null
  Slug: string
  ImageURL: string
  IsActive: boolean
  CreatedAt: string
  UpdatedAt: string
  Deleted: number
  children?: Category[]
}

interface CategorySelectorProps {
  value: string
  onChange: (value: string) => void
  onPageReset: () => void
}

export default function CategorySelector({ value, onChange, onPageReset }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost/api/admin/categories/getAllCategory",{
          headers: {
            "Content-Type": "application/json",
          },
        credentials: 'include', 
      });
      const result = await response.json()

      if (result.status === "success") {
        setCategories(result.data)
      } else {
        setError("Failed to fetch categories")
      }
    } catch (err) {
      setError("Error fetching categories")
      console.error("Error fetching categories:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = (selectedValue: string) => {
    onChange(selectedValue)
    onPageReset()
  }

  const renderCategoryOptions = (categories: Category[], level = 0) => {
    return categories.map((category) => {
      const indent = "  ".repeat(level)
      const hasChildren = category.children && category.children.length > 0

      return (
        <div key={category.CategoryID}>
          <SelectItem value={category.CategoryID.toString()} className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              {indent}
              {hasChildren ? (
                <FolderOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 text-gray-500" />
              )}
              {category.Name}
            </span>
          </SelectItem>

          {hasChildren && renderCategoryOptions(category.children!, level + 1)}
        </div>
      )
    })
  }

  const getSelectedCategoryName = (categoryId: string): string => {
    const findCategory = (cats: Category[], id: string): Category | null => {
      for (const cat of cats) {
        if (cat.CategoryID.toString() === id) {
          return cat
        }
        if (cat.children) {
          const found = findCategory(cat.children, id)
          if (found) return found
        }
      }
      return null
    }

    if (!categoryId) return "Tất cả danh mục"
    const category = findCategory(categories, categoryId)
    return category ? category.Name : "Tất cả danh mục"
  }

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Đang tải..." />
        </SelectTrigger>
      </Select>
    )
  }

  if (error) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Lỗi tải dữ liệu" />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Chọn danh mục">
          {value ? getSelectedCategoryName(value) : "Tất cả danh mục"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px] overflow-y-auto">
        <SelectItem value="all">
          <span className="flex items-center gap-1">
            <Folder className="h-4 w-4 text-gray-500" />
            Tất cả danh mục
          </span>
        </SelectItem>
        {renderCategoryOptions(categories)}
      </SelectContent>
    </Select>
  )
}
