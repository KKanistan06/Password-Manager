import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as ReactIcons from 'react-icons/fa';
import * as BsIcons from 'react-icons/bs';
import * as SiIcons from 'react-icons/si';
import * as MdIcons from 'react-icons/md';
import CryptoJS from 'crypto-js';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copyMessages, setCopyMessages] = useState({});
  const [formData, setFormData] = useState({
    applicationName: '',
    username: '',
    password: '',
    url: ''
  });

  // Enhanced icon mapping with original colors
  const iconMapping = {
    facebook: { icon: 'FaFacebook', color: '#1877F2' },
    instagram: { icon: 'FaInstagram', color: '#E4405F' },
    twitter: { icon: 'FaTwitter', color: '#1DA1F2' },
    linkedin: { icon: 'FaLinkedin', color: '#0077B5' },
    google: { icon: 'FaGoogle', color: '#4285F4' },
    github: { icon: 'FaGithub', color: '#333' },
    youtube: { icon: 'FaYoutube', color: '#FF0000' },
    amazon: { icon: 'FaAmazon', color: '#FF9900' },
    apple: { icon: 'FaApple', color: '#000000' },
    microsoft: { icon: 'FaMicrosoft', color: '#00A4EF' },
    netflix: { icon: 'SiNetflix', color: '#E50914' },
    spotify: { icon: 'FaSpotify', color: '#1DB954' },
    discord: { icon: 'FaDiscord', color: '#5865F2' },
    telegram: { icon: 'FaTelegram', color: '#0088CC' },
    whatsapp: { icon: 'FaWhatsapp', color: '#25D366' },
    gmail: { icon: 'SiGmail', color: '#EA4335' },
    outlook: { icon: 'SiMicrosoftoutlook', color: '#0078D4' },
    yahoo: { icon: 'FaYahoo', color: '#6001D2' },
    dropbox: { icon: 'FaDropbox', color: '#0061FF' },
    slack: { icon: 'FaSlack', color: '#4A154B' },
    reddit: { icon: 'FaReddit', color: '#FF4500' },
    pinterest: { icon: 'FaPinterest', color: '#BD081C' },
    snapchat: { icon: 'FaSnapchat', color: '#FFFC00' },
    tiktok: { icon: 'SiTiktok', color: '#000000' },
    default: { icon: 'FaGlobe', color: '#667eea' }
  };

  const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'your-secret-key';

  useEffect(() => {
    // Check if user is authenticated on component mount
    if (!user) {
      navigate('/login');
      return;
    }
    loadPasswords();
  }, [user, navigate]);

  const loadPasswords = () => {
    if (!user) return;
    const savedPasswords = localStorage.getItem(`passwords_${user.email}`);
    if (savedPasswords) {
      setPasswords(JSON.parse(savedPasswords));
    }
  };

  const savePasswords = (updatedPasswords) => {
    if (!user) return;
    localStorage.setItem(`passwords_${user.email}`, JSON.stringify(updatedPasswords));
    setPasswords(updatedPasswords);
  };

  const encryptPassword = (password) => {
    return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
  };

  const decryptPassword = (encryptedPassword) => {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const getIcon = (applicationName) => {
    const appName = applicationName.toLowerCase();
    const iconData = iconMapping[appName] || iconMapping.default;
    const Icon = ReactIcons[iconData.icon] || BsIcons[iconData.icon] || SiIcons[iconData.icon] || ReactIcons.FaGlobe;
    return { Icon, color: iconData.color };
  };

  const calculatePasswordAge = (createdDate) => {
    const created = new Date(createdDate);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPasswordRecommendation = (createdDate) => {
    const age = calculatePasswordAge(createdDate);
    if (age > 90) return { status: 'critical', message: 'Change immediately' };
    if (age > 60) return { status: 'warning', message: 'Consider changing' };
    return { status: 'good', message: 'Password is fresh' };
  };

  const showCopyMessage = (passwordId, type) => {
    setCopyMessages(prev => ({
      ...prev,
      [passwordId]: `${type} copied!`
    }));
    
    setTimeout(() => {
      setCopyMessages(prev => ({
        ...prev,
        [passwordId]: null
      }));
    }, 2000);
  };

  const handleAddPassword = (e) => {
    e.preventDefault();
    const newPassword = {
      id: Date.now(),
      applicationName: formData.applicationName,
      username: formData.username,
      password: encryptPassword(formData.password),
      url: formData.url,
      createdDate: new Date().toISOString(),
      lastChanged: new Date().toISOString()
    };

    const updatedPasswords = [...passwords, newPassword];
    savePasswords(updatedPasswords);
    
    setFormData({ applicationName: '', username: '', password: '', url: '' });
    setShowAddForm(false);
  };

  const handleEditPassword = (password) => {
    setEditingPassword(password);
    setFormData({
      applicationName: password.applicationName,
      username: password.username,
      password: decryptPassword(password.password),
      url: password.url
    });
    setShowEditForm(true);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    const updatedPasswords = passwords.map(p => 
      p.id === editingPassword.id 
        ? {
            ...p,
            applicationName: formData.applicationName,
            username: formData.username,
            password: encryptPassword(formData.password),
            url: formData.url,
            lastChanged: new Date().toISOString()
          }
        : p
    );
    
    savePasswords(updatedPasswords);
    setFormData({ applicationName: '', username: '', password: '', url: '' });
    setShowEditForm(false);
    setEditingPassword(null);
  };

  const handleDeleteClick = (password) => {
    setDeleteCandidate(password);
    setShowDeleteConfirm(true);
    setDeleteConfirmText('');
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmText === deleteCandidate.applicationName) {
      const updatedPasswords = passwords.filter(p => p.id !== deleteCandidate.id);
      savePasswords(updatedPasswords);
      setShowDeleteConfirm(false);
      setDeleteCandidate(null);
      setDeleteConfirmText('');
    }
  };

  const togglePasswordVisibility = (passwordId) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [passwordId]: !prev[passwordId]
    }));
  };

  const copyToClipboard = async (text, type, passwordId) => {
    try {
      await navigator.clipboard.writeText(text);
      showCopyMessage(passwordId, type);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleOpenApplication = (password) => {
    if (password.url) {
      const newWindow = window.open(password.url, '_blank');
      if (newWindow) {
        setTimeout(() => {
          try {
            const decryptedPassword = decryptPassword(password.password);
            console.log('Username:', password.username);
            console.log('Password:', decryptedPassword);
          } catch (error) {
            console.error('Error opening application:', error);
          }
        }, 1000);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Show loading or redirect if no user
  if (!user) {
    return <div>Loading...</div>;
  }

  const filteredPasswords = passwords.filter(password =>
    password.applicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Password Manager</h1>
          <div className="user-info">
            <span>Welcome, {user.firstName}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search passwords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="add-password-btn"
          >
            Add New Password
          </button>
        </div>

        {/* Add Password Modal */}
        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Add New Password</h2>
              <form onSubmit={handleAddPassword}>
                <div className="form-group">
                  <label>Application Name</label>
                  <input
                    type="text"
                    value={formData.applicationName}
                    onChange={(e) => setFormData({...formData, applicationName: e.target.value})}
                    required
                    placeholder="e.g., Facebook, Gmail, Instagram"
                  />
                </div>
                <div className="form-group">
                  <label>Username/Email</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Website URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-btn">Save Password</button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Password Modal */}
        {showEditForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Edit Password</h2>
              <form onSubmit={handleUpdatePassword}>
                <div className="form-group">
                  <label>Application Name</label>
                  <input
                    type="text"
                    value={formData.applicationName}
                    onChange={(e) => setFormData({...formData, applicationName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Username/Email</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Website URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-btn">Update Password</button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingPassword(null);
                      setFormData({ applicationName: '', username: '', password: '', url: '' });
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content delete-modal">
              <h2>Confirm Deletion</h2>
              <p>To delete this password entry for <strong>{deleteCandidate?.applicationName}</strong>, please type the application name exactly:</p>
              <div className="form-group">
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={`Type "${deleteCandidate?.applicationName}" to confirm`}
                  className="confirm-input"
                />
              </div>
              <div className="form-actions">
                <button 
                  onClick={handleDeleteConfirm}
                  disabled={deleteConfirmText !== deleteCandidate?.applicationName}
                  className="delete-confirm-btn"
                >
                  Delete Password
                </button>
                <button 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteCandidate(null);
                    setDeleteConfirmText('');
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="passwords-grid">
          {filteredPasswords.length === 0 ? (
            <div className="no-passwords">
              <p>No passwords saved yet. Add your first password to get started!</p>
            </div>
          ) : (
            filteredPasswords.map(password => {
              const { Icon, color } = getIcon(password.applicationName);
              const recommendation = getPasswordRecommendation(password.createdDate);
              const isPasswordVisible = visiblePasswords[password.id];
              const copyMessage = copyMessages[password.id];
              
              return (
                <div key={password.id} className="password-card">
                  {copyMessage && (
                    <div className="copy-notification">
                      {copyMessage}
                    </div>
                  )}
                  
                  <div className="password-header">
                    <div className="app-info">
                      <Icon className="app-icon" size={24} style={{ color }} />
                      <span className="app-name">{password.applicationName}</span>
                    </div>
                    <div className="password-actions">
                      <button 
                        onClick={() => handleEditPassword(password)}
                        className="edit-btn"
                        title="Edit Password"
                      >
                        <MdIcons.MdEdit size={16} />
                      </button>
                      <button 
                        onClick={() => handleOpenApplication(password)}
                        className="open-btn"
                        title="Open Application"
                      >
                        <MdIcons.MdOpenInNew size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(password)}
                        className="delete-btn"
                        title="Delete Password"
                      >
                        <MdIcons.MdDelete size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="password-details">
                    <div className="detail-row">
                      <span className="label">Username:</span>
                      <div className="value-container">
                        <span className="value">{password.username}</span>
                        <button 
                          onClick={() => copyToClipboard(password.username, 'Username', password.id)}
                          className="copy-btn"
                          title="Copy Username"
                        >
                          <MdIcons.MdContentCopy size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="detail-row">
                      <span className="label">Password:</span>
                      <div className="value-container">
                        <span className="value">
                          {isPasswordVisible 
                            ? decryptPassword(password.password)
                            : '••••••••'
                          }
                        </span>
                        <div className="password-controls">
                          <button 
                            onClick={() => togglePasswordVisibility(password.id)}
                            className="show-btn"
                            title={isPasswordVisible ? "Hide Password" : "Show Password"}
                          >
                            {isPasswordVisible ? <MdIcons.MdVisibilityOff size={14} /> : <MdIcons.MdVisibility size={14} />}
                          </button>
                          <button 
                            onClick={() => copyToClipboard(decryptPassword(password.password), 'Password', password.id)}
                            className="copy-btn"
                            title="Copy Password"
                          >
                            <MdIcons.MdContentCopy size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`password-recommendation ${recommendation.status}`}>
                    <span className="recommendation-text">
                      {recommendation.message} (Age: {calculatePasswordAge(password.createdDate)} days)
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
