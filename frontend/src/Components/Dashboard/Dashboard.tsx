import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

interface UserProfile {
  name: string;
  age: number;
  height: string;
  weight: string;
  location: string;
  dueDate: string;
  weeksPregnant: number;
  profileImage: string;
}

interface HealthMetric {
  label: string;
  value: string;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
}

interface Appointment {
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  type: string;
}

interface Message {
  from: string;
  preview: string;
  date: string;
  avatar: string;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'appointments' | 'community'>('overview');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userProfile: UserProfile = {
    name: user?.name || 'User',
    age: user?.age || 32,
    height: '5\'6"',
    weight: '142 lbs',
    location: 'Austin, TX',
    dueDate: user?.dueDate || 'September 15, 2026',
    weeksPregnant: 24,
    profileImage: '👩🏻'
  };

  const healthMetrics: HealthMetric[] = [
    { label: 'Blood Pressure', value: '120/80', icon: '💓', trend: 'stable' },
    { label: 'Baby\'s Heart Rate', value: '145 bpm', icon: '💗', trend: 'stable' },
    { label: 'Weight Gain', value: '+18 lbs', icon: '⚖️', trend: 'up' },
    { label: 'Next Checkup', value: 'In 5 days', icon: '📅', trend: 'stable' }
  ];

  const upcomingAppointments: Appointment[] = [
    {
      doctor: 'Dr. Jane Doe',
      specialty: 'OB-GYN',
      date: 'Friday, April 28',
      time: '10:00 AM',
      type: 'Telehealth Consultation'
    },
    {
      doctor: 'Dr. Michael Chen',
      specialty: 'Ultrasound Specialist',
      date: 'Monday, May 8',
      time: '2:30 PM',
      type: 'Anatomy Scan'
    }
  ];

  const recentMessages: Message[] = [
    {
      from: 'Dr. Patel',
      preview: 'Your test results are ready, please review them at your convenience.',
      date: 'Apr 23',
      avatar: '👨‍⚕️'
    },
    {
      from: 'Support Team',
      preview: 'Your appointment with Dr. Lee has been confirmed. Please fill out the online forms.',
      date: 'Apr 20',
      avatar: '💬'
    }
  ];

