"use client";

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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);



  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/admin/categories/getAllCategory', {
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
        setCategories(flattenCategories(data));
        setCategoryTree(data);
        console.log(data);

      } catch (err) {
        console.error('Lỗi load danh mục:', err);
      }
    };

    fetchCategories();
  }, []);

  const flattenCategories = (tree: Category[]): Category[] => {
    const flat: Category[] = [];
    const traverse = (nodes: Category[]) => {
      nodes.forEach(node => {
        flat.push(node);
        if (node.children?.length) traverse(node.children);
      });
    };
    traverse(tree);
    return flat;
  };

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
          if (data.status === 'success') {
            alert(data.message);
          } else {
            alert(data.message);
          }
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

  // Hàm mở modal sửa danh mục
  function openEditCategoryModal(category: Category) {
    setEditCategory(category);
  }

  // Hàm đóng modal
  function closeEditCategoryModal() {
    setEditCategory(null);
  }

  // Hàm xử lý sau khi cập nhật xong
  function handleUpdatedCategory(updatedCategory: Category) {
    // Cập nhật lại danh sách category hoặc gọi fetch lại
    alert('Đã cập nhật ' + updatedCategory);
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
              <button className="btn btn-outline-success" data-bs-toggle="modal" data-bs-target="#createCategoryModal">
                + Thêm mới
              </button>
            </div>
          </div>

          <div className="row">
            <div className="col-4">
              <h5>Cấu trúc danh mục</h5>
              {renderTree(categoryTree)}
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
                        <img style={{ width: 60 }} src={"localhost8000:" + item.ImageURL} alt={item.Name} />
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
                        <button className="btn btn-sm btn-danger" onClick={() => deleteCategory(item.CategoryID)}>
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
