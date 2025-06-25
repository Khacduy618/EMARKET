'use client';
import './style.css';
import Swal from 'sweetalert2';

import { JSX, useEffect, useState } from 'react';
import CreateCategoryModal from './components/CreateCategoryModal';
import EditCategoryModal from './components/EditCategoryModal';

type Category = {
  CategoryID: number;
  Name: string;
  ImageURL?: string;
  ParentCategoryID?: number;
  children?: Category[];
};

type Pagination = {
  currentPage: number;
  totalPage: number;
};

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [displayQuantity, setDisplayQuantity] = useState<number>(10);
  const [keyword, setKeyword] = useState<string>('');
  const [pagination, setPagination] = useState<Pagination>({ currentPage: 1, totalPage: 1 });
  
  // Thêm state để điều khiển modal Create
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8001/api/admin/categories/list?page=${page}&display_quantity=${displayQuantity}&keyword=${encodeURIComponent(keyword)}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      const res2 = await fetch('http://127.0.0.1:8001/api/admin/categories/getAllCategory', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      const data = await res.json();
      const dataTree = await res2.json();

      setCategories(data.data);
      setPagination({
        currentPage: data.pagination.currentPage,
        totalPage: data.pagination.totalPage,
      });
      setCategoryTree(dataTree.data);
    } catch (err) {
      console.error('Lỗi load danh mục:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, displayQuantity, keyword]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setPage(1);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDisplayQuantity(Number(e.target.value));
    setPage(1);
  };

  const deleteCategory = async (id: number) => {
    const hasChildren = categories.some(c => c.ParentCategoryID === id);
    if (hasChildren) {
      alert('Bạn cần xóa danh mục con trước!');
      return;
    }

    if (confirm('Bạn có chắc chắn muốn xóa?')) {
      try {
        const res = await fetch(`http://127.0.0.1:8001/api/admin/categories/delete/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ _method: 'DELETE' }),
        });

        const result = await res.json();
        alert(result.message);
        fetchCategories();
      } catch (error) {
        console.error('Lỗi khi xóa danh mục:', error);
        alert('Xảy ra lỗi khi xóa danh mục');
      }
    }
  };

  const renderPagination = () => (
    <div className="d-flex justify-content-between align-items-center">
      <div>Trang {pagination.currentPage} / {pagination.totalPage}</div>
      <div>
        <button
          className="btn btn-sm btn-secondary me-2"
          disabled={pagination.currentPage <= 1}
          onClick={() => setPage(p => p - 1)}
        >Trước</button>
        <button
          className="btn btn-sm btn-secondary"
          disabled={pagination.currentPage >= pagination.totalPage}
          onClick={() => setPage(p => p + 1)}
        >Sau</button>
      </div>
    </div>
  );

  const renderTree = (tree: Category[]): JSX.Element => (
    <ul>
      {tree.map(node => (
        <li key={node.CategoryID}>
          {node.Name}
          {node.children && node.children.length > 0 && renderTree(node.children)}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <CreateCategoryModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onCreated={() => {
          Swal.fire({
            icon: 'success',
            title: 'Thêm danh mục thành công!',
            showConfirmButton: false,
            timer: 1500,
          });
          fetchCategories();
          setShowCreateModal(false);
        }}
      />

      {editCategory && (
        <EditCategoryModal
          category={editCategory}
          categoryTree={categoryTree}
          onClose={() => setEditCategory(null)}
          onUpdated={() => {
            alert('Cập nhật thành công!');
            fetchCategories();
          }}
        />
      )}

      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Quản lý danh mục</h5>
          <button
            className="btn btn-outline-success"
            onClick={() => setShowCreateModal(true)}
          >+ Thêm mới</button>
        </div>

        <div className="card-body" style={{ height: 'auto' }}>
          <div className="row mb-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm theo tên danh mục"
                value={keyword}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div>Loading categories...</div>
            </div>
          ) : (
            <div className="row">
              <div className="col-md-4">
                <h6>Cây danh mục</h6>
                <ul id="category-tree">{renderTree(categoryTree)}</ul>
              </div>
              <div className="col-md-8">
                <table className="table table-bordered table-sm">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên danh mục</th>
                      <th>Hình ảnh</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((item, index) => (
                      <tr key={item.CategoryID}>
                        <td>{(page - 1) * displayQuantity + index + 1}</td>
                        <td>{item.Name}</td>
                        <td>
                          <img style={{ width: 60 }} src={item.ImageURL} alt={item.Name} />
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => setEditCategory(item)}
                            // Bỏ data-bs-toggle vì modal được điều khiển qua state
                          >Sửa</button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteCategory(item.CategoryID)}
                          >Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {renderPagination()}
                <div className="col-2 mt-3">
                  <span>Hiển thị: </span>
                  <select className="form-select" value={displayQuantity} onChange={handleQuantityChange}>
                    {[5, 10, 20, 50, 100].map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
