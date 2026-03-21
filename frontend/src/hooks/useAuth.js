import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { clearCartState } from '../redux/slices/cartSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector((s) => s.auth);
  const handleLogout = () => { dispatch(logout()); dispatch(clearCartState()); };
  return { user, token, loading, error, isAuthenticated: !!token, isAdmin: user?.role === 'admin', logout: handleLogout };
};

export default useAuth;
