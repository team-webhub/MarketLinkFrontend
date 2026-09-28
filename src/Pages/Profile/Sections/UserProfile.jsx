import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { gsap } from "gsap";
import axios from "axios";
import "../Styles/Profile.css";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const Profile = () => {
  const navigate = useNavigate();

  // REFS FOR GSAP ANIMATIONS
  const headerRef = useRef(null);
  const sidebarRef = useRef(null);
  const feedRef = useRef(null);
  const editModalRef = useRef(null);

  // GLOBAL STATE
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: ""
  });

  // MODAL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [showAccountPanel, setShowAccountPanel] = useState(false);

  // FORM DATA STATE
  const [formData, setFormData] = useState({
    username: "",
    profile_picture: "",
    banner: ""
  });

  // Auth Header Helper
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  // Helper for Settings sync
  const syncSettingsState = (sourceUser = {}) => {
    const savedSettings = JSON.parse(localStorage.getItem("marketlinkUserSettings") || "{}");
    setSettings({
      fullName: sourceUser.username || sourceUser.name || savedSettings.fullName || "User",
      email: sourceUser.email || savedSettings.email || "",
      phone: sourceUser.contact_number || sourceUser.phone || sourceUser.contact || savedSettings.phone || "",
      address: sourceUser.address || sourceUser.location || savedSettings.address || ""
    });
  };

  // Fetch profile and product data from the database.
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

      const role = String(currentUser?.role || "customer").toLowerCase();
      const accountType = role === "farmer" ? "Farmer" : role === "admin" ? "Admin" : "Customer";

      const formattedUser = {
        _id: currentUser?._id || currentUser?.id || "u_1",
        name: currentUser?.username || currentUser?.name || "User",
        email: currentUser?.email || "",
        contact: currentUser?.contact_number || currentUser?.phone || currentUser?.contact || "N/A",
        location: currentUser?.address || currentUser?.location || "Not Specified",
        profilepic: currentUser?.profile_picture || currentUser?.profilepic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500",
        banner: currentUser?.banner || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
        isVerified: currentUser?.isVerified ?? true,
        role,
        accountType,
        approvalStatus: currentUser?.approvalStatus || "approved",
        businessName: currentUser?.business_name || "",
        contactPerson: currentUser?.contact_person || "",
        operatingDays: Array.isArray(currentUser?.operating_days) ? currentUser.operating_days : [],
        pickupWindows: Array.isArray(currentUser?.pickup_time_windows) ? currentUser.pickup_time_windows : [],
        isActive: currentUser?.isActive ?? true,
        createdAt: currentUser?.createdAt,
        connections: currentUser?.connections || []
      };

      setUser(formattedUser);
      syncSettingsState(currentUser || {});
      setFormData({
        username: formattedUser.name,
        profile_picture: formattedUser.profilepic,
        banner: formattedUser.banner
      });

      // 2. Fetch User Products
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

  // Modal animation
  useEffect(() => {
    if (isModalOpen && editModalRef.current) {
      gsap.fromTo(editModalRef.current, { scale: 0.85, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "back.out(1.4)" });
    }
  }, [isModalOpen]);

  // 🌟 HANDLER ACTIONS 🌟
  const handleOpenEditModal = () => {
    setFormData({
      username: user?.name || "",
      profile_picture: user?.profilepic || "",
      banner: user?.banner || ""
    });
    setSettings((prev) => ({
      ...prev,
      fullName: user?.name || prev.fullName,
      email: user?.email || prev.email,
      phone: user?.contact || prev.phone,
      address: user?.location || prev.address
    }));
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const updatedName = formData.username.trim() || user?.name || "User";
    const updatedContact = settings.phone || user?.contact || "";
    const updatedAddress = settings.address || user?.location || "";

    const updateData = {
      username: updatedName,
      contact_number: updatedContact,
      address: updatedAddress
    };

    try {
      const res = await axios.put(`${API_BASE_URL}/users/profile`, updateData, getAuthHeader());

      const updatedUserObj = {
        ...user,
        name: updatedName,
        contact: updatedContact,
        location: updatedAddress
      };

      setUser(updatedUserObj);

      const localStored = JSON.parse(localStorage.getItem('user') || '{}');
      const syncedUser = {
        ...localStored,
        ...updateData,
        username: updatedName,
        name: updatedName,
        contact_number: updatedContact,
        address: updatedAddress
      };
      localStorage.setItem('user', JSON.stringify(syncedUser));

      window.dispatchEvent(new Event('userStateChange'));
      toast.success(res.data?.message || "Profile Updated Successfully! 🎉");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Profile Update Error:", error);

      setUser((prev) => ({
        ...prev,
        name: updatedName,
        contact: updatedContact,
        location: updatedAddress
      }));

      const localStored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...localStored,
        username: updatedName,
        name: updatedName,
        contact_number: updatedContact,
        address: updatedAddress
      }));

      window.dispatchEvent(new Event('userStateChange'));
      toast.success("Profile Updated locally!");
      setIsModalOpen(false);
    }
  }; 

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("userStateChange"));
    toast.success("Logged Out Successfully!");
    navigate("/login");
  };

  // SETTINGS HANDLERS
  const handleSettingsFieldChange = (event) => {
    const { name, value } = event.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = () => {
    const fullName = settings.fullName.trim() || user?.name || "User";
    const nextSettings = { ...settings, fullName };

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

    setFormData((prev) => ({
      ...prev,
      username: fullName
    }));

    window.dispatchEvent(new Event("userStateChange"));
    toast.success("Profile settings saved successfully!");
  };

  const handleRequestFarmerAccess = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/users/request-farmer`, {}, getAuthHeader());
      const updatedUser = res.data?.user || null;

      if (updatedUser) {
        const mergedUser = {
          ...user,
          ...updatedUser,
          role: updatedUser.role || 'farmer',
          accountType: 'Farmer',
          approvalStatus: updatedUser.approvalStatus || 'pending',
          isFarmer: true,
        };
        setUser(mergedUser);
        localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user') || '{}'), ...updatedUser, role: 'farmer', approvalStatus: updatedUser.approvalStatus || 'pending' }));
      }

      toast.success(res.data?.message || 'Farmer request sent successfully.');
      await fetchProfileData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to request farmer access.');
    }
  };

  if (loading) {
    return (
      <div className="pf-page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <h3 style={{ color: 'var(--text-green, #10b981)' }}>Loading Profile Data... ⏳</h3>
      </div>
    );
  }

  if (!user) return null;

  const initials = (user.name || "User")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "MarketLink Member";

  const isFarmer = user.role === "farmer";
  const isAdmin = user.role === "admin";

  return (
    <div className="pf-page-wrapper pf-modern-profile">
      <div className="pf-container pf-modern-container">

        {/* ==================== HERO ==================== */}
        <section ref={headerRef} className="pf-modern-hero">
          <div className="pf-cover">
            <img
              src={user.banner}
              alt="Profile cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="pf-cover-overlay" />

            <button
              type="button"
              className="pf-cover-action"
              onClick={handleOpenEditModal}
            >
              <i className="fa-solid fa-pen"></i>
              Edit profile
            </button>
          </div>

          <div className="pf-hero-content">
            <div className="pf-identity-row">
              <div className="pf-modern-avatar-wrap">
                <img
                  src={user.profilepic}
                  alt={user.name}
                  className="pf-modern-avatar"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement.classList.add("show-initials");
                  }}
                />
                <span className="pf-avatar-initials">{initials}</span>

                <label className="pf-avatar-edit" title="Change profile picture">
                  <i className="fa-solid fa-camera"></i>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="pf-hidden-input"
                  />
                </label>
              </div>

              <div className="pf-identity">
                <div className="pf-name-line">
                  <h1>{user.name}</h1>
                  {user.isVerified && (
                    <span className="pf-verified" title="Verified profile">
                      <i className="fa-solid fa-check"></i>
                    </span>
                  )}
                </div>

                <p className="pf-handle">
                  @{user.name?.toLowerCase().replace(/\s+/g, "") || "user"}
                </p>

                <div className="pf-meta-row">
                  <span>
                    <i className="fa-solid fa-location-dot"></i>
                    {user.location || "Location not added"}
                  </span>
                  <span>
                    <i className="fa-solid fa-user-tag"></i>
                    {user.accountType}
                  </span>
                  <span>
                    <i className="fa-regular fa-calendar"></i>
                    {memberSince}
                  </span>
                </div>
              </div>

              <div className="pf-hero-actions">
                <button
                  type="button"
                  className="pf-icon-btn"
                  title="Account settings"
                  onClick={() => setShowAccountPanel(true)}
                >
                  <i className="fa-solid fa-sliders"></i>
                </button>

                <button
                  type="button"
                  className="pf-icon-btn danger"
                  title="Logout"
                  onClick={handleLogout}
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                </button>
              </div>
            </div>

            {/* ==================== STATS ==================== */}
            <div className="pf-modern-stats">
              {isFarmer && (
                <button
                  type="button"
                  className="pf-modern-stat"
                  onClick={() => setActiveModal("products")}
                >
                  <strong>{products.length}</strong>
                  <span>Products</span>
                </button>
              )}

              <button
                type="button"
                className="pf-modern-stat"
                onClick={() => setActiveModal("connections")}
              >
                <strong>{user.connections?.length || 0}</strong>
                <span>Connections</span>
              </button>

              <div className="pf-profile-status">
                <span className="pf-status-dot"></span>
                Active profile
              </div>
            </div>
          </div>
        </section>

        {/* ==================== MAIN ==================== */}
        <div className="pf-modern-layout flex flex-row">

          {/* LEFT */}
          <aside ref={sidebarRef} className="pf-modern-sidebar flex flex-row">

            <section className="pf-modern-card">
              <div className="pf-section-heading">
                <div>
                  <span className="pf-eyebrow">PROFILE</span>
                  <h2>About</h2>
                </div>
                <button
                  type="button"
                  className="pf-small-icon"
                  onClick={handleOpenEditModal}
                  title="Edit profile"
                >
                  <i className="fa-solid fa-pen"></i>
                </button>
              </div>

              <p className="pf-about-copy">
                {user.accountType} account connected to MarketLink.
                {user.location ? ` Based in ${user.location}.` : ""}
              </p>

              <div className="pf-about-list">
                <div>
                  <span className="pf-about-icon"><i className="fa-regular fa-envelope"></i></span>
                  <div>
                    <small>Email</small>
                    <strong>{user.email || "Not added"}</strong>
                  </div>
                </div>

                <div>
                  <span className="pf-about-icon"><i className="fa-solid fa-phone"></i></span>
                  <div>
                    <small>Phone</small>
                    <strong>{user.contact || "Not added"}</strong>
                  </div>
                </div>

                <div>
                  <span className="pf-about-icon"><i className="fa-solid fa-location-dot"></i></span>
                  <div>
                    <small>Location</small>
                    <strong>{user.location || "Not added"}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="pf-secondary-wide"
                onClick={handleOpenEditModal}
              >
                <i className="fa-regular fa-pen-to-square"></i>
                Update profile
              </button>
            </section>

            <section className="pf-modern-card pf-role-card">
              <div className="pf-section-heading">
                <div>
                  <span className="pf-eyebrow">ACCOUNT PROFILE</span>
                  <h2>{isFarmer ? "Farmer details" : isAdmin ? "Admin access" : "Customer profile"}</h2>
                </div>
                <span className="pf-role-mark">{user.accountType}</span>
              </div>

              {isFarmer ? (
                <div className="pf-role-details">
                  <div><small>Business</small><strong>{user.businessName || "Not added"}</strong></div>
                  <div><small>Approval</small><strong className={`pf-approval-${user.approvalStatus}`}>{user.approvalStatus}</strong></div>
                  <div><small>Operating days</small><strong>{user.operatingDays.length ? user.operatingDays.join(", ") : "All week"}</strong></div>
                  <div><small>Pickup windows</small><strong>{user.pickupWindows.length ? user.pickupWindows.join(" | ") : "Not added"}</strong></div>
                </div>
              ) : (
                <p className="pf-role-copy">
                  {isAdmin
                    ? "Administrative account with access to MarketLink operations."
                    : "Browse verified farmers, discover fresh produce and manage your market activity."}
                </p>
              )}

              {!isFarmer && !isAdmin && (
                <div className="pf-role-panel-request">
                  <div>
                    <span className="pf-eyebrow">FARMER ACCESS</span>
                    <h3>Become a farmer</h3>
                  </div>
                  <button type="button" className="pf-primary-btn" onClick={handleRequestFarmerAccess}>
                    <i className="fa-solid fa-seedling"></i>
                    Request approval
                  </button>
                </div>
              )}

              {isFarmer && user.approvalStatus !== 'approved' && (
                <div className="pf-role-panel-request pf-role-panel-warn">
                  <div>
                    <span className="pf-eyebrow">STATUS</span>
                    <h3>Farmer application pending</h3>
                  </div>
                  <strong className={`pf-approval-${user.approvalStatus}`}>{user.approvalStatus}</strong>
                </div>
              )}
            </section>

            <section className="pf-modern-card pf-quick-card">
              <div className="pf-section-heading">
                <div>
                  <span className="pf-eyebrow">QUICK ACTIONS</span>
                  <h2>Manage</h2>
                </div>
              </div>

              <button
                type="button"
                className="pf-quick-action"
                onClick={() => setShowAccountPanel(true)}
              >
                <span><i className="fa-solid fa-gear"></i></span>
                <div>
                  <strong>Account settings</strong>
                  <small>Personal information & preferences</small>
                </div>
                <i className="fa-solid fa-chevron-right"></i>
              </button>

            </section>
          </aside>

          {/* RIGHT */}
          <main ref={feedRef} className="pf-modern-content">

            {/* PRODUCTS */}
            {isFarmer && <section className="pf-modern-card">
              <div className="pf-section-heading">
                <div>
                  <span className="pf-eyebrow">MARKETPLACE</span>
                  <h2>Products</h2>
                </div>
                <button
                  type="button"
                  className="pf-text-btn"
                  onClick={() => setActiveModal("products")}
                >
                  View all <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>

              {products.length === 0 ? (
                <div className="pf-empty-modern">
                  <div><i className="fa-solid fa-box-open"></i></div>
                  <h3>No products yet</h3>
                  <p>Your products will appear here when they are added.</p>
                </div>
              ) : (
                <div className="pf-product-grid-modern">
                  {products.slice(0, 4).map((product) => (
                    <button
                      type="button"
                      key={product._id || product.id}
                      className="pf-product-modern"
                      onClick={() => setActiveProduct(product)}
                    >
                      <div className="pf-product-modern-image">
                        <img
                          src={
                            product.image_url ||
                            product.image ||
                            "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=900&auto=format&fit=crop"
                          }
                          alt={product.name}
                        />
                        {product.is_available === false && (
                          <span>Unavailable</span>
                        )}
                      </div>
                      <div className="pf-product-modern-info">
                        <h3>{product.name}</h3>
                        <p>{product.category || "Fresh produce"}</p>
                        <div>
                          <strong>Rs. {product.price}</strong>
                          <small>
                            {product.stock_quantity || product.stock || 0} in stock
                          </small>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>}

            {false && (<>
            {/* ACTIVITY */}
            <section className="pf-modern-card">
              <div className="pf-section-heading">
                <div>
                  <span className="pf-eyebrow">COMMUNITY</span>
                  <h2>Recent activity</h2>
                </div>
                <span className="pf-count-pill">
                  {posts.length} {posts.length === 1 ? "post" : "posts"}
                </span>
              </div>

              {posts.length === 0 ? (
                <div className="pf-empty-modern">
                  <div><i className="fa-regular fa-message"></i></div>
                  <h3>Your activity starts here</h3>
                  <p>Share your first market update, product news or announcement.</p>
                  <button
                    type="button"
                    className="pf-primary-btn"
                    onClick={() => setIsPostModalOpen(true)}
                  >
                    <i className="fa-solid fa-plus"></i>
                    Create post
                  </button>
                </div>
              ) : (
                <div className="pf-modern-posts">
                  {posts.map((post) => {
                    const pId = post._id || post.id;
                    const likesCount = post.likes?.length || 0;
                    const isUserLiked = post.likes?.some(
                      (l) => (typeof l === "object" ? l._id || l.id : l) === user._id
                    );

                    return (
                      <article key={pId} className="pf-modern-post">
                        <div className="pf-post-top-modern">
                          <div className="pf-post-author-modern">
                            <img src={user.profilepic} alt={user.name} />
                            <div>
                              <strong>{user.name}</strong>
                              <span>
                                {new Date(post.createdAt || Date.now()).toLocaleDateString(
                                  "en-US",
                                  { day: "numeric", month: "short", year: "numeric" }
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="pf-post-tools">
                            <button
                              type="button"
                              onClick={() => handleEditPost(post)}
                              title="Edit"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePost(pId)}
                              title="Delete"
                              className="danger"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </div>

                        {editingPostId === pId ? (
                          <div className="pf-inline-edit">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="pf-textarea"
                            />
                            <div>
                              <button
                                type="button"
                                className="pf-primary-btn"
                                onClick={() => submitEditPost(pId)}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="pf-cancel-btn"
                                onClick={() => setEditingPostId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="pf-modern-post-text">
                            {post.text || post.content || "Market update"}
                          </p>
                        )}

                        {post.liveLink && (
                          <a
                            href={post.liveLink}
                            target="_blank"
                            rel="noreferrer"
                            className="pf-modern-link"
                          >
                            <i className="fa-solid fa-arrow-up-right-from-square"></i>
                            {post.liveLink}
                          </a>
                        )}

                        {post.media?.length > 0 && (
                          <MediaSlider mediaItems={post.media} />
                        )}

                        <div className="pf-post-actions-modern">
                          <button
                            type="button"
                            className={isUserLiked ? "liked" : ""}
                            onClick={() => handleLike(pId)}
                          >
                            <i className={isUserLiked ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                            {likesCount}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setShowComments((prev) => ({
                                ...prev,
                                [pId]: !prev[pId],
                              }))
                            }
                          >
                            <i className="fa-regular fa-comment"></i>
                            {post.comments?.length || 0}
                          </button>
                        </div>

                        {showComments[pId] && (
                          <div className="pf-modern-comments">
                            <div className="pf-comment-input">
                              <input
                                type="text"
                                placeholder="Write a comment..."
                                value={commentInputs[pId] || ""}
                                onChange={(e) =>
                                  setCommentInputs((prev) => ({
                                    ...prev,
                                    [pId]: e.target.value,
                                  }))
                                }
                                className="pf-input"
                              />
                              <button
                                type="button"
                                className="pf-primary-btn"
                                onClick={() => handleAddComment(pId)}
                              >
                                Send
                              </button>
                            </div>

                            {post.comments?.map((comment, index) => (
                              <div className="pf-modern-comment" key={index}>
                                <strong>
                                  {comment.name ||
                                    comment.user?.username ||
                                    comment.user?.name ||
                                    "User"}
                                </strong>
                                <p>{comment.text || comment.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
            </>)}
          </main>
        </div>
      </div>

      {/* ==================== CREATE POST MODAL ==================== */}
      {false && isPostModalOpen && (
        <div
          className="pf-modern-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsPostModalOpen(false);
          }}
        >
          <div ref={createPostModalRef} className="pf-modern-modal pf-post-modal">
            <div className="pf-modal-top">
              <div>
                <span className="pf-eyebrow">NEW ACTIVITY</span>
                <h2>Create a post</h2>
              </div>
              <button
                type="button"
                className="pf-modal-close"
                onClick={() => setIsPostModalOpen(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="pf-post-modal-user">
              <img src={user.profilepic} alt={user.name} />
              <div>
                <strong>{user.name}</strong>
                <span>Posting to MarketLink</span>
              </div>
            </div>

            <form onSubmit={handlePostSubmit}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share a market update, product news or announcement..."
                className="pf-modern-textarea"
                autoFocus
              />

              {showLinkInput && (
                <input
                  type="url"
                  value={liveLink}
                  onChange={(e) => setLiveLink(e.target.value)}
                  placeholder="https://example.com"
                  className="pf-input"
                />
              )}

              {mediaFiles.length > 0 && (
                <div className="pf-file-chips">
                  {mediaFiles.map((file, index) => (
                    <div key={index}>
                      <span><i className="fa-solid fa-paperclip"></i>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pf-modal-tools">
                <label>
                  <i className="fa-regular fa-image"></i>
                  Media
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="pf-hidden-input"
                    onChange={handleFileSelect}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setShowLinkInput((prev) => !prev)}
                >
                  <i className="fa-solid fa-link"></i>
                  Link
                </button>

                <span className="pf-tool-spacer"></span>

                <button
                  type="button"
                  className="pf-cancel-btn"
                  onClick={() => setIsPostModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="pf-primary-btn"
                  disabled={isPosting}
                >
                  {isPosting ? "Publishing..." : "Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EDIT PROFILE MODAL ==================== */}
      {isModalOpen && (
        <div
          className="pf-modern-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div ref={editModalRef} className="pf-modern-modal">
            <div className="pf-modal-top">
              <div>
                <span className="pf-eyebrow">ACCOUNT</span>
                <h2>Edit profile</h2>
              </div>
              <button
                type="button"
                className="pf-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="pf-modern-form">
              <div className="pf-edit-avatar">
                <img src={user.profilepic} alt={user.name} />
                <label>
                  <i className="fa-solid fa-camera"></i>
                  Change photo
                  <input
                    type="file"
                    accept="image/*"
                    className="pf-hidden-input"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              <div className="pf-modern-form-grid">
                <label>
                  <span>Display name</span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="pf-input"
                    required
                  />
                </label>

                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={settings.email}
                    onChange={handleSettingsFieldChange}
                    className="pf-input"
                  />
                </label>

                <label>
                  <span>Phone</span>
                  <input
                    type="tel"
                    name="phone"
                    value={settings.phone}
                    onChange={handleSettingsFieldChange}
                    className="pf-input"
                  />
                </label>

                <label>
                  <span>Location</span>
                  <input
                    type="text"
                    name="address"
                    value={settings.address}
                    onChange={handleSettingsFieldChange}
                    className="pf-input"
                  />
                </label>
              </div>

              <div className="pf-modal-footer">
                <button
                  type="button"
                  className="pf-cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="pf-primary-btn">
                  <i className="fa-solid fa-check"></i>
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== ACCOUNT SETTINGS MODAL ==================== */}
      {showAccountPanel && (
        <div
          className="pf-modern-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAccountPanel(false);
          }}
        >
          <div className="pf-modern-modal pf-settings-modal">
            <div className="pf-modal-top">
              <div>
                <span className="pf-eyebrow">PREFERENCES</span>
                <h2>Account settings</h2>
              </div>
              <button
                type="button"
                className="pf-modal-close"
                onClick={() => setShowAccountPanel(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="pf-setting-item">
              <div>
                <strong>Profile visibility</strong>
                <span>Your public profile information is visible to other MarketLink users.</span>
              </div>
              <span className="pf-setting-badge">Public</span>
            </div>

            <div className="pf-setting-item">
              <div>
                <strong>Account type</strong>
                <span>Current MarketLink account role</span>
              </div>
              <span className="pf-setting-badge">{user.accountType}</span>
            </div>

            <div className="pf-setting-item clickable" onClick={handleOpenEditModal}>
              <div>
                <strong>Personal information</strong>
                <span>Update name, phone and location</span>
              </div>
              <i className="fa-solid fa-chevron-right"></i>
            </div>

            <button
              type="button"
              className="pf-danger-wide"
              onClick={handleLogout}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              Log out of MarketLink
            </button>
          </div>
        </div>
      )}

      {/* ==================== CONNECTIONS ==================== */}
      {activeModal === "connections" && (
        <div
          className="pf-modern-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <div className="pf-modern-modal pf-list-modal">
            <div className="pf-modal-top">
              <div>
                <span className="pf-eyebrow">NETWORK</span>
                <h2>{activeModal}</h2>
              </div>
              <button
                type="button"
                className="pf-modal-close"
                onClick={() => setActiveModal(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="pf-network-list">
              {Array.isArray(user[activeModal]) && user[activeModal].length > 0 ? (
                user[activeModal].map((item, index) => {
                  const name =
                    typeof item === "object"
                      ? item.name || item.username || item.business_name || "MarketLink User"
                      : item;

                  const image =
                    typeof item === "object"
                      ? item.profile_picture || item.profilepic
                      : null;

                  return (
                    <div className="pf-network-item" key={index}>
                      {image ? (
                        <img src={image} alt={name} />
                      ) : (
                        <div className="pf-network-avatar">
                          {String(name || "U")[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <strong>{name}</strong>
                        <span>MarketLink member</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="pf-empty-modern">
                  <div><i className="fa-solid fa-users"></i></div>
                  <h3>No {activeModal} yet</h3>
                  <p>This section will update automatically as your network grows.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== PRODUCTS MODAL ==================== */}
      {activeModal === "products" && (
        <div
          className="pf-modern-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <div className="pf-modern-modal pf-products-modal">
            <div className="pf-modal-top">
              <div>
                <span className="pf-eyebrow">MARKETPLACE</span>
                <h2>All products</h2>
              </div>
              <button
                type="button"
                className="pf-modal-close"
                onClick={() => setActiveModal(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {products.length ? (
              <div className="pf-product-grid-modern modal-grid">
                {products.map((product) => (
                  <button
                    type="button"
                    key={product._id || product.id}
                    className="pf-product-modern"
                    onClick={() => setActiveProduct(product)}
                  >
                    <div className="pf-product-modern-image">
                      <img
                        src={
                          product.image_url ||
                          product.image ||
                          "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=900&auto=format&fit=crop"
                        }
                        alt={product.name}
                      />
                    </div>
                    <div className="pf-product-modern-info">
                      <h3>{product.name}</h3>
                      <p>{product.category || "Fresh produce"}</p>
                      <div>
                        <strong>Rs. {product.price}</strong>
                        <small>{product.stock_quantity || 0} in stock</small>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="pf-empty-modern">
                <div><i className="fa-solid fa-box-open"></i></div>
                <h3>No products yet</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== PRODUCT DETAIL MODAL ==================== */}
      {activeProduct && (
        <div
          className="pf-modern-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setActiveProduct(null);
          }}
        >
          <div className="pf-modern-modal pf-product-detail-modal">
            <button
              type="button"
              className="pf-modal-close absolute"
              onClick={() => setActiveProduct(null)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <img
              className="pf-detail-product-image"
              src={
                activeProduct.image_url ||
                activeProduct.image ||
                "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop"
              }
              alt={activeProduct.name}
            />

            <div className="pf-detail-product-body">
              <span className="pf-eyebrow">
                {activeProduct.category || "PRODUCT"}
              </span>
              <h2>{activeProduct.name}</h2>
              <p>{activeProduct.description || "Fresh marketplace product."}</p>

              <div className="pf-detail-price">
                <strong>Rs. {activeProduct.price}</strong>
                <span>
                  {activeProduct.stock_quantity || activeProduct.stock || 0} in stock
                </span>
              </div>

              <button
                type="button"
                className="pf-primary-btn pf-full-width"
                onClick={() => setActiveProduct(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
