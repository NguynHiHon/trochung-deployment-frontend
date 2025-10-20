import React, { useState } from 'react';
import {
  Box, Button, Container, Grid, Link, Paper, TextField, Typography, Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from '../../config/axios';
import { setCredentials } from '../../redux/slices/authSlice';
import './RegisterDirect.css';

export default function RegisterDirect() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');
  const [info, setInfo]       = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setInfo('');
    if (!username.trim() || !email.trim() || !password.trim()) {
      setErr('Vui lòng nhập đủ username, email và mật khẩu.');
      return;
    }
    if (password.length < 8) {
      setErr('Mật khẩu phải từ 8 ký tự trở lên.');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/register-direct', {
        username: username.trim(),
        email: email.trim(),
        password: password,
      });
      if (res?.data?.success) {
        const { user, accessToken, refreshToken } = res.data.data || {};
        // đăng nhập ngay
        dispatch(setCredentials({ user, accessToken, refreshToken }));
        setInfo('Đăng ký thành công. Đang chuyển hướng...');
        setTimeout(() => navigate('/'), 800);
      } else {
        setErr(res?.data?.error || 'Đăng ký thất bại.');
      }
    } catch (e2) {
      setErr(e2?.response?.data?.error || 'Lỗi máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="rd-root">
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        <Paper elevation={0} className="rd-card">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
              <Stack spacing={0.5} mb={3}>
                <Link href="/login" underline="hover">← Quay lại đăng nhập</Link>
                <Typography variant="h4" fontWeight={800}>Đăng ký nhanh</Typography>
                <Typography color="text.secondary">
                  Tạo tài khoản mới và sử dụng ngay — <b>không cần xác minh email</b>.
                </Typography>
              </Stack>

              <Box component="form" onSubmit={submit}>
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e)=>setUsername(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Mật khẩu"
                  type="password"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  margin="normal"
                  helperText="Tối thiểu 8 ký tự"
                  required
                />

                {err && <Typography color="error" mt={1}>{err}</Typography>}
                {info && <Typography color="primary" mt={1}>{info}</Typography>}

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ mt: 2, width: '100%', py: 1.2, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                >
                  {loading ? 'Đang tạo...' : 'Đăng ký ngay'}
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
              <Box className="rd-illustration">
                <Box
                  component="img"
                  src={process.env.PUBLIC_URL + '/illustrations/register.png'}
                  alt="register"
                  sx={{ width: '100%', borderRadius: 3 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}