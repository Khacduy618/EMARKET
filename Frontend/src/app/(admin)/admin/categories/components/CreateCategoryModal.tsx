'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { JSX } from 'react/jsx-runtime';

type Category = {
  CategoryID: number;
  Name: string;
  children?: Category[];
};

type Props = {
  onCreated: () => void;
};

export default function CreateCategoryModal({ onCreated }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentId, setParentId] = useState<string>('');
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetch('http://localhost:8001/api/admin/categories/getAllCategory')
      .then(res => res.json())
      .then(data => setCategories(data.data))
      .catch(console.error);
  }, []);

  const renderOptions = (tree: Category[], level = 0): JSX.Element[] => {
    return tree.flatMap(node => [
      <option key={node.CategoryID} value={node.CategoryID}>
        {'\u00A0'.repeat(level * 4)}- {node.Name}
      </option>,
      ...(node.children ? renderOptions(node.children, level + 1) : []),
    ]);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('Parent', parentId);
    formData.append('Name', name);
    if (imageFile) {
      formData.append('image', imageFile);
    }
   
    try {
      const res = await fetch('http://127.0.0.1:8001/api/admin/categories/create', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      console.log(result);
      if (res.ok && result.success) {
        onCreated();
        // Reset form
        setName('');
        setParentId('');
        setImageFile(null);
        setImagePreview('');
      } else {
        alert(result.message || 'Tạo danh mục thất bại!');
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra trong quá trình gửi dữ liệu!');
    }
  };

  return (
    <div
      className="modal fade"
      id="createCategoryModal"
      tabIndex={-1}
      aria-labelledby="createCategoryModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg">
        <form className="modal-content" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="modal-header">
            <h5 className="modal-title" id="createCategoryModalLabel">
              Thêm mới danh mục
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="parentCategory" className="form-label">
                Danh mục cha
              </label>
              <select
                id="parentCategory"
                className="form-select"
                value={parentId}
                onChange={e => setParentId(e.target.value)}
              >
                <option value="">--- Danh mục cấp cao nhất ---</option>
                {renderOptions(categories)}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="categoryName" className="form-label">
                Tiêu đề
              </label>
              <input
                id="categoryName"
                type="text"
                className="form-control"
                required
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="categoryImage" className="form-label">
                Hình ảnh
              </label>
              <input
                id="categoryImage"
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: 150, marginTop: 10, display: 'block' }}
                />
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Tạo mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
