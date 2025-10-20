import React from 'react';
import { Typography, Box } from '@mui/material';

const AdminPosts = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Quản lý bài đăng
      </Typography>
      <Typography>
        Trang quản lý bài đăng - sẽ có table và các chức năng CRUD
      </Typography>
    </Box>
  );
};

export default AdminPosts;