'use client';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './style.css'

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

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // <-- thêm loading

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);  // bật loading khi bắt đầu fetch
      try {
        const res = await fetch('http://127.0.0.1:8000/api/admin/categories/list', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        const res2 = await fetch('http://127.0.0.1:8000/api/admin/categories/getAllCategory', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (!res.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await res.json();
        const dataTree = await res2.json();

        setCategories(data.data);
        setCategoryTree(dataTree.data);

      } catch (err) {
        console.error('Lỗi load danh mục:', err);
      } finally {
        setLoading(false);  // tắt loading dù lỗi hay thành công
      }
    };

    fetchCategories();
  }, []);

  const deleteCategory = (id: number) => {
    const hasChildren = categories.some(c => c.ParentCategoryID === id);
    if (hasChildren) {
      alert('Bạn cần xóa danh mục con trước!');
      return;
    }

    if (confirm('Bạn có chắc chắn muốn xóa?')) {
      // Xóa tạm khỏi danh sách hiển thị
      setCategories(prev => prev.filter(c => c.CategoryID !== id));

      fetch(`http://127.0.0.1:8000/api/admin/categories/delete/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          _method: 'DELETE'
        })
      })
        .then(response => response.json())
        .then(data => {
          alert(data.message);
        })
        .catch(error => console.error('Error:', error));

      setCategoryTree(removeFromTree(categoryTree, id));
    }
  };

  const removeFromTree = (tree: Category[], id: number): Category[] => {
    return tree
      .filter(node => node.CategoryID !== id)
      .map(node => ({
        ...node,
        children: node.children ? removeFromTree(node.children, id) : [],
      }));
  };

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

  function openEditCategoryModal(category: Category) {
    setEditCategory(category);
  }

  function closeEditCategoryModal() {
    setEditCategory(null);
  }

  function handleUpdatedCategory(updatedCategory: Category) {
    alert('Đã cập nhật ' + updatedCategory.Name);
    closeEditCategoryModal();
  }

  return (
    <>
      <CreateCategoryModal />
      {editCategory && (
        <EditCategoryModal
          category={editCategory}
          categoryTree={categoryTree}
          onClose={closeEditCategoryModal}
          onUpdated={handleUpdatedCategory}
        />
      )}

      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">Quản lý danh mục</h5>
        </div>

        <div className="card-body">
          <div className="row mb-3">
            <div className="col-8"></div>
            <div className="col-4 text-end">
              <button
                className="btn btn-outline-success"
                data-bs-toggle="modal"
                data-bs-target="#createCategoryModal"
              >
                + Thêm mới
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div>Đang tải danh mục...</div>
            </div>
          ) : (
            <div className="row">
              <div className="col-4">
                <h5>Cấu trúc danh mục</h5>
                <ul id="category-tree">{renderTree(categoryTree)}</ul>
              </div>

              <div className="col-8">
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
                        <td>{index + 1}</td>
                        <td>{item.Name}</td>
                        <td>
                          <img style={{ width: 60 }} src={item.ImageURL} alt={item.Name} />
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => openEditCategoryModal(item)}
                            data-bs-toggle="modal"
                            data-bs-target="#editCategoryModal"
                          >
                            Sửa
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteCategory(item.CategoryID)}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
