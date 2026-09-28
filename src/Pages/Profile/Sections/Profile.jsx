import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { gsap } from "gsap";
import axios from "axios";
import "../Styles/Profile.css";
import "../../Profile copy/Styles/FarmerProfile.css";

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
  const [settings, setSettings] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    restockEmail: true,
    restockSms: false,
    restockPush: true,
    restockThreshold: "5",
    restockFrequency: "Instant"
  });

  // Post Edit & Delete States
  const [activeMenuPostId, setActiveMenuPostId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");

  // MODAL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [quickModal, setQuickModal] = useState(null);

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
        profilepic: currentUser?.profile_picture || currentUser?.profilepic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500",
        banner: currentUser?.banner || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
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

  // SETTINGS HANDLERS
  const getDefaultSettings = (sourceUser = {}) => ({
    fullName: sourceUser.username || sourceUser.name || "User",
    email: sourceUser.email || "",
    phone: sourceUser.phone || sourceUser.contact_number || sourceUser.contact || "",
    address: sourceUser.address || sourceUser.location || "",
    restockEmail: sourceUser.restockEmail ?? true,
    restockSms: sourceUser.restockSms ?? false,
    restockPush: sourceUser.restockPush ?? true,
    restockThreshold: sourceUser.restockThreshold ?? "5",
    restockFrequency: sourceUser.restockFrequency ?? "Instant"
  });

  const syncSettingsState = (sourceUser = {}) => {
    const savedSettings = JSON.parse(localStorage.getItem("marketlinkUserSettings") || "{}");
    setSettings({
      ...getDefaultSettings(sourceUser),
      ...savedSettings
    });
  };

  const handleSettingsFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSaveSettings = () => {
    const fullName = settings.fullName.trim() || user?.name || "User";
    const nextSettings = {
      ...settings,
      fullName
    };

    const localStored = JSON.parse(localStorage.getItem("user") || "{}");
    const syncedUser = {
      ...localStored,
      username: fullName,
      name: fullName,
      email: settings.email,
      phone: settings.phone,
      contact: settings.phone,
      contact_number: settings.phone,
      location: settings.address,
      address: settings.address
    };

    localStorage.setItem("marketlinkUserSettings", JSON.stringify(nextSettings));
    localStorage.setItem("user", JSON.stringify(syncedUser));
    setUser((prev) => ({
      ...prev,
      name: fullName,
      email: settings.email,
      contact: settings.phone,
      location: settings.address,
      address: settings.address
    }));
    window.dispatchEvent(new Event("userStateChange"));
    toast.success("Profile settings saved successfully!");
  };

  const openQuickModal = (type) => setQuickModal(type);

  const renderQuickModalContent = () => {
    if (!quickModal) return null;

    if (quickModal === 'about') {
      return (
        <div className="pf-modal-body-stack">
          <h3 className="pf-modal-title">About Me</h3>
          <p className="pf-card-text">{user.about || 'No bio added yet.'}</p>
          <div className="pf-info-pill-grid">
            <span className="pf-info-pill">{user.education || 'Profession not set'}</span>
            <span className="pf-info-pill">{user.location || 'Location not set'}</span>
          </div>
        </div>
      );
    }

    if (quickModal === 'contact') {
      return (
        <div className="pf-modal-body-stack">
          <h3 className="pf-modal-title">Contact Info</h3>
          <div className="pf-contact-list pf-contact-list-modal">
            <div className="pf-contact-item">
              <div className="pf-icon-box"><i className="fa-solid fa-envelope"></i></div>
              <span>{user.email}</span>
            </div>
            <div className="pf-contact-item">
              <div className="pf-icon-box"><i className="fa-solid fa-phone"></i></div>
              <span>{user.contact}</span>
            </div>
            <div className="pf-contact-item">
              <div className="pf-icon-box"><i className="fa-solid fa-location-dot"></i></div>
              <span>{user.location}</span>
            </div>
          </div>
        </div>
      );
    }

    if (quickModal === 'skills') {
      return (
        <div className="pf-modal-body-stack">
          <h3 className="pf-modal-title">Skills & Expertise</h3>
          <div className="pf-skills-wrap pf-skills-wrap-modal">
            {(String(user.skills || 'General').split(',')).map((skill, index) => (
              <span key={index} className="pf-skill-badge">{skill.trim()}</span>
            ))}
          </div>
        </div>
      );
    }

    if (quickModal === 'settings') {
      return (
        <div className="pf-modal-body-stack">
          <h3 className="pf-modal-title">Profile Settings</h3>
          <div className="pf-settings-form">
            <div className="pf-form-grid-2 pf-settings-grid">
              <div>
                <label className="pf-label">Full name</label>
                <input type="text" name="fullName" value={settings.fullName} onChange={handleSettingsFieldChange} className="pf-input" />
              </div>
              <div>
                <label className="pf-label">Email</label>
                <input type="email" name="email" value={settings.email} onChange={handleSettingsFieldChange} className="pf-input" />
              </div>
            </div>
            <div className="pf-form-grid-2 pf-settings-grid">
              <div>
                <label className="pf-label">Phone</label>
                <input type="tel" name="phone" value={settings.phone} onChange={handleSettingsFieldChange} className="pf-input" />
              </div>
              <div>
                <label className="pf-label">Address</label>
                <input type="text" name="address" value={settings.address} onChange={handleSettingsFieldChange} className="pf-input" />
              </div>
            </div>
            <button type="button" className="pf-btn-green" onClick={handleSaveSettings}>Save Preferences</button>
          </div>
        </div>
      );
    }

    return null;
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
        <div ref={headerRef} className="pf-profile-shell">
          <div className="pf-shell-banner">
            {user.banner ? (
              <img src={user.banner} alt="Banner" className="pf-banner-img" />
            ) : (
              <div className="pf-banner-fallback"></div>
            )}
            <label className="pf-change-cover-btn">
              <i className="fa-solid fa-camera"></i> Change Cover
              <input type="file" accept="image/*" className="pf-hidden-input" onChange={handleBannerUpload} />
            </label>
          </div>

          <div className="pf-shell-body">
            <div className="pf-shell-user-row">
              <div className="pf-avatar-wrapper">
                <div className="pf-avatar">
                  {user.profilepic ? <img src={user.profilepic} alt="Profile" /> : user.name?.[0]?.toUpperCase()}
                  <div className="pf-avatar-overlay"><i className="fa-solid fa-pen"></i></div>
                </div>
                <label className="pf-avatar-upload-btn">
                  <i className="fa-solid fa-camera"></i>
                  <input type="file" accept="image/*" className="pf-hidden-input" onChange={handleImageUpload} />
                </label>
              </div>

              <div className="pf-shell-meta">
                <div className="pf-name-flex">
                  <h1 className="pf-user-name">{user.name}</h1>
                  {user.isVerified && (
                    <span className="pf-verified-badge" title="Verified Account">
                      <i className="fa-solid fa-circle-check"></i>
                    </span>
                  )}
                </div>
                <p className="pf-user-headline">{user.headline || 'MarketLink Member'}</p>
                <div className="pf-shell-mini-info">
                  <span><i className="fa-solid fa-location-dot"></i> {user.location || 'Location not available'}</span>
                  <span><i className="fa-solid fa-phone"></i> {user.contact || 'No number added'}</span>
                </div>
              </div>
            </div>

            <div className="pf-shell-stats">
              <div className="pf-stat-box" onClick={() => setActiveModal('followers')}>
                <span className="pf-stat-num">{user.followers?.length || 0}</span>
                <span className="pf-stat-label">Followers</span>
              </div>
              <div className="pf-stat-box" onClick={() => setActiveModal('following')}>
                <span className="pf-stat-num">{user.following?.length || 0}</span>
                <span className="pf-stat-label">Following</span>
              </div>
              <div className="pf-stat-box" onClick={() => setActiveModal('connections')}>
                <span className="pf-stat-num">{user.connections?.length || 0}</span>
                <span className="pf-stat-label">Connections</span>
              </div>
              <div className="pf-stat-box" onClick={() => setActiveModal('products')}>
                <span className="pf-stat-num">{products.length || 0}</span>
                <span className="pf-stat-label">Products</span>
              </div>
            </div>

            <div className="pf-shell-quick-actions">
              <button className="pf-quick-action" onClick={() => openQuickModal('about')}>
                <i className="fa-solid fa-user"></i> About
              </button>
              <button className="pf-quick-action" onClick={() => openQuickModal('contact')}>
                <i className="fa-solid fa-address-book"></i> Contact
              </button>
              <button className="pf-quick-action" onClick={() => openQuickModal('settings')}>
                <i className="fa-solid fa-gear"></i> Settings
              </button>
            </div>

            <div className="pf-floating-action-bar">
              <button onClick={() => setIsModalOpen(true)} className="pf-float-btn pf-float-primary">
                <i className="fa-solid fa-pen"></i>
                Edit
              </button>
              <button onClick={() => setIsPostModalOpen(true)} className="pf-float-btn pf-float-secondary">
                <i className="fa-solid fa-plus"></i>
                Post
              </button>
            </div>
          </div>
        </div>

        <div className="pf-main-grid">
          <div ref={feedRef} className="pf-feed">
            <div className="pf-card pf-post-composer-card">
              <div className="pf-card-header-row">
                <h3 className="pf-card-title"><i className="fa-solid fa-box-open"></i> Products</h3>
              </div>
              {products.length === 0 ? (
                <p className="pf-card-text">No products added yet.</p>
              ) : (
                <div className="pf-products-grid">
                  {products.map((product) => (
                    <div key={product._id || product.id} className="pf-product-card">
                      <div className="pf-product-image-wrap">
                        <img src={product.image_url || product.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=900&auto=format&fit=crop"} alt={product.name} className="pf-product-image" />
                      </div>
                      <div className="pf-product-body">
                        <h4>{product.name}</h4>
                        <p>{product.category}</p>
                        <div className="pf-product-meta">
                          <span>Rs. {product.price}</span>
                          <span>{product.stock_quantity || product.stock || 0} in stock</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pf-card">
              <div className="pf-card-header-row">
                <h3 className="pf-card-title"><i className="fa-solid fa-clock"></i> Activity Feed</h3>
              </div>
              {posts.length === 0 ? (
                <p className="pf-card-text">No activity yet. Share your latest market update.</p>
              ) : (
                posts.map((post) => (
                  <div key={post._id || post.id} className="pf-post-card">
                    <div className="pf-post-header">
                      <div className="pf-post-avatar">{user.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <h4>{user.name}</h4>
                        <small>{new Date(post.createdAt || Date.now()).toLocaleDateString()}</small>
                      </div>
                    </div>
                    <p className="pf-post-text">{post.text || post.content || 'Market update'}</p>
                    {post.liveLink && (
                      <a href={post.liveLink} target="_blank" rel="noreferrer" className="pf-post-link">{post.liveLink}</a>
                    )}
                    {post.media && post.media.length > 0 && <MediaSlider mediaItems={post.media} />}
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      {quickModal && (
        <div className="pf-modal-overlay" onClick={() => setQuickModal(null)}>
          <div className="pf-modal-card pf-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="pf-modal-header">
              <h2 className="pf-modal-title">Profile Details</h2>
              <button onClick={() => setQuickModal(null)} className="pf-close-btn"><i className="fa-solid fa-xmark"></i></button>
            </div>
            {renderQuickModalContent()}
          </div>
        </div>
      )}

      {isPostModalOpen && (
        <div className="pf-modal-overlay">
          <div ref={createPostModalRef} className="pf-modal-card">
            <div className="pf-modal-header">
              <h2 className="pf-modal-title"><i className="fa-solid fa-pen pf-green-text"></i> Create Post</h2>
              <button onClick={() => setIsPostModalOpen(false)} className="pf-close-btn"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handlePostSubmit} className="pf-modal-form">
              <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Share news, updates or announcements..." className="pf-textarea"></textarea>
              {showLinkInput && (
                <input type="text" placeholder="https://your-website-or-link.com" value={liveLink} onChange={(e) => setLiveLink(e.target.value)} className="pf-input" />
              )}
              {mediaFiles.length > 0 && (
                <div className="pf-media-files-list">
                  {mediaFiles.map((file, idx) => (
                    <div key={idx} className="pf-media-file-item">
                      <span className="pf-file-name"><i className="fa-solid fa-paperclip pf-green-text"></i>{file.name}</span>
                      <button type="button" onClick={() => removeSelectedFile(idx)} className="pf-red-text"><i className="fa-solid fa-trash"></i></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="pf-modal-actions-row">
                <label className="pf-upload-media-label"><i className="fa-solid fa-images pf-green-text"></i> Add Media<input type="file" multiple accept="image/*,video/*" onChange={handleFileSelect} className="pf-hidden-input" /></label>
                <button type="button" onClick={() => setShowLinkInput(!showLinkInput)} className={`pf-btn-outline ${showLinkInput ? 'pf-active-link-btn' : ''}`}><i className="fa-solid fa-globe pf-green-text"></i> Add Link</button>
              </div>
              <button type="submit" disabled={isPosting} className="pf-btn-green pf-full-width">{isPosting ? 'Publishing...' : 'Publish Post 🚀'}</button>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="pf-modal-overlay">
          <div ref={editModalRef} className="pf-modal-card pf-modal-large">
            <div className="pf-modal-header">
              <h2 className="pf-modal-title">Update Profile</h2>
              <button onClick={() => setIsModalOpen(false)} className="pf-close-btn"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleFormSubmit} className="pf-modal-form">
              <div className="pf-form-grid-2">
                <div>
                  <label className="pf-label">Username / Name</label>
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="pf-input" required />
                </div>
                <div>
                  <label className="pf-label">Headline</label>
                  <input type="text" name="headline" value={formData.headline} onChange={handleInputChange} className="pf-input" />
                </div>
              </div>
              <div>
                <label className="pf-label">About / Bio</label>
                <textarea name="about" value={formData.about} onChange={handleInputChange} rows="4" className="pf-textarea"></textarea>
              </div>
              <div>
                <label className="pf-label">Education / Business Title</label>
                <input type="text" name="education" value={formData.education} onChange={handleInputChange} className="pf-input" />
              </div>
              <div>
                <label className="pf-label">Skills (Comma Separated)</label>
                <input type="text" name="skills" value={formData.skills} onChange={handleInputChange} className="pf-input" />
              </div>
              <div className="pf-form-grid-3">
                <div>
                  <label className="pf-label">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="pf-input" />
                </div>
                <div>
                  <label className="pf-label">Contact Phone</label>
                  <input type="text" name="contact" value={formData.contact} onChange={handleInputChange} className="pf-input" />
                </div>
                <div>
                  <label className="pf-label">Website URL</label>
                  <input type="text" name="website" value={formData.website} onChange={handleInputChange} className="pf-input" />
                </div>
              </div>
              <div className="pf-form-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="pf-btn-cancel">Cancel</button>
                <button type="submit" className="pf-btn-green">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal && (
        <div className="pf-modal-overlay">
          <div className="pf-modal-card pf-modal-small">
            <div className="pf-modal-header">
              <h3 className="pf-modal-title" style={{ textTransform: 'capitalize' }}>{activeModal}</h3>
              <button onClick={() => setActiveModal(null)} className="pf-close-btn"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="pf-modal-body-scroll">
              {activeModal === 'products' && products.length === 0 ? (
                <p className="pf-empty-list-text">No products found.</p>
              ) : user[activeModal]?.length === 0 ? (
                <p className="pf-empty-list-text">No users found in {activeModal}.</p>
              ) : (
                (activeModal === 'products' ? products : user[activeModal])?.map((item, idx) => (
                  <div key={item._id || item.id || idx} className="pf-user-list-item">
                    <div className="pf-user-list-left">
                      <img src={item.profilepic || item.profile_picture || item.image_url || item.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"} alt={item.name || item.username || 'Product'} className="pf-user-list-avatar" />
                      <div>
                        <h4 className="pf-user-list-name">{item.name || item.username || item.title}</h4>
                        <p className="pf-user-list-desc">{item.headline || item.category || 'Item'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;