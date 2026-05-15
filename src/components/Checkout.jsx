import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiMapPin, FiTruck, FiCreditCard, FiFileText, FiMessageSquare, FiArrowLeft } from 'react-icons/fi';
import { apiService } from '../services/api';

const Checkout = () => {
    const { cartItems, clearCart } = useCart();
    const navigate = useNavigate();
    
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
    const shipping = 20000;
    const total = subtotal + shipping;

    const [formData, setFormData] = useState({
        phone: '',
        email: '',
        address: '',
        province: '',
        district: '',
        ward: '',
        paymentMethod: 'cod',
        note: '',
        needsInvoice: false
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const orderData = {
            created_at: new Date().toISOString(),
            customer_name: "Khách hàng", // Có thể bổ sung input tên nếu cần
            customer_phone: formData.phone,
            customer_email: formData.email,
            customer_address: `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.province}`,
            items: cartItems,
            total_amount: total,
            status: 'pending',
            payment_method: formData.paymentMethod,
            note: formData.note
        };

        try {
            const data = await apiService.createOrder(orderData);
            const orderId = data?.[0]?.id || Date.now().toString();
            clearCart();
            alert(`Đặt hàng thành công! Mã đơn hàng: BK${orderId.toString().padStart(8, '0')}`);
            navigate('/order-tracking');
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra khi đặt hàng.");
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <Container className="py-5 text-center">
                <h3>Giỏ hàng của bạn đang trống</h3>
                <Link to="/" className="btn btn-primary rounded-pill px-4 mt-3">Quay lại mua sắm</Link>
            </Container>
        );
    }

    return (
        <Container className="py-4 checkout-page">
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/cart">Giỏ hàng</Link></li>
                    <li className="breadcrumb-item active">Thanh toán</li>
                </ol>
            </nav>

            <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                    {/* Bên trái: Thông tin giao hàng */}
                    <Col lg={7}>
                        <Card className="border-0 shadow-sm rounded-4 mb-4">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                    <FiMapPin className="text-primary" /> Thông tin giao hàng
                                </h5>
                                
                                <Row className="g-3">
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Số điện thoại</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                className="bg-light border-0 py-2" 
                                                placeholder="Nhập số điện thoại" 
                                                required
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Email (không bắt buộc)</Form.Label>
                                            <Form.Control 
                                                type="email" 
                                                className="bg-light border-0 py-2" 
                                                placeholder="Nhập email" 
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Địa chỉ</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                className="bg-light border-0 py-2" 
                                                placeholder="Số nhà, tên đường..." 
                                                required
                                                value={formData.address}
                                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Tỉnh/TP</Form.Label>
                                            <Form.Select 
                                                className="bg-light border-0 py-2" 
                                                required
                                                value={formData.province}
                                                onChange={(e) => setFormData({...formData, province: e.target.value})}
                                            >
                                                <option value="">Chọn Tỉnh/TP</option>
                                                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                                                <option value="Hà Nội">Hà Nội</option>
                                                <option value="Đà Nẵng">Đà Nẵng</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Quận/Huyện</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                className="bg-light border-0 py-2" 
                                                required
                                                value={formData.district}
                                                onChange={(e) => setFormData({...formData, district: e.target.value})}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Phường/Xã</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                className="bg-light border-0 py-2" 
                                                required
                                                value={formData.ward}
                                                onChange={(e) => setFormData({...formData, ward: e.target.value})}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <hr className="my-4" />

                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                    <FiTruck className="text-primary" /> Phương thức giao hàng
                                </h5>
                                <div className="p-3 border rounded-3 bg-primary-light border-primary d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-2">
                                        <Form.Check type="radio" checked readOnly />
                                        <span>Giao hàng tận nơi</span>
                                    </div>
                                    <span className="fw-bold">20.000đ</span>
                                </div>

                                <hr className="my-4" />

                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                    <FiCreditCard className="text-primary" /> Phương thức thanh toán
                                </h5>
                                <div className="payment-methods gap-2 d-flex flex-column">
                                    <div className={`p-3 border rounded-3 cursor-pointer ${formData.paymentMethod === 'cod' ? 'border-primary bg-primary-light' : ''}`} onClick={() => setFormData({...formData, paymentMethod: 'cod'})}>
                                        <Form.Check 
                                            type="radio" 
                                            label="Thanh toán khi giao hàng (COD)" 
                                            name="payment" 
                                            checked={formData.paymentMethod === 'cod'}
                                            onChange={() => setFormData({...formData, paymentMethod: 'cod'})}
                                        />
                                    </div>
                                    <div className={`p-3 border rounded-3 cursor-pointer ${formData.paymentMethod === 'bank' ? 'border-primary bg-primary-light' : ''}`} onClick={() => setFormData({...formData, paymentMethod: 'bank'})}>
                                        <Form.Check 
                                            type="radio" 
                                            label="Chuyển khoản qua ngân hàng" 
                                            name="payment" 
                                            checked={formData.paymentMethod === 'bank'}
                                            onChange={() => setFormData({...formData, paymentMethod: 'bank'})}
                                        />
                                    </div>
                                    <div className={`p-3 border rounded-3 cursor-pointer ${formData.paymentMethod === 'bidv' ? 'border-primary bg-primary-light' : ''}`} onClick={() => setFormData({...formData, paymentMethod: 'bidv'})}>
                                        <Form.Check 
                                            type="radio" 
                                            label="Chuyển khoản qua QR-BIDV" 
                                            name="payment" 
                                            checked={formData.paymentMethod === 'bidv'}
                                            onChange={() => setFormData({...formData, paymentMethod: 'bidv'})}
                                        />
                                    </div>
                                </div>

                                <hr className="my-4" />

                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <Form.Check 
                                        type="checkbox" 
                                        label={<span className="fw-bold small">Hóa đơn điện tử</span>}
                                        checked={formData.needsInvoice}
                                        onChange={(e) => setFormData({...formData, needsInvoice: e.target.checked})}
                                    />
                                    <FiFileText className="text-muted" />
                                </div>

                                <Form.Group>
                                    <Form.Label className="small fw-bold d-flex align-items-center gap-2">
                                        <FiMessageSquare /> Ghi chú đơn hàng
                                    </Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={2} 
                                        className="bg-light border-0" 
                                        placeholder="Ví dụ: Giao giờ hành chính..." 
                                        value={formData.note}
                                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Bên phải: Tóm tắt đơn hàng (Hình 2) */}
                    <Col lg={5}>
                        <Card className="border-0 shadow-sm rounded-4 sticky-top" style={{ top: '100px' }}>
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-4">Đơn hàng ({cartItems.length} sản phẩm)</h5>
                                <div className="order-items-scroll mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {cartItems.map(item => (
                                        <div key={item.id} className="d-flex gap-3 mb-3 pb-3 border-bottom align-items-center">
                                            <div className="position-relative">
                                                <img src={item.image} alt={item.name} className="rounded border" style={{ width: '50px', height: '70px', objectFit: 'cover' }} />
                                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary small">
                                                    {item.cartQuantity}
                                                </span>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="fw-bold small">{item.name}</div>
                                                <div className="text-muted small">Tác giả: {item.author}</div>
                                            </div>
                                            <div className="fw-bold small">{(item.price * item.cartQuantity).toLocaleString()}đ</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Tạm tính</span>
                                    <span className="fw-semibold">{subtotal.toLocaleString()}đ</span>
                                </div>
                                <div className="d-flex justify-content-between mb-4">
                                    <span className="text-muted">Phí vận chuyển</span>
                                    <span className="fw-semibold">{shipping.toLocaleString()}đ</span>
                                </div>

                                <hr />

                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <span className="h5 fw-bold mb-0">Tổng cộng:</span>
                                    <span className="h4 fw-bold text-primary mb-0">{total.toLocaleString()}đ</span>
                                </div>

                                <Button 
                                    variant="primary" 
                                    size="lg" 
                                    type="submit"
                                    disabled={loading}
                                    className="w-100 rounded-pill py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                >
                                    {loading ? 'ĐANG XỬ LÝ...' : 'ĐẶT HÀNG NGAY'}
                                </Button>

                                <Link to="/cart" className="btn btn-link w-100 mt-2 text-muted text-decoration-none small">
                                    <FiArrowLeft size={14} className="me-1" /> Quay lại giỏ hàng
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default Checkout;
