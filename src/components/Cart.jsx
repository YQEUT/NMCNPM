import React from 'react';
import { Container, Table, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingCart, FiCreditCard, FiTruck } from 'react-icons/fi';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
    const navigate = useNavigate();

    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
    const shipping = subtotal > 0 ? 30000 : 0;
    const total = subtotal + shipping;


    if (cartItems.length === 0) {
        return (
            <Container className="py-5 text-center">
                <div className="empty-cart-wrapper py-5 bg-white rounded-4 shadow-sm">
                    <FiShoppingCart size={80} className="text-muted mb-4" />
                    <h2 className="fw-bold mb-3">Giỏ hàng của bạn đang trống</h2>
                    <p className="text-muted mb-4 lead">Hãy quay lại trang chủ và chọn cho mình những cuốn sách yêu thích nhé!</p>
                    <Link to="/" className="btn btn-primary btn-lg rounded-pill px-5">
                        <FiArrowLeft className="me-2" /> Tiếp tục mua sắm
                    </Link>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <FiShoppingCart className="text-primary" /> Giỏ hàng của bạn
                <span className="badge bg-primary-light text-primary rounded-pill small ms-2" style={{ fontSize: '1rem' }}>
                    {cartItems.length} sản phẩm
                </span>
            </h2>

            <Row className="g-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                        <Table hover responsive className="cart-table m-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4 py-3">Sản phẩm</th>
                                    <th className="py-3">Giá tiền</th>
                                    <th className="py-3">Số lượng</th>
                                    <th className="py-3">Thành tiền</th>
                                    <th className="pe-4 py-3 text-end"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map(item => (
                                    <tr key={item.id} className="align-middle">
                                        <td className="ps-4 py-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <img src={item.image} alt={item.name} className="rounded-3 shadow-sm" style={{ width: '60px', height: '80px', objectFit: 'cover' }} />
                                                <div>
                                                    <div className="fw-bold text-dark">{item.name}</div>
                                                    <div className="text-muted small">{item.author}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-primary">{Number(item.price).toLocaleString()}đ</div>
                                            {item.discount > 0 && (
                                                <div className="text-muted small text-decoration-line-through">{Number(item.original_price).toLocaleString()}đ</div>
                                            )}
                                        </td>
                                        <td>
                                            <div className="quantity-control d-flex align-items-center border rounded-pill p-1" style={{ width: 'fit-content' }}>
                                                <Button 
                                                    variant="link" 
                                                    className="text-dark p-0 px-2" 
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                >
                                                    <FiMinus size={14} />
                                                </Button>
                                                <span className="fw-bold px-2" style={{ minWidth: '30px', textAlign: 'center' }}>{item.cartQuantity}</span>
                                                <Button 
                                                    variant="link" 
                                                    className="text-dark p-0 px-2" 
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                >
                                                    <FiPlus size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                        <td className="fw-bold text-dark">
                                            {(item.price * item.cartQuantity).toLocaleString()}đ
                                        </td>
                                        <td className="pe-4 text-end">
                                            <Button 
                                                variant="light" 
                                                className="rounded-circle text-danger p-2" 
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                <FiTrash2 size={18} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Card.Footer className="bg-white border-0 p-3 text-end pe-4">
                            <Button variant="link" className="text-danger text-decoration-none fw-bold" onClick={clearCart}>
                                <FiTrash2 className="me-1" /> Xóa toàn bộ giỏ hàng
                            </Button>
                        </Card.Footer>
                    </Card>

                    <Link to="/" className="btn btn-outline-primary rounded-pill px-4">
                        <FiArrowLeft className="me-2" /> Tiếp tục mua sắm
                    </Link>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-sm rounded-4 p-3 summary-card bg-white sticky-top" style={{ top: '100px' }}>
                        <h4 className="fw-bold mb-4">Chi tiết thanh toán</h4>
                        
                        <div className="d-flex justify-content-between mb-3">
                            <span className="text-muted">Tạm tính ({cartItems.length} sản phẩm)</span>
                            <span className="fw-semibold">{subtotal.toLocaleString()}đ</span>
                        </div>
                        
                        <div className="d-flex justify-content-between mb-3">
                            <span className="text-muted">Phí vận chuyển</span>
                            <span className="fw-semibold text-success">{shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString()}đ`}</span>
                        </div>

                        {shipping > 0 && (
                            <Alert variant="info" className="py-2 small border-0 rounded-3 mb-3">
                                <FiTruck className="me-2" /> Mua thêm <b>{(500000 - subtotal > 0 ? (500000 - subtotal).toLocaleString() : 0)}đ</b> để được miễn phí vận chuyển!
                            </Alert>
                        )}

                        <hr className="my-4" />

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="h5 fw-bold mb-0">Tổng cộng:</span>
                            <span className="h4 fw-bold text-primary mb-0">{total.toLocaleString()}đ</span>
                        </div>

                        <div className="d-grid gap-2">
                            <Button 
                                variant="primary" 
                                size="lg" 
                                className="rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                                onClick={() => navigate('/checkout')}
                            >
                                <FiCreditCard /> THANH TOÁN NGAY
                            </Button>
                            <div className="text-center mt-2 small text-muted">
                                <span className="d-block mb-2">Đảm bảo thanh toán an toàn 100%</span>
                                <div className="d-flex justify-content-center gap-3 align-items-center opacity-75">
                                    <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="momo" height="22" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" alt="paypal" height="18" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="visa" height="15" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="mastercard" height="20" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

        </Container>
    );
};

export default Cart;
