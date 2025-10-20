import axios from '../../config/axios';
import { loginStart, loginSuccess, loginFailure, registerFailure, registerStart, registerSuccess, logout } from '../../redux/slices/authSlice';

export const loginUser = async (user, dispatch, navigate) => {
    //login
    dispatch(loginStart());
    try {
        console.log('[authApi] loginUser - request payload:', user);
        const res = await axios.post('/api/auth/login', user);
        console.log('[authApi] loginUser - response status:', res.status);
        console.log('[authApi] loginUser - response data:', res.data);
        console.log('[authApi] loginUser - response headers:', res.headers);
        dispatch(loginSuccess(res.data));
        if (res.data.user.role === 'admin') {
            navigate("/admin/homeadmin");
        } 
        if (res.data.user.role === 'user') {
            navigate("/home");
        }
    } catch (error) {
        // Detailed error logging for debugging
        if (error.response) {
            // Server responded with a status outside 2xx
            console.error('[authApi] loginUser - error response status:', error.response.status);
            console.error('[authApi] loginUser - error response data:', error.response.data);
            console.error('[authApi] loginUser - error response headers:', error.response.headers);
        } else if (error.request) {
            // Request was made but no response received
            console.error('[authApi] loginUser - no response received, request:', error.request);
        } else {
            // Something happened setting up the request
            console.error('[authApi] loginUser - request setup error:', error.message);
        }
        console.error('[authApi] loginUser - full error object:', error);
        dispatch(loginFailure());
    }
}

//register
export const registerUser = async (user, dispatch, navigate) => {
    dispatch(registerStart());
    try {
        const res = await axios.post('/api/auth/register', user);
        dispatch(registerSuccess(res.data));
        navigate("/login");
    } catch (error) {
        dispatch(registerFailure());
    }
}

//logout
export const logoutUser = async (dispatch, navigate) => {
    try {
        await axios.post('/api/auth/logout');
        dispatch(logout());
        navigate('/');
    } catch (error) {
        // Ngay cả khi API call thất bại, vẫn logout ở frontend
        dispatch(logout());
        navigate('/');
    }
}