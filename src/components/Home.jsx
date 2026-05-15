import React, { useState, useEffect } from 'react';
import { Row, Col, Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
    FiArrowRight, 
    FiBookOpen, 
    FiStar, 
    FiTrendingUp, 
    FiEdit3, 
    FiBriefcase, 
    FiHeart, 
    FiLayers,
    FiShoppingCart,
    FiCalendar,
    FiHome,
    FiCheckCircle
} from 'react-icons/fi';

import { useCart } from '../context/CartContext';
import { apiService } from '../services/api';

const Home = () => {
    const { addToCart } = useCart();
    const [allCategories, setAllCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [addedToCart, setAddedToCart] = useState(false);

    const categoryMap = {
        sach_mam_non: { title: "Sách Mầm Non", icon: <FiLayers className="text-primary" /> },
        sach_thieu_nhi: { title: "Sách Thiếu Nhi", icon: <FiBookOpen className="text-success" /> },
        sach_ki_nang: { title: "Sách Kĩ Năng", icon: <FiStar className="text-warning" /> },
        sach_kinh_doanh: { title: "Sách Kinh Doanh", icon: <FiBriefcase className="text-info" /> },
        sach_me_va_be: { title: "Sách Mẹ và Bé", icon: <FiHeart className="text-danger" /> },
        sach_van_hoc: { title: "Sách Văn Học", icon: <FiEdit3 className="text-secondary" /> },
        sach_tham_khao: { title: "Sách Tham Khảo", icon: <FiLayers className="text-dark" /> },
        notebook: { title: "Note Book", icon: <FiEdit3 className="text-primary" /> },
        top_best_seller: { title: "Bán Chạy Nhất", icon: <FiTrendingUp className="text-danger" /> },
        sach_moi: { title: "Sách Mới Phát Hành", icon: <FiStar className="text-primary" /> },
        sach_sap_phat_hanh: { title: "Sắp Phát Hành", icon: <FiArrowRight className="text-muted" /> }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await apiService.getCategories();
                setAllCategories(data);
            } catch (error) {
                console.error("Error fetching books:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleShowDetail = (book) => {
        setSelectedBook(book);
        setShowModal(true);
    };

    const featuredCategories = [
        { name: 'Sách Mầm Non', icon: <FiLayers />, color: '#3b82f6', link: '/category/sach_mam_non' },
        { name: 'Thiếu Nhi', icon: <FiBookOpen />, color: '#10b981', link: '/category/sach_thieu_nhi' },
        { name: 'Kĩ Năng', icon: <FiStar />, color: '#f59e0b', link: '/category/sach_ki_nang' },
        { name: 'Kinh Doanh', icon: <FiBriefcase />, color: '#6366f1', link: '/category/sach_kinh_doanh' },
        { name: 'Mẹ và Bé', icon: <FiHeart />, color: '#ec4899', link: '/category/sach_me_va_be' },
        { name: 'Văn Học', icon: <FiEdit3 />, color: '#8b5cf6', link: '/category/sach_van_hoc' },
    ];

    if (loading) return <div className="text-center py-5">Đang tải dữ liệu...</div>;

    return (
        <main className="py-4">
            {/* Hero Section */}
            <section className="hero-section">
                <img 
                    src="/images/bookstore_hero_banner_1778523261921.png" 
                    alt="Hero Banner" 
                    className="hero-img"
                />
                <div className="hero-content">
                    <h1>Khám Phá Thế Giới Qua Từng Trang Sách</h1>
                    <p className="lead mb-4">Hàng ngàn đầu sách mới nhất đang chờ đón bạn với ưu đãi lên đến 50%.</p>
                    <Link to="/shop" className="btn-primary-custom">
                        Mua Ngay <FiArrowRight className="ms-2" />
                    </Link>
                </div>
            </section>

            {/* Icons Grid */}
            <section className="mb-5">
                <div className="section-title">
                    <h2>Danh Mục Nổi Bật</h2>
                </div>
                <div className="category-grid">
                    {featuredCategories.map((cat, index) => (
                        <Link key={index} to={cat.link} className="category-card">
                            <div className="category-icon" style={{ color: cat.color, background: `${cat.color}15` }}>
                                {cat.icon}
                            </div>
                            <span>{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Dynamic Sections for Featured Categories */}
            {Object.keys(allCategories)
                .filter(catKey => [
                    'top_best_seller', 
                    'sach_moi', 
                    'sach_thieu_nhi', 
                    'sach_ki_nang', 
                    'sach_van_hoc'
                ].includes(catKey))
                .map(catKey => {
                    const books = allCategories[catKey];
                    if (!books || books.length === 0) return null;

                    const catInfo = categoryMap[catKey] || { title: catKey, icon: <FiLayers /> };

                    return (
                        <section key={catKey} className="books-row mb-5">
                            <div className="section-title d-flex justify-content-between align-items-center mb-4">
                                <h2 className="m-0 d-flex align-items-center">
                                    <span className="me-2">{catInfo.icon}</span>
                                    {catInfo.title}
                                </h2>
                                <Link to={`/category/${catKey}`} className="text-primary text-decoration-none fw-bold small">
                                    Xem tất cả <FiArrowRight />
                                </Link>
                            </div>
                            <Row className="g-4">
                                {books.slice(0, 6).map(book => (
                                    <Col key={book.id} xs={6} md={4} lg={2}>
                                        <div 
                                            className="book-card h-100 shadow-sm border-0 rounded-3 overflow-hidden cursor-pointer"
                                            onClick={() => handleShowDetail(book)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="book-img-wrapper position-relative">
                                                <img src={book.image} alt={book.name} className="book-img w-100" style={{ height: '220px', objectFit: 'cover' }} />
                                                {book.discount > 0 && (
                                                    <div className="discount-badge bg-danger text-white position-absolute top-0 end-0 m-2 px-2 py-1 rounded-2 small fw-bold">
                                                        -{book.discount}%
                                                    </div>
                                                )}
                                            </div>
                                            <div className="book-info p-3">
                                                <h3 className="book-title h6 text-truncate mb-1">{book.name}</h3>
                                                <p className="book-author text-muted small mb-2">{book.author}</p>
                                                <div className="price-wrapper d-flex align-items-center gap-2">
                                                    <span className="current-price fw-bold text-primary">{Number(book.price).toLocaleString()}đ</span>
                                                    {book.original_price > book.price && (
                                                        <span className="old-price text-muted text-decoration-line-through smaller">
                                                            {Number(book.original_price).toLocaleString()}đ
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </section>
                    );
                })}

            {/* Product Detail Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered className="product-detail-modal">
                {selectedBook && (
                    <Modal.Body className="p-0 overflow-hidden rounded-4">
                        <Row className="g-0">
                            <Col md={5} className="bg-light d-flex align-items-center justify-content-center p-4">
                                <img 
                                    src={selectedBook.image} 
                                    alt={selectedBook.name} 
                                    className="img-fluid rounded-3 shadow-lg" 
                                    style={{ maxHeight: '400px', width: 'auto', objectFit: 'contain' }}
                                />
                            </Col>
                            <Col md={7} className="p-4 p-lg-5 bg-white position-relative">
                                <button 
                                    className="btn-close position-absolute top-0 end-0 m-3" 
                                    onClick={() => setShowModal(false)}
                                ></button>
                                
                                <div className="mb-4">
                                    <span className="badge bg-primary-subtle text-primary mb-2 rounded-pill">Thông tin sản phẩm</span>
                                    <h2 className="fw-bold mb-1 text-dark">{selectedBook.name}</h2>
                                    <p className="text-muted lead mb-0">{selectedBook.author}</p>
                                </div>

                                <div className="info-grid mb-4 bg-light p-3 rounded-4">
                                    <Row className="gy-3">
                                        <Col xs={6}>
                                            <div className="small text-muted d-flex align-items-center gap-2">
                                                <FiHome /> Nhà xuất bản
                                            </div>
                                            <div className="fw-bold">{selectedBook.publisher || 'N/A'}</div>
                                        </Col>
                                        <Col xs={6}>
                                            <div className="small text-muted d-flex align-items-center gap-2">
                                                <FiCalendar /> Năm xuất bản
                                            </div>
                                            <div className="fw-bold">{selectedBook.year || 'N/A'}</div>
                                        </Col>
                                        <Col xs={6}>
                                            <div className="small text-muted d-flex align-items-center gap-2">
                                                <FiCheckCircle /> Tình trạng
                                            </div>
                                            <div className={`fw-bold ${selectedBook.quantity > 0 ? 'text-success' : 'text-danger'}`}>
                                                {selectedBook.quantity > 0 ? `Còn hàng (${selectedBook.quantity})` : 'Hết hàng'}
                                            </div>
                                        </Col>
                                        <Col xs={6}>
                                            <div className="small text-muted d-flex align-items-center gap-2">
                                                <FiStar /> Đánh giá
                                            </div>
                                            <div className="fw-bold text-warning">4.8/5 (Khuyên dùng)</div>
                                        </Col>
                                    </Row>
                                </div>

                                <div className="mb-4">
                                    <div className="d-flex align-items-end gap-3 mb-2">
                                        <span className="h2 fw-bold text-primary mb-0">{Number(selectedBook.price).toLocaleString()}đ</span>
                                        {selectedBook.discount > 0 && (
                                            <span className="h5 text-muted text-decoration-line-through mb-1">
                                                {Number(selectedBook.original_price).toLocaleString()}đ
                                            </span>
                                        )}
                                    </div>
                                    {selectedBook.discount > 0 && (
                                        <div className="d-inline-block bg-danger text-white px-3 py-1 rounded-pill fw-bold small">
                                            Giảm giá cực sốc: {selectedBook.discount}%
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4 bg-light-subtle p-3 rounded-4 border">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <span className="fw-bold small text-uppercase letter-spacing-1">Giới thiệu sách</span>
                                    </div>
                                    <div 
                                        className="text-muted" 
                                        style={{ 
                                            lineHeight: '1.7', 
                                            fontSize: '0.9rem',
                                            maxHeight: '180px', 
                                            overflowY: 'auto',
                                            whiteSpace: 'pre-line' 
                                        }}
                                    >
                                        {selectedBook.description || 'Nội dung đang được cập nhật. Cuốn sách này hứa hẹn sẽ mang đến cho bạn những trải nghiệm tuyệt vời và kiến thức bổ ích...'}
                                    </div>
                                </div>

                                <div className="d-grid gap-2">
                                    <Button 
                                        variant={addedToCart ? "success" : "primary"} 
                                        size="lg" 
                                        className="rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                                        onClick={() => {
                                            addToCart(selectedBook);
                                            setAddedToCart(true);
                                            setTimeout(() => setAddedToCart(false), 2000);
                                        }}
                                    >
                                        {addedToCart ? (
                                            <> <FiCheckCircle /> Đã thêm vào giỏ </>
                                        ) : (
                                            <> <FiShoppingCart /> Thêm vào giỏ hàng </>
                                        )}
                                    </Button>
                                    <Button variant="outline-dark" onClick={() => setShowModal(false)} className="rounded-pill py-2">
                                        Tiếp tục mua sắm
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Modal.Body>
                )}
            </Modal>
        </main>
    );
};

export default Home;
