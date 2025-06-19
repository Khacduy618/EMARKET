import React, { useEffect, useState } from 'react';
import { JSX } from 'react/jsx-runtime';

type Category = {
  CategoryID: number;
  Name: string;
  ParentCategoryID?: number;
  ImageURL?: string;
  children?: Category[];
};

type EditCategoryModalProps = {
  category: Category | null;
  categoryTree: Category[]; // dữ liệu danh mục cây truyền vào để build options
  onClose: () => void;
  onUpdated: (updatedCategory: Category) => void;
};

export default function EditCategoryModal({ category, categoryTree, onClose, onUpdated }: EditCategoryModalProps) {
  const [parentId, setParentId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Khi mở modal (category thay đổi), cập nhật form
  useEffect(() => {
    if (category) {
      setTitle(category.Name);
      setParentId(category.ParentCategoryID?.toString() || '');
      setPreviewUrl(category.ImageURL || null);
      setImageFile(null);
    }
  }, [category]);

  // Build options cho select (đệ quy)
  const buildCategoryOptions = (tree: Category[], level = 0): JSX.Element[] => {
    return tree.flatMap(node => {
      const indent = '\u00A0\u00A0\u00A0\u00A0'.repeat(level);
      const option = (
        <option key={node.CategoryID} value={node.CategoryID}>
          {indent} - {node.Name}
        </option>
      );
      if (node.children?.length) {
        return [option, ...buildCategoryOptions(node.children, level + 1)];
      }
      return [option];
    });
  };

  // Xử lý thay đổi file ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(category?.ImageURL || null);
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    const formData = new FormData();
    formData.append('CategoryID', category.CategoryID.toString());
    formData.append('Name', title);
    formData.append('Parent', parentId);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    formData.append('_method', 'PATCH');
    console.log(category);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/categories/update', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Update failed');

      const updated = await res.json();
      onUpdated(updated);
      onClose();
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Cập nhật danh mục thất bại!');
    }
  };

  if (!category) return null; 

  return (
    <div className="modal show d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="editCategoryModalLabel">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="modal-header">
              <h5 className="modal-title" id="editCategoryModalLabel">Chỉnh sửa danh mục</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <input type="hidden" name="CategoryID" value={category.CategoryID} />

              <div className="mb-3">
                <label htmlFor="edit-parent-category" className="form-label">Danh mục cha</label>
                <select
                  id="edit-parent-category"
                  className="form-select"
                  value={parentId}
                  onChange={e => setParentId(e.target.value)}
                >
                  <option value="">--- Danh mục cấp cao nhất ---</option>
                  {buildCategoryOptions(categoryTree)}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="edit-title" className="form-label">Tiêu đề</label>
                <input
                  id="edit-title"
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="thumbnail" className="form-label">Hình ảnh</label>
                <input
                  type="file"
                  className="form-control"
                  id="thumbnail"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mt-2"
                    style={{ maxWidth: '150px' }}
                  />
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
              <button type="submit" className="btn btn-primary">Lưu chỉnh sửa</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
