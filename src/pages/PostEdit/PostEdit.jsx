import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  useTheme,
  TextField,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  fetchPostByIdAction,
  updatePostAction,
  uploadFiles,
} from "../../services/api/postApi";
import SelectLocation from "../UserLayout/component/selectLocation";
import BasicInfoSection from "../UserLayout/component/BasicInfoSection";
import UtilitiesSection from "../UserLayout/component/UtilitiesSection";
import CostsSection from "../UserLayout/component/CostsSection";
import HouseRulesSection from "../UserLayout/component/HouseRulesSection";
import MediaUploadSection from "../UserLayout/component/MediaUploadSection";
import ContractSection from "../UserLayout/component/ContractSection";
import { useToast } from '../../Components/ToastProvider';

const PostEdit = () => {
  const theme = useTheme();
  const { postId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [post, setPost] = useState(null);

  // Form state mirrors PostRoomPages
  const [title, setTitle] = useState("");
  const [overviewDescription, setOverviewDescription] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    priceFrom: "",
    priceTo: "",
    area: "",
    province: "",
    district: "",
    ward: "",
    street: "",
  });

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [address, setAddress] = useState("");
  const [nameLocation, setNameLocation] = useState({
    provinceName: "",
    districtName: "",
    wardName: "",
  });

  const [selectedUtilities, setSelectedUtilities] = useState([]);
  const [additionalCosts, setAdditionalCosts] = useState([]);
  const [postTier, setPostTier] = useState('normal');
  const [newCost, setNewCost] = useState({ type: "", frequency: "" });
  const [houseRules, setHouseRules] = useState("");

  // media local file lists and url lists
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [contractImages, setContractImages] = useState([]);
  const [imagesUrls, setImagesUrls] = useState([]);
  const [videosUrls, setVideosUrls] = useState([]);
  const [contractUrls, setContractUrls] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const p = await fetchPostByIdAction(postId, dispatch);
        if (!mounted) return;
        if (!p) {
          showToast('Không tìm thấy bài đăng', 'error');
          setPost(null);
          return;
        }
        setPost(p);

        // prefill form state with post data
        setTitle(p.title || "");
        setOverviewDescription(p.overviewDescription || "");
        setFilters(prev => ({
          ...prev,
          category: p.category || prev.category,
          priceFrom: (p.priceFrom ?? (p.room?.price)) || prev.priceFrom,
          area: (p.area ?? (p.room?.area)) || prev.area,
        }));

        // location
        setSelectedProvince(p.room?.province || "");
        setSelectedDistrict(p.room?.district || "");
        setAddress(p.room?.detailAddress || p.room?.address || "");
        setNameLocation(prev => ({
          ...prev,
          provinceName: p.room?.province || prev.provinceName,
          districtName: p.room?.district || prev.districtName,
          wardName: p.room?.ward || prev.wardName,
        }));

        setSelectedUtilities(Array.isArray(p.utilities) ? p.utilities : []);
        setAdditionalCosts(Array.isArray(p.additionalCosts) ? p.additionalCosts : []);
        setHouseRules(p.houseRules || "");

        // images/videos/contracts: show existing urls in lists so user can remove/add
  setImagesUrls(Array.isArray(p.images) ? p.images : (Array.isArray(p.room?.images) ? p.room.images : []));
        setVideosUrls(Array.isArray(p.videos) ? p.videos : []);
        setContractUrls(Array.isArray(p.contractImages) ? p.contractImages : []);
  setPostTier(p.postTier || 'normal');

      } catch (err) {
        console.error('Load post error', err);
        showToast('Lỗi khi tải dữ liệu bài đăng', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [postId, dispatch, showToast]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleUtilityChange = (utility) => {
    setSelectedUtilities(prev =>
      prev.includes(utility) ? prev.filter(i => i !== utility) : [...prev, utility]
    );
  };

  const handleAddCost = () => {
    if (newCost.type && newCost.frequency) {
      setAdditionalCosts(prev => [...prev, { ...newCost, id: Date.now() }]);
      setNewCost({ type: "", frequency: "" });
    }
  };

  const handleRemoveCost = (id) => {
    setAdditionalCosts(prev => prev.filter(cost => cost.id !== id));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length + uploadedImages.length > 15) {
      alert('Tối đa 15 ảnh với tin đăng.');
      return;
    }
    setUploadedImages(prev => [...prev, ...files]);
  };

  const handleVideoUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length + uploadedVideos.length > 2) {
      alert('Tối đa 2 video với tin đăng');
      return;
    }
    setUploadedVideos(prev => [...prev, ...files]);
  };

  const handleContractUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length + contractImages.length > 6) {
      alert('Tối đa 6 ảnh hợp đồng');
      return;
    }
    setContractImages(prev => [...prev, ...files]);
  };

  const removeImage = (index, type) => {
    if (type === 'images') {
      setUploadedImages(prev => prev.filter((_, i) => i !== index));
      setImagesUrls(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'videos') {
      setUploadedVideos(prev => prev.filter((_, i) => i !== index));
      setVideosUrls(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'contract') {
      setContractImages(prev => prev.filter((_, i) => i !== index));
      setContractUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    // Basic validation similar to PostRoomPages
    const missing = [];
    if (!title || !title.trim()) missing.push('Tiêu đề');
    if (!overviewDescription || !overviewDescription.trim()) missing.push('Mô tả');
    if (!filters.category) missing.push('Loại phòng');
    if (!filters.priceFrom && !filters.priceTo && !imagesUrls.length) {
      // not strict: allow updates without price if user intends
    }
    if (!(nameLocation?.provinceName) && !selectedProvince) missing.push('Tỉnh/Thành');
    if (!(nameLocation?.districtName) && !selectedDistrict) missing.push('Quận/Huyện');
    if (!address || !address.trim()) missing.push('Địa chỉ chi tiết');
    if (missing.length) {
      showToast('Vui lòng điền các trường bắt buộc: ' + missing.join(', '), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // upload selected local files and merge with existing URLs
      let finalImageUrls = Array.isArray(imagesUrls) ? [...imagesUrls] : [];
      let finalVideoUrls = Array.isArray(videosUrls) ? [...videosUrls] : [];
      let finalContractUrls = Array.isArray(contractUrls) ? [...contractUrls] : [];

      if (Array.isArray(uploadedImages) && uploadedImages.length) {
        const urls = await uploadFiles(uploadedImages, 'posts/media', 3);
        finalImageUrls = [...finalImageUrls, ...urls];
      }
      if (Array.isArray(uploadedVideos) && uploadedVideos.length) {
        const urls = await uploadFiles(uploadedVideos, 'posts/media', 2);
        finalVideoUrls = [...finalVideoUrls, ...urls];
      }
      if (Array.isArray(contractImages) && contractImages.length) {
        const urls = await uploadFiles(contractImages, 'posts/contracts', 2);
        finalContractUrls = [...finalContractUrls, ...urls];
      }

      const payload = {
        title,
        overviewDescription,
        postType: post?.postType || 'room_rental',
        postTier,
        category: filters.category,
        priceFrom: filters.priceFrom,
        priceTo: filters.priceTo,
        area: filters.area,
        utilities: selectedUtilities,
        additionalCosts,
        houseRules,
        images: finalImageUrls,
        videos: finalVideoUrls,
        contractImages: finalContractUrls,
        room: {
          price: Number(filters.priceFrom) || (post?.room?.price || 0),
          area: Number(filters.area) || (post?.room?.area || 0),
          district: nameLocation.districtName || post?.room?.district || '',
          province: nameLocation.provinceName || post?.room?.province || '',
          detailAddress: address || post?.room?.detailAddress || '',
        },
      };

      const res = await updatePostAction(postId, payload, dispatch);
      if (res?.error) {
        showToast('Cập nhật thất bại', 'error');
        } else {
        showToast('Cập nhật thành công', 'success');
        navigate('/user/posts');
      }
    } catch (err) {
      console.error('Submit edit error', err);
      showToast('Có lỗi khi lưu bài đăng', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Typography>Đang tải...</Typography>;
  if (!post) return <Typography color="error">Không tìm thấy bài đăng</Typography>;

  return (
    <Box
      className="invite-roommate-content"
      sx={{ minHeight: "100vh", backgroundColor: "#fff", p: 2, width: "100%" }}
    >
      <Box sx={{ mb: 4, textAlign: "left" }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: "bold", color: theme.palette.primary.main, mb: 1, textAlign: "left" }}
        >
          Chỉnh sửa bài đăng
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={12}>
          <Grid size={{ xs: 12, sm: 10, md: 8, lg: 8 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" mb={1} sx={{ textAlign: "left" }}>
                Tiêu đề
              </Typography>
              <TextField fullWidth size="small" placeholder="Tiêu đề bài đăng " value={title} onChange={(e) => setTitle(e.target.value)} sx={{ bgcolor: "#fff" }} />
                <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ minWidth: 80 }}>Phân loại</Typography>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <Select value={postTier} onChange={(e) => setPostTier(e.target.value)}>
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="vip">VIP</MenuItem>
                      <MenuItem value="svip">S-VIP</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" mb={1} sx={{ textAlign: "left" }}>
                Mô tả chung
              </Typography>
              <TextField fullWidth size="small" placeholder="Mô tả ngắn tối đa 200 ký tự" value={overviewDescription} onChange={(e) => setOverviewDescription(e.target.value)} sx={{ bgcolor: "#fff", mt: 1 }} inputProps={{ maxLength: 200 }} />
            </Box>
          </Grid>

          <BasicInfoSection selectedCategory={filters.category} setSelectedCategory={(v) => handleFilterChange('category', v)} selectedPrice={filters.priceFrom} setSelectedPrice={(v) => handleFilterChange('priceFrom', v)} selectedArea={filters.area} setSelectedArea={(v) => handleFilterChange('area', v)} />

          <SelectLocation selectedProvince={selectedProvince} setSelectedProvince={setSelectedProvince} selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict} selectedWard={selectedWard} setSelectedWard={setSelectedWard} address={address} setAddress={setAddress} setNameLocation={setNameLocation} nameLocation={nameLocation} />

          <UtilitiesSection selectedUtilities={selectedUtilities} handleUtilityChange={handleUtilityChange} />

          <CostsSection additionalCosts={additionalCosts} newCost={newCost} setNewCost={setNewCost} handleAddCost={handleAddCost} handleRemoveCost={handleRemoveCost} />

          <HouseRulesSection houseRules={houseRules} setHouseRules={setHouseRules} />

          <MediaUploadSection uploadedImages={uploadedImages} uploadedVideos={uploadedVideos} handleImageUpload={handleImageUpload} handleVideoUpload={handleVideoUpload} removeImage={removeImage} disabled={isSubmitting} imagesUrls={imagesUrls} videosUrls={videosUrls} setImagesUrls={setImagesUrls} setVideosUrls={setVideosUrls} />

          <ContractSection contractImages={contractImages} handleContractUpload={handleContractUpload} removeImage={removeImage} disabled={isSubmitting} contractUrls={contractUrls} setContractUrls={setContractUrls} />

          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button variant="contained" color="primary" size="large" onClick={handleSubmit} disabled={isSubmitting} sx={{ px: 6, py: 1.5, fontSize: "1.1rem", fontWeight: "bold" }}>
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PostEdit;
