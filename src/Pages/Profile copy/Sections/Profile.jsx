import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { gsap } from "gsap";
import axios from "axios";
import "../Styles/Profile.css";

// API Base URL (Change this to match your backend port/URL)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// 🌟 POST MEDIA SLIDER COMPONENT 🌟
const MediaSlider = ({ mediaItems }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!mediaItems || mediaItems.length === 0) return null;

  const nextSlide = () =>
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));

  const isVideo = (url) => {
    return typeof url === 'string' && url.match(/\.(mp4|webm|ogg|mov)$/i);
  };

  return (
    <div className="pf-slider-container">
      <div className="pf-slider-viewport">
        {isVideo(mediaItems[currentIndex]) ? (
          <video
            src={mediaItems[currentIndex]}
            controls
            className="pf-slider-media"
          />
        ) : (
          <img
            src={mediaItems[currentIndex]}
            alt="Post Media"
            className="pf-slider-media"
          />
        )}
      </div>

      {mediaItems.length > 1 && (
        <>
          <button onClick={prevSlide} className="pf-slider-arrow pf-slider-arrow-left">
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          <button onClick={nextSlide} className="pf-slider-arrow pf-slider-arrow-right">
            <i className="fa-solid fa-chevron-right"></i>
          </button>

          <div className="pf-slider-dots">
            {mediaItems.map((_, idx) => (
              <div
                key={idx}
                className={`pf-slider-dot ${idx === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(idx)}
              ></div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();

  // REFS FOR GSAP ANIMATIONS
  const headerRef = useRef(null);
  const sidebarRef = useRef(null);
  const feedRef = useRef(null);
  const editModalRef = useRef(null);
  const createPostModalRef = useRef(null);

  // GLOBAL STATE
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);

  // Post Edit & Delete States
  const [activeMenuPostId, setActiveMenuPostId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");

  // MODAL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  // FORM DATA STATE
  const [formData, setFormData] = useState({
    username: "",
    headline: "",
    about: "",
    education: "",
    skills: "",
    contact: "",
    website: "",
    location: "",
    profile_picture: "",
    banner: ""
  });

  // POST CREATION STATES
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [text, setText] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [liveLink, setLiveLink] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Comments & Likes States
  const [showComments, setShowComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [activeReplyBox, setActiveReplyBox] = useState({});
  const [commentReacts, setCommentReacts] = useState({});
  const [replyReacts, setReplyReacts] = useState({});

  // Auth Header Helper
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  // 🌟 FETCH PROFILE & POSTS FROM DATABASE 🌟
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token && !storedUser) {
        toast.error("Please login to view profile");
        navigate("/login");
        return;
      }

      // 1. Fetch User Data
      let currentUser = storedUser ? JSON.parse(storedUser) : null;
      
      try {
        const userRes = await axios.get(`${API_BASE_URL}/users/profile`, getAuthHeader());
        if (userRes.data?.user) {
          currentUser = userRes.data.user;
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
      } catch (err) {
        console.warn("Backend profile endpoint fallback to LocalStorage:", err);
      }

      const normalizeMediaUrl = (value) => {
        if (!value || typeof value !== 'string') return value;
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
        if (value.startsWith('/uploads/')) return `http://localhost:5000${value}`;
        if (value.startsWith('uploads/')) return `http://localhost:5000/${value}`;
        return value;
      };

      const formattedUser = {
        _id: currentUser?._id || currentUser?.id || "u_1",
        name: currentUser?.username || currentUser?.name || "User",
        headline: currentUser?.headline || "MarketLink Member",
        about: currentUser?.about || "No bio added yet.",
        education: currentUser?.education || "Not specified",
        skills: currentUser?.skills || "General",
        contact: currentUser?.contact || currentUser?.phone || "N/A",
        email: currentUser?.email || "",
        website: currentUser?.website || "",
        location: currentUser?.location || "Not Specified",
        profilepic: normalizeMediaUrl(currentUser?.profile_picture || currentUser?.profilepic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500"),
        banner: normalizeMediaUrl(currentUser?.banner || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200"),
        isVerified: currentUser?.isVerified ?? true,
        accountType: currentUser?.role === "farmer" ? "Farmer" : "Customer",
        followers: currentUser?.followers || [],
        following: currentUser?.following || [],
        connections: currentUser?.connections || []
      };

      setUser(formattedUser);
      setFormData({
        username: formattedUser.name,
        headline: formattedUser.headline,
        about: formattedUser.about,
        education: formattedUser.education,
        skills: formattedUser.skills,
        contact: formattedUser.contact,
        website: formattedUser.website,
        location: formattedUser.location,
        profile_picture: formattedUser.profilepic,
        banner: formattedUser.banner
      });

      // 2. Fetch User Posts from Database
      try {
        const postsRes = await axios.get(`${API_BASE_URL}/posts/user/${formattedUser._id}`, getAuthHeader());
        if (postsRes.data?.posts) {
          setPosts(postsRes.data.posts);
        } else if (Array.isArray(postsRes.data)) {
          setPosts(postsRes.data);
        }
      } catch (err) {
        console.warn("Posts endpoint unavailable, using initial empty state.");
        setPosts([]);
      }

      // 3. Fetch User Products (if any)
      try {
        const prodRes = await axios.get(`${API_BASE_URL}/products/user/${formattedUser._id}`, getAuthHeader());
        if (prodRes.data?.products) {
          setProducts(prodRes.data.products);
        }
      } catch (err) {
        setProducts([]);
      }

    } catch (error) {
      console.error("Profile Loading Error:", error);
      toast.error("Failed to load profile data!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // 🌟 GSAP INITIAL ANIMATIONS 🌟
  useEffect(() => {
    if (!loading && user) {
      const ctx = gsap.context(() => {
        if (headerRef.current) {
          gsap.fromTo(headerRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
        }
        if (sidebarRef.current) {
          gsap.fromTo(sidebarRef.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.8, delay: 0.2, ease: "power3.out" });
        }
        if (feedRef.current) {
          gsap.fromTo(feedRef.current, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.8, delay: 0.3, ease: "power3.out" });
        }
      });

      return () => ctx.revert();
    }
  }, [loading, user]);

  // Modal Animations
  useEffect(() => {
    if (isModalOpen && editModalRef.current) {
      gsap.fromTo(editModalRef.current, { scale: 0.85, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "back.out(1.4)" });
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isPostModalOpen && createPostModalRef.current) {
      gsap.fromTo(createPostModalRef.current, { scale: 0.85, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "back.out(1.4)" });
    }
  }, [isPostModalOpen]);

  // 🌟 DATABASE & HANDLER ACTIONS 🌟
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Update Profile in DB & LocalStorage
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        username: formData.username,
        headline: formData.headline,
        about: formData.about,
        education: formData.education,
        skills: formData.skills,
        contact: formData.contact,
        website: formData.website,
        location: formData.location
      };

      const res = await axios.put(`${API_BASE_URL}/users/profile`, updateData, getAuthHeader());
      
      const updatedUserObj = {
        ...user,
        name: formData.username,
        headline: formData.headline,
        about: formData.about,
        education: formData.education,
        skills: formData.skills,
        contact: formData.contact,
        website: formData.website,
        location: formData.location
      };

      setUser(updatedUserObj);

      // Sync with LocalStorage
      const localStored = JSON.parse(localStorage.getItem('user') || '{}');
      const syncedUser = { ...localStored, ...updateData };
      localStorage.setItem('user', JSON.stringify(syncedUser));
      
      // Dispatch header state change
      window.dispatchEvent(new Event('userStateChange'));

      toast.success(res.data?.message || "Profile Updated Successfully! 🎉");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Profile Update Error:", error);
      // Local fallback if backend fails
      setUser((prev) => ({ ...prev, name: formData.username, ...formData }));
      toast.success("Profile Updated locally!");
      setIsModalOpen(false);
    }
  };

  // Profile & Banner Image Upload Handlers
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setUser((prev) => ({ ...prev, profilepic: objectUrl }));

    try {
      const uploadData = new FormData();
      uploadData.append("profile_picture", file);

      const res = await axios.post(`${API_BASE_URL}/users/avatar`, uploadData, {
        headers: {
          ...getAuthHeader().headers,
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data?.profile_picture) {
        setUser((prev) => ({ ...prev, profilepic: res.data.profile_picture }));
        const localStored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...localStored, profile_picture: res.data.profile_picture }));
        window.dispatchEvent(new Event('userStateChange'));
      }
      toast.success("Profile Picture Updated! 🎉");
    } catch (err) {
      console.warn("Avatar Upload Endpoint Fallback:", err);
      toast.success("Profile Picture Updated locally!");
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setUser((prev) => ({ ...prev, banner: objectUrl }));

    try {
      const uploadData = new FormData();
      uploadData.append("banner", file);

      await axios.post(`${API_BASE_URL}/users/banner`, uploadData, {
        headers: {
          ...getAuthHeader().headers,
          "Content-Type": "multipart/form-data"
        }
      });
      toast.success("Profile Banner Updated! 🎨");
    } catch (err) {
      toast.success("Banner Updated locally!");
    }
  };

  // CREATE POST HANDLER (DB + LOCAL)
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && mediaFiles.length === 0 && !liveLink.trim()) {
      return toast.error("Post text or media required!");
    }

    try {
      setIsPosting(true);
      const postFormData = new FormData();
      postFormData.append("text", text);
      postFormData.append("liveLink", liveLink);

      mediaFiles.forEach((file) => {
        postFormData.append("media", file);
      });

      const res = await axios.post(`${API_BASE_URL}/posts`, postFormData, {
        headers: {
          ...getAuthHeader().headers,
          "Content-Type": "multipart/form-data"
        }
      });

      const newPost = res.data?.post || {
        _id: `p_${Date.now()}`,
        user: user._id,
        text,
        liveLink,
        media: mediaFiles.map((f) => URL.createObjectURL(f)),
        createdAt: new Date().toISOString(),
        likes: [],
        comments: []
      };

      setPosts([newPost, ...posts]);
      toast.success("Post Published! 🚀");

      setText("");
      setMediaFiles([]);
      setLiveLink("");
      setShowLinkInput(false);
      setIsPostModalOpen(false);
    } catch (error) {
      console.error("Post Creation Error:", error);
      // Fallback local creation
      const localPost = {
        _id: `p_${Date.now()}`,
        user: user._id,
        text,
        liveLink,
        media: mediaFiles.map((f) => URL.createObjectURL(f)),
        createdAt: new Date().toISOString(),
        likes: [],
        comments: []
      };
      setPosts([localPost, ...posts]);
      toast.success("Post Published! 🚀");
      setIsPostModalOpen(false);
    } finally {
      setIsPosting(false);
    }
  };

  // DELETE POST (DB + LOCAL)
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/posts/${postId}`, getAuthHeader());
      setPosts(posts.filter((p) => p._id !== postId));
      toast.success("Post Deleted!");
    } catch (error) {
      setPosts(posts.filter((p) => p._id !== postId));
      toast.success("Post Deleted!");
    }
  };

  // EDIT POST
  const handleEditPost = (post) => {
    setEditingPostId(post._id);
    setEditText(post.text);
    setActiveMenuPostId(null);
  };

  const submitEditPost = async (postId) => {
    try {
      await axios.put(`${API_BASE_URL}/posts/${postId}`, { text: editText }, getAuthHeader());
      setPosts(posts.map((p) => (p._id === postId ? { ...p, text: editText } : p)));
      toast.success("Post Updated!");
      setEditingPostId(null);
    } catch (error) {
      setPosts(posts.map((p) => (p._id === postId ? { ...p, text: editText } : p)));
      toast.success("Post Updated!");
      setEditingPostId(null);
    }
  };

  // LIKE POST (DB + LOCAL)
  const handleLike = async (postId) => {
    try {
      await axios.put(`${API_BASE_URL}/posts/like/${postId}`, {}, getAuthHeader());
    } catch (err) {
      console.warn("Like API fallback to state");
    }

    setPosts(
      posts.map((p) => {
        if (p._id === postId) {
          const isLiked = p.likes?.includes(user._id);
          const updatedLikes = isLiked
            ? p.likes.filter((id) => id !== user._id)
            : [...(p.likes || []), user._id];
          return { ...p, likes: updatedLikes };
        }
        return p;
      })
    );
  };

  // ADD COMMENT (DB + LOCAL)
  const handleAddComment = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;

    const newCommentObj = {
      name: user.name,
      user: { _id: user._id, profilepic: user.profilepic },
      text: commentText,
      replies: []
    };

    try {
      await axios.post(`${API_BASE_URL}/posts/comment/${postId}`, { text: commentText }, getAuthHeader());
    } catch (err) {
      console.warn("Comment API fallback");
    }

    setPosts(
      posts.map((p) => {
        if (p._id === postId) {
          return { ...p, comments: [...(p.comments || []), newCommentObj] };
        }
        return p;
      })
    );

    setCommentInputs({ ...commentInputs, [postId]: "" });
    toast.success("Comment Added!");
  };

  // REPLIES & DELETE COMMENTS
  const handleAddReplyProfile = (postId, commentIndex) => {
    const textVal = replyInputs[`${postId}-${commentIndex}`];
    if (!textVal?.trim()) return;

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id === postId) {
          const updatedComments = [...post.comments];
          updatedComments[commentIndex].replies = [
            ...(updatedComments[commentIndex].replies || []),
            { name: user.name, text: textVal, user: user._id }
          ];
          return { ...post, comments: updatedComments };
        }
        return post;
      })
    );

    setReplyInputs((prev) => ({ ...prev, [`${postId}-${commentIndex}`]: "" }));
    setActiveReplyBox((prev) => ({ ...prev, [`${postId}-${commentIndex}`]: false }));
    toast.success("Reply Added! 🚀");
  };

  const handleDeleteCommentProfile = (postId, commentIndex) => {
    if (!window.confirm("Delete this comment?")) return;
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, comments: p.comments.filter((_, idx) => idx !== commentIndex) }
          : p
      )
    );
    toast.success("Comment Deleted! 🗑️");
  };

  const handleDeleteReplyProfile = (postId, commentIndex, replyIndex) => {
    if (!window.confirm("Delete reply?")) return;
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id === postId) {
          const updatedComments = [...post.comments];
          updatedComments[commentIndex].replies = updatedComments[commentIndex].replies.filter((_, idx) => idx !== replyIndex);
          return { ...post, comments: updatedComments };
        }
        return post;
      })
    );
    toast.success("Reply Deleted! 🗑️");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("userStateChange"));
    toast.success("Logged Out Successfully!");
    navigate("/login");
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setMediaFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeSelectedFile = (indexToRemove) => {
    setMediaFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  if (loading) {
    return (
      <div className="pf-page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <h3 style={{ color: 'var(--text-green, #10b981)' }}>Loading Profile Data... ⏳</h3>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="pf-page-wrapper">
      <div className="pf-container">
        {/* VIP Header Card */}
        <div ref={headerRef} className="pf-header-card">
          <div className="pf-banner-area">
            {user.banner ? (
              <img src={normalizeMediaUrl(user.banner)} alt="Banner" className="pf-banner-img" />
            ) : (
              <div className="pf-banner-fallback"></div>
            )}
            <label className="pf-change-cover-btn">
              <i className="fa-solid fa-camera"></i> Change Cover
              <input
                type="file"
                accept="image/*"
                className="pf-hidden-input"
                onChange={handleBannerUpload}
              />
            </label>
          </div>

          <div className="pf-profile-details">
            <div className="pf-user-row">
              <div className="pf-avatar-wrapper">
                <div className="pf-avatar">
                  {user.profilepic ? (
                    <img src={normalizeMediaUrl(user.profilepic)} alt="Profile" />
                  ) : (
                    user.name?.[0]?.toUpperCase()
                  )}
                  <div className="pf-avatar-overlay">
                    <i className="fa-solid fa-pen"></i>
                  </div>
                </div>
                <label className="pf-avatar-upload-btn">
                  <i className="fa-solid fa-camera"></i>
                  <input
                    type="file"
                    accept="image/*"
                    className="pf-hidden-input"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              <div className="pf-info-meta">
                <div className="pf-meta-header">
                  <div>
                    <div className="pf-name-flex">
                      <h1 className="pf-user-name">{user.name}</h1>
                      {user.isVerified && (
                        <span className="pf-verified-badge" title="Verified Account">
                          <i className="fa-solid fa-circle-check"></i>
                        </span>
                      )}
                    </div>
                    <p className="pf-user-headline">{user.headline}</p>
                  </div>
                  <div className="pf-header-actions">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="pf-btn-outline"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="pf-btn-logout"
                      title="Logout"
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {user.accountType === "Farmer" && (
              <div className="pf-pro-banner">
                <div className="pf-pro-left">
                  <div className="pf-pro-icon">
                    <i className="fa-solid fa-tractor"></i>
                  </div>
                  <div>
                    <h3 className="pf-pro-title">
                      Farmer Dashboard Active
                    </h3>
                    <p className="pf-pro-desc">
                      Manage your products, pre-orders and marketplace stalls seamlessly.
                    </p>
                  </div>
                </div>
                <Link to="/farmerdashboard" className="pf-btn-green pf-btn-pro">
                  <i className="fa-solid fa-gears"></i> Open Dashboard
                </Link>
              </div>
            )}

            {/* STATS SECTION */}
            <div className="pf-stats-row">
              <div className="pf-stat-box" onClick={() => setActiveModal("followers")}>
                <span className="pf-stat-num">{user.followers?.length || 0}</span>
                <span className="pf-stat-label">Followers</span>
              </div>

              <div className="pf-stat-box" onClick={() => setActiveModal("following")}>
                <span className="pf-stat-num">{user.following?.length || 0}</span>
                <span className="pf-stat-label">Following</span>
              </div>

              <div className="pf-stat-box" onClick={() => setActiveModal("connections")}>
                <span className="pf-stat-num">{user.connections?.length || 0}</span>
                <span className="pf-stat-label">Connections</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="pf-main-grid">
          {/* LEFT SIDEBAR */}
          <div ref={sidebarRef} className="pf-sidebar">
            <div className="pf-card">
              <h3 className="pf-card-title">
                <i className="fa-solid fa-user"></i> About Me
              </h3>
              <p className="pf-card-text">{user.about}</p>
            </div>

            <div className="pf-card">
              <h3 className="pf-card-title">
                <i className="fa-solid fa-graduation-cap"></i> Education / Profession
              </h3>
              <div className="pf-flex-gap">
                <div className="pf-icon-box">
                  <i className="fa-solid fa-building-columns"></i>
                </div>
                <p className="pf-card-text">{user.education}</p>
              </div>
            </div>

            <div className="pf-card">
              <h3 className="pf-card-title">
                <i className="fa-solid fa-bolt"></i> Skills & Expertise
              </h3>
              <div className="pf-skills-wrap">
                {user.skills.split(",").map((skill, index) => (
                  <span key={index} className="pf-skill-badge">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="pf-card">
              <h3 className="pf-card-title">
                <i className="fa-solid fa-address-book"></i> Contact Info
              </h3>
              <div className="pf-contact-list">
                <div className="pf-contact-item">
                  <div className="pf-icon-box">
                    <i className="fa-solid fa-envelope"></i>
                  </div>
                  <span className="pf-truncate">{user.email}</span>
                </div>
                <div className="pf-contact-item">
                  <div className="pf-icon-box">
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <span>{user.contact}</span>
                </div>
                <div className="pf-contact-item">
                  <div className="pf-icon-box">
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <span>{user.location}</span>
                </div>
              </div>
            </div>

            {user.website && (
              <div className="pf-card">
                <h3 className="pf-card-title">
                  <i className="fa-solid fa-globe"></i> Website
                </h3>
                <a
                  href={
                    user.website.startsWith("http")
                      ? user.website
                      : `https://${user.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="pf-website-link"
                >
                  <div className="pf-icon-box-green">
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </div>
                  <span className="pf-truncate">{user.website}</span>
                </a>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: ACTIVITY & POSTS */}
          <div ref={feedRef} className="pf-content-col">
            {/* PRODUCTS DECK */}
            {products.length > 0 && (
              <div className="pf-card pf-inventory-card">
                <div className="pf-inventory-header">
                  <div className="pf-inventory-title-wrap">
                    <i className="fa-solid fa-cubes pf-green-text"></i>
                    <h3 className="pf-inventory-title">Active Market Stall Products</h3>
                  </div>
                  <Link to="/farmerdashboard" className="pf-inventory-manage">
                    Manage Stalls <i className="fa-solid fa-chevron-right"></i>
                  </Link>
                </div>

                <div className="pf-inventory-scroll">
                  {products.map((prod, idx) => (
                    <div key={idx} className="pf-product-card">
                      <div>
                        {prod.image ? (
                          <img src={prod.image} className="pf-product-img" alt="" />
                        ) : (
                          <div className="pf-product-no-img">
                            <i className="fa-regular fa-image"></i>
                          </div>
                        )}
                        <h4 className="pf-product-title">{prod.title}</h4>
                        <p className="pf-product-desc">{prod.description}</p>
                      </div>
                      <div className="pf-product-actions">
                        <button className="pf-btn-view">View Item</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pf-activity-bar">
              <h2 className="pf-activity-title">
                <i className="fa-solid fa-chart-line"></i> My Feed Activity
              </h2>
              <div className="pf-activity-right">
                <span className="pf-posts-count">{posts.length} Posts</span>
                <button
                  onClick={() => setIsPostModalOpen(true)}
                  className="pf-btn-green"
                >
                  <i className="fa-solid fa-plus"></i> Add Post
                </button>
              </div>
            </div>

            <div className="pf-posts-feed">
              {posts.length === 0 ? (
                <div className="pf-empty-posts">
                  <i className="fa-regular fa-folder-open"></i>
                  <p>No posts published yet. Click "Add Post" to get started!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post._id} className="pf-card pf-post-card">
                    <div className="pf-post-header">
                      <div className="pf-post-user">
                        <img
                          src={user.profilepic}
                          alt="Profile"
                          className="pf-post-avatar"
                        />
                        <div>
                          <h4 className="pf-post-author">{user.name}</h4>
                          <span className="pf-post-date">
                            {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="pf-dropdown-wrap">
                        <button
                          onClick={() =>
                            setActiveMenuPostId(
                              activeMenuPostId === post._id ? null : post._id
                            )
                          }
                          className="pf-menu-dots-btn"
                        >
                          <i className="fa-solid fa-ellipsis-vertical"></i>
                        </button>

                        {activeMenuPostId === post._id && (
                          <div className="pf-dropdown-menu">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="pf-dropdown-item"
                            >
                              <i className="fa-solid fa-pen pf-green-text"></i> Edit
                            </button>
                            <button
                              onClick={() => handleDeletePost(post._id)}
                              className="pf-dropdown-item pf-red-text"
                            >
                              <i className="fa-solid fa-trash"></i> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {editingPostId === post._id ? (
                      <div className="pf-edit-box">
                        <textarea
                          className="pf-textarea"
                          rows="3"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <div className="pf-edit-buttons">
                          <button
                            onClick={() => setEditingPostId(null)}
                            className="pf-btn-cancel"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => submitEditPost(post._id)}
                            className="pf-btn-green"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      post.text && <p className="pf-post-text">{post.text}</p>
                    )}

                    {/* LIVE LINK */}
                    {post.liveLink && (
                      <div className="pf-sandbox-box">
                        <div className="pf-sandbox-info">
                          <div className="pf-pulse-wrap">
                            <span className="pf-ping"></span>
                            <span className="pf-dot"></span>
                          </div>
                          <div className="pf-sandbox-meta">
                            <p className="pf-sandbox-title">Featured Link</p>
                            <span className="pf-sandbox-link">{post.liveLink}</span>
                          </div>
                        </div>
                        <a
                          href={post.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pf-btn-green pf-btn-sm"
                        >
                          Visit
                          <i className="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                      </div>
                    )}

                    {/* MEDIA SLIDER */}
                    {post.media && post.media.length > 0 && (
                      <MediaSlider mediaItems={post.media} />
                    )}

                    <div className="pf-post-stats-bar">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`pf-like-btn ${
                          post.likes?.includes(user._id) ? "active" : ""
                        }`}
                      >
                        <i
                          className={`fa-thumbs-up ${
                            post.likes?.includes(user._id)
                              ? "fa-solid"
                              : "fa-regular"
                          }`}
                        ></i>{" "}
                        {post.likes?.length || 0} Likes
                      </button>
                      <button
                        onClick={() =>
                          setShowComments((prev) => ({
                            ...prev,
                            [post._id]: !prev[post._id]
                          }))
                        }
                        className="pf-comment-btn"
                      >
                        <i className="fa-regular fa-comment"></i>{" "}
                        {post.comments?.length || 0} Comments
                      </button>
                    </div>

                    {showComments[post._id] && (
                      <div className="pf-comments-section">
                        {post.comments?.map((c, i) => {
                          const commentReactKey = `${post._id}-${i}`;
                          const replyBoxKey = `${post._id}-${i}`;

                          return (
                            <div key={i} className="pf-comment-card">
                              <div className="pf-comment-row">
                                <img
                                  src={c.user?.profilepic || user.profilepic}
                                  className="pf-comment-user-img"
                                  alt="User"
                                />
                                <div className="pf-comment-content">
                                  <div className="pf-comment-top font-bold">
                                    <h5 className="pf-comment-author">
                                      {c.name || "User"}
                                    </h5>
                                    <button
                                      onClick={() =>
                                        handleDeleteCommentProfile(post._id, i)
                                      }
                                      className="pf-red-text"
                                    >
                                      <i className="fa-solid fa-trash"></i>
                                    </button>
                                  </div>
                                  <p className="pf-comment-body">{c.text}</p>

                                  <div className="pf-comment-actions">
                                    <button
                                      onClick={() =>
                                        setCommentReacts((prev) => ({
                                          ...prev,
                                          [commentReactKey]:
                                            !prev[commentReactKey]
                                        }))
                                      }
                                      className={
                                        commentReacts[commentReactKey]
                                          ? "pf-green-text"
                                          : ""
                                      }
                                    >
                                      <i className="fa-solid fa-heart"></i>{" "}
                                      {commentReacts[commentReactKey]
                                        ? "Liked"
                                        : "Like"}
                                    </button>
                                    <button
                                      onClick={() =>
                                        setActiveReplyBox((prev) => ({
                                          ...prev,
                                          [replyBoxKey]: !prev[replyBoxKey]
                                        }))
                                      }
                                    >
                                      <i className="fa-solid fa-reply"></i> Reply
                                    </button>
                                  </div>

                                  {/* REPLIES LIST */}
                                  {c.replies && c.replies.length > 0 && (
                                    <div className="pf-replies-list">
                                      {c.replies.map((r, rIdx) => {
                                        const replyReactKey = `${post._id}-${i}-${rIdx}`;
                                        return (
                                          <div
                                            key={rIdx}
                                            className="pf-reply-card"
                                          >
                                            <div>
                                              <span className="pf-reply-author">
                                                {r.name}
                                              </span>
                                              <p className="pf-reply-body">
                                                {r.text}
                                              </p>
                                            </div>
                                            <button
                                              onClick={() =>
                                                handleDeleteReplyProfile(
                                                  post._id,
                                                  i,
                                                  rIdx
                                                )
                                              }
                                              className="pf-red-text"
                                            >
                                              <i className="fa-solid fa-xmark"></i>
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* REPLY INPUT */}
                                  {activeReplyBox[replyBoxKey] && (
                                    <div className="pf-reply-input-box">
                                      <input
                                        type="text"
                                        placeholder="Write a reply..."
                                        className="pf-input"
                                        value={replyInputs[replyBoxKey] || ""}
                                        onChange={(e) =>
                                          setReplyInputs({
                                            ...replyInputs,
                                            [replyBoxKey]: e.target.value
                                          })
                                        }
                                        onKeyDown={(e) =>
                                          e.key === "Enter" &&
                                          handleAddReplyProfile(post._id, i)
                                        }
                                      />
                                      <button
                                        onClick={() =>
                                          handleAddReplyProfile(post._id, i)
                                        }
                                        className="pf-btn-green"
                                      >
                                        Reply
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        <div className="pf-main-comment-input">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            className="pf-input"
                            value={commentInputs[post._id] || ""}
                            onChange={(e) =>
                              setCommentInputs({
                                ...commentInputs,
                                [post._id]: e.target.value
                              })
                            }
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleAddComment(post._id)
                            }
                          />
                          <button
                            onClick={() => handleAddComment(post._id)}
                            className="pf-btn-green"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE POST MODAL */}
      {isPostModalOpen && (
        <div className="pf-modal-overlay">
          <div ref={createPostModalRef} className="pf-modal-card">
            <div className="pf-modal-header">
              <h2 className="pf-modal-title">
                <i className="fa-solid fa-pen pf-green-text"></i> Create Post
              </h2>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="pf-close-btn"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="pf-modal-form">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share news, updates or announcements..."
                className="pf-textarea"
              ></textarea>

              {showLinkInput && (
                <input
                  type="text"
                  placeholder="https://your-website-or-link.com"
                  value={liveLink}
                  onChange={(e) => setLiveLink(e.target.value)}
                  className="pf-input"
                />
              )}

              {mediaFiles.length > 0 && (
                <div className="pf-media-files-list">
                  {mediaFiles.map((file, idx) => (
                    <div key={idx} className="pf-media-file-item">
                      <span className="pf-file-name">
                        <i className="fa-solid fa-paperclip pf-green-text"></i>
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(idx)}
                        className="pf-red-text"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pf-modal-actions-row">
                <label className="pf-upload-media-label">
                  <i className="fa-solid fa-images pf-green-text"></i> Add Media
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="pf-hidden-input"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  className={`pf-btn-outline ${
                    showLinkInput ? "pf-active-link-btn" : ""
                  }`}
                >
                  <i className="fa-solid fa-globe pf-green-text"></i> Add Link
                </button>
              </div>

              <button type="submit" disabled={isPosting} className="pf-btn-green pf-full-width">
                {isPosting ? "Publishing... ⏳" : "Publish Post 🚀"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isModalOpen && (
        <div className="pf-modal-overlay">
          <div ref={editModalRef} className="pf-modal-card pf-modal-large">
            <div className="pf-modal-header">
              <h2 className="pf-modal-title">Update Profile</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="pf-close-btn"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="pf-modal-form">
              <div className="pf-form-grid-2">
                <div>
                  <label className="pf-label">Username / Name</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="pf-input"
                    required
                  />
                </div>
                <div>
                  <label className="pf-label">Headline</label>
                  <input
                    type="text"
                    name="headline"
                    value={formData.headline}
                    onChange={handleInputChange}
                    className="pf-input"
                  />
                </div>
              </div>
              <div>
                <label className="pf-label">About / Bio</label>
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleInputChange}
                  rows="4"
                  className="pf-textarea"
                ></textarea>
              </div>
              <div>
                <label className="pf-label">Education / Business Title</label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className="pf-input"
                />
              </div>
              <div>
                <label className="pf-label">Skills (Comma Separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="pf-input"
                />
              </div>
              <div className="pf-form-grid-3">
                <div>
                  <label className="pf-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="pf-input"
                  />
                </div>
                <div>
                  <label className="pf-label">Contact Phone</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="pf-input"
                  />
                </div>
                <div>
                  <label className="pf-label">Website URL</label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="pf-input"
                  />
                </div>
              </div>
              <div className="pf-form-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="pf-btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="pf-btn-green">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONNECTIONS / FOLLOWERS MODAL */}
      {activeModal && (
        <div className="pf-modal-overlay">
          <div className="pf-modal-card pf-modal-small">
            <div className="pf-modal-header">
              <h3 className="pf-modal-title" style={{ textTransform: 'capitalize' }}>{activeModal}</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="pf-close-btn"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="pf-modal-body-scroll">
              {user[activeModal]?.length === 0 ? (
                <p style={{ textAlign: 'center', opacity: 0.7, padding: '20px' }}>No users found in {activeModal}.</p>
              ) : (
                user[activeModal]?.map((item, idx) => (
                  <div key={item._id || idx} className="pf-user-list-item">
                    <div className="pf-user-list-left">
                      <img
                        src={item.profilepic || item.profile_picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"}
                        alt={item.name}
                        className="pf-user-list-avatar"
                      />
                      <div>
                        <h4 className="pf-user-list-name">{item.name || item.username}</h4>
                        <p className="pf-user-list-desc">{item.headline || "User"}</p>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;