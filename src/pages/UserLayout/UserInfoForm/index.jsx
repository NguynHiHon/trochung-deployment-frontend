import React, { useState, useEffect } from 'react';
import { decodeJwt } from '../../../utils/jwtHelper';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  Person as PersonIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { getUserInfor, updateUserInfor } from '../../../services/api/userInforApi';
import InterestsSection from './components/InterestsSection';
import HabitsSection from './components/HabitsSection';
import DislikesSection from './components/DislikesSection';

const UserInfoForms = () => {
  const [tokenPayload, setTokenPayload] = useState(null);
  const theme = useTheme();
  const dispatch = useDispatch();
  // Redux selectors
  const userInforData = useSelector((state) => state.userInfor.userInfor.dataInfor);
  const loading = useSelector((state) => state.userInfor.userInfor.isFetching);
  const message = useSelector((state) => state.userInfor.message);
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const accessToken = useSelector(state => state?.auth?.login?.accessToken || "");
  
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    profession: '',
    interests: [],
    habits: [],
    dislikes: [],
    bio: '',
    phoneNumber: '',
    avatar: ''
  });

  // Load user info on component mount
  useEffect(() => {
    if (currentUser?.id) {
      getUserInfor(currentUser.id, dispatch);
    }
  }, [currentUser, dispatch]);

  // Update formData when userInforData changes
  useEffect(() => {
    if (userInforData) {
      setFormData({
        fullName: userInforData.fullName || '',
        age: userInforData.age || '',
        gender: userInforData.gender || '',
        profession: userInforData.profession || '',
        interests: userInforData.interests || [],
        habits: userInforData.habits || [],
        dislikes: userInforData.dislikes || [],
        bio: userInforData.bio || '',
        phoneNumber: userInforData.phoneNumber || '',
        avatar: userInforData.avatar || ''
      });
    }
  }, [userInforData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handlers for child components
  const handleUpdateInterests = (newInterests) => {
    setFormData(prev => ({
      ...prev,
      interests: newInterests
    }));
  };

  const handleUpdateHabits = (newHabits) => {
    setFormData(prev => ({
      ...prev,
      habits: newHabits
    }));
  };

  const handleUpdateDislikes = (newDislikes) => {
    setFormData(prev => ({
      ...prev,
      dislikes: newDislikes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateUserInfor(formData, dispatch);
  };

  // Nút xem token payload
  const handleShowTokenPayload = () => {
    if (accessToken) {
  const payload = decodeJwt(accessToken);
      setTokenPayload(payload);
    } else {
      setTokenPayload("Không tìm thấy accessToken trong Redux!");
    }
  };

  return (
    <Box sx={{ p: 3, width: '100%', maxWidth: '100%' }}>
      <Button variant="outlined" onClick={handleShowTokenPayload} sx={{ mb: 2 }}>
        Xem token payload
      </Button>
      {tokenPayload && (
        <pre style={{ background: "#eee", padding: 8, marginTop: 8 }}>
          {typeof tokenPayload === "string"
            ? tokenPayload
            : JSON.stringify(tokenPayload, null, 2)}
        </pre>
      )}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Thông tin cá nhân
      </Typography>
      
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        {/* Avatar */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}>
            {formData.fullName ? formData.fullName[0] : <PersonIcon />}
          </Avatar>
          <Button variant="outlined" component="label" startIcon={<PhotoCameraIcon />}>
            Đổi ảnh đại diện
            <input type="file" hidden accept="image/*" />
          </Button>
        </Box>

        {/* Thông tin cơ bản */}
        <Grid container spacing={3} sx={{ mb: 4, width: '100%' }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Họ và tên *"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tuổi *"
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Giới tính *</InputLabel>
              <Select
                value={formData.gender}
                label="Giới tính *"
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <MenuItem value="Nam">Nam</MenuItem>
                <MenuItem value="Nữ">Nữ</MenuItem>
                <MenuItem value="Khác">Khác</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Số điện thoại"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nghề nghiệp *"
              value={formData.profession}
              onChange={(e) => handleInputChange('profession', e.target.value)}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 4 }} />
        {/* 3 sections nằm ngang - sử dụng component riêng */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 4, 
          flexDirection: 'column', // Mặc định là column
          '@media (min-width: 1380px)': {
            flexDirection: 'row'
          },
          maxWidth: '100%', 
          width: '100%' 
        }}>
          <InterestsSection 
            interests={formData.interests} 
            onUpdateInterests={handleUpdateInterests} 
          />
          <HabitsSection 
            habits={formData.habits} 
            onUpdateHabits={handleUpdateHabits} 
          />
          <DislikesSection 
            dislikes={formData.dislikes} 
            onUpdateDislikes={handleUpdateDislikes} 
          />
        </Box>

        {/* Giới thiệu */}
        <TextField
          fullWidth
          label="Giới thiệu bản thân"
          multiline
          rows={4}
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          sx={{ mb: 3 }}
          helperText={`${formData.bio.length}/500 ký tự`}
        />

        {/* Submit Button */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{
              bgcolor: theme.palette.primary.main,
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 3,
              boxShadow: '0 4px 16px rgba(51, 51, 102, 0.2)',
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 24px rgba(51, 51, 102, 0.3)',
              },
              '&:disabled': {
                bgcolor: theme.palette.grey[400],
                transform: 'none',
                boxShadow: 'none'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {loading ? 'Đang lưu...' : 'Lưu thông tin'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default UserInfoForms;