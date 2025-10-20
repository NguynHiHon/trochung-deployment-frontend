import {
    Box,
    Typography,
    Avatar,
    Button,
    Divider,
    List,
    ListItemButton,
    Drawer,
    Chip,
    ListItemIcon,
    IconButton,
} from "@mui/material";
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { logoutUser } from '../../services/api/authApi';

export default function UserSidebar({ mobileMenuOpen, onMobileMenuClose }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();

    const [postsOpen, setPostsOpen] = useState(false);

    const menuItems = [
        { text: "Thông tin cá nhân ", path: "/user/profile", icon: <AccountCircleIcon /> },
        { text: "Quản lý tin đăng", path: "/user/posts", icon: <PostAddIcon /> },
        { text: "Lịch sử nạp tiền", path: "/user/topup-history", icon: <MonetizationOnIcon /> },
        { text: "Lịch sử giao dịch", path: "/user/transactions", icon: <HistoryIcon /> },
        { text: "Đổi mật khẩu", path: "/user/change-password", icon: <LockIcon /> },
        { text: "Thông báo", path: "/user/notifications", icon: <NotificationsNoneIcon /> },
        { text: "Bảng giá dịch vụ", path: "/user/pricing", icon: <DescriptionIcon /> },
        { text: "Liên hệ & trợ giúp", path: "/user/support", icon: <ContactSupportIcon /> },
        { text: "Đăng xuất", path: "/logout", icon: <ExitToAppIcon /> },
    ];

    const handleMenuClick = async (path) => {
        if (path === "/logout") {
            try {
                // call logout API which clears server-side refresh token cookie and clears retoken
                await logoutUser(dispatch, navigate);
            } catch (err) {
                // even if API fails, logoutUser will dispatch logout and navigate
                console.error('Logout error:', err);
            }
        } else {
            navigate(path);
        }

        // Đóng mobile menu sau khi click
        if (onMobileMenuClose) {
            onMobileMenuClose();
        }
    };

    const drawerWidth = 240;
    
    const sidebarContent = (
        <Box
            sx={{
                width: drawerWidth,
                background: theme.palette.background.paper,
                color: theme.palette.text.primary,
                p: 2,
                height: '100%',
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
                boxShadow: `4px 0 12px ${theme.palette.divider}`,
                borderRight: `1px solid ${theme.palette.divider}`,
            }}
        >
            {/* Avatar + chips */}
            <Box display="flex" flexDirection="column" alignItems="flex-start" gap={1} mb={0.5}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: theme.palette.grey[200], color: theme.palette.text.primary }}>
                    U
                </Avatar>
                <Chip icon={<AccountCircleIcon />} label="ID" sx={{ borderRadius: 3, bgcolor: theme.palette.grey[100] }} />
                <Chip icon={<AccountBalanceWalletIcon />} label="Số dư" sx={{ borderRadius: 3, bgcolor: theme.palette.grey[100] }} />
            </Box>

            {/* Nạp tiền button */}
            <Button
                variant="contained"
                fullWidth
                startIcon={<MonetizationOnIcon />}
                onClick={() => handleMenuClick('/user/topup')}
                sx={{
                    mb: 0.5,
                    bgcolor: theme.palette.grey[50],
                    color: theme.palette.text.primary,
                    textTransform: 'none',
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: theme.palette.grey[100] }
                }}
            >
                Nạp tiền
            </Button>

            <Divider />

            {/* Menu list */}
            <List disablePadding>
                {/* Parent: Đăng tin (collapsible) */}
                <ListItemButton
                    onClick={() => setPostsOpen((v) => !v)}
                    sx={{ borderRadius: 2, py: 1, mb: 0.5, alignItems: 'center' }}
                >
                    <ListItemIcon sx={{ minWidth: 36, color: theme.palette.text.secondary }}>
                        <PostAddIcon />
                    </ListItemIcon>
                    <Typography sx={{ flex: 1 }}>Đăng tin</Typography>
                    <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                        {postsOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                </ListItemButton>

                {/* Sub-items under Đăng tin */}
                {postsOpen && (
                    <Box sx={{ pl: 4, pr: 1, mb: 1 }}>
                        <ListItemButton onClick={() => handleMenuClick('/user/post-room')} sx={{ borderRadius: 2, py: 0.8, mb: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 36, color: theme.palette.text.secondary }}>
                                <DescriptionIcon />
                            </ListItemIcon>
                            <Typography>Đăng tin cho thuê</Typography>
                        </ListItemButton>
                        <ListItemButton onClick={() => handleMenuClick('/user/invite-roommate')} sx={{ borderRadius: 2, py: 0.8 }}>
                            <ListItemIcon sx={{ minWidth: 36, color: theme.palette.text.secondary }}>
                                <PeopleIcon />
                            </ListItemIcon>
                            <Typography>Đăng tìm ở ghép</Typography>
                        </ListItemButton>
                    </Box>
                )}

                {menuItems.map((item, idx) => (
                    <ListItemButton
                        key={idx}
                        onClick={() => handleMenuClick(item.path)}
                        sx={{
                            borderRadius: 2,
                            py: 1,
                            mb: 0.5,
                            alignItems: 'center',
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 36, color: theme.palette.text.secondary }}>
                            {item.icon}
                        </ListItemIcon>
                        <Typography sx={{ flex: 1 }}>{item.text}</Typography>
                        <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                            <ChevronRightIcon fontSize="small" />
                        </IconButton>
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            {/* Desktop Sidebar - luôn hiện */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: drawerWidth,
                    flexShrink: 0,
                }}
            >
                {sidebarContent}
            </Box>

            {/* Mobile Drawer - chỉ hiện khi mở */}
            <Drawer
                variant="temporary"
                open={mobileMenuOpen}
                onClose={onMobileMenuClose}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: drawerWidth,
                        border: 'none'
                    },
                }}
            >
                {sidebarContent}
            </Drawer>
        </>
    );
}