import React, { useState, useEffect, useRef } from 'react';
import { Container, Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { FiSearch, FiTruck, FiShoppingCart, FiUser, FiBook, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabaseClient';

const Header = () => {
    const { cartCount } = useCart();
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [allBooks, setAllBooks] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);

    const [showAuth, setShowAuth] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [registerData, setRegisterData] = useState({ 
        firstName: '', 
        lastName: '', 
        email: '', 
        password: '', 
        confirmPassword: '' 
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const userMenuRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllBooks = async () => {
            try {
                const data = await apiService.getCategories();
                let books = [];
                Object.values(data).forEach(catBooks => {
                    books = [...books, ...catBooks];
                });
                // Lọc trùng ID
                const unique = Array.from(new Map(books.map(b => [b.id, b])).values());
                setAllBooks(unique);
            } catch (error) {
                console.error("Error loading books for suggestions", error);
            }
        };
        fetchAllBooks();

        // Kiểm tra session hiện tại (cho Google Login)
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setCurrentUser({
                    full_name: session.user.user_metadata.full_name || session.user.email,
                    username: session.user.email
                });
            } else {
                // Kiểm tra localStorage (cho login thủ công bằng bảng users)
                const savedUser = localStorage.getItem('logged_user');
                if (savedUser) setCurrentUser(JSON.parse(savedUser));
            }
        };
        checkUser();

        // Lắng nghe thay đổi auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                const userObj = {
                    full_name: session.user.user_metadata.full_name || session.user.email,
                    username: session.user.email,
                    email: session.user.email
                };
                setCurrentUser(userObj);
                localStorage.setItem('logged_user', JSON.stringify(userObj));
            } else {
                const savedUser = localStorage.getItem('logged_user');
                if (!savedUser) setCurrentUser(null);
            }
        });

        // Đóng gợi ý và dropdown khi bấm ra ngoài
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            subscription.unsubscribe();
        };
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.trim().length > 0) {
            const filtered = allBooks.filter(book => 
                book.name.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 6); // Lấy tối đa 6 gợi ý
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
            setShowSuggestions(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await apiService.signInWithGoogle();
        } catch (err) {
            console.error(err);
            setError('Có lỗi xảy ra khi đăng nhập bằng Google!');
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Login Logic
                const users = await apiService.getUsers();
                const user = users.find(u => 
                    u.username === loginData.username && u.password === loginData.password
                );

                if (user) {
                    console.log('Login success:', user);
                    setCurrentUser(user);
                    localStorage.setItem('logged_user', JSON.stringify(user));
                    setShowAuth(false);
                    if (user.role === 'admin') {
                        navigate('/admin');
                    } else {
                        alert('Đăng nhập thành công!');
                    }
                } else {
                    setError('Tên đăng nhập hoặc mật khẩu không đúng!');
                }
            } else {
                // Register Logic - Validation
                if (registerData.password !== registerData.confirmPassword) {
                    setError('Mật khẩu nhập lại không khớp!');
                    setLoading(false);
                    return;
                }

                const users = await apiService.getUsers();
                if (users.some(u => u.username === registerData.email)) {
                    setError('Email này đã được đăng ký!');
                    setLoading(false);
                    return;
                }

                await apiService.createUser({
                    username: registerData.email,
                    password: registerData.password,
                    role: 'user',
                    full_name: `${registerData.lastName} ${registerData.firstName}`.trim()
                });

                alert('Đăng ký thành công! Hãy đăng nhập.');
                setIsLogin(true);
            }
        } catch (err) {
            console.error(err);
            setError('Có lỗi xảy ra khi kết nối đến server!');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.clear();
        setCurrentUser(null);
        setShowUserDropdown(false);
        navigate('/');
        window.location.reload();
    };

    return (
        <header className="main-header">
            <Container>
                <div className="header-container">
                    {/* Logo */}
                    <Link to="/" className="logo">
                        <FiBook size={32} />
                        <span>BOOK<span>STORE</span></span>
                    </Link>

                    {/* Search Bar */}
                    <form className="search-container" onSubmit={handleSearch} ref={searchRef}>
                        <div className="search-wrapper">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sách, tác giả, nhà xuất bản..."
                                className="search-input"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onFocus={() => searchTerm.trim() && setShowSuggestions(true)}
                            />
                            <button type="submit" className="search-btn">
                                <FiSearch size={18} /> 
                                <span className="d-none d-md-inline">Tìm kiếm</span>
                            </button>
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="search-suggestions shadow-lg rounded-4 overflow-hidden border">
                                {suggestions.map(book => (
                                    <div 
                                        key={book.id} 
                                        className="suggestion-item d-flex align-items-center gap-3 p-3 border-bottom cursor-pointer"
                                        onClick={() => {
                                            setSearchTerm(book.name);
                                            setShowSuggestions(false);
                                            navigate(`/search?q=${encodeURIComponent(book.name)}`);
                                        }}
                                    >
                                        <img src={book.image} alt="" className="rounded shadow-sm" style={{ width: '35px', height: '48px', objectFit: 'cover' }} />
                                        <div>
                                            <div className="fw-bold small text-dark">{book.name}</div>
                                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{book.author}</div>
                                            <div className="text-primary fw-bold small">{Number(book.price).toLocaleString()}đ</div>
                                        </div>
                                    </div>
                                ))}
                                <div 
                                    className="p-2 text-center bg-light small text-primary fw-bold cursor-pointer hover-bg-primary-light"
                                    onClick={handleSearch}
                                >
                                    Xem tất cả kết quả cho "{searchTerm}"
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Actions */}
                    <div className="header-actions">
                        <Link to="/order-tracking" className="header-item">
                            <FiTruck />
                            <span>Tra cứu đơn hàng</span>
                        </Link>

                        <div className="position-relative" ref={userMenuRef}>
                            <div className="header-item cursor-pointer" onClick={() => currentUser ? setShowUserDropdown(!showUserDropdown) : setShowAuth(true)}>
                                <FiUser />
                                <span>{currentUser ? currentUser.full_name : 'Tài khoản'}</span>
                            </div>

                            {/* User Dropdown Menu */}
                            {currentUser && showUserDropdown && (
                                <div className="user-dropdown-menu shadow-lg rounded-3 border py-2 bg-white position-absolute end-0 mt-2" style={{ width: '180px', zIndex: 1100 }}>
                                    <div 
                                        className="px-3 py-2 border-bottom mb-2 d-flex align-items-center gap-2 fw-bold text-dark small cursor-pointer hover-bg-primary-light"
                                        onClick={() => {navigate('/account'); setShowUserDropdown(false);}}
                                    >
                                        <FiUser size={14} /> {currentUser.full_name}
                                    </div>
                                    <div 
                                        className="dropdown-item px-3 py-2 cursor-pointer d-flex align-items-center gap-2 text-danger small"
                                        onClick={handleLogout}
                                    >
                                        <FiLock size={14} /> Đăng xuất
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link to="/cart" className="header-item">
                            <div className="position-relative">
                                <FiShoppingCart />
                                <span className="cart-badge">{cartCount}</span>
                            </div>
                            <span>Giỏ hàng</span>
                        </Link>
                    </div>
                </div>
            </Container>

            {/* Auth Modal */}
            <Modal show={showAuth} onHide={() => {setShowAuth(false); setError('');}} centered className="auth-modal">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="w-100 text-center fw-bold fs-4">
                        {isLogin ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 pb-4">
                    {error && <Alert variant="danger" className="py-2 fs-7">{error}</Alert>}
                    
                    <Form className="mt-3" onSubmit={handleAuth}>
                        {isLogin ? (
                            <>
                                <Form.Group className="mb-3 auth-input-group">
                                    <FiUser className="input-icon" />
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Email hoặc Tên đăng nhập" 
                                        className="auth-input" 
                                        value={loginData.username}
                                        onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3 auth-input-group">
                                    <FiLock className="input-icon" />
                                    <Form.Control 
                                        type="password" 
                                        placeholder="Mật khẩu" 
                                        className="auth-input" 
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </>
                        ) : (
                            <>
                                <Row className="g-2 mb-3">
                                    <Col md={6}>
                                        <Form.Group className="auth-input-group">
                                            <Form.Control 
                                                type="text" 
                                                placeholder="Họ" 
                                                className="auth-input ps-3" 
                                                value={registerData.lastName}
                                                onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="auth-input-group">
                                            <Form.Control 
                                                type="text" 
                                                placeholder="Tên" 
                                                className="auth-input ps-3" 
                                                value={registerData.firstName}
                                                onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3 auth-input-group">
                                    <FiUser className="input-icon" />
                                    <Form.Control 
                                        type="email" 
                                        placeholder="Email của bạn" 
                                        className="auth-input" 
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3 auth-input-group">
                                    <FiLock className="input-icon" />
                                    <Form.Control 
                                        type="password" 
                                        placeholder="Mật khẩu" 
                                        className="auth-input" 
                                        value={registerData.password}
                                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3 auth-input-group">
                                    <FiLock className="input-icon" />
                                    <Form.Control 
                                        type="password" 
                                        placeholder="Nhập lại mật khẩu" 
                                        className="auth-input" 
                                        value={registerData.confirmPassword}
                                        onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </>
                        )}

                        <Button variant="primary" type="submit" className="w-100 py-2 fw-bold btn-auth mb-3" disabled={loading}>
                            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập' : 'Đăng Ký')}
                        </Button>

                        <div className="divider"><span>Hoặc</span></div>

                        <Button 
                            variant="outline-dark" 
                            className="w-100 py-2 d-flex align-items-center justify-content-center gap-2 btn-google mb-3" 
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                        >
                            <FcGoogle size={20} /> Đăng nhập với Google
                        </Button>

                        <div className="text-center mt-3 fs-7">
                            {isLogin ? (
                                <p>Chưa có tài khoản? <span className="auth-toggle" onClick={() => setIsLogin(false)}>Đăng ký ngay</span></p>
                            ) : (
                                <p>Đã có tài khoản? <span className="auth-toggle" onClick={() => setIsLogin(true)}>Đăng nhập</span></p>
                            )}
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </header>
    );
};

export default Header;
