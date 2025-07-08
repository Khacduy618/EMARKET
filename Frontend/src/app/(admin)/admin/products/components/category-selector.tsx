"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, ChevronDown, Folder, Tag, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

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

export default function ShopeeCategorySelector({ value, onChange, onPageReset }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:8001/api/admin/categories/getAllCategory")
      const result = await response.json()

      if (result.status === "success") {
        setCategories(result.data)
        // Mở rộng tất cả danh mục cha mặc định
        const allCategoryIds = getAllCategoryIds(result.data)
        setExpandedCategories(new Set(allCategoryIds))
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

  // Hàm đệ quy để lấy tất cả ID danh mục (bao gồm cả con của con)
  const getAllCategoryIds = (cats: Category[]): number[] => {
    const ids: number[] = []
    const traverse = (categories: Category[]) => {
      categories.forEach((cat) => {
        if (cat.children && cat.children.length > 0) {
          ids.push(cat.CategoryID)
          traverse(cat.children)
        }
      })
    }
    traverse(cats)
    return ids
  }

  const handleValueChange = (selectedValue: string) => {
    onChange(selectedValue)
    onPageReset()
  }

  const toggleExpanded = (categoryId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const renderCategoryOptions = (categories: Category[], level = 0): React.ReactNode[] => {
    const result: React.ReactNode[] = []

    categories.forEach((category) => {
      const hasChildren = category.children && category.children.length > 0
      const isExpanded = expandedCategories.has(category.CategoryID)
      const paddingLeft = level * 16

      // Render danh mục hiện tại
      result.push(
        <SelectItem
          key={category.CategoryID}
          value={category.CategoryID.toString()}
          className={cn(
            "relative cursor-pointer hover:bg-orange-50 focus:bg-orange-50 transition-colors",
            level === 0 ? "font-medium text-gray-900" : "text-gray-700",
            level > 0 && "border-l border-orange-100",
          )}
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
        >
          <div className="flex items-center justify-between w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => toggleExpanded(category.CategoryID, e)}
                  className="p-0.5 hover:bg-orange-200 rounded transition-colors flex items-center justify-center"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-orange-600" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-orange-600" />
                  )}
                </button>
              ) : (
                <div className="w-4 flex justify-center">
                  {level === 0 ? (
                    <Folder className="h-4 w-4 text-orange-600" />
                  ) : level === 1 ? (
                    <Tag className="h-3 w-3 text-gray-500" />
                  ) : (
                    <Circle className="h-2 w-2 text-gray-400 fill-current" />
                  )}
                </div>
              )}

              {hasChildren && (
                <>
                  {level === 0 ? (
                    <Folder className="h-4 w-4 text-orange-600" />
                  ) : level === 1 ? (
                    <Tag className="h-3 w-3 text-orange-500" />
                  ) : (
                    <Circle className="h-2 w-2 text-orange-400 fill-current" />
                  )}
                </>
              )}

              <span
                className={cn(level === 0 ? "text-sm font-medium" : level === 1 ? "text-sm" : "text-xs", "truncate")}
              >
                {category.Name}
              </span>
            </div>
            {hasChildren && <span className="text-xs text-gray-400 ml-2 shrink-0">({category.children?.length})</span>}
          </div>
        </SelectItem>,
      )

      // Render danh mục con nếu được mở rộng
      if (hasChildren && isExpanded && category.children) {
        const childrenNodes = renderCategoryOptions(category.children, level + 1)
        result.push(
          <div key={`children-${category.CategoryID}`} className="ml-2">
            {childrenNodes}
          </div>,
        )
      }
    })

    return result
  }

  const getCategoryBreadcrumb = (categoryId: string): string => {
    const findCategoryPath = (cats: Category[], id: string, path: string[] = []): string[] | null => {
      for (const cat of cats) {
        const currentPath = [...path, cat.Name]
        if (cat.CategoryID.toString() === id) {
          return currentPath
        }
        if (cat.children) {
          const found = findCategoryPath(cat.children, id, currentPath)
          if (found) return found
        }
      }
      return null
    }

    if (!categoryId || categoryId === "all") return "Tất cả danh mục"
    const path = findCategoryPath(categories, categoryId)
    return path ? path.join(" › ") : "Tất cả danh mục"
  }

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[280px] border-orange-200 focus:border-orange-400">
          <SelectValue placeholder="Đang tải danh mục..." />
        </SelectTrigger>
      </Select>
    )
  }

  if (error) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[280px] border-red-200">
          <SelectValue placeholder="Lỗi tải dữ liệu" />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[280px] border-orange-200 focus:border-orange-400 hover:border-orange-300">
        <SelectValue placeholder="Chọn danh mục">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-orange-600" />
            <span className="truncate text-sm">{getCategoryBreadcrumb(value)}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-[350px] max-h-[450px] overflow-y-auto">
        <SelectItem value="all" className="font-medium text-orange-600 hover:bg-orange-50 focus:bg-orange-50">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-orange-600" />
            <span>Tất cả danh mục</span>
          </div>
        </SelectItem>

        <div className="border-t border-gray-100 my-1" />

        <div className="space-y-0.5">{renderCategoryOptions(categories)}</div>
      </SelectContent>
    </Select>
  )
}
