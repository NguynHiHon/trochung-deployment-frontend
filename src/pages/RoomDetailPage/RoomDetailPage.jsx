import React, { useEffect, useState } from 'react';
import { FavoriteApi } from '../../services/api';
import { fetchRoomById, fetchAllRooms, fetchPostById } from '../../services/api/postApi';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Card,
  CardMedia,
  CardContent,
  Avatar,
  Rating as MuiRating,
  Badge
} from '@mui/material';
import {
  ArrowBack,
  FavoriteBorder,
  Favorite,
  Share,
  Phone,
  LocationOn,
  Home,
  People,
  Wc,
  SquareFoot,
  CalendarToday,
  Person,
  Star,
  PlayArrow,
  Kitchen,
  DirectionsCar,
  Build,
  CheckCircle,
  Map,
  Message,
  Save,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { CommentApi } from '../../services/api/commentApi';
import { RatingApi } from '../../services/api/ratingApi';
import { useSelector } from 'react-redux';

const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const accessToken = useSelector((s) => s?.auth?.login?.accessToken);
  const [room, setRoom] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [similarRooms, setSimilarRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [myRating, setMyRating] = useState(null);
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });
  const [replyFor, setReplyFor] = useState(null); // commentId đang mở form trả lời
  const [editFor, setEditFor] = useState(null); // { id, isReply, parentId? }
  const [editText, setEditText] = useState('');
  const [showContactCard, setShowContactCard] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('RoomDetailPage - Loading room with ID:', id);
        
        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem('favoriteRoomIds');
        if (savedFavorites) {
          try {
            setFavorites(new Set(JSON.parse(savedFavorites)));
          } catch (e) {
            console.error('Error parsing favorites:', e);
          }
        }

        // Fetch room details from API
        const foundRoom = await fetchRoomById(id);
        console.log('RoomDetailPage - Found room:', foundRoom);
        
        if (foundRoom) {
          setRoom(foundRoom);
          const postId = foundRoom?.postId || foundRoom?.post || foundRoom?.id;
          console.log('🔑 PostId for comments/ratings:', postId);
          console.log('📦 Room data:', foundRoom);
          
          try {
            // Load comments & ratings từ server nếu có postId hợp lệ
            if (postId) {
              console.log('📡 Loading comments and ratings...');
              const [cmt, stats, mine] = await Promise.all([
                CommentApi.listByPost(postId).catch(e => { console.error('Comments error:', e); return []; }),
                RatingApi.stats(postId).catch(e => { console.error('Stats error:', e); return { average: 0, count: 0 }; }),
                RatingApi.me(postId).catch(e => { console.log('Me rating error (OK if not logged in):', e.message); return null; })
              ]);
              console.log('✅ Comments loaded:', cmt);
              console.log('✅ Stats loaded:', stats);
              console.log('✅ My rating loaded:', mine);
              setComments(Array.isArray(cmt) ? cmt : []);
              setRatingStats(stats || { average: 0, count: 0 });
              setMyRating(mine || null);
            } else {
              console.warn('⚠️ No postId found, cannot load comments/ratings');
              setComments([]);
              setRatingStats({ average: 0, count: 0 });
              setMyRating(null);
            }
          } catch (e) {
            console.error('❌ Load comments/ratings failed:', e);
            setComments([]);
            setRatingStats({ average: 0, count: 0 });
            setMyRating(null);
          }
          
            // Load similar rooms from API
          const allRooms = await fetchAllRooms();
          const similar = allRooms.filter(r => r && r.id !== foundRoom.id).slice(0, 3);
          setSimilarRooms(similar);

          // If postId exists, fetch post detail to get userInfo for invite posts
          try {
            if (postId) {
              const postFull = await fetchPostById(postId);
              if (postFull && postFull.post) {
                const prefs = postFull.post.userInfo || postFull.post.roommatePreferences || {};
                setRoom(r => ({ ...r, _postDetail: postFull.post, roommatePreferences: prefs }));
              }
            }
          } catch (e) {
            console.error('Error fetching post full details:', e);
          }
          
          // Load reviews from localStorage
          const savedReviews = localStorage.getItem(`reviews_${foundRoom.id}`);
          if (savedReviews) {
            const parsedReviews = JSON.parse(savedReviews);
            setReviews(parsedReviews);
          } else {
            // Default sample reviews
            setReviews([
              {
                id: 1,
                name: 'Phương Anh 2k4',
                avatar: 'PA',
                rating: 5,
                comment: 'Mình ở đây từ năm 1, chưa có vấn đề gì xảy ra, chỉ có mỗi hơi xa chợ, chú trọ oke',
                date: '26/07 09:36 AM',
                likes: 12,
                liked: false
              },
              {
                id: 2,
                name: 'Tuấn Anh 27k7',
                avatar: 'TA',
                rating: 5,
                comment: 'Vừa mới vào ở lần đầu, chưa biết vấn đề gì ko nhưng chủ nhà vui tính nên okela',
                date: 'Hôm nay 09:36 AM',
                likes: 8,
                liked: true
              }
            ]);
          }
        }
        setLoading(false);
      } catch (e) {
        console.error('Error loading room data:', e);
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  // Auto-hide contact card on mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowContactCard(false);
      } else {
        setShowContactCard(true);
      }
    };

    // Check initial screen size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleFavorite = async () => {
    const MAX_FAVORITES = 20;
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
      try { await FavoriteApi.removeFavorite(id); } catch (_) {}
    } else {
      if (newFavorites.size >= MAX_FAVORITES) {
        try { alert(`Bạn chỉ có thể lưu tối đa ${MAX_FAVORITES} phòng yêu thích.`); } catch (_) {}
        return;
      }
      newFavorites.add(id);
      try { await FavoriteApi.addFavorite(id); } catch (_) {}
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoriteRoomIds', JSON.stringify([...newFavorites]));
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (!room) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Không tìm thấy phòng trọ</Typography>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          Quay lại
        </Button>
      </Box>
    );
  }

  const isFavorite = favorites.has(String(room.id));

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header với nút quay lại */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ bgcolor: 'grey.100' }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
          {room.title}
        </Typography>
        <Tooltip title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}>
          <IconButton onClick={toggleFavorite} size="large" sx={{ bgcolor: 'grey.100' }}>
            {isFavorite ? <Favorite color="error" fontSize="large" /> : <FavoriteBorder fontSize="large" />}
          </IconButton>
        </Tooltip>
        <IconButton sx={{ bgcolor: 'grey.100' }}>
          <Share />
        </IconButton>
      </Stack>

      {/* Header với giá và đánh giá */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {room.title}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
              <Chip label="Cho Thuê" color="primary" size="small" />
              <MuiRating value={Number(ratingStats.average) || 0} readOnly precision={0.5} size="small" />
              <Typography variant="body2" color="text.secondary">
                ({ratingStats.count} Reviews)
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOn sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body1" color="text.secondary">
                {room.district}, {room.city}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                {room.price}  VND
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {room.area}m²
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Nội dung chính */}
        <Grid item xs={12} md={12}>
          {/* Gallery hình ảnh */}
          <Paper sx={{ overflow: 'hidden', borderRadius: 2, mb: 3 }}>
            <Grid container spacing={1}>
              <Grid item xs={12} md={8}>
                <Box sx={{ position: 'relative', height: 400 }}>
                  <Box 
                    component="img" 
                    src={room.image} 
                    alt={room.title}
                    sx={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }} 
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Grid container spacing={1} sx={{ height: '100%' }}>
                  {[1, 2, 3, 4].map((index) => (
                    <Grid item xs={6} key={index}>
                      <Box sx={{ 
                        position: 'relative', 
                        height: index === 0 ? 200 : 95,
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}>
                        <Box 
                          component="img" 
                          src={room.image} 
                          alt={`${room.title} ${index}`}
                          sx={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }} 
                        />
                        {index === 3 && (
                          <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600
                          }}>
                            +1
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* Tiện ích & Nội thất (dữ liệu thật) */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Tiện Ích & Nội Thất
            </Typography>
            {Array.isArray(room.utilities) && room.utilities.length > 0 ? (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {room.utilities.map((u, idx) => (
                  <Chip key={idx} label={u} variant="outlined" />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">Chưa cập nhật</Typography>
            )}
          </Paper>

          {/* Chi phí (dữ liệu thật) */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Chi Phí
            </Typography>
            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Giá thuê/tháng:</Typography>
                <Typography variant="body2">{room.price} {room.unit}</Typography>
              </Stack>
              {Array.isArray(room.additionalCosts) && room.additionalCosts.length > 0 ? (
                room.additionalCosts.map((c, idx) => (
                  <Stack key={idx} direction="row" spacing={1}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.type}:</Typography>
                    <Typography variant="body2">{c.frequency}</Typography>
                  </Stack>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">Chưa cập nhật chi phí phát sinh</Typography>
              )}
            </Stack>
          </Paper>

          {/* Mô tả */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              Chào các em sinh viên,<br/><br/>
              {room.description}<br/><br/>
              Chúng tôi luôn chào đón các bạn đến tham quan và trải nghiệm không gian sống tuyệt vời này. Hãy liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất!
            </Typography>
          </Paper>

          {/* Video */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Video
            </Typography>
            <Box sx={{ position: 'relative', height: 300, borderRadius: 2, overflow: 'hidden' }}>
              <Box 
                component="img" 
                src={room.image} 
                alt="Video thumbnail"
                sx={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }} 
              />
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'rgba(0,0,0,0.7)',
                borderRadius: '50%',
                p: 2,
                cursor: 'pointer'
              }}>
                <PlayArrow sx={{ fontSize: 40, color: 'white' }} />
              </Box>
            </Box>
          </Paper>

          {/* Đánh giá + Bình luận thật */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mr: 'auto' }}>
                Đánh giá & Bình luận
              </Typography>
              <MuiRating
                value={myRating?.stars || 0}
                precision={1}
                onChange={async (_e, val) => {
                  console.log('⭐ Rating changed to:', val);
                  console.log('🔐 Access token:', accessToken ? 'EXISTS' : 'MISSING');
                  if (!accessToken) { 
                    console.warn('⚠️ No access token, need login');
                    try { alert('Bạn cần đăng nhập để đánh giá'); } catch (_) {} 
                    return; 
                  }
                  try {
                    const postId = room?.postId || room?.post || room?.id;
                    console.log('📤 Sending rating for postId:', postId);
                    const saved = await RatingApi.upsert(postId, { stars: val, review: '' });
                    console.log('✅ Rating saved:', saved);
                    setMyRating(saved);
                    const stats = await RatingApi.stats(postId);
                    console.log('✅ Stats updated:', stats);
                    setRatingStats(stats);
                    // notify other views (view-all) to refresh
                    try { window.dispatchEvent(new Event('ratingUpdated')); } catch (_) {}
                  } catch (e) {
                    console.error('❌ Rating failed:', e);
                    alert('Lỗi khi lưu đánh giá: ' + e.message);
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Trung bình: {Number(ratingStats.average).toFixed(1)} ({ratingStats.count})
              </Typography>
            </Stack>

            {/* Form nhập comment */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Avatar>{(room.author || 'N').charAt(0)}</Avatar>
              <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận..."
                  style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e0e0e0' }}
                />
                <Button
                  variant="contained"
                  onClick={async () => {
                    console.log('💬 Comment button clicked');
                    console.log('📝 Comment content:', newComment);
                    if (!newComment.trim()) {
                      console.warn('⚠️ Empty comment');
                      return;
                    }
                    console.log('🔐 Access token:', accessToken ? 'EXISTS' : 'MISSING');
                    if (!accessToken) { 
                      console.warn('⚠️ No access token, need login');
                      try { alert('Bạn cần đăng nhập để bình luận'); } catch (_) {} 
                      return; 
                    }
                    try {
                      const postId = room?.postId || room?.post || room?.id;
                      console.log('📤 Sending comment for postId:', postId);
                      const c = await CommentApi.create(postId, { content: newComment });
                      console.log('✅ Comment created:', c);
                      setComments((prev) => [...prev, c]);
                      setNewComment('');
                      // refresh stats for view-all page
                      try { const stats = await RatingApi.stats(postId); setRatingStats(stats); } catch (_) {}
                    } catch (e) {
                      console.error('❌ Comment failed:', e);
                      alert('Lỗi khi gửi bình luận: ' + e.message);
                    }
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  Gửi
                </Button>
                <Button
                  variant="text"
                  onClick={() => navigate(`/room/${room.id}/reviews`)}
                  sx={{ textTransform: 'none' }}
                >
                  View all
                </Button>
              </Box>
            </Stack>

            {/* Danh sách comments (threaded) */}
            <Stack spacing={1.5}>
              {comments.map((c) => (
                <Box key={c._id}>
                  <Stack direction="row" spacing={1}>
                    <Avatar>{(c.user?.username || 'U').charAt(0)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{c.user?.username || 'User'}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(c.createdAt).toLocaleString()}</Typography>
                      </Stack>
                      {editFor?.id === c._id ? (
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          <input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #e0e0e0' }}
                          />
                          <Button size="small" onClick={async () => {
                            try {
                              const updated = await CommentApi.update(c._id, { content: editText });
                              setComments((prev) => prev.map(x => x._id === c._id ? { ...x, content: updated.content, isEdited: true } : x));
                              setEditFor(null);
                              setEditText('');
                            } catch (_) {}
                          }}>Lưu</Button>
                          <Button size="small" color="inherit" onClick={() => { setEditFor(null); setEditText(''); }}>Hủy</Button>
                        </Stack>
                      ) : (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{c.content}</Typography>
                      )}
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.25 }}>
                        <Button size="small" variant="text" onClick={() => setReplyFor(replyFor === c._id ? null : c._id)} sx={{ textTransform: 'none', minWidth: 'auto', px: 0.5 }}>Trả lời</Button>
                        <Button size="small" variant="text" onClick={() => { setEditFor({ id: c._id }); setEditText(c.content); }} sx={{ textTransform: 'none', minWidth: 'auto', px: 0.5 }}>Sửa</Button>
                        <Button size="small" color="error" variant="text" onClick={async () => {
                          try { await CommentApi.remove(c._id); setComments((prev) => prev.filter(x => x._id !== c._id)); } catch (_) {}
                        }} sx={{ textTransform: 'none', minWidth: 'auto', px: 0.5 }}>Xóa</Button>
                      </Stack>
                      {/* Replies */}
                      {Array.isArray(c.replies) && c.replies.length > 0 && (
                        <Stack spacing={1} sx={{ mt: 1, pl: 5 }}>
                          {c.replies.map((r) => (
                            <Stack direction="row" spacing={1} key={r._id}>
                              <Avatar>{(r.user?.username || 'U').charAt(0)}</Avatar>
                              <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{r.user?.username || 'User'}</Typography>
                                  <Typography variant="caption" color="text.secondary">{new Date(r.createdAt).toLocaleString()}</Typography>
                                </Stack>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{r.content}</Typography>
                              </Box>
                            </Stack>
                          ))}
                        </Stack>
                      )}
                      {/* Form trả lời nhỏ dưới bình luận */}
                      {replyFor === c._id && (
                        <Stack direction="row" spacing={1} sx={{ mt: 1, pl: 5 }}>
                          <input
                            placeholder="Trả lời..."
                            onKeyDown={async (ev) => {
                              if (ev.key === 'Enter') {
                                const val = ev.currentTarget.value.trim();
                                if (!val) return;
                                if (!accessToken) { try { alert('Bạn cần đăng nhập để trả lời'); } catch (_) {} return; }
                                try {
                                  const postId = room?.postId || room?.post || room?.id;
                                  const reply = await CommentApi.create(postId, { content: val, parent: c._id });
                                  setComments((prev) => prev.map(x => x._id === c._id ? { ...x, replies: [...(x.replies||[]), reply] } : x));
                                  ev.currentTarget.value = '';
                                  setReplyFor(null);
                                } catch (_) {}
                              }
                            }}
                            style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #e0e0e0' }}
                          />
                        </Stack>
                      )}
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Phòng trọ tương tự */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Phòng Trọ Tương Tự
            </Typography>
            <Grid container spacing={2}>
              {similarRooms.map((similarRoom) => (
                <Grid item xs={12} sm={4} md={4} key={similarRoom.id}>
                  <Card variant="outlined" sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}>
                    <Box sx={{ position: 'relative', height: 160 }}>
                      <Box 
                        component="img" 
                        src={similarRoom.image} 
                        alt={similarRoom.title}
                        sx={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }} 
                      />
                      <Chip 
                        label="Đã Xác Thực" 
                        size="small" 
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          left: 8,
                          bgcolor: 'success.main',
                          color: 'white'
                        }} 
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          const newFavorites = new Set(favorites);
                          if (newFavorites.has(similarRoom.id)) {
                            newFavorites.delete(similarRoom.id);
                          } else {
                            newFavorites.add(similarRoom.id);
                          }
                          setFavorites(newFavorites);
                          localStorage.setItem('favoriteRoomIds', JSON.stringify([...newFavorites]));
                          window.dispatchEvent(new Event('favoritesUpdated'));
                        }}
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8,
                          bgcolor: 'rgba(255,255,255,0.9)'
                        }}
                      >
                        {favorites.has(similarRoom.id) ? 
                          <Favorite color="error" fontSize="small" /> : 
                          <FavoriteBorder fontSize="small" />
                        }
                      </IconButton>
                    </Box>
                    <CardContent sx={{ 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      p: 1.5
                    }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.875rem' }}>
                          {similarRoom.title}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                          <MuiRating value={3} readOnly size="small" />
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                            ID:{similarRoom.id}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                          <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {similarRoom.district}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', fontSize: '0.75rem' }}>
                            {similarRoom.area}m²
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} sx={{ mb: 0.5, flexWrap: 'wrap' }}>
                          {similarRoom.utilities?.slice(0, 2).map((utility, index) => (
                            <Chip key={index} label={utility} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
                          ))}
                        </Stack>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                            {similarRoom.price}
                          </Typography>
                          <Chip label="-20%" color="error" size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => navigate(`/room/${similarRoom.id}`)}
                          sx={{ flex: 1, textTransform: 'none', fontSize: '0.75rem', py: 0.5 }}
                        >
                          Xem chi tiết
                        </Button>
                        <Button 
                          variant="contained" 
                          size="small" 
                          startIcon={<Phone sx={{ fontSize: 14 }} />}
                          sx={{ flex: 1, textTransform: 'none', fontSize: '0.75rem', py: 0.5 }}
                        >
                          Liên hệ
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button 
                variant="contained" 
                onClick={() => navigate('/rooms')}
                sx={{ textTransform: 'none' }}
              >
                Xem Thêm
              </Button>
            </Box>
          </Paper>

          {/* Vị trí trên bản đồ (dữ liệu thật, dùng địa chỉ, không cần API key) */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Vị Trí Trên Bản Đồ
              </Typography>
              <Button 
                variant="contained" 
                size="small"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${room.address}, ${room.ward ? room.ward + ', ' : ''}${room.district}, ${room.city}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textTransform: 'none' }}
              >
                Xem Trên Google Map
              </Button>
            </Box>
            
            <Box sx={{ 
              height: 400, 
              borderRadius: 2, 
              overflow: 'hidden',
              border: '1px solid #e0e0e0'
            }}>
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(`${room.address}, ${room.ward ? room.ward + ', ' : ''}${room.district}, ${room.city}`)}&z=15&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Bản đồ ${room.title}`}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              <strong>Địa chỉ:</strong> {room.address}{room.ward ? `, ${room.ward}` : ''}, {room.district}, {room.city}
            </Typography>
          </Paper>

        </Grid>
      </Grid>

      {/* Floating contact card at bottom right corner */}
      <Box sx={{ 
        position: 'fixed', 
        right: { xs: 12, md: 28 }, 
        bottom: { xs: 20, md: 28 }, 
        zIndex: 1200, 
        width: { xs: 330, md: 380 }
      }}>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Liên hệ ngay
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowContactCard(!showContactCard)}
              startIcon={showContactCard ? <ExpandLess /> : <ExpandMore />}
              sx={{ textTransform: 'none', minWidth: 'auto', p: 1 }}
            >
              {showContactCard ? 'Ẩn' : 'Hiện'}
            </Button>
          </Box>
          
          {showContactCard && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <Avatar sx={{ width: 52, height: 52 }}>
                  {(room.author || 'N').charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {room.author || 'Người đăng'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Phone sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="body1" color="text.secondary">
                      {room.phone || '0123.456.789'}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.25} sx={{ mt: 1.25 }}>
                <Button variant="outlined" size="medium" startIcon={<Phone /> } sx={{ textTransform: 'none', flex: 1, borderRadius: 999, fontWeight: 600, height: 40 }}>
                  Gọi ngay
                </Button>
                <Button variant="contained" size="medium" startIcon={<Message /> } sx={{ textTransform: 'none', flex: 1, borderRadius: 999, fontWeight: 600, height: 40 }}>
                  Gửi tin nhắn
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
                <Button variant="outlined" size="small" startIcon={<Save /> } sx={{ textTransform: 'none', borderRadius: 999 }}>
                  Lưu
                </Button>
              </Stack>
            </Paper>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default RoomDetailPage;
