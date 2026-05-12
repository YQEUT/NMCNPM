import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { FiArrowLeft, FiLayers, FiBookOpen, FiStar, FiBriefcase, FiHeart, FiEdit3, FiTrendingUp, FiShoppingCart, FiCalendar, FiHome, FiCheckCircle } from 'react-icons/fi';

import { useCart } from '../context/CartContext';

const Category = () => {
    const { addToCart } = useCart();
    const { catKey } = useParams();
    const [books, setBooks] = useState([]);
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
        const fetchCategoryData = async () => {
            setLoading(true);
            try {
                const res = await axios.get('http://localhost:9999/category');
                setBooks(res.data[catKey] || []);
            } catch (error) {
                console.error("Error fetching category books:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategoryData();
    }, [catKey]);

    const handleShowDetail = (book) => {
        setSelectedBook(book);
        setShowModal(true);
    };

    const catInfo = categoryMap[catKey] || { title: "Danh Mục", icon: <FiLayers /> };

    if (loading) return <Container className="py-5 text-center">Đang tải...</Container>;

    return (
        <Container className="py-4">
            <div className="d-flex align-items-center gap-3 mb-5">
                <Link to="/" className="btn btn-light rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px', padding: 0 }}>
                    <FiArrowLeft size={20} />
                </Link>
                <h2 className="fw-bold m-0 d-flex align-items-center">
                    <span className="me-2">{catInfo.icon}</span>
                    {catInfo.title}
                </h2>
                <span className="badge bg-primary-light text-primary rounded-pill px-3">{books.length} sản phẩm</span>
            </div>

            {books.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-4">
                    <p className="text-muted">Hiện chưa có sản phẩm nào trong danh mục này.</p>
                    <Link to="/" className="btn btn-primary rounded-pill px-4">Quay lại trang chủ</Link>
                </div>
            ) : (
                <Row className="g-3 row-cols-2 row-cols-md-4 row-cols-lg-6">
                    {books.map(book => (
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
                                    <p className="book-author text-muted small mb-1 text-truncate" style={{ fontSize: '0.75rem' }}>{book.author}</p>
                                    <div className="price-wrapper d-flex align-items-center gap-1 flex-wrap">
                                        <span className="current-price fw-bold text-primary" style={{ fontSize: '0.85rem' }}>{Number(book.price).toLocaleString()}đ</span>
                                        {book.original_price > book.price && (
                                            <span className="old-price text-muted text-decoration-line-through" style={{ fontSize: '0.65rem' }}>
                                                {Number(book.original_price).toLocaleString()}đ
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            )}

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
        </Container>
    );
};

export default Category;
