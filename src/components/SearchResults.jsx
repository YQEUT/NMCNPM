import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button, Spinner } from 'react-bootstrap';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    FiSearch, 
    FiShoppingCart, 
    FiCheckCircle, 
    FiHome, 
    FiCalendar, 
    FiArrowLeft
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const SearchResults = () => {
    const { addToCart } = useCart();
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q') || '';
    
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const res = await axios.get('http://localhost:9999/category');
                const categories = res.data;
                
                // Gom tất cả sách từ mọi danh mục vào 1 mảng phẳng
                let allBooks = [];
                Object.values(categories).forEach(catBooks => {
                    allBooks = [...allBooks, ...catBooks];
                });

                // Lọc bỏ trùng lặp nếu 1 cuốn sách ở nhiều danh mục
                const uniqueBooks = Array.from(new Map(allBooks.map(item => [item.id, item])).values());

                // Tìm kiếm theo tên, tác giả hoặc NXB
                const filtered = uniqueBooks.filter(book => 
                    book.name.toLowerCase().includes(query.toLowerCase()) ||
                    (book.author && book.author.toLowerCase().includes(query.toLowerCase())) ||
                    (book.publisher && book.publisher.toLowerCase().includes(query.toLowerCase()))
                );

                setResults(filtered);
            } catch (error) {
                console.error("Error searching books:", error);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchResults();
        } else {
            setResults([]);
            setLoading(false);
        }
    }, [query]);

    const handleShowDetail = (book) => {
        setSelectedBook(book);
        setShowModal(true);
    };

    return (
        <Container className="py-5">
            <div className="mb-5">
                <h2 className="fw-bold d-flex align-items-center gap-3">
                    <FiSearch className="text-primary" /> Kết quả tìm kiếm cho: 
                    <span className="text-primary italic">"{query}"</span>
                </h2>
                <p className="text-muted">Tìm thấy {results.length} sản phẩm phù hợp.</p>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Đang tìm kiếm sách...</p>
                </div>
            ) : results.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
                    <FiSearch size={64} className="text-muted mb-3" />
                    <h4 className="fw-bold">Rất tiếc, không tìm thấy kết quả nào</h4>
                    <p className="text-muted mb-4">Hãy thử tìm kiếm bằng từ khóa khác hoặc quay lại trang chủ.</p>
                    <Link to="/" className="btn btn-primary rounded-pill px-5">
                        <FiArrowLeft className="me-2" /> Quay lại trang chủ
                    </Link>
                </div>
            ) : (
                <Row className="g-4 row-cols-2 row-cols-md-4 row-cols-lg-6">
                    {results.map(book => (
                        <Col key={book.id}>
                            <div 
                                className="book-card h-100 shadow-sm border-0 rounded-3 overflow-hidden bg-white cursor-pointer"
                                onClick={() => handleShowDetail(book)}
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
            )}

            {/* Product Detail Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered className="product-detail-modal">
                {selectedBook && (
                    <Modal.Body className="p-0 overflow-hidden rounded-4">
                        <Row className="g-0">
                            <Col md={5} className="bg-light d-flex align-items-center justify-content-center p-4">
                                <img src={selectedBook.image} alt="" className="img-fluid rounded-3 shadow-lg" style={{ maxHeight: '400px' }} />
                            </Col>
                            <Col md={7} className="p-4 p-lg-5 bg-white">
                                <button className="btn-close position-absolute top-0 end-0 m-3" onClick={() => setShowModal(false)}></button>
                                <div className="mb-4">
                                    <h2 className="fw-bold mb-1">{selectedBook.name}</h2>
                                    <p className="text-muted lead">{selectedBook.author}</p>
                                </div>
                                <div className="info-grid mb-4 bg-light p-3 rounded-4">
                                    <Row className="gy-3">
                                        <Col xs={6}>
                                            <div className="small text-muted mb-1"><FiHome /> NXB</div>
                                            <div className="fw-bold">{selectedBook.publisher || 'N/A'}</div>
                                        </Col>
                                        <Col xs={6}>
                                            <div className="small text-muted mb-1"><FiCalendar /> Năm</div>
                                            <div className="fw-bold">{selectedBook.year || 'N/A'}</div>
                                        </Col>
                                    </Row>
                                </div>
                                <div className="mb-4">
                                    <span className="h2 fw-bold text-primary">{Number(selectedBook.price).toLocaleString()}đ</span>
                                    {selectedBook.discount > 0 && (
                                        <span className="ms-3 text-muted text-decoration-line-through">{Number(selectedBook.original_price).toLocaleString()}đ</span>
                                    )}
                                </div>
                                <div className="mb-4 bg-light-subtle p-3 rounded-4 border">
                                    <div className="fw-bold small text-uppercase mb-2">Giới thiệu sách</div>
                                    <div className="text-muted small" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                        {selectedBook.description || 'Nội dung đang được cập nhật...'}
                                    </div>
                                </div>
                                <div className="d-grid">
                                    <Button 
                                        variant={addedToCart ? "success" : "primary"} 
                                        size="lg" 
                                        className="rounded-pill py-3 fw-bold"
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

export default SearchResults;
