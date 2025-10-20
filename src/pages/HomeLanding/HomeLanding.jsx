import React, { useState, useEffect } from "react";
import "./HomeLanding.css";
import {
    heroSlides,
    featuredPosts,
    latestPosts,
    emergencySharing,
    areaSuggestions
} from "../../data/homeData";

const Placeholder = ({ children }) => (
    <div className="ph" role="img" aria-label="placeholder">
        {children}
    </div>
);

/* --- HERO CAROUSEL (có nút next/prev + auto slide) --- */
const HeroCarousel = () => {
    const [index, setIndex] = useState(0);
    const total = heroSlides.length;

    const handlePrev = () => {
        setIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
    };

    const handleNext = () => {
        setIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % total);
        }, 4000); // tự động trượt mỗi 4s
        return () => clearInterval(interval);
    }, [total]);

    return (
        <section className="hero">
            <div className="hero-slider-wrapper">
                <button className="nav prev" onClick={handlePrev}>‹</button>

                <div
                    className="hero-slider"
                    style={{ transform: `translateX(-${index * 100}%)` }}
                >
                    {heroSlides.map((s) => (
                        <Placeholder key={s.id}>
                            <h1>{s.title}</h1>
                        </Placeholder>
                    ))}
                </div>

                <button className="nav next" onClick={handleNext}>›</button>
            </div>

            <div className="dots">
                {heroSlides.map((s, idx) => (
                    <span
                        key={s.id}
                        className={`dot ${idx === index ? "active" : ""}`}
                        onClick={() => setIndex(idx)}
                    />
                ))}
            </div>
        </section>
    );
};

/* --- POST CARD --- */
const PostCard = ({ post }) => (
    <article className="card">
        <Placeholder />
        <div className="card-body">
            <div className="card-meta">
                <span>{post.author || "Tên người đăng"}</span>
                <span>{post.date || "1/1/2024"}</span>
            </div>
            <h3>{post.title}</h3>
            {post.description && <p>{post.description}</p>}
            {(post.price || post.priceLabel) && (
                <div className="price">{post.price || post.priceLabel}</div>
            )}
            <button className="btn">Contact us</button>
        </div>
    </article>
);

/* --- POSTS SECTION --- */
const PostsSection = ({ title, items }) => (
    <section className="row-section">
        <h3 className="section-title">{title}</h3>
        <div className="grid-3">
            {items.map((p) => (
                <PostCard key={p.id} post={p} />
            ))}
        </div>
    </section>
);

/* --- AREA CAROUSEL --- */
const AreaCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(4);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 900) {
                setVisibleCount(1);
            } else {
                setVisibleCount(4);
            }
        };

        handleResize(); // chạy ngay khi load
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handlePrev = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? areaSuggestions.length - visibleCount : prev - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prev) =>
            prev + visibleCount >= areaSuggestions.length ? 0 : prev + 1
        );
    };

    return (
        <section className="areas">
            <h3 className="section-title">Gợi ý khu vực</h3>
            <div className="areas-container">
                <button className="nav prev" onClick={handlePrev}>‹</button>
                <div className="areas-track-wrapper">
                    <div
                        className="areas-track"
                        style={{
                            transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
                        }}
                    >
                        {areaSuggestions.map((a) => (
                            <div key={a.id} className="area-item">
                                <div className="ph">
                                    <span className="badge">{a.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <button className="nav next" onClick={handleNext}>›</button>
            </div>
        </section>
    );
};


/* --- MAIN PAGE --- */
const HomeLanding = () => {
    return (
        <main className="home-landing">
            <div className="container">
                <div className="page-header">
                    <h2>Tìm kiếm chỗ thuê giá tốt</h2>
                    <div className="searchbar">
                        <input placeholder="Search for..." />
                    </div>
                    <p className="subtitle">
                        Công cụ tìm kiếm phòng trọ, nhà nguyên căn, căn hộ cho thuê, tìm người ở
                        ghép nhanh chóng, hiệu quả hơn!
                    </p>
                </div>

                <HeroCarousel />

                {/* --- Tin nổi bật: 3 phòng, to hơn --- */}
                <section className="featured">
                    <h3 className="section-title">Tin nổi bật</h3>
                    <div className="grid-featured">
                        {featuredPosts.slice(0, 3).map((p) => (
                            <PostCard key={p.id} post={p} />
                        ))}
                    </div>
                </section>

                {/* --- Vừa mới đăng: 4 phòng, nhỏ hơn --- */}
                <section className="latest">
                    <h3 className="section-title">Vừa mới đăng</h3>
                    <div className="grid-small">
                        {latestPosts.slice(0, 4).map((p) => (
                            <PostCard key={p.id} post={p} />
                        ))}
                    </div>
                </section>

                {/* --- Ở ghép khẩn cấp: 4 phòng, nhỏ hơn --- */}
                <section className="emergency">
                    <h3 className="section-title">Ở ghép khẩn cấp</h3>
                    <div className="grid-small">
                        {emergencySharing.slice(0, 4).map((p) => (
                            <PostCard key={p.id} post={p} />
                        ))}
                    </div>
                </section>


                <AreaCarousel />
            </div>
        </main>
    );
};

export default HomeLanding;
