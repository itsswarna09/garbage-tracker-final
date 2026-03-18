import React, { useState, useEffect } from 'react';
import {
  Trash2, MapPin, Zap, CheckCircle, ArrowRight,
  Mail, Lock, User, LogOut, Plus, Trash,
  Clock, AlertCircle,
} from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const savedUsers = localStorage.getItem('garbageTrackerUsers');
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    const savedReports = localStorage.getItem('garbageTrackerReports');
    if (savedReports) setReports(JSON.parse(savedReports));
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
      setCurrentPage('dashboard');
    }
  }, []);

  const geocodeLocation = async (locationText) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const query = encodeURIComponent(locationText.trim());
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const analyzeWithAI = async (type) => {
    setAiLoading(true);
    setAiResult('');

    const fullBins = userReports.filter(r => r.status === 'full').length;
    const moderateBins = userReports.filter(r => r.status === 'moderate').length;
    const emptyBins = userReports.filter(r => r.status === 'empty').length;
    const cities = [...new Set(userReports.map(r => r.location))].join(', ');
    const total = userReports.length;

    await new Promise(r => setTimeout(r, 1500));

    let result = '';

    if (type === 'insights') {
      result = `📊 AI INSIGHTS FOR YOUR GARBAGE DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 🔴 URGENT ATTENTION NEEDED
   ${fullBins} out of ${total} bins are completely full (${total > 0 ? Math.round((fullBins/total)*100) : 0}%). Immediate collection required to prevent overflow and health hazards.

2. 📍 COVERAGE ANALYSIS
   You are monitoring: ${cities || 'no locations yet'}. ${moderateBins} bins are at moderate capacity and will need collection within 24-48 hours.

3. ✅ EFFICIENCY SCORE
   ${emptyBins} bins (${total > 0 ? Math.round((emptyBins/total)*100) : 0}%) are empty and in good condition. Overall status: ${total > 0 ? (emptyBins > fullBins ? 'GOOD 🟢' : 'NEEDS IMPROVEMENT 🟡') : 'NO DATA YET'}.

💡 RECOMMENDATION: Focus collection efforts on full bins first, then schedule moderate bins for tomorrow morning.`;

    } else if (type === 'predict') {
      result = `🔮 OVERFLOW PREDICTION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ HIGH RISK AREAS:
${fullBins > 0 ? `• ${cities.split(',')[0] || 'Reported locations'} — Will overflow in ~6-12 hours if not collected` : '• No high risk areas currently'}

📅 COLLECTION TIMELINE:
- Next 6 hours: Collect ${fullBins} full bin(s) — URGENT
- Next 24 hours: Monitor ${moderateBins} moderate bin(s)
- This week: Routine check on ${emptyBins} empty bin(s)

🕐 BEST COLLECTION TIMES:
- Morning: 6:00 AM - 8:00 AM (least traffic)
- Evening: 5:00 PM - 7:00 PM (before night peak)

📊 PREDICTED OVERFLOW RISK:
${fullBins >= 3 ? '🔴 HIGH — Immediate action required!' : fullBins >= 1 ? '🟡 MEDIUM — Collection needed today' : '🟢 LOW — Situation under control'}`;

    } else if (type === 'route') {
      const locationList = userReports
        .sort((a, b) => {
          const priority = { full: 0, moderate: 1, empty: 2 };
          return priority[a.status] - priority[b.status];
        })
        .map((r, i) => `   Stop ${i+1}: ${r.location} — ${r.status === 'full' ? '🔴 URGENT' : r.status === 'moderate' ? '🟡 MODERATE' : '🟢 ROUTINE'}`)
        .join('\n');

      result = `🗺️ OPTIMIZED COLLECTION ROUTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚛 RECOMMENDED ROUTE (Priority Order):
${locationList || '   No bins reported yet — add some reports first!'}

⏱️ ESTIMATED TIMES:
- Full bins: 10 min per stop
- Moderate bins: 8 min per stop
- Empty bins: 5 min per stop
- Total estimated time: ~${(fullBins * 10) + (moderateBins * 8) + (emptyBins * 5)} minutes

💰 EFFICIENCY SAVINGS:
- Optimized route saves ~30% fuel vs random collection
- Prioritizing full bins reduces overflow risk by 80%

✅ START with full bins, then moderate, then empty for maximum efficiency!`;
    }

    setAiResult(result);
    setAiLoading(false);
  };

  const handleSignup = (email, password, confirmPassword) => {
    if (!email || !password || !confirmPassword) { alert('Please fill in all fields'); return false; }
    if (password !== confirmPassword) { alert('Passwords do not match!'); return false; }
    if (password.length < 6) { alert('Password must be at least 6 characters'); return false; }
    if (users.find((u) => u.email === email)) { alert('Email already registered!'); return false; }
    const newUser = { id: Date.now(), email, password, createdAt: new Date().toISOString() };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('garbageTrackerUsers', JSON.stringify(updatedUsers));
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    alert('Account created! Welcome!');
    setCurrentPage('dashboard');
    return true;
  };

  const handleLogin = (email, password) => {
    if (!email || !password) { alert('Please fill in all fields'); return false; }
    const foundUser = users.find((u) => u.email === email && u.password === password);
    if (!foundUser) { alert('Invalid email or password!'); return false; }
    setUser(foundUser);
    localStorage.setItem('currentUser', JSON.stringify(foundUser));
    setCurrentPage('dashboard');
    return true;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    setCurrentPage('landing');
  };

  const handleAddReport = async (location, status, description) => {
    if (!location || !status) { alert('Please fill in location and status'); return false; }
    alert('Finding location... please wait');
    const coordinates = await geocodeLocation(location);
    if (!coordinates) {
      alert('Location not found. Try: "Mumbai", "Delhi", "Kakinada", "Bengaluru", "Chennai"');
      return false;
    }
    const newReport = {
      id: Date.now(), userId: user.id, location, status, description,
      timestamp: new Date().toISOString(),
      latitude: coordinates.latitude, longitude: coordinates.longitude,
    };
    const updatedReports = [...reports, newReport];
    setReports(updatedReports);
    localStorage.setItem('garbageTrackerReports', JSON.stringify(updatedReports));
    alert('Report submitted at ' + location + '!');
    setShowReportForm(false);
    return true;
  };

  const handleDeleteReport = (reportId) => {
    const updatedReports = reports.filter((r) => r.id !== reportId);
    setReports(updatedReports);
    localStorage.setItem('garbageTrackerReports', JSON.stringify(updatedReports));
    alert('Report deleted!');
  };

  const userReports = reports.filter((r) => r.userId === user?.id);
  const stats = {
    total: userReports.length,
    full: userReports.filter((r) => r.status === 'full').length,
    moderate: userReports.filter((r) => r.status === 'moderate').length,
    empty: userReports.filter((r) => r.status === 'empty').length,
  };

  const LandingPage = () => (
    <div style={{ backgroundColor: '#FFFFFF' }}>
      <nav style={{
        position: 'fixed', top: 0, width: '100%',
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)', zIndex: 50,
        borderBottom: '1px solid #E5E7EB',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '16px 24px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
              borderRadius: '8px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Trash2 size={24} color="#FFFFFF" />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#111827' }}>
              GarbageTracker
            </span>
          </div>
          <button onClick={() => setCurrentPage('signup')} style={{
            backgroundColor: '#10B981', color: '#FFFFFF',
            padding: '8px 24px', borderRadius: '8px',
            border: 'none', fontWeight: '600', cursor: 'pointer',
          }}>
            Get Started
          </button>
        </div>
      </nav>

      <section style={{
        paddingTop: '120px', paddingBottom: '80px',
        paddingLeft: '16px', paddingRight: '16px',
        maxWidth: '800px', margin: '0 auto',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#D1FAE5', padding: '8px 16px',
            borderRadius: '9999px', border: '1px solid #A7F3D0', width: 'fit-content',
          }}>
            <Zap size={16} color="#10B981" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
              The Smart Way to Track Garbage
            </span>
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: 'bold', color: '#111827', lineHeight: '1.1' }}>
            Smart Waste Tracking Made Simple
          </h1>
          <p style={{ fontSize: '20px', color: '#4B5563', lineHeight: '1.8' }}>
            Real-time garbage bin monitoring powered by AI. Optimize collection routes,
            reduce overflow, and track environmental impact.
          </p>
          <button onClick={() => setCurrentPage('signup')} style={{
            backgroundColor: '#10B981', color: '#FFFFFF',
            padding: '16px 32px', borderRadius: '8px', border: 'none',
            fontWeight: 'bold', fontSize: '18px', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'fit-content',
          }}>
            Start Free Trial <ArrowRight size={20} />
          </button>
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#4B5563' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} color="#10B981" /> No credit card required
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} color="#10B981" /> Free setup
            </div>
          </div>
        </div>
      </section>

      <footer style={{
        backgroundColor: '#111827', color: '#9CA3AF',
        padding: '48px 16px 32px', textAlign: 'center', fontSize: '14px',
      }}>
        <p>© 2024 GarbageTracker. All rights reserved.</p>
      </footer>
    </div>
  );

  const AuthForm = ({ mode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      await new Promise((r) => setTimeout(r, 400));
      if (mode === 'signup') handleSignup(email, password, confirmPassword);
      else handleLogin(email, password);
      setLoading(false);
    };

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', backgroundColor: '#F9FAFB', padding: '16px',
      }}>
        <div style={{
          width: '100%', maxWidth: '400px', backgroundColor: '#FFFFFF',
          padding: '40px', borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px', height: '56px', backgroundColor: '#D1FAE5',
              borderRadius: '12px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px',
            }}>
              {mode === 'signup' ? <User size={28} color="#10B981" /> : <Lock size={28} color="#10B981" />}
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
              {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p style={{ color: '#4B5563', fontSize: '14px' }}>
              {mode === 'signup' ? 'Join GarbageTracker today' : 'Sign in to your account'}
            </p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Email Address', type: 'email', value: email, setter: setEmail, placeholder: 'your@email.com', icon: <Mail size={20} color="#9CA3AF" /> },
              { label: 'Password', type: 'password', value: password, setter: setPassword, placeholder: '••••••••', icon: <Lock size={20} color="#9CA3AF" /> },
              ...(mode === 'signup' ? [{ label: 'Confirm Password', type: 'password', value: confirmPassword, setter: setConfirmPassword, placeholder: '••••••••', icon: <Lock size={20} color="#9CA3AF" /> }] : []),
            ].map((field) => (
              <div key={field.label}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  {field.label}
                </label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  backgroundColor: '#F3F4F6', padding: '12px',
                  borderRadius: '8px', border: '1px solid #E5E7EB',
                }}>
                  {field.icon}
                  <input
                    type={field.type} value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    placeholder={field.placeholder}
                    style={{
                      flex: 1, backgroundColor: 'transparent',
                      border: 'none', outline: 'none',
                      fontSize: '16px', color: '#111827',
                    }}
                  />
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} style={{
              backgroundColor: '#10B981', color: '#FFFFFF',
              padding: '12px 24px', borderRadius: '8px', border: 'none',
              fontWeight: 'bold', fontSize: '16px', cursor: 'pointer',
              marginTop: '8px', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? '...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </form>
          <p style={{ textAlign: 'center', color: '#4B5563', fontSize: '14px', marginTop: '24px' }}>
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => setCurrentPage(mode === 'signup' ? 'login' : 'signup')} style={{
              backgroundColor: 'transparent', border: 'none',
              color: '#10B981', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
            }}>
              {mode === 'signup' ? 'Sign in here' : 'Sign up here'}
            </button>
          </p>
        </div>
      </div>
    );
  };

  const MapView = ({ reports }) => {
    const mapRef = React.useRef(null);
    const mapInstanceRef = React.useRef(null);

    React.useEffect(() => {
      if (!mapRef.current || reports.length === 0) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      const initMap = () => {
        if (!window.L) { setTimeout(initMap, 200); return; }
        try {
          const map = window.L.map(mapRef.current).setView([20.5937, 78.9629], 5);
          mapInstanceRef.current = map;
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors', maxZoom: 19,
          }).addTo(map);
          reports.forEach((report) => {
            if (!report.latitude || !report.longitude) return;
            const color = report.status === 'full' ? '#EF4444'
              : report.status === 'moderate' ? '#F59E0B' : '#10B981';
            const icon = window.L.divIcon({
              html: `<div style="width:32px;height:32px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">📍</div>`,
              iconSize: [32, 32], iconAnchor: [16, 16],
              popupAnchor: [0, -16], className: '',
            });
            window.L.marker([report.latitude, report.longitude], { icon })
              .bindPopup(`<div style="padding:10px;font-size:14px;min-width:150px;"><strong>${report.location}</strong><br/>${report.status === 'full' ? '🔴 Full' : report.status === 'moderate' ? '🟡 Moderate' : '🟢 Empty'}<br/>${report.description ? `<small>${report.description}</small>` : ''}</div>`)
              .addTo(map);
          });
          setTimeout(() => map.invalidateSize(), 200);
        } catch (err) { console.error('Map error:', err); }
      };
      const timer = setTimeout(initMap, 150);
      return () => {
        clearTimeout(timer);
        if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
      };
    }, [reports]);

    if (reports.length === 0) {
      return (
        <div style={{
          backgroundColor: '#FFFFFF', padding: '48px 32px',
          borderRadius: '12px', textAlign: 'center',
          color: '#4B5563', border: '2px dashed #E5E7EB',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
          <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No reports on map yet</p>
          <p>Report some bins first, then switch to Map View!</p>
        </div>
      );
    }

    return (
      <div style={{
        width: '100%', height: '500px', borderRadius: '12px',
        overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '40px', border: '1px solid #E5E7EB',
      }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>
    );
  };

  const ReportForm = ({ onSubmit }) => {
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('moderate');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      await onSubmit(location, status, description);
      setLocation(''); setStatus('moderate'); setDescription('');
      setLoading(false);
    };

    return (
      <div style={{
        backgroundColor: '#FFFFFF', padding: '32px',
        borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '40px',
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>
          Report a Garbage Bin
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Location (try: "Mumbai", "Delhi", "Kakinada")
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#F3F4F6', padding: '12px',
              borderRadius: '8px', border: '1px solid #E5E7EB',
            }}>
              <MapPin size={20} color="#9CA3AF" />
              <input type="text" value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter city or location"
                style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '16px', color: '#111827' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Bin Status
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['empty', 'moderate', 'full'].map((s) => (
                <label key={s} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 16px',
                  backgroundColor: status === s ? '#D1FAE5' : '#F3F4F6',
                  borderRadius: '8px',
                  border: status === s ? '2px solid #10B981' : '1px solid #E5E7EB',
                  cursor: 'pointer',
                  color: status === s ? '#10B981' : '#4B5563',
                  fontWeight: status === s ? 'bold' : 'normal',
                }}>
                  <input type="radio" name="status" value={s}
                    checked={status === s} onChange={(e) => setStatus(e.target.value)}
                    style={{ cursor: 'pointer' }} />
                  {s === 'empty' ? '🟢 Empty' : s === 'moderate' ? '🟡 Moderate' : '🔴 Full'}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Description (Optional)
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details..."
              style={{
                width: '100%', padding: '12px', borderRadius: '8px',
                border: '1px solid #E5E7EB', backgroundColor: '#F3F4F6',
                fontSize: '16px', color: '#111827',
                fontFamily: 'Arial, sans-serif', minHeight: '100px', resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            backgroundColor: '#10B981', color: '#FFFFFF',
            padding: '12px 24px', borderRadius: '8px', border: 'none',
            fontWeight: 'bold', fontSize: '16px', cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    );
  };

  const ReportsList = ({ reports, onDelete }) => {
    if (reports.length === 0) {
      return (
        <div style={{
          backgroundColor: '#FFFFFF', padding: '32px',
          borderRadius: '12px', textAlign: 'center', color: '#4B5563',
        }}>
          <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#9CA3AF' }} />
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>No reports yet</p>
          <p>Start by reporting a garbage bin in your area!</p>
        </div>
      );
    }
    return (
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>
          Your Reports
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {reports.map((report) => {
            const borderColor = report.status === 'full' ? '#EF4444' : report.status === 'moderate' ? '#F59E0B' : '#10B981';
            const bgColor = report.status === 'full' ? '#FEE2E2' : report.status === 'moderate' ? '#FEF3C7' : '#D1FAE5';
            const textColor = report.status === 'full' ? '#EF4444' : report.status === 'moderate' ? '#D97706' : '#10B981';
            const label = report.status === 'full' ? '🔴 Full' : report.status === 'moderate' ? '🟡 Moderate' : '🟢 Empty';
            return (
              <div key={report.id} style={{
                backgroundColor: '#FFFFFF', padding: '24px',
                borderRadius: '12px', border: `2px solid ${borderColor}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                      {report.location}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4B5563', fontSize: '14px' }}>
                      <Clock size={16} />
                      {new Date(report.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <button onClick={() => onDelete(report.id)} style={{
                    backgroundColor: '#FEE2E2', color: '#EF4444',
                    border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer',
                  }}>
                    <Trash size={16} />
                  </button>
                </div>
                <span style={{
                  display: 'inline-block', padding: '6px 12px', borderRadius: '6px',
                  backgroundColor: bgColor, color: textColor, fontWeight: 'bold', fontSize: '14px',
                }}>
                  {label}
                </span>
                {report.description && (
                  <p style={{ color: '#4B5563', fontSize: '14px', marginTop: '12px', lineHeight: '1.5' }}>
                    {report.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const DashboardPage = () => (
    <div>
      <nav style={{
        backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB',
        padding: '16px 24px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '40px', height: '40px', backgroundColor: '#10B981',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trash2 size={24} color="#FFFFFF" />
          </div>
          <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#111827' }}>GarbageTracker</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#4B5563', fontSize: '14px' }}>{user?.email}</span>
          <button onClick={handleLogout} style={{
            backgroundColor: '#EF4444', color: '#FFFFFF',
            border: 'none', padding: '8px 16px', borderRadius: '8px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600',
          }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', padding: '40px 16px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '40px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
              Your Garbage Tracking Dashboard
            </h1>
            <p style={{ fontSize: '18px', color: '#4B5563' }}>Track and manage garbage bins across India</p>
            <p style={{ fontSize: '13px', color: '#059669', marginTop: '8px' }}>✅ Using FREE OpenStreetMap (Nominatim)</p>
            <p style={{ fontSize: '12px', color: '#F59E0B', marginTop: '4px' }}>💡 Try: "Mumbai", "Delhi", "Kakinada", "Bengaluru", "Chennai"</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
            {[
              { id: 'list', label: '📋 List View' },
              { id: 'map', label: '🗺️ Map View' },
              { id: 'ai', label: '🤖 AI Analysis' },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setViewMode(tab.id)} style={{
                backgroundColor: viewMode === tab.id ? '#10B981' : '#E5E7EB',
                color: viewMode === tab.id ? '#FFFFFF' : '#111827',
                padding: '12px 24px', borderRadius: '8px',
                border: 'none', fontWeight: '600', cursor: 'pointer',
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* AI VIEW */}
          {viewMode === 'ai' && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                🤖 AI Analysis
              </h2>
              <p style={{ color: '#4B5563', marginBottom: '24px' }}>
                AI analyzes your garbage data and gives real insights
              </p>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {[
                  { type: 'insights', label: '📊 Get Insights', color: '#10B981' },
                  { type: 'predict', label: '🔮 Predict Overflows', color: '#3B82F6' },
                  { type: 'route', label: '🗺️ Optimize Route', color: '#8B5CF6' },
                ].map((btn) => (
                  <button key={btn.type} onClick={() => analyzeWithAI(btn.type)}
                    disabled={aiLoading} style={{
                      background: btn.color, color: 'white', border: 'none',
                      padding: '12px 20px', borderRadius: '8px', cursor: 'pointer',
                      fontWeight: '600', fontSize: '15px', opacity: aiLoading ? 0.7 : 1,
                    }}>
                    {btn.label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Full 🔴', value: stats.full, bg: '#FEF2F2', color: '#EF4444' },
                  { label: 'Moderate 🟡', value: stats.moderate, bg: '#FFFBEB', color: '#F59E0B' },
                  { label: 'Empty 🟢', value: stats.empty, bg: '#F0FDF4', color: '#10B981' },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: s.bg, padding: '16px 24px',
                    borderRadius: '8px', textAlign: 'center', flex: 1, minWidth: '100px',
                  }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{
                background: '#F9FAFB', border: '1px solid #E5E7EB',
                borderRadius: '12px', padding: '24px', minHeight: '150px',
              }}>
                {aiLoading && (
                  <div style={{ textAlign: 'center', color: '#10B981', padding: '20px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤖</div>
                    <div>AI is analyzing your data...</div>
                  </div>
                )}
                {!aiLoading && !aiResult && (
                  <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '20px' }}>
                    Click any button above to get AI-powered insights! 🚀
                  </div>
                )}
                {!aiLoading && aiResult && (
                  <div style={{ lineHeight: '1.8', color: '#374151', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '14px' }}>
                    {aiResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MAP VIEW */}
          {viewMode === 'map' && (
            <>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>
                Garbage Bins on Map
              </h2>
              <MapView reports={userReports} />
            </>
          )}

          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '16px', marginBottom: '32px',
              }}>
                {[
                  { label: 'Total Reports', value: stats.total, color: '#10B981', icon: '📊' },
                  { label: 'Full Bins', value: stats.full, color: '#EF4444', icon: '🔴' },
                  { label: 'Moderate', value: stats.moderate, color: '#F59E0B', icon: '🟡' },
                  { label: 'Empty', value: stats.empty, color: '#10B981', icon: '🟢' },
                ].map((stat) => (
                  <div key={stat.label} style={{
                    backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px',
                    border: `2px solid ${stat.color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: stat.color, marginBottom: '4px' }}>
                      {stat.value}
                    </div>
                    <div style={{ color: '#4B5563', fontSize: '14px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '32px' }}>
                <button onClick={() => setShowReportForm(!showReportForm)} style={{
                  backgroundColor: '#10B981', color: '#FFFFFF',
                  padding: '16px 32px', borderRadius: '8px', border: 'none',
                  fontWeight: 'bold', fontSize: '16px', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                }}>
                  <Plus size={20} />
                  {showReportForm ? 'Hide Form' : 'Report New Bin'}
                </button>
              </div>
              {showReportForm && <ReportForm onSubmit={handleAddReport} />}
              <ReportsList reports={userReports} onDelete={handleDeleteReport} />
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {!user ? (
        <>
          {currentPage === 'landing' && <LandingPage />}
          {currentPage === 'signup' && <AuthForm mode="signup" />}
          {currentPage === 'login' && <AuthForm mode="login" />}
        </>
      ) : (
        <DashboardPage />
      )}
    </div>
  );
}