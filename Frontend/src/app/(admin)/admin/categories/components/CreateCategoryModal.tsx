import { useEffect, useState, ChangeEvent, JSX } from 'react';
import { Modal, Button, Form, Image } from 'react-bootstrap';

type Category = {
  CategoryID: number;
  Name: string;
  children?: Category[];
};

type Props = {
  show: boolean;
  onHide: () => void;
  onCreated: () => void;
};

export default function CreateCategoryModal({ show, onHide, onCreated }: Props) {
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
      if (res.ok && result.success) {
        onCreated();

        setName('');
        setParentId('');
        setImageFile(null);
        setImagePreview('');
        onHide();
      } else {
        alert(result.message || 'Tạo danh mục thất bại!');
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra trong quá trình gửi dữ liệu!');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Form onSubmit={handleSubmit} encType="multipart/form-data">
        <Modal.Header closeButton>
          <Modal.Title>Thêm mới danh mục</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3" controlId="parentCategory">
            <Form.Label>Danh mục cha</Form.Label>
            <Form.Select
              value={parentId}
              onChange={e => setParentId(e.target.value)}
            >
              <option value="">--- Danh mục cấp cao nhất ---</option>
              {renderOptions(categories)}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="categoryName">
            <Form.Label>Tiêu đề</Form.Label>
            <Form.Control
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="categoryImage">
            <Form.Label>Hình ảnh</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <Image
                src={imagePreview}
                alt="Preview"
                style={{ maxWidth: 150, marginTop: 10 }}
                thumbnail
              />
            )}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Hủy
          </Button>
          <Button variant="primary" type="submit">
            Tạo mới
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
