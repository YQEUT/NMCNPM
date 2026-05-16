import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Button, Table } from 'react-bootstrap';
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
        if (!userEmail && !currentFullName) return;
        try {
            setLoading(true);
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
    }, [activeTab]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('logged_user');
        navigate('/');
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
                                        <h6 className="fw-bold m-0">Các đơn hàng vừa đặt</h6>
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
                                                    <th>Tổng tiền</th>
                                                    <th>Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.slice(0, 3).map(order => (
                                                    <tr key={order.id}>
                                                        <td className="fw-bold text-primary">BK{order.id.toString().padStart(8, '0')}</td>
                                                        <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                                                        <td>{Number(order.total_amount).toLocaleString()}đ</td>
                                                        <td>{order.status}</td>
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
                                        <div className="text-muted small mb-1">Địa chỉ: , Vietnam</div>
                                        <div className="text-muted small mb-3">Điện thoại: </div>
                                        <div className="d-flex gap-2">
                                            <Button variant="outline-secondary" size="sm" className="px-3">Sửa</Button>
                                            <Button variant="outline-danger" size="sm" className="px-3">Xóa</Button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'address' && (
                                <div>
                                    <h6 className="fw-bold mb-4 border-bottom pb-2">Sổ địa chỉ</h6>
                                    <Button variant="primary" className="rounded-pill mb-4 px-4">+ Thêm địa chỉ mới</Button>
                                    {/* Danh sách địa chỉ tương tự như phần trên */}
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
                                                <tr key={order.id}>
                                                    <td className="fw-bold text-primary">BK{order.id.toString().padStart(8, '0')}</td>
                                                    <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                                                    <td className="small">
                                                        {order.items.map(i => i.name).join(', ').substring(0, 30)}...
                                                    </td>
                                                    <td className="fw-bold">{Number(order.total_amount).toLocaleString()}đ</td>
                                                    <td>{order.status}</td>
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
        </Container>
    );
};

export default Account;
