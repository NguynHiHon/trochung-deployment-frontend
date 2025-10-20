
import {
    Box,
    Typography,
    Grid,
    Button,
    FormControl,
    Select,
    MenuItem,
    TextField,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import LeafletMap from '../../../Components/Map/LeafletMap';

const SelectLocation = ({ 
    selectedProvince, setSelectedProvince,
    selectedDistrict, setSelectedDistrict, 
    selectedWard, setSelectedWard,
    address, setAddress,
    setNameLocation, nameLocation
}) => {
    // State quản lý bộ lọc
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    // State để lưu vị trí bản đồ
    const [mapLocation, setMapLocation] = useState(null);
    const [mapMarker, setMapMarker] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);


    const getWardName = (wardCode) => {
        const wardName = wards.find(w => w.code === wardCode)?.name || '';
        setNameLocation(prev => ({
            ...prev,
            wardName: wardName
        }));
    }
    // Load tỉnh/thành phố 
    useEffect(() => {
        // detect simple mobile view by user agent — used to hide interactive map on mobile
        try {
            const ua = navigator.userAgent || '';
            const isMobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
            setIsMobileView(Boolean(isMobileUA));
        } catch (e) {
            setIsMobileView(false);
        }

        const fetchProvinces = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://provinces.open-api.vn/api/p/');
                const data = await response.json();
                setProvinces(data);
            } catch (error) {
                console.error('Error fetching provinces:', error);
                // Fallback to static data if API fails
                setProvinces([
                    { code: 79, name: "TP. Hồ Chí Minh" },
                    { code: 1, name: "Hà Nội" },
                   
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchProvinces();
    }, []);

    // Load quận/huyện khi chọn tỉnh
    const handleProvinceChange = async (provinceCode) => {
        setSelectedProvince(provinceCode);
        // update province name and reset district/ward names atomically
        setNameLocation(prev => ({
            ...prev,
            provinceName: provinces.find(p => p.code === provinceCode)?.name || '',
            districtName: '',
            wardName: ''
        }));

        setSelectedDistrict('');
        setSelectedWard('');
        setDistricts([]);
        setWards([]);

        if (provinceCode) {
            try {
                setLoading(true);
                // tưởng t dùng chat nên mới dùng fetch đúng k k phải đâu nha vì đây là api public nên dùng fetch vởi axios đã dược config luôn gọi đén localhost 8000 rồi nha :
                const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
                const data = await response.json();
                setDistricts(data.districts || []);
            } catch (error) {
                console.error('Error fetching districts:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    // Load quận/huyện khi chọn huyện
    const handleDistrictChange = async (districtCode) => {
        setSelectedDistrict(districtCode);
        // update district name and reset ward name
        setNameLocation(prev => ({
            ...prev,
            districtName: districts.find(d => d.code === districtCode)?.name || '',
            wardName: ''
        }));
        setSelectedWard('');
        if (districtCode) {
            try {
                setLoading(true);
                const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
                const data = await response.json();
                setWards(data.wards || []);
            } catch (error) {
                console.error('Error fetching wards:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    // Hàm xử lý khi người dùng nhấn nút "Xác nhận vị trí"
    const createMapLocation = () => {
        const selectedProvinceData = provinces.find(p => p.code === selectedProvince);
        const selectedDistrictData = districts.find(d => d.code === selectedDistrict);
        const selectedWardData = wards.find(w => w.code === selectedWard);

    // Xây dựng địa chỉ đã định dạng: nếu địa chỉ chi tiết rỗng/null thì chỉ dùng phường/quận/tỉnh
    const parts = [];
    if (address && address.trim()) parts.push(address.trim());
    if (selectedWardData?.name) parts.push(selectedWardData.name);
    if (selectedDistrictData?.name) parts.push(selectedDistrictData.name);
    if (selectedProvinceData?.name) parts.push(selectedProvinceData.name);
    const fullAddress = parts.join(', ');

    // Lưu các tên dễ đọc vào state chung để component cha có thể sử dụng
        const provinceName = selectedProvinceData?.name || '';
        const districtName = selectedDistrictData?.name || '';
        const wardName = selectedWardData?.name || '';

        setNameLocation(prev => ({
            ...prev,
            provinceName,
            districtName,
            wardName
        }));

        // Xác nhận vị trí (no console output)

        const formatted = fullAddress.trim();
        setMapLocation(formatted);
    // Thử forward-geocoding (tìm tọa độ từ địa chỉ) để lấy lat/lng và căn bản đồ
        (async () => {
            try {
                // clear previous results (UI disabled)
                const candidates = [];
                const provincePart = selectedProvinceData?.name || '';
                const districtPart = selectedDistrictData?.name || '';
                const wardPart = selectedWardData?.name || '';
                if (formatted) candidates.push(formatted + ', Vietnam');
                // thêm các phương án ít chi tiết hơn để tăng khả năng tìm được
                const areaOnly = [wardPart, districtPart, provincePart].filter(Boolean).join(', ');
                if (areaOnly) candidates.push(areaOnly + ', Vietnam');
                if (provincePart) candidates.push(provincePart + ', Vietnam');
                // bổ sung các biến thể hay gặp: không dấu và thêm hậu tố 'Province'
                const removeDiacritics = (s = '') => s.normalize('NFD').replace(/\p{Diacritic}/gu, '');
                try {
                    if (provincePart) {
                        const provNoDiac = removeDiacritics(provincePart);
                        if (provNoDiac && provNoDiac !== provincePart) candidates.push(provNoDiac + ', Vietnam');
                        // thêm dạng 'Province' để tăng khả năng match ở một số index
                        candidates.push(`${provincePart} Province, Vietnam`);
                    }
                    if (areaOnly) {
                        const areaNoDiac = removeDiacritics(areaOnly);
                        if (areaNoDiac && areaNoDiac !== areaOnly) candidates.push(areaNoDiac + ', Vietnam');
                    }
                } catch (e) {
                    // ignore diacritics helper failures
                }

                // helper: chuẩn hoá chuỗi (lowercase, bỏ dấu) để so sánh
                const normalize = (s = '') => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
                let found = null;
                for (const q of candidates) {
                        try {
                        const enc = encodeURIComponent(q);
                        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${enc}&addressdetails=1&limit=5`);
                        if (!res.ok) {
                            // Nominatim trả lỗi cho q
                            continue;
                        }
                        const results = await res.json();
                        if (results && results.length > 0) {
                            // list top display_names (shortened)
                        }
                        if (!results || results.length === 0) {
                            // Không có kết quả cho candidate
                            continue;
                        }
                                // kết quả trả về sẽ được dùng nội bộ để chọn preferred
                        // ưu tiên kết quả:
                        // 1) nếu display_name chứa nguyên chuỗi tìm (normalize)
                        // 2) nếu query chứa 'đại học' ưu tiên loại university
                        // 3) ưu tiên chứa quận + tỉnh (normalize)
                        let preferred = null;
                        // 1) check chứa nguyên chuỗi tìm (normalize)
                        if (formatted) {
                            preferred = results.find(r => normalize(r.display_name || '').includes(normalize(formatted)));
                        }
                        // (removed university-specific heuristic to avoid over-prioritizing educational places)
                        // 3) ưu tiên chứa quận + tỉnh (normalize)
                        if (!preferred && districtPart && provincePart) {
                            preferred = results.find(r => {
                                const nameNorm = normalize(r.display_name || '');
                                return nameNorm.includes(normalize(districtPart)) && nameNorm.includes(normalize(provincePart));
                            });
                            // preferred found based on district+province
                        }
                        const r = preferred || results[0];
                        const lat = parseFloat(r.lat);
                        const lng = parseFloat(r.lon);
                        const display = r.display_name || q;
                        found = { lat, lng, display };
                        break;
                    } catch (innerErr) {
                        // Thử geocode thất bại cho candidate
                        continue;
                    }
                }

                if (found) {
                    setMapMarker({ lat: found.lat, lng: found.lng, address: found.display });
                    setNameLocation(prev => ({
                        ...prev,
                        mapLat: found.lat,
                        mapLng: found.lng,
                        mapAddress: found.display
                    }));
                    // Hiển thị địa chỉ chính là chuỗi do user nhập (formatted).
                    setMapLocation(formatted || found.display);
                } else {
                    // phương án dự phòng: không tìm thấy tọa độ
                    setMapMarker(prev => prev || null);
                }
            } catch (err) {
                // Forward geocode thất bại
                setMapMarker(prev => prev || null);
            }
        })();
    };

    // Tự động cập nhật tên đọc được và mapLocation khi các phần được chọn và có địa chỉ
    useEffect(() => {
        const provinceName = provinces.find(p => p.code === selectedProvince)?.name || '';
        const districtName = districts.find(d => d.code === selectedDistrict)?.name || '';
        const wardName = wards.find(w => w.code === selectedWard)?.name || '';
        if (provinceName || districtName || wardName) {
            setNameLocation(prev => ({ ...prev, provinceName, districtName, wardName }));
        }
        // Nếu tất cả các phần địa chỉ rỗng (ví dụ sau khi đăng tin thành công và parent đã clear),
        // thì clear trạng thái bản đồ bên trong component để không còn marker/địa chỉ hiển thị.
        if (!selectedProvince && !selectedDistrict && !selectedWard && (!address || !address.trim())) {
            setMapMarker(null);
            setMapLocation(null);
            // xóa tọa độ/địa chỉ map trong state cha nếu còn
            setNameLocation(prev => ({ ...prev, mapLat: null, mapLng: null, mapAddress: '' }));
        }
        // Không tự động set mapLocation khi người dùng chỉ gõ địa chỉ chi tiết.
        // mapLocation chỉ được cập nhật khi user nhấn "Xác nhận" (createMapLocation)
        // hoặc khi click trực tiếp lên bản đồ.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProvince, selectedDistrict, selectedWard, address, provinces, districts, wards]);
    return (
        <>
            <Box sx={{ mb: 2 }}>
                <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    mb={1}
                    sx={{ textAlign: 'left' }}
                >
                    Khu vực
                </Typography>

                {/* Hàng 3a: Tỉnh + Huyện + Phường + Địa chỉ - 4 CỘT NGANG */}
                <Grid container spacing={2} mb={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <Typography
                            variant="body2"
                            mb={0.5}
                            sx={{ textAlign: 'left' }}
                        >
                            Tỉnh / Thành phố
                        </Typography>
                        <FormControl fullWidth size="small" sx={{ bgcolor: '#fff' }}>
                            <Select
                                value={selectedProvince}
                                onChange={(e) => handleProvinceChange(e.target.value)}
                                displayEmpty
                                sx={{
                                    '& .MuiSelect-select': {
                                        color: selectedProvince ? 'inherit' : '#999',
                                    }
                                }}
                            >
                                <MenuItem value="" disabled sx={{ color: '#999' }}>
                                    {loading ? 'Đang tải...' : 'Chọn Tỉnh/Thành phố'}
                                </MenuItem>
                                {provinces.map((province) => (
                                    <MenuItem key={province.code} value={province.code}>
                                        {province.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <Typography
                            variant="body2"
                            mb={0.5}
                            sx={{ textAlign: 'left' }}
                        >
                            Quận / Huyện
                        </Typography>
                        <FormControl fullWidth size="small" sx={{ bgcolor: '#fff' }}>
                            <Select
                                value={selectedDistrict}
                                onChange={(e) => handleDistrictChange(e.target.value)}
                                displayEmpty
                                sx={{
                                    '& .MuiSelect-select': {
                                        color: selectedDistrict ? 'inherit' : '#999',
                                    }
                                }}
                            >
                                <MenuItem value="" disabled sx={{ color: '#999' }}>
                                    {!selectedProvince ? 'Chọn tỉnh trước' : (loading ? 'Đang tải...' : 'Chọn Quận/Huyện')}
                                </MenuItem>
                                {districts.map((district) => (
                                    <MenuItem key={district.code} value={district.code}>
                                        {district.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <Typography
                            variant="body2"
                            mb={0.5}
                            sx={{ textAlign: 'left' }}
                        >
                            Phường / Xã
                        </Typography>
                        <FormControl fullWidth size="small" sx={{ bgcolor: '#fff' }}>
                            <Select
                                value={selectedWard}
                                onChange={(e) => {setSelectedWard(e.target.value); getWardName(e.target.value)}}
                                displayEmpty
                                sx={{
                                    '& .MuiSelect-select': {
                                        color: selectedWard ? 'inherit' : '#999',
                                    }
                                }}
                            >
                                <MenuItem value="" disabled sx={{ color: '#999' }}>
                                    {!selectedDistrict ? 'Chọn quận trước' : (loading ? 'Đang tải...' : 'Chọn Phường/Xã')}
                                </MenuItem>
                                {wards.map((ward) => (
                                    <MenuItem key={ward.code} value={ward.code}>
                                        {ward.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Hàng 3b: Địa chỉ chi tiết (Input field) */}
                <Typography
                    variant="body2"
                    mb={0.5}
                    sx={{ textAlign: 'left' }}
                >
                    Địa chỉ chi tiết
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 10, sm: 6, md: 6, lg: 6 }}>
                        <TextField
                            fullWidth
                            placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường, ...)"
                            size="small"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            sx={{ bgcolor: '#fff' }}
                        />
                    </Grid>
                    <Grid size={{ xs: 4, sm: 2, md: 2, lg: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={createMapLocation}
                            disabled={!selectedProvince || !selectedDistrict || !selectedWard }
                            sx={{
                                height: '40px',
                                width: '100%',
                                minWidth: '108px',
                                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                            }}
                        >
                            Xác nhận
                        </Button>
                    </Grid>
                </Grid>

                {/* Hàng 4: Chỉ có Map - FULL WIDTH */}
                <Box sx={{ mb: 2 }}>
                    <Typography
                        variant="body2"
                        mb={1}
                        sx={{ textAlign: 'left' }}
                    >
                        Vị trí trên bản đồ
                    </Typography>
                    {mapLocation && (
                        <Typography
                            variant="body2"
                            mb={1}
                            sx={{
                                textAlign: 'left',
                                color: '#2e7d32',
                                fontWeight: 'bold',
                                bgcolor: '#e8f5e8',
                                p: 1,
                                borderRadius: 1
                            }}
                        >
                            📍 Địa chỉ đã xác nhận: {mapLocation}
                        </Typography>
                    )}
                    {/* removed system-resolved display */}
                    <Box sx={{ width: '100%', height: '400px' }}>
                        <Box sx={{ width: '100%', height: '100%' }}>
                            {isMobileView ? (
                                <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
                                    <Typography variant="body1" color="text.primary" fontWeight="bold">
                                        Chức năng xem bản đồ chỉ hỗ trợ trên máy tính.
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Vui lòng sử dụng máy tính để chọn tọa độ trực tiếp trên bản đồ. Trên điện thoại, vui lòng chọn tỉnh/quận/phường và nhấn "Xác nhận" để tự động căn tọa độ.
                                    </Typography>
                                </Box>
                            ) : (
                                <LeafletMap
                                    center={mapMarker ? { lat: mapMarker.lat, lng: mapMarker.lng } : { lat: 21.0278, lng: 105.8342 }}
                                    zoom={17}
                                    initialMarker={mapMarker}
                                />
                            )}
                            {!mapLocation && (
                                <Box sx={{
                                    position: 'absolute',
                                    left: 24,
                                    top: 24,
                                    zIndex: 900,
                                    bgcolor: '#e8f5e8',
                                    p: 1,
                                    borderRadius: 1,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Vui lòng điền địa chỉ và nhấn "Xác nhận" hoặc click trên bản đồ để chọn tọa độ
                                    </Typography>
                                </Box>
                            )}
                            {/* geocodeResults UI removed (no results list shown) */}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    )
}

export default SelectLocation;