  const weeklyMilestone = {
    week: weeksPregnant,
    babySize: 'Cantaloupe',
    length: '12 inches',
    development: 'Baby can now hear sounds from outside the womb!'
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon"></span>
          <h1>ConnectHER</h1>
        </div>
        
        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="nav-icon">🏠</span>
            <span>Overview</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'health' ? 'active' : ''}`}
            onClick={() => setActiveTab('health')}
          >
            <span className="nav-icon">💪</span>
            <span>Health Tracker</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <span className="nav-icon">📅</span>
            <span>Appointments</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'community' ? 'active' : ''}`}
            onClick={() => setActiveTab('community')}
          >
            <span className="nav-icon">👥</span>
            <span>Community</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="settings-btn">
            <span>⚙️</span> Settings
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span> Log Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <div className="welcome-section">
            <h2 className="welcome-text">Welcome back, {userProfile.name}! ✨</h2>
            <p className="subtitle">Week {weeklyMilestone.week} • {userProfile.dueDate}</p>
          </div>
          <div className="header-actions">
            <button className="icon-btn notification-btn">
              <span>🔔</span>
              <span className="badge">2</span>
            </button>
            <button className="icon-btn messages-btn">
              <span>💬</span>
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="tab-content overview-tab">
            <div className="content-grid">
              {/* Profile Card */}
              <div className="card profile-card">
                <div className="card-header">
                  <h3>Your Profile</h3>
                  <button className="edit-btn">Edit</button>
                </div>
                <div className="profile-content">
                  <div className="profile-avatar">
                    <span className="avatar-emoji">{userProfile.profileImage}</span>
                  </div>
                  <div className="profile-details">
                    <h4 className="profile-name">{userProfile.name}</h4>
                    <div className="profile-info-grid">
                      <div className="info-item">
                        <span className="info-label">Age</span>
                        <span className="info-value">{userProfile.age} years</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Height</span>
                        <span className="info-value">{userProfile.height}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Weight</span>
                        <span className="info-value">{userProfile.weight}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Location</span>
                        <span className="info-value">{userProfile.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Baby Milestone Card */}
              <div className="card milestone-card">
                <div className="card-header">
                  <h3>This Week's Milestone</h3>
                  <span className="week-badge">Week {weeklyMilestone.week}</span>
                </div>
                <div className="milestone-content">
                  <div className="baby-size">
                    <span className="size-emoji">🍈</span>
                    <div className="size-details">
                      <p className="size-comparison">Size of a {weeklyMilestone.babySize}</p>
                      <p className="size-measurement">{weeklyMilestone.length} long</p>
                    </div>
                  </div>
                  <div className="development-note">
                    <span className="note-icon">✨</span>
                    <p>{weeklyMilestone.development}</p>
                  </div>
                </div>
              </div>

              {/* Health Metrics Grid */}
              <div className="health-metrics-grid">
                {healthMetrics.map((metric, index) => (
                  <div key={index} className="metric-card" style={{ animationDelay: `${index * 0.1}s` }}>
                    <span className="metric-icon">{metric.icon}</span>
                    <div className="metric-info">
                      <span className="metric-label">{metric.label}</span>
                      <span className="metric-value">{metric.value}</span>
                    </div>
                    {metric.trend && (
                      <span className={`trend-indicator ${metric.trend}`}>
                        {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Upcoming Appointment */}
              <div className="card appointment-preview">
                <div className="card-header">
                  <h3>Next Appointment</h3>
                  <button className="view-all-btn">View All →</button>
                </div>
                {upcomingAppointments[0] && (
                  <div className="appointment-item">
                    <div className="appointment-icon">👩‍⚕️</div>
                    <div className="appointment-details">
                      <h4>{upcomingAppointments[0].doctor}</h4>
                      <p className="appointment-specialty">{upcomingAppointments[0].specialty}</p>
                      <div className="appointment-time">
                        <span>📅 {upcomingAppointments[0].date}</span>
                        <span>🕐 {upcomingAppointments[0].time}</span>
                      </div>
                      <span className="appointment-type">{upcomingAppointments[0].type}</span>
                    </div>
                    <button className="view-details-btn">View Details</button>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="card messages-card">
                <div className="card-header">
                  <h3>Recent Messages</h3>
                  <button className="view-all-btn">View All →</button>
                </div>
                <div className="messages-list">
                  {recentMessages.map((message, index) => (
                    <div key={index} className="message-item">
                      <span className="message-avatar">{message.avatar}</span>
                      <div className="message-content">
                        <div className="message-header">
                          <span className="message-from">{message.from}</span>
                          <span className="message-date">{message.date}</span>
                        </div>
                        <p className="message-preview">{message.preview}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Tips */}
              <div className="card tips-card">
                <div className="card-header">
                  <h3>Health Tips for Week {weeklyMilestone.week}</h3>
                </div>
                <div className="tips-list">
                  <div className="tip-item">
                    <span className="tip-icon">💧</span>
                    <p>Stay hydrated - aim for 8-10 glasses of water daily</p>
                  </div>
                  <div className="tip-item">
                    <span className="tip-icon">🥗</span>
                    <p>Include iron-rich foods like spinach and lean meats</p>
                  </div>
                  <div className="tip-item">
                    <span className="tip-icon">🧘‍♀️</span>
                    <p>Practice gentle prenatal yoga for flexibility</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="tab-content health-tab">
            <div className="content-grid">
              <div className="card large-card">
                <h3>Health Tracking</h3>
                <p className="placeholder-text">Track your daily health metrics, symptoms, and wellness journey.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="tab-content appointments-tab">
            <div className="content-grid">
              <div className="card large-card">
                <div className="card-header">
                  <h3>All Appointments</h3>
                  <button className="primary-btn">+ Schedule New</button>
                </div>
                <div className="appointments-list">
                  {upcomingAppointments.map((appointment, index) => (
                    <div key={index} className="appointment-item full">
                      <div className="appointment-icon">👩‍⚕️</div>
                      <div className="appointment-details">
                        <h4>{appointment.doctor}</h4>
                        <p className="appointment-specialty">{appointment.specialty}</p>
                        <div className="appointment-time">
                          <span>📅 {appointment.date}</span>
                          <span>🕐 {appointment.time}</span>
                        </div>
                        <span className="appointment-type">{appointment.type}</span>
                      </div>
                      <button className="view-details-btn">View Details</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="tab-content community-tab">
            <div className="content-grid">
              <div className="card large-card">
                <h3>Community & Support</h3>
                <p className="placeholder-text">Connect with other expecting mothers and share your journey.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;