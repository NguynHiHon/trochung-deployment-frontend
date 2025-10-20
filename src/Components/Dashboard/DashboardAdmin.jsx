import React from 'react';
import { Typography, Box, Card, CardContent, Grid } from '@mui/material';

const DashboardAdmin = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Tổng người dùng</Typography>
              <Typography variant="h4" color="primary">1,234</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Tổng bài đăng</Typography>
              <Typography variant="h4" color="secondary">856</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Lượt xem</Typography>
              <Typography variant="h4" color="success.main">45.2K</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Doanh thu</Typography>
              <Typography variant="h4" color="warning.main">2.1B</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardAdmin;