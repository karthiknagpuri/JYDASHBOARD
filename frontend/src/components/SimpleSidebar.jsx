import React from 'react';
import { 
  Upload, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Shield, 
  Home, 
  Menu,
  X,
  Activity
} from 'lucide-react';
import './SimpleSidebar.css';

const SimpleSidebar = ({ activeTab, setActiveTab, participants = [], isMobile, isOpen, setIsOpen }) => {
  const navigationItems = [
    {
      id: 0,
      label: 'Upload CSV',
      icon: Upload,
      description: 'Import participant data'
    },
    {
      id: 1,
      label: `Participants (${participants.length})`,
      icon: Users,
      description: 'View all participants'
    },
    {
      id: 2,
      label: 'Analytics',
      icon: BarChart3,
      description: 'Data visualizations'
    },
    {
      id: 3,
      label: 'Executive KPIs',
      icon: TrendingUp,
      description: 'Key performance indicators'
    },
    {
      id: 4,
      label: 'Data Quality',
      icon: Shield,
      description: 'Data accuracy report'
    },
    {
      id: 5,
      label: 'Interactive Analytics',
      icon: Activity,
      description: 'Advanced insights & charts'
    }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  if (isMobile) {
    return (
      <>
        {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}
        <div className={`sidebar mobile ${isOpen ? 'open' : ''}`}>
          <SidebarContent 
            navigationItems={navigationItems} 
            activeTab={activeTab} 
            handleNavClick={handleNavClick}
            participants={participants}
            isMobile={true}
            setIsOpen={setIsOpen}
          />
        </div>
      </>
    );
  }

  return (
    <div className="sidebar desktop">
      <SidebarContent 
        navigationItems={navigationItems} 
        activeTab={activeTab} 
        handleNavClick={handleNavClick}
        participants={participants}
        isMobile={false}
      />
    </div>
  );
};

const SidebarContent = ({ navigationItems, activeTab, handleNavClick, participants, isMobile, setIsOpen }) => {
  return (
    <div className="sidebar-content">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <Home size={32} style={{ color: '#1976d2' }} />
          <div>
            <h1>Jagriti Yatra</h1>
            <p>Participant Dashboard</p>
          </div>
        </div>
        {isMobile && (
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <Icon size={20} />
              <div className="nav-content">
                <div className="nav-label">{item.label}</div>
                <div className="nav-description">{item.description}</div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-stats">
        <div className="stats-card">
          <h3>Quick Stats</h3>
          <div className="stats-grid">
            <div>
              <div className="stat-value">{participants.length}</div>
              <div className="stat-label">Total Participants</div>
            </div>
            <div>
              <div className="stat-value">
                {participants.filter(p => p.yatri_type === 'facilitator').length}
              </div>
              <div className="stat-label">Facilitators</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MobileMenuButton = ({ isOpen, setIsOpen }) => (
  <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
    {isOpen ? <X size={20} /> : <Menu size={20} />}
  </button>
);

export default SimpleSidebar;