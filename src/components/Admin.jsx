import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Form, Modal, Row, Col, Alert, Tabs, Tab, Card } from 'react-bootstrap';
import { apiService } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiBox, FiGrid, FiBarChart2, FiUsers, FiRefreshCw } from 'react-icons/fi';

const Admin = () => {
    const [categories, setCategories] = useState({});
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [mainTab, setMainTab] = useState('products');
    const [activeCat, setActiveCat] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentBook, setCurrentBook] = useState(null);
    const [formData, setFormData] = useState({
        name: '', author: '', publisher: '', year: '', original_price: '',
        discount: '', quantity: '', image: '', description: ''
    });
    const [msg, setMsg] = useState('');
    const [imgError, setImgError] = useState('');
    const [targetCategories, setTargetCategories] = useState([]);
    const [customerSearch, setCustomerSearch] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const [catData, userData, orderData] = await Promise.all([
                apiService.getCategories(),
                apiService.getUsers(),
                apiService.getOrders()
            ]);
            
            setCategories(catData);
            setUsers(userData);
            setOrders(orderData);
            
            if (!activeCat) {
                const firstCat = Object.keys(catData)[0];
                if (firstCat) setActiveCat(firstCat);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [activeCat]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleShow = (book = null, cat = activeCat) => {
        if (book) {
            setCurrentBook(book);
            // Tìm tất cả các danh mục mà cuốn sách này đang xuất hiện
            const belongsTo = Object.keys(categories).filter(key => 
                categories[key].some(b => b.id === book.id)
            );
            setTargetCategories(belongsTo);
            
            setFormData({ 
                name: book.name || '',
                author: book.author || '',
                publisher: book.publisher || '',
                year: book.year || '',
                original_price: book.original_price || book.price || '',
                discount: book.discount || 0,
                quantity: book.quantity || 0,
                image: book.image || '',
                description: book.description || ''
            });
        } else {
            setCurrentBook(null);
            setTargetCategories([cat]); // Mặc định là danh mục đang xem
            setFormData({ name: '', author: '', publisher: '', year: '', original_price: '', discount: 0, quantity: 0, image: '', description: '' });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (targetCategories.length === 0) {
            alert("Vui lòng chọn ít nhất một danh mục!");
            return;
        }

        // Kiểm tra link ảnh
        if (formData.image && formData.image.startsWith('data:')) {
            setImgError('⚠️ Vui lòng nhập link URL ảnh, không dùng base64!');
            return;
        }
        setImgError('');

        try {
            const origPrice = Number(formData.original_price);
            const disc = Number(formData.discount);
            const sellingPrice = Math.round(origPrice * (1 - disc / 100));

            const bookData = {
                ...(currentBook?.id ? { id: currentBook.id } : {}),
                name: formData.name,
                author: formData.author,
                publisher: formData.publisher,
                year: formData.year ? Number(formData.year) : null,
                original_price: origPrice,
                discount: disc,
                price: sellingPrice,
                quantity: Number(formData.quantity),
                image: formData.image,
                description: formData.description
            };

            await apiService.upsertProduct(bookData, targetCategories);
            
            setMsg('Cập nhật thành công!');
            setShowModal(false);
            fetchData();
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra!");
        }
    };

    const handleDelete = async (bookId) => {
        if (window.confirm('Xóa sản phẩm này khỏi hệ thống?')) {
            try {
                await apiService.deleteProduct(bookId);
                fetchData();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleDeleteUser = async (userId, fullName) => {
        if (window.confirm(`Bạn có chắc muốn xóa người dùng "${fullName}"? Hành động này không thể hoàn tác.`)) {
            try {
                await apiService.deleteUser(userId);
                setMsg(`Đã xóa người dùng ${fullName}`);
                fetchData();
                setTimeout(() => setMsg(''), 3000);
            } catch (error) {
                console.error(error);
                alert("Không thể xóa người dùng này!");
            }
        }
    };

    const handleToggleRole = async (user) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        if (window.confirm(`Thay đổi vai trò của ${user.full_name} thành ${newRole === 'admin' ? 'Quản trị' : 'Khách hàng'}?`)) {
            try {
                await apiService.updateUser(user.id, { role: newRole });
                setMsg(`Đã cập nhật vai trò cho ${user.full_name}`);
                fetchData();
                setTimeout(() => setMsg(''), 3000);
            } catch (error) {
                console.error(error);
                alert("Không thể cập nhật vai trò!");
            }
        }
    };

    // Stats calculation
    const totalBooks = Object.values(categories).reduce((acc, curr) => acc + curr.length, 0);

    // Mapping category keys to Vietnamese names
    const categoryMap = {
        sach_mam_non: "Sách Mầm Non",
        sach_thieu_nhi: "Sách Thiếu Nhi",
        sach_ki_nang: "Sách Kĩ Năng",
        sach_kinh_doanh: "Sách Kinh Doanh",
        sach_me_va_be: "Sách Mẹ và Bé",
        sach_van_hoc: "Sách Văn Học",
        sach_tham_khao: "Sách Tham Khảo",
        notebook: "Note Book",
        top_best_seller: "Bán Chạy Nhất",
        sach_moi: "Sách Mới",
        sach_sap_phat_hanh: "Sắp Phát Hành"
    };

    // Form calculation for display
    const calculatedPrice = Math.round(Number(formData.original_price) * (1 - Number(formData.discount) / 100));

    return (
        <Container className="py-4 admin-dashboard">
            {/* Header Area */}
            <div className="admin-header mb-4">
                <div>
                    <h2 className="fw-bold m-0">Hệ Thống Quản Trị</h2>
                    <p className="text-muted">Quản lý kho sách và nội dung hiển thị</p>
                </div>
                <Button variant="primary" onClick={() => handleShow()} className="rounded-pill px-4 shadow-sm">
                    <FiPlus className="me-2" /> Thêm Sách Mới
                </Button>
            </div>

            {/* Stats Overview */}
            <Row className="mb-4 g-3">
                <Col md={3}>
                    <Card className="border-0 shadow-sm rounded-4 stats-card h-100">
                        <Card.Body className="d-flex align-items-center gap-3">
                            <div className="stats-icon bg-primary-light text-primary"><FiBox /></div>
                            <div>
                                <div className="text-muted small">Tổng số sách</div>
                                <div className="h4 fw-bold m-0">{totalBooks}</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm rounded-4 stats-card h-100">
                        <Card.Body className="d-flex align-items-center gap-3">
                            <div className="stats-icon bg-success-light text-success"><FiGrid /></div>
                            <div>
                                <div className="text-muted small">Danh mục</div>
                                <div className="h4 fw-bold m-0">{Object.keys(categories).length}</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm rounded-4 stats-card h-100">
                        <Card.Body className="d-flex align-items-center gap-3">
                            <div className="stats-icon bg-info-light text-info"><FiUsers /></div>
                            <div>
                                <div className="text-muted small">Khách hàng</div>
                                <div className="h4 fw-bold m-0">{users.length}</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm rounded-4 stats-card h-100">
                        <Card.Body className="d-flex align-items-center gap-3">
                            <div className="stats-icon bg-warning-light text-warning"><FiBarChart2 /></div>
                            <div>
                                <div className="text-muted small">Hệ thống</div>
                                <div className="h4 fw-bold m-0 text-success">Online</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {msg && <Alert variant="success" className="border-0 shadow-sm">{msg}</Alert>}

            {/* Main Navigation Tabs */}
            <Tabs
                activeKey={mainTab}
                onSelect={(k) => setMainTab(k)}
                className="main-admin-tabs mb-4 border-0"
            >
                <Tab eventKey="products" title={<span><FiBox className="me-2"/>Sản phẩm</span>} />
                <Tab eventKey="orders" title={<span><FiGrid className="me-2"/>Đơn hàng</span>} />
                <Tab eventKey="customers" title={<span><FiUsers className="me-2"/>Khách hàng</span>} />
            </Tabs>

            {mainTab === 'products' && (
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                    <Card.Header className="bg-white border-0 pt-3">
                        <Tabs
                            activeKey={activeCat}
                            onSelect={(k) => setActiveCat(k)}
                            className="admin-tabs border-0 overflow-auto flex-nowrap"
                        >
                            {Object.keys(categories).map(catKey => (
                                <Tab 
                                    key={catKey} 
                                    eventKey={catKey} 
                                    title={categoryMap[catKey] || catKey}
                                />
                            ))}
                        </Tabs>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <Table hover className="admin-table m-0">
                            <thead>
                                <tr>
                                    <th className="ps-4">Sản phẩm</th>
                                    <th>Tác giả</th>
                                    <th>Số lượng</th>
                                    <th>Giá bán</th>
                                    <th className="text-end pe-4">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories[activeCat]?.map(book => (
                                    <tr key={book.id} className="align-middle">
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <img src={book.image} alt="" className="rounded-2" style={{ width: '45px', height: '60px', objectFit: 'cover' }} />
                                                <div className="fw-semibold">{book.name}</div>
                                            </div>
                                        </td>
                                        <td className="text-muted">{book.author}</td>
                                        <td><span className={`badge ${book.quantity > 0 ? 'bg-light text-dark' : 'bg-danger-subtle text-danger'}`}>{book.quantity || 0}</span></td>
                                        <td className="fw-bold text-primary">{Number(book.price).toLocaleString()}đ</td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <Button variant="light" size="sm" className="rounded-circle btn-icon" onClick={() => handleShow(book, activeCat)}>
                                                    <FiEdit2 size={14} className="text-primary" />
                                                </Button>
                                                <Button variant="light" size="sm" className="rounded-circle btn-icon" onClick={() => handleDelete(book.id)}>
                                                    <FiTrash2 size={14} className="text-danger" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            {mainTab === 'orders' && (
                <Card className="border-0 shadow-sm rounded-4">
                    <Card.Body className="p-0">
                        <Table hover className="admin-table m-0">
                            <thead>
                                <tr>
                                    <th className="ps-4">Mã đơn</th>
                                    <th>Khách hàng</th>
                                    <th>Ngày đặt</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} className="align-middle">
                                        <td className="ps-4 fw-bold text-muted">#{order.id}</td>
                                        <td>
                                            <div className="fw-semibold">{order.customer_name}</div>
                                            <div className="small text-muted">{order.customer_phone}</div>
                                        </td>
                                        <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td className="fw-bold text-primary">{Number(order.total_amount).toLocaleString()}đ</td>
                                        <td>
                                            <span className={`badge ${order.status === 'pending' ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'}`}>
                                                {order.status === 'pending' ? 'Chờ xử lý' : 'Hoàn thành'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && <tr><td colSpan="5" className="text-center py-4">Chưa có đơn hàng nào</td></tr>}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            {mainTab === 'customers' && (
                <Card className="border-0 shadow-sm rounded-4">
                    <Card.Header className="bg-white border-0 py-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold m-0">Danh sách khách hàng</h5>
                            <div className="d-flex gap-2">
                                <Form.Control 
                                    type="text" 
                                    placeholder="Tìm tên hoặc email..." 
                                    className="rounded-pill border-0 bg-light px-3 shadow-none" 
                                    style={{ width: '250px' }}
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                />
                                <Button variant="light" className="rounded-circle btn-icon" onClick={fetchData}>
                                    <FiRefreshCw size={14} />
                                </Button>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <Table hover className="admin-table m-0">
                            <thead>
                                <tr>
                                    <th className="ps-4">Khách hàng</th>
                                    <th>Email/Username</th>
                                    <th>Vai trò</th>
                                    <th>Ngày tham gia</th>
                                    <th className="text-end pe-4">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.filter(u => 
                                    u.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                    u.username.toLowerCase().includes(customerSearch.toLowerCase())
                                ).map(user => (
                                    <tr key={user.id} className="align-middle">
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="avatar-small bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                                                    {user.full_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="fw-semibold">{user.full_name}</div>
                                            </div>
                                        </td>
                                        <td className="text-muted">{user.username}</td>
                                        <td>
                                            <span 
                                                className={`badge cursor-pointer ${user.role === 'admin' ? 'bg-danger-subtle text-danger' : 'bg-info-subtle text-info'}`}
                                                onClick={() => handleToggleRole(user)}
                                                title="Nhấn để đổi quyền"
                                            >
                                                {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                                            </span>
                                        </td>
                                        <td className="small">{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td className="text-end pe-4">
                                            <Button 
                                                variant="light" 
                                                size="sm" 
                                                className="rounded-circle btn-icon" 
                                                onClick={() => handleDeleteUser(user.id, user.full_name)}
                                                disabled={user.role === 'admin'} // Tránh tự xóa admin hoặc admin xóa nhau dễ dàng
                                            >
                                                <FiTrash2 size={14} className="text-danger" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            {/* Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered className="admin-modal">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">{currentBook ? 'Cập Nhật Sách' : 'Thêm Sách Mới'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 pb-4">
                    <Form>
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Tên Sản Phẩm</Form.Label>
                                    <Form.Control type="text" className="bg-light border-0" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Danh Mục (Chọn nhiều)</Form.Label>
                                    <div className="d-flex flex-wrap gap-2 p-3 bg-light rounded-3">
                                        {Object.keys(categoryMap).map(key => (
                                            <Form.Check 
                                                key={key}
                                                type="checkbox"
                                                id={`check-${key}`}
                                                label={categoryMap[key]}
                                                className="me-3 mb-2"
                                                checked={targetCategories.includes(key)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setTargetCategories([...targetCategories, key]);
                                                    } else {
                                                        setTargetCategories(targetCategories.filter(item => item !== key));
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Tác Giả</Form.Label>
                                    <Form.Control type="text" className="bg-light border-0" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Số Lượng Trong Kho</Form.Label>
                                    <Form.Control type="number" className="bg-light border-0" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
                                </Form.Group>
                            </Col>
                            <Col md={8}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Nhà Xuất Bản</Form.Label>
                                    <Form.Control type="text" className="bg-light border-0" placeholder="VD: NXB Kim Đồng" value={formData.publisher} onChange={(e) => setFormData({...formData, publisher: e.target.value})} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Năm Xuất Bản</Form.Label>
                                    <Form.Control type="number" className="bg-light border-0" placeholder="VD: 2024" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Giá Gốc (VNĐ)</Form.Label>
                                    <Form.Control type="number" className="bg-light border-0" value={formData.original_price} onChange={(e) => setFormData({...formData, original_price: e.target.value})} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Giảm Giá (%)</Form.Label>
                                    <Form.Control type="number" className="bg-light border-0" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Giá Sau Giảm (Dự kiến)</Form.Label>
                                    <div className="h5 fw-bold text-primary mt-1">{calculatedPrice.toLocaleString()}đ</div>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Mô Tả Sản Phẩm</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={4} 
                                        className="bg-light border-0" 
                                        placeholder="Nhập nội dung giới thiệu sách..." 
                                        value={formData.description} 
                                        onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Link Ảnh (URL)</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        className={`bg-light border-0 ${imgError ? 'is-invalid' : ''}`}
                                        placeholder="VD: https://images.unsplash.com/photo-xxx"
                                        value={formData.image} 
                                        onChange={(e) => { setImgError(''); setFormData({...formData, image: e.target.value}); }} 
                                    />
                                    {imgError && <div className="text-danger small mt-1">{imgError}</div>}
                                    {formData.image && formData.image.startsWith('http') && (
                                        <img src={formData.image} alt="preview" className="mt-2 rounded-2" style={{ height: '60px', objectFit: 'cover' }} />
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={() => setShowModal(false)} className="rounded-pill px-4">Hủy</Button>
                    <Button variant="primary" onClick={handleSave} className="rounded-pill px-4">Lưu Dữ Liệu</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Admin;
