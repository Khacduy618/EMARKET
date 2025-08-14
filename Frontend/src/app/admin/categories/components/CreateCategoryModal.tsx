"use client"

import type React from "react"

import { useEffect, useState, type ChangeEvent } from "react"
import { X, Upload, FolderPlus, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { getAuthToken } from "@/services/api"
import { API_URL } from "@/lib/config"

type Category = {
  CategoryID: number
  Name: string
  children?: Category[]
}

type Props = {
  show: boolean
  onHide: () => void
  onCreated: () => void
}

export default function CreateCategoryModal({ show, onHide, onCreated }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [parentId, setParentId] = useState<string>("0") // Updated default value to '0'
  const [name, setName] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (show) {
      fetch(`${API_URL}/admin/categories/getAllCategory`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setCategories(data.data))
        .catch(console.error)
    }
  }, [show])

  const renderOptions = (tree: Category[], level = 0): React.ReactNode[] => {
    return tree.flatMap((node) => [
      <SelectItem key={node.CategoryID} value={node.CategoryID.toString()}>
        {"\u00A0".repeat(level * 4)}- {node.Name}
      </SelectItem>,
      ...(node.children ? renderOptions(node.children, level + 1) : []),
    ])
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)

    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append("Parent", parentId)
    formData.append("Name", name)
    if (imageFile) {
      formData.append("image", imageFile)
    }

    try {
      const res = await fetch(`${API_URL}/admin/categories/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formData,
      })

      const result = await res.json()
      if (res.ok && result.success) {
        onCreated()
        setName("")
        setParentId("0") // Updated default value to '0'
        setImageFile(null)
        setImagePreview("")
        onHide()
      } else {
        alert(result.message || "Tạo danh mục thất bại!")
      }
    } catch (err) {
      console.error(err)
      alert("Có lỗi xảy ra trong quá trình gửi dữ liệu!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <FolderPlus className="w-5 h-5 mr-2 text-orange-500" />
            Thêm danh mục mới
          </DialogTitle>
          <DialogDescription>Tạo danh mục mới để phân loại sản phẩm trong shop của bạn</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parent-category" className="text-sm font-medium">
                Danh mục cha
              </Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="--- Danh mục cấp cao nhất ---" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">--- Danh mục cấp cao nhất ---</SelectItem> {/* Updated value to '0' */}
                  {renderOptions(categories)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-name" className="text-sm font-medium">
                Tên danh mục <span className="text-red-500">*</span>
              </Label>
              <Input
                id="category-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên danh mục..."
                className="focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-image" className="text-sm font-medium">
                Hình ảnh danh mục
              </Label>
              <Card className="border-dashed border-2 border-gray-300 hover:border-orange-400 transition-colors">
                <CardContent className="p-4">
                  {imagePreview ? (
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16 rounded-lg">
                        <AvatarImage src={imagePreview || "/placeholder.svg"} alt="Preview" className="object-cover" />
                        <AvatarFallback className="rounded-lg">
                          <ImageIcon className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{imageFile?.name}</p>
                        <p className="text-xs text-gray-500">{imageFile && (imageFile.size / 1024).toFixed(1)} KB</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview("")
                          }}
                          className="mt-2"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <div className="text-sm text-gray-600 mb-2">Kéo thả ảnh vào đây hoặc</div>
                      <Input
                        id="category-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("category-image")?.click()}
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
            <Button type="button" variant="outline" onClick={onHide}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Tạo danh mục
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
