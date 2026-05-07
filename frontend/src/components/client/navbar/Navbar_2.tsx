import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import avatarDefault from '../../../assets/pictures/avatar.jpg'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../stores/Store';
import {
  setNavbarActiveItem,
  setNavbarMenuOpen,
  resetUI,
} from '../../../stores/UiStore';
import CartItem from '../../CartItem';
import axiosInstance from '../../../api/Axios';
import { logout } from '../../../stores/AuthStore';

const Navbar_2 = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeItem = useSelector((state: RootState) => state.ui.navbarActiveItem);
  const menuOpen = useSelector((state: RootState) => state.ui.navbarMenuOpen);
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync UI with backend if needed, but for now rely on Redux Persist
  }, []);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        dispatch(setNavbarMenuOpen(false));
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, dispatch]);

  const handleLogout = () => {
  dispatch(setNavbarMenuOpen(false));
  dispatch(setNavbarActiveItem('home'));
  dispatch(logout());

  // (Tuỳ chọn) Reset UI store nếu có persist
  // dispatch(resetUI());

  // Chuyển hướng người dùng về trang chủ hoặc login
  navigate('/register-login');
};


  const handleMenuClick = (item: string) => {
    dispatch(setNavbarMenuOpen(false));
    const id = user?.id || '';
    navigate(`/${item}/${id}`);
  };

  const isPatient = user?.role === 'PATIENT';
  const isDoctor = user?.role === 'DOCTOR' || user?.role === 'ADMIN';


  return (
    <div className='navbar_2'>
      <div className='left_Navbar_2'>
        <span className={`left_Navbar_2_item ${activeItem === 'home' ? 'now' : ''}`} onClick={() => { dispatch(setNavbarActiveItem('home')); navigate('/'); }}>Home</span>
        { isLoggedIn && isPatient && (
          <><span className={`left_Navbar_2_item ${activeItem === 'doctors-ai' ? 'now' : ''}`} onClick={() => { dispatch(setNavbarActiveItem('doctors-ai')); navigate('/doctors-ai'); }}>Doctors AI</span>
          <span className={`left_Navbar_2_item ${activeItem === 'products' ? 'now' : ''}`} onClick={() => { dispatch(setNavbarActiveItem('products')); navigate('/products'); }}>Products</span>
          <span className={`left_Navbar_2_item ${activeItem === 'consult' ? 'now' : ''}`} onClick={() => { dispatch(setNavbarActiveItem('consult')); navigate('/consult'); }}>Consult</span>
          </>)
        }
        { isLoggedIn && isDoctor && (
            <span className={`left_Navbar_2_item ${activeItem === 'appointments' ? 'now' : ''}`} onClick={() => { dispatch(setNavbarActiveItem('appointments')); navigate(`/admin/dashboard`); }}>Admin Panel</span>
          )
        }
        <span className={`left_Navbar_2_item ${activeItem === 'about-us' ? 'now' : ''}`} onClick={() => { dispatch(setNavbarActiveItem('about-us')); navigate('/about-us'); }}>About us</span>
      </div>
      <div className='right_Navbar_2'>
        {!isLoggedIn ? (
          <>
            <button className='sign_up' onClick={() => navigate('/register-login?mode=register')}>Sign up</button>
            <button className='log_in' onClick={() => navigate('/register-login?mode=login')}>Log in</button>
          </>
        ) : (
          <div className="Main_Dashboard_avatar_menu_wrap" ref={menuRef}>
            <img
              src={user?.avatarUrl || user?.avatar || avatarDefault}
              alt="avatar"
              className="dashboard_avatar"
              onClick={() => dispatch(setNavbarMenuOpen(!menuOpen))}
            />
            <span
              className="dashboard_greeting"
              onClick={() => dispatch(setNavbarMenuOpen(!menuOpen))}
            >
              Hi, {user?.fullName || user?.username || user?.email || 'User'}
            </span>
            {isPatient && <CartItem/>}
            {menuOpen && (
              <div className="Main_Dashboard_dropdown_menu">
                <div className="dropdown_item" onClick={() => handleMenuClick('profile')}>Profile</div>
                <div className="dropdown_item" onClick={() => handleMenuClick('appointment')}>Appointment</div>
                <div className="dropdown_item" onClick={() => handleMenuClick('diagnose-history')}>Diagnose History</div>
                <div className="dropdown_item" onClick={() => handleMenuClick('orders')}>Orders</div>
                <div className="dropdown_separator"></div>
                <div className="dropdown_item">Settings</div>
                <div className="dropdown_separator"></div>
                <div className="dropdown_item logout" onClick={handleLogout}>Logout</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar_2;