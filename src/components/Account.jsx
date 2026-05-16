import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Button, Table, Modal, Form } from 'react-bootstrap';
import { FiUser, FiMapPin, FiPackage, FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { apiService } from '../services/api';

const Account = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchUserOrders = async (userEmail, currentFullName) => {
        if (!userEmail && !currentFullName) {
            setOrders([]);
            return;
        }
        try {
            setLoading(true);
            setOrders([]); // Luôn xóa dữ liệu cũ trước khi tải dữ liệu mới
            const allOrders = await apiService.getOrders();
            console.log("All orders fetched:", allOrders.length);
            console.log("Searching for:", { userEmail, currentFullName });

            // Bộ lọc cực kỳ linh hoạt
            const userOrders = allOrders.filter(o => {
                const orderEmail = (o.customer_email || "").toLowerCase();
                const orderName = (o.customer_name || "").toLowerCase();
                const targetEmail = (userEmail || "").toLowerCase();
                const targetName = (currentFullName || "").toLowerCase();

                return (targetEmail && orderEmail === targetEmail) || 
                       (targetName && orderName === targetName && orderName !== "khách hàng");
            });

            setOrders(userOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            let user = null;
            if (session?.user) {
                user = {
                    full_name: session.user.user_metadata.full_name || session.user.email,
                    username: session.user.email,
                    email: session.user.email
                };
            } else {
                const savedUser = localStorage.getItem('logged_user');
                if (savedUser) user = JSON.parse(savedUser);
            }

            if (!user) {
                navigate('/');
            } else {
                setCurrentUser(user);
                fetchUserOrders(user.username || user.email, user.full_name);
            }
        };
        checkUser();
    }, [navigate]);

    // Gọi lại khi chuyển tab để đảm bảo dữ liệu mới nhất
    useEffect(() => {
        if (currentUser && (activeTab === 'general' || activeTab === 'orders')) {
            fetchUserOrders(currentUser.username || currentUser.email, currentUser.full_name);
        }
    }, [activeTab, currentUser]);

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editAddress, setEditAddress] = useState({
        full_name: '',
        phone: '',
        address_detail: ''
    });

    const handleEditAddress = () => {
        setEditAddress({
            full_name: currentUser.full_name,
            phone: currentUser.phone || '',
            address_detail: currentUser.address_detail || ''
        });
        setShowAddressModal(true);
    };

    const saveAddress = () => {
        const updatedUser = { 
            ...currentUser, 
            full_name: editAddress.full_name,
            phone: editAddress.phone,
            address_detail: editAddress.address_detail
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('logged_user', JSON.stringify(updatedUser));
        setShowAddressModal(false);
        alert("Đã cập nhật địa chỉ thành công!");
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.clear();
        navigate('/');
        window.location.reload();
    };

    if (loading || !currentUser) return <div className="text-center py-5">Đang tải...</div>;

    return (
        <Container className="py-5">
            <Row className="g-4">
                {/* Sidebar */}
                <Col lg={3}>
                    <div className="account-sidebar shadow-sm rounded-3 overflow-hidden bg-white">
                        <div className="account-header p-4 text-white text-center" style={{ background: '#006a31' }}>
                            <div className="avatar-circle mb-3 mx-auto d-flex align-items-center justify-content-center bg-white text-success rounded-circle" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                                <FiUser />
                            </div>
                            <div className="small opacity-75">Tài khoản của</div>
                            <div className="fw-bold fs-5">{currentUser.full_name}</div>
                        </div>
                        <Nav className="flex-column p-2 admin-tabs">
                            <Nav.Link 
                                className={`d-flex align-items-center gap-2 py-3 px-4 ${activeTab === 'general' ? 'active' : ''}`}
                                onClick={() => setActiveTab('general')}
                            >
                                <FiUser /> Thông tin chung
                            </Nav.Link>
                            <Nav.Link 
                                className={`d-flex align-items-center gap-2 py-3 px-4 ${activeTab === 'address' ? 'active' : ''}`}
                                onClick={() => setActiveTab('address')}
                            >
                                <FiMapPin /> Sổ địa chỉ
                            </Nav.Link>
                            <Nav.Link 
                                className={`d-flex align-items-center gap-2 py-3 px-4 ${activeTab === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                <FiPackage /> Đơn hàng của tôi
                            </Nav.Link>
                        </Nav>
                    </div>
                </Col>

                {/* Main Content */}
                <Col lg={9}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold text-uppercase m-0">Bảng thông tin của tôi</h4>
                        <Button variant="link" className="text-dark text-decoration-none small" onClick={handleLogout}>
                            Đăng xuất
                        </Button>
                    </div>

                    <Card className="border-0 shadow-sm rounded-3 mb-4">
                        <Card.Body className="p-4">
                            {activeTab === 'general' && (
                                <>
                                    <h6 className="fw-bold mb-4 border-bottom pb-2">Thông tin tài khoản</h6>
                                    <div className="bg-light p-4 rounded-3 mb-5" style={{ maxWidth: '600px' }}>
                                        <Row className="mb-3">
                                            <Col sm={4} className="text-muted">Họ và tên:</Col>
                                            <Col sm={8} className="fw-bold">{currentUser.full_name}</Col>
                                        </Row>
                                        <Row>
                                            <Col sm={4} className="text-muted">Email:</Col>
                                            <Col sm={8} className="fw-bold">{currentUser.username || currentUser.email}</Col>
                                        </Row>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="fw-bold m-0 d-flex align-items-center gap-2">
                                            Các đơn hàng vừa đặt 
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm" 
                                                className="rounded-circle p-0 d-flex align-items-center justify-content-center" 
                                                style={{ width: '24px', height: '24px' }}
                                                onClick={() => fetchUserOrders(currentUser.username || currentUser.email, currentUser.full_name)}
                                                title="Làm mới"
                                            >
                                                <FiPackage size={12} />
                                            </Button>
                                        </h6>
                                        <Button variant="link" className="text-primary text-decoration-none small" onClick={() => setActiveTab('orders')}>Xem tất cả</Button>
                                    </div>
                                    
                                    {orders.length === 0 ? (
                                        <div className="text-muted italic mb-5">Bạn chưa đặt mua sản phẩm nào!...</div>
                                    ) : (
                                        <Table responsive hover className="small mb-5">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>Mã đơn</th>
                                                    <th>Ngày đặt</th>
                                                    <th>Sản phẩm</th>
                                                    <th>Tổng tiền</th>
                                                    <th>Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.slice(0, 3).map(order => (
                                                    <tr key={order.id} className="align-middle">
                                                        <td className="fw-bold text-primary">BK{order.id.toString().padStart(8, '0')}</td>
                                                        <td className="small">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                                                        <td>
                                                            <div className="d-flex gap-1 overflow-hidden" style={{ maxWidth: '120px' }}>
                                                                {order.items && order.items.slice(0, 3).map((item, idx) => (
                                                                    <img key={idx} src={item.image} alt="" title={item.name} className="rounded border shadow-sm" style={{ width: '25px', height: '35px', objectFit: 'cover' }} />
                                                                ))}
                                                                {order.items && order.items.length > 3 && <span className="small text-muted">+{order.items.length - 3}</span>}
                                                            </div>
                                                        </td>
                                                        <td className="fw-bold small">{Number(order.total_amount).toLocaleString()}đ</td>
                                                        <td>
                                                            <span className={`badge rounded-pill ${order.status === 'pending' ? 'bg-warning' : 'bg-success'}`}>
                                                                {order.status === 'pending' ? 'Chờ xử lý' : order.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}

                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="fw-bold m-0">Sổ địa chỉ</h6>
                                        <Button variant="link" className="text-primary text-decoration-none small" onClick={() => setActiveTab('address')}>Xem tất cả <FiChevronRight /></Button>
                                    </div>
                                    <div className="p-4 border border-success border-dashed rounded-3 position-relative" style={{ borderStyle: 'dashed' }}>
                                        <span className="position-absolute top-0 end-0 m-3 text-success small fw-bold">Mặc định</span>
                                        <div className="fw-bold mb-1 fs-5">{currentUser.full_name}</div>
                                        <div className="text-muted small mb-1">Địa chỉ: {currentUser.address_detail || 'Chưa cập nhật'}, Vietnam</div>
                                        <div className="text-muted small mb-3">Điện thoại: {currentUser.phone || 'Chưa cập nhật'}</div>
                                        <div className="d-flex gap-2">
                                            <Button variant="outline-secondary" size="sm" className="px-3" onClick={handleEditAddress}>Sửa</Button>
                                            <Button variant="outline-danger" size="sm" className="px-3">Xóa</Button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'address' && (
                                <div>
                                    <h6 className="fw-bold mb-4 border-bottom pb-2">Sổ địa chỉ</h6>
                                    <Button variant="primary" className="rounded-pill mb-4 px-4">+ Thêm địa chỉ mới</Button>
                                    <div className="p-4 border rounded-3 bg-light mb-3">
                                        <div className="fw-bold mb-1">{currentUser.full_name}</div>
                                        <div className="text-muted small">Địa chỉ: {currentUser.address_detail || 'Chưa cập nhật'}</div>
                                        <div className="text-muted small mb-3">Điện thoại: {currentUser.phone || 'Chưa cập nhật'}</div>
                                        <Button variant="link" className="p-0 text-primary text-decoration-none small" onClick={handleEditAddress}>Chỉnh sửa</Button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'orders' && (
                                <div>
                                    <h6 className="fw-bold mb-4 border-bottom pb-2">Đơn hàng của tôi</h6>
                                    <Table responsive hover>
                                        <thead className="bg-light">
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Ngày đặt</th>
                                                <th>Sản phẩm</th>
                                                <th>Tổng tiền</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order.id} className="align-middle">
                                                    <td className="fw-bold text-primary">BK{order.id.toString().padStart(8, '0')}</td>
                                                    <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="d-flex gap-1">
                                                                {order.items && order.items.slice(0, 3).map((item, idx) => (
                                                                    <img key={idx} src={item.image} alt="" className="rounded border shadow-sm" style={{ width: '30px', height: '40px', objectFit: 'cover' }} />
                                                                ))}
                                                            </div>
                                                            <div className="small text-muted">
                                                                {order.items && order.items.length > 0 ? (
                                                                    order.items.length === 1 ? order.items[0].name : `${order.items[0].name} và ${order.items.length - 1} sản phẩm khác`
                                                                ) : 'Không có sản phẩm'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="fw-bold">{Number(order.total_amount).toLocaleString()}đ</td>
                                                    <td>
                                                        <span className={`badge rounded-pill ${order.status === 'pending' ? 'bg-warning' : 'bg-success'}`}>
                                                            {order.status === 'pending' ? 'Chờ xử lý' : order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal Sửa địa chỉ */}
            <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Chỉnh sửa địa chỉ</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Họ và tên</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={editAddress.full_name} 
                                onChange={(e) => setEditAddress({...editAddress, full_name: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Số điện thoại</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={editAddress.phone} 
                                onChange={(e) => setEditAddress({...editAddress, phone: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Địa chỉ chi tiết</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3}
                                value={editAddress.address_detail} 
                                onChange={(e) => setEditAddress({...editAddress, address_detail: e.target.value})}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddressModal(false)}>Hủy</Button>
                    <Button variant="primary" onClick={saveAddress}>Lưu thay đổi</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Account;
