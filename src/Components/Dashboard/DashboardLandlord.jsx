import React from 'react';
import { Typography, Box, Card, CardContent, Grid } from '@mui/material';

const DashboardLandlord = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Landlord Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Tổng phòng</Typography>
              <Typography variant="h4" color="primary">25</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Đã cho thuê</Typography>
              <Typography variant="h4" color="success.main">20</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Phòng trống</Typography>
              <Typography variant="h4" color="warning.main">5</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Doanh thu tháng</Typography>
              <Typography variant="h4" color="secondary">50M</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardLandlord;