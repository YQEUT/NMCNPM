import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import { apiService } from '../services/api';
import { Link } from 'react-router-dom';
import { 
    FiLayers, 
    FiArrowRight, 
    FiShoppingCart, 
    FiCalendar, 
    FiHome, 
    FiCheckCircle, 
    FiEdit3,
    FiBookOpen,
    FiStar,
    FiBriefcase,
    FiHeart,
    FiTrendingUp
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const Shop = () => {
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
        sach_sap_phat_hanh: { title: "Sắp Phát Hành", icon: <FiStar className="text-muted" /> }
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

    if (loading) return <Container className="py-5 text-center">Đang tải toàn bộ danh mục...</Container>;

    return (
        <Container className="py-5">
            <div className="shop-header mb-5 text-center">
                <h1 className="fw-bold display-5 mb-3">Tất Cả Danh Mục Sách</h1>
                <p className="text-muted lead mx-auto" style={{ maxWidth: '700px' }}>
                    Khám phá kho tàng tri thức khổng lồ với đầy đủ các thể loại từ Sách Mầm Non đến Văn Học và Kinh Doanh.
                </p>
            </div>

            {Object.keys(allCategories).map(catKey => {
                const books = allCategories[catKey];
                if (!books || books.length === 0) return null;

                const catInfo = categoryMap[catKey] || { title: catKey, icon: <FiLayers /> };

                return (
                    <section key={catKey} className="mb-5 pb-4 border-bottom last-child-border-0">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="fw-bold m-0 d-flex align-items-center h3">
                                <span className="me-2">{catInfo.icon}</span>
                                {catInfo.title}
                                <span className="ms-3 badge bg-light text-muted fw-normal rounded-pill" style={{ fontSize: '0.9rem' }}>
                                    {books.length} sách
                                </span>
                            </h2>
                            <Link to={`/category/${catKey}`} className="text-primary text-decoration-none fw-bold small">
                                Xem riêng mục này <FiArrowRight />
                            </Link>
                        </div>
                        <Row className="g-3 row-cols-2 row-cols-md-4 row-cols-lg-6">
                            {books.slice(0, 12).map(book => (
                                <Col key={book.id}>
                                    <div 
                                        className="book-card h-100 shadow-sm border-0 rounded-3 overflow-hidden bg-white cursor-pointer"
                                        onClick={() => handleShowDetail(book)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="book-img-wrapper position-relative">
                                            <img src={book.image} alt={book.name} className="book-img w-100" style={{ height: '180px', objectFit: 'cover' }} />
                                            {book.discount > 0 && (
                                                <div className="discount-badge bg-danger text-white position-absolute top-0 end-0 m-1 px-1 rounded-1 fw-bold" style={{ fontSize: '0.65rem' }}>
                                                    -{book.discount}%
                                                </div>
                                            )}
                                        </div>
                                        <div className="book-info p-2">
                                            <h3 className="book-title mb-1 text-truncate fw-bold" style={{ fontSize: '0.85rem' }}>{book.name}</h3>
                                            <div className="price-wrapper d-flex align-items-center gap-1">
                                                <span className="current-price fw-bold text-primary" style={{ fontSize: '0.85rem' }}>{Number(book.price).toLocaleString()}đ</span>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                        {books.length > 12 && (
                            <div className="text-center mt-4">
                                <Link to={`/category/${catKey}`} className="btn btn-outline-primary rounded-pill px-4 btn-sm">
                                    Xem thêm {books.length - 12} sản phẩm khác
                                </Link>
                            </div>
                        )}
                    </section>
                );
            })}

            {/* Product Detail Modal (Same as Category.jsx) */}
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
                                <button className="btn-close position-absolute top-0 end-0 m-3" onClick={() => setShowModal(false)}></button>
                                
                                <div className="mb-4">
                                    <span className="badge bg-primary-subtle text-primary mb-2 rounded-pill">Thông tin sản phẩm</span>
                                    <h2 className="fw-bold mb-1 text-dark">{selectedBook.name}</h2>
                                    <p className="text-muted lead mb-0">{selectedBook.author}</p>
                                </div>

                                <div className="info-grid mb-4 bg-light p-3 rounded-4">
                                    <Row className="gy-3">
                                        <Col xs={6}>
                                            <div className="small text-muted d-flex align-items-center gap-2">
                                                <FiHome /> NXB
                                            </div>
                                            <div className="fw-bold text-truncate">{selectedBook.publisher || 'N/A'}</div>
                                        </Col>
                                        <Col xs={6}>
                                            <div className="small text-muted d-flex align-items-center gap-2">
                                                <FiCalendar /> Năm
                                            </div>
                                            <div className="fw-bold">{selectedBook.year || 'N/A'}</div>
                                        </Col>
                                        <Col xs={6}>
                                            <div className="small text-muted d-flex align-items-center gap-2">
                                                <FiCheckCircle /> Trạng thái
                                            </div>
                                            <div className={`fw-bold ${selectedBook.quantity > 0 ? 'text-success' : 'text-danger'}`}>
                                                {selectedBook.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                                            </div>
                                        </Col>
                                        <Col xs={6}>
                                            <div className="small text-muted d-flex align-items-center gap-2">
                                                <FiStar /> Đánh giá
                                            </div>
                                            <div className="fw-bold text-warning">4.8/5</div>
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
                                </div>

                                <div className="mb-4 bg-light-subtle p-3 rounded-4 border">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <span className="fw-bold small text-uppercase letter-spacing-1">Giới thiệu sách</span>
                                    </div>
                                    <div className="text-muted" style={{ lineHeight: '1.7', fontSize: '0.9rem', maxHeight: '120px', overflowY: 'auto', whiteSpace: 'pre-line' }}>
                                        {selectedBook.description || 'Nội dung đang được cập nhật...'}
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
                                        {addedToCart ? <> <FiCheckCircle /> Đã thêm </> : <> <FiShoppingCart /> Thêm vào giỏ hàng </>}
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Modal.Body>
                )}
            </Modal>
        </Container>
    );
};

export default Shop;
