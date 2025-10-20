import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Box,
  Avatar
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Home,
  Forum,
  ManageAccounts,
  HomeWork,
  People,
  HelpOutline,
  MenuBook,
  Menu as MenuIcon
} from '@mui/icons-material';
import { logoutUser } from '../../services/api/authApi';
import theme from '../../theme/theme';
import MenuMobile from '../Dashboard/MenuMobile';

const NavBar = () => {
  const user = useSelector((state) => state.auth.login.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favCount, setFavCount] = useState(0);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = () => {
    setMobileMenuOpen(true);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logoutUser(dispatch, navigate);
    handleClose(); // Đóng menu sau khi logout
  };

  useEffect(() => {
    const readFav = () => {
      try {
        const raw = localStorage.getItem('favoriteRoomIds') || '[]';
        const arr = JSON.parse(raw);
        setFavCount(Array.isArray(arr) ? arr.length : 0);
      } catch (_) {
        setFavCount(0);
      }
    };
    readFav();
    const onStorage = () => readFav();
    const onFavUpdate = () => readFav();
    window.addEventListener('storage', onStorage);
    window.addEventListener('favoritesUpdated', onFavUpdate);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('favoritesUpdated', onFavUpdate);
    };
  }, []);


  return (
     <AppBar 
      position="sticky" 
      elevation={2}
      sx={{
        //'#1e88e5',
        bgcolor: theme.palette.primary.main,
        borderRadius: 0,
        '& .MuiToolbar-root': {
          borderRadius: 0,
        },
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        height: 70,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Mobile Menu Button - Show on screens < 1000px */}
        <IconButton
          color="inherit"
          onClick={handleMobileMenuOpen}
          sx={{ 
            display: { xs: 'flex', lg: 'none' },
            mr: 2
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: 'none',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.5rem'
          }}
        >
          Logo
        </Typography>

        {/* Navigation Menu - Hide on screens < 1000px */}
        <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 2 }}>
          <Button 
            color="inherit" 
            component={Link} 
            to="/home"
            sx={{ 
              color: 'white', 
              textTransform: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.8,
              minWidth: 'auto',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}
          >
            <Home sx={{ fontSize: 22 }} />
Trang chủ
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/rooms"
            sx={{ 
              color: 'white', 
              textTransform: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.8,
              minWidth: 'auto',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}
          >
            <HomeWork sx={{ fontSize: 22 }} />
             Nhà trọ
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/invite-rooms"
            sx={{ 
              color: 'white', 
              textTransform: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.8,
              minWidth: 'auto',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}
          >
            <People sx={{ fontSize: 22 }} />
            Tìm ở ghép
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/forum"
            sx={{ 
              color: 'white', 
              textTransform: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.8,
              minWidth: 'auto',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}
          >
            <Forum sx={{ fontSize: 22 }} />
            Diễn đàn
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/about"
            sx={{ 
              color: 'white', 
              textTransform: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.8,
              minWidth: 'auto',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}
          >
            <HelpOutline sx={{ fontSize: 22 }} />
            About
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/blog"
            sx={{ 
              color: 'white', 
              textTransform: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.8,
              minWidth: 'auto',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}
          >
            <MenuBook sx={{ fontSize: 22 }} />
            Blog
          </Button>
        </Box>

        {/* Right Side - User Menu - Hide on screens < 1000px */}
        <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              <Button
                variant="contained"
                component={Link}
                to="/user/profile"
                startIcon={<ManageAccounts />}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                Quản lý
              </Button>

              <IconButton
                size="large"
                onClick={handleMenu}
                sx={{ p: 0 }}
              >
                <Avatar 
                  sx={{ bgcolor: '#f39c12', width: 40, height: 40 }}
                  alt={user.username}
                >
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose} component={Link} to="/profile">
                  Thông tin cá nhân
                </MenuItem>
                <MenuItem onClick={handleClose} component={Link} to="/favorites">
                  Phòng yêu thích ({favCount})
                </MenuItem>
                <MenuItem onClick={handleClose} component={Link} to="/my-posts">
                  Tin đã đăng
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  Đăng xuất
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                component={Link}
                to="/manage"
                startIcon={<ManageAccounts />}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                Quản lý
              </Button>
              
              <Button color="inherit" component={Link} to="/login">
                Đăng nhập
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                component={Link}
                to="/register"
                sx={{ borderColor: 'white', '&:hover': { borderColor: 'grey.300' } }}
              >
                Đăng ký
              </Button>
            </>
          )}
        </Box>
      </Toolbar>

      {/* Mobile Menu Drawer */}
      <MenuMobile 
        open={mobileMenuOpen} 
        onClose={handleMobileMenuClose} 
      />
    </AppBar>
  );
};

export default NavBar;