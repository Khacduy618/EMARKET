import { useEffect, useState } from 'react';
import { Modal, Button, Table, Spinner } from 'react-bootstrap';

type Order = {
  OrderID: number;
  OrderCode: string;
  BuyerName: string;
  OrderDate: string; 
  TotalAmount: number;
};

type OderModelProps = {
  show: boolean;
  onClose: () => void;
  date?: string; 
};

export default function OderModel({ show, date, onClose }: OderModelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show && date) {
      setLoading(true);
      setError(null);
      fetch(`http://localhost:8000/api/seller/orders?date=${encodeURIComponent(date)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          setOrders(data); 
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    } else {
 
      setOrders([]);
      setError(null);
      setLoading(false);
    }
  }, [show, date]);

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Đơn hàng ngày {date}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && (
          <div className="text-center my-4">
            <Spinner animation="border" />
          </div>
        )}
        {error && <div className="alert alert-danger">Lỗi: {error}</div>}
        {!loading && !error && orders.length === 0 && (
          <div>Không có đơn hàng nào cho ngày này.</div>
        )}
        {!loading && !error && orders.length > 0 && (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>OrderID</th>
                <th>OrderCode</th>
                <th>BuyerName</th>
                <th>OrderDate</th>
                <th>Tổng tiền (₫)</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.OrderID}>
                  <td>{order.OrderID}</td>
                  <td>{order.OrderCode}</td>
                  <td>{order.BuyerName}</td>
                  <td>{order.OrderDate}</td>
                  <td>{order.TotalAmount.toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
