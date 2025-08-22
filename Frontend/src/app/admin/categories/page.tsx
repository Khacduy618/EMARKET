"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Plus, Search, Edit, Trash2, FolderTree, ImageIcon, ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import CreateCategoryModal from "./components/CreateCategoryModal"
import EditCategoryModal from "./components/EditCategoryModal"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { getAuthToken } from "@/services/api"
import { API_URL } from "@/lib/config"

type Category = {
  CategoryID: number
  Name: string
  ImageURL?: string
  ParentCategoryID?: number
  children?: Category[]
}

type Pagination = {
  currentPage: number
  totalPage: number
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [categoryTree, setCategoryTree] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [displayQuantity, setDisplayQuantity] = useState<number>(5)
  const [keyword, setKeyword] = useState<string>("")
  const [pagination, setPagination] = useState<Pagination>({ currentPage: 1, totalPage: 1 })
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false)
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set())

  const fetchCategories = async () => {
    setLoading(true)
    try { 
      const res = await fetch(
<<<<<<< HEAD:Frontend/src/app/admin/categories/page.tsx
        `${API_URL}/admin/categories/list?page=${page}&display_quantity=${displayQuantity}&keyword=${encodeURIComponent(keyword)}`,
=======
        `http://localhost:8001/api/admin/categories/list?page=${page}&display_quantity=${displayQuantity}&keyword=${encodeURIComponent(keyword)}`,
>>>>>>> V2:Frontend/src/app/(admin)/admin/categories/page.tsx
        {
          credentials: 'include', 
        },
      )

<<<<<<< HEAD:Frontend/src/app/admin/categories/page.tsx
      const res2 = await fetch(`${API_URL}/admin/categories/getAllCategory`, {
=======
      const res2 = await fetch("http://localhost:8001/api/admin/categories/getAllCategory", {
>>>>>>> V2:Frontend/src/app/(admin)/admin/categories/page.tsx
        headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include', 
      })

      const data = await res.json()
      const dataTree = await res2.json()

      setCategories(data.data)
      setPagination({
        currentPage: data.pagination.currentPage,
        totalPage: data.pagination.totalPage,
      })
      setCategoryTree(dataTree.data)
    } catch (err) {
      console.error("Lỗi load danh mục:", err)
      toast.error("Không thể tải danh sách danh mục")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [page, displayQuantity, keyword])

  const handleSearchChange = (value: string) => {
    setKeyword(value)
    setPage(1)
  }

  const handleQuantityChange = (value: string) => {
    setDisplayQuantity(Number(value))
    setPage(1)
  }

  const deleteCategory = async (id: number) => {
    const hasChildren = categories.some((c) => c.ParentCategoryID === id)
    if (hasChildren) {
      toast.warning("Bạn cần xóa danh mục con trước!")
      return
    }

    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
<<<<<<< HEAD:Frontend/src/app/admin/categories/page.tsx
          const res = await fetch(`${API_URL}/admin/categories/delete/${id}`, {
=======
        const res = await fetch(`http://localhost:8001/api/admin/categories/delete/${id}`, {
>>>>>>> V2:Frontend/src/app/(admin)/admin/categories/page.tsx
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include', 
          body: JSON.stringify({ _method: "DELETE" }),
        })

        const result = await res.json()
        toast.success(result.message || "Xóa danh mục thành công")
        fetchCategories()
      } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error)
        toast.error("Xảy ra lỗi khi xóa danh mục")
      }
    }
  }

  const toggleNode = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderTree = (tree: Category[], level = 0): React.ReactNode => {
    return tree.map((node) => (
      <div key={node.CategoryID} className="select-none">
        <div
          className={`flex items-center py-2 px-2 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors ${level > 0 ? "ml-4" : ""}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {node.children && node.children.length > 0 ? (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 mr-2" onClick={() => toggleNode(node.CategoryID)}>
              {expandedNodes.has(node.CategoryID) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6 mr-2" />
          )}

          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={node.ImageURL || "/placeholder.svg"} alt={node.Name} />
            <AvatarFallback className="text-xs bg-orange-100 text-orange-600">{node.Name.charAt(0)}</AvatarFallback>
          </Avatar>

          <span className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">{node.Name}</span>

          <Badge variant="secondary" className="ml-auto text-xs">
            {categories.filter((c) => c.ParentCategoryID === node.CategoryID).length}
          </Badge>
        </div>

        {node.children && node.children.length > 0 && expandedNodes.has(node.CategoryID) && (
          <div className="ml-2">{renderTree(node.children, level + 1)}</div>
        )}
      </div>
    ))
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm danh mục
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Tree */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <FolderTree className="w-5 h-5 mr-2 text-orange-500" />
                Cây danh mục
              </CardTitle>
              <CardDescription>Cấu trúc phân cấp danh mục sản phẩm</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="max-h-96 overflow-y-auto space-y-1">
                {categoryTree.length > 0 ? (
                  renderTree(categoryTree)
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FolderTree className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có danh mục nào</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category List */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Danh sách danh mục</CardTitle>
                  <CardDescription>Tổng cộng {categories.length} danh mục</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm danh mục..."
                      value={keyword}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-4 w-64"
                    />
                  </div>
                  <Select value={displayQuantity.toString()} onValueChange={handleQuantityChange}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 50, 100].map((q) => (
                        <SelectItem key={q} value={q.toString()}>
                          {q}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="ml-3 text-gray-600">Đang tải...</span>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="w-16">STT</TableHead>
                          <TableHead>Danh mục</TableHead>
                          <TableHead className="w-24">Hình ảnh</TableHead>
                          <TableHead className="w-32">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((item, index) => (
                          <TableRow key={item.CategoryID} className="hover:bg-orange-50/50 transition-colors">
                            <TableCell className="font-medium text-gray-600">
                              {(page - 1) * displayQuantity + index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={item.ImageURL || "/placeholder.svg"} alt={item.Name} />
                                  <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                                    {item.Name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900">{item.Name}</p>
                                  {item.ParentCategoryID && <p className="text-xs text-gray-500">Danh mục con</p>}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {item.ImageURL ? (
                                <Avatar className="h-12 w-12 rounded-lg">
                                  <AvatarImage
                                    src={item.ImageURL || "/placeholder.svg"}
                                    alt={item.Name}
                                    className="object-cover"
                                  />
                                  <AvatarFallback className="rounded-lg bg-gray-100">
                                    <ImageIcon className="h-4 w-4 text-gray-400" />
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <ImageIcon className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditCategory(item)}
                                  className="hover:bg-blue-50 hover:border-blue-200"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteCategory(item.CategoryID)}
                                  className="hover:bg-red-50 hover:border-red-200 text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Trang {pagination.currentPage} / {pagination.totalPage}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.currentPage <= 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.currentPage >= pagination.totalPage}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        <CreateCategoryModal
          show={showCreateModal}
          onHide={() => setShowCreateModal(false)}
          onCreated={() => {
            toast.success("Thêm danh mục thành công!")
            fetchCategories()
            setShowCreateModal(false)
          }}
        />

        {editCategory && (
          <EditCategoryModal
            categoryId={editCategory.CategoryID}
            categoryTree={categoryTree}
            onClose={() => setEditCategory(null)}
            onUpdated={() => {
              toast.success("Cập nhật danh mục thành công!")
              fetchCategories()
              setEditCategory(null)
            }}
          />
        )}
      </div>
    </>
  )
}
