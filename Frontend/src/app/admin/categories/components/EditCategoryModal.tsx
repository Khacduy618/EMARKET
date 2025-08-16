"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { X, Upload, Save, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { getAuthToken, API_BASE_URL } from "@/services/api"

type Category = {
  CategoryID: number
  Name: string
  ParentCategoryID?: number
  ImageURL?: string
  children?: Category[]
}

type EditCategoryModalProps = {
  category: Category | null
  categoryTree: Category[]
  onClose: () => void
  onUpdated: (updatedCategory: Category) => void
}

export default function EditCategoryModal({ category, categoryTree, onClose, onUpdated }: EditCategoryModalProps) {
  const [parentId, setParentId] = useState<string>("0")
  const [title, setTitle] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (category) {
      setTitle(category.Name)
      setParentId(category.ParentCategoryID?.toString() || "0")
      setPreviewUrl(category.ImageURL || null)
      setImageFile(null)
    }
  }, [category])

  const buildCategoryOptions = (tree: Category[], level = 0): React.ReactNode[] => {
    return tree.flatMap((node) => {
      // Không hiển thị chính danh mục đang edit và các danh mục con của nó
      if (category && node.CategoryID === category.CategoryID) {
        return []
      }

      const indent = "\u00A0\u00A0\u00A0\u00A0".repeat(level)
      const option = (
        <SelectItem key={node.CategoryID} value={node.CategoryID.toString()}>
          {indent} - {node.Name}
        </SelectItem>
      )

      if (node.children?.length) {
        return [option, ...buildCategoryOptions(node.children, level + 1)]
      }
      return [option]
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)

    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(category?.ImageURL || null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) return

    setLoading(true)
    const formData = new FormData()
    formData.append("CategoryID", category.CategoryID.toString())
    formData.append("Name", title)
    formData.append("Parent", parentId)
    if (imageFile) {
      formData.append("image", imageFile)
    }
    formData.append("_method", "PATCH")

    try {
      const res = await fetch(API_BASE_URL + "/admin/categories/update", {
        method: "POST",
        credentials: 'include',
        body: formData,
      })

      if (!res.ok) throw new Error("Update failed")

      const updated = await res.json()
      onUpdated(updated)
      onClose()
    } catch (error) {
      console.error("Error updating category:", error)
      alert("Cập nhật danh mục thất bại!")
    } finally {
      setLoading(false)
    }
  }

  if (!category) return null

  return (
    <Dialog open={!!category} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Save className="w-5 h-5 mr-2 text-blue-200" />
            Chỉnh sửa danh mục
          </DialogTitle>
          <DialogDescription>Cập nhật thông tin danh mục "{category.Name}"</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-parent-category" className="text-sm font-medium">
                Danh mục cha
              </Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="--- Danh mục cấp cao nhất ---" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">--- Danh mục cấp cao nhất ---</SelectItem>
                  {buildCategoryOptions(categoryTree)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-sm font-medium">
                Tên danh mục <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Nhập tên danh mục..."
                className="focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-thumbnail" className="text-sm font-medium">
                Hình ảnh danh mục
              </Label>
              <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
                <CardContent className="p-4">
                  {previewUrl ? (
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16 rounded-lg">
                        <AvatarImage src={previewUrl || "/placeholder.svg"} alt="Preview" className="object-cover" />
                        <AvatarFallback className="rounded-lg">
                          <ImageIcon className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{imageFile?.name || "Ảnh hiện tại"}</p>
                        {imageFile && <p className="text-xs text-gray-500">{(imageFile.size / 1024).toFixed(1)} KB</p>}
                        <div className="flex space-x-2 mt-2">
                          <Input
                            id="edit-thumbnail"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById("edit-thumbnail")?.click()}
                          >
                            Thay đổi
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setImageFile(null)
                              setPreviewUrl(null)
                            }}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <div className="text-sm text-gray-600 mb-2">Kéo thả ảnh vào đây hoặc</div>
                      <Input
                        id="edit-thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("edit-thumbnail")?.click()}
                      >
                        Chọn ảnh
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
