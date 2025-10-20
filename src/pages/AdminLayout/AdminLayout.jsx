import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
      {/* Sidebar */}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          p: 3,
          backgroundColor: '#f5f5f5',
          minWidth: 0,
          overflow: 'auto'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;