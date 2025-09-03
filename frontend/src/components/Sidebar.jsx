import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  Database,
  FileText,
  Settings,
  HelpCircle,
  Map,
  DollarSign,
  Calendar,
  Activity,
  Shield,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Upload,
  UserPlus,
  LogOut,
  Bell,
  Search,
  Home,
  Award,
  MessageSquare
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout, onAddYatri, notifications = 0 }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview & summary',
      category: 'main'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Data insights & charts',
      category: 'main'
    },
    {
      id: 'data',
      label: 'Data Management',
      icon: Database,
      description: 'Manage all data',
      category: 'main'
    },
    {
      id: 'participants',
      label: 'Participants',
      icon: Users,
      description: 'Yatri profiles',
      category: 'main'
    },
    {
      id: 'revenue',
      label: 'Revenue',
      icon: DollarSign,
      description: 'Financial analytics',
      category: 'insights'
    },
    {
      id: 'states',
      label: 'State Analysis',
      icon: Map,
      description: 'Geographic insights',
      category: 'insights'
    },
    {
      id: 'submissions',
      label: 'Submissions',
      icon: FileText,
      description: 'CSV submissions',
      category: 'main'
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      description: 'Event timeline',
      category: 'insights'
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: Activity,
      description: 'KPIs & metrics',
      category: 'insights'
    },
    {
      id: 'quality',
      label: 'Data Quality',
      icon: Shield,
      description: 'Quality checks',
      category: 'insights'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BookOpen,
      description: 'Generate reports',
      category: 'tools'
    },
    {
      id: 'awards',
      label: 'Awards & Badges',
      icon: Award,
      description: 'Recognition system',
      category: 'tools'
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: MessageSquare,
      description: 'Messages & alerts',
      category: 'tools'
    },
    {
      id: 'upload',
      label: 'Upload Data',
      icon: Upload,
      description: 'Import CSV files',
      category: 'tools'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Configuration',
      category: 'system'
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      description: 'Documentation',
      category: 'system'
    }
  ];

  const filteredItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { id: 'main', label: 'Main', items: filteredItems.filter(item => item.category === 'main') },
    { id: 'insights', label: 'Insights', items: filteredItems.filter(item => item.category === 'insights') },
    { id: 'tools', label: 'Tools', items: filteredItems.filter(item => item.category === 'tools') },
    { id: 'system', label: 'System', items: filteredItems.filter(item => item.category === 'system') }
  ];

  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        style={{
          width: '100%',
          padding: isCollapsed ? '12px' : '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: 'none',
          borderRadius: '8px',
          background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
          color: isActive ? 'white' : '#6b7280',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '14px',
          fontWeight: isActive ? '600' : '400',
          textAlign: 'left',
          position: 'relative',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          marginBottom: '2px'
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = '#f3f4f6';
            e.currentTarget.style.color = '#374151';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#6b7280';
          }
        }}
        title={isCollapsed ? `${item.label} - ${item.description}` : ''}
      >
        <Icon size={18} style={{ flexShrink: 0 }} />
        {!isCollapsed && (
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: '13px' }}>{item.label}</div>
            {item.description && (
              <div style={{ 
                fontSize: '11px', 
                opacity: 0.7,
                marginTop: '1px'
              }}>
                {item.description}
              </div>
            )}
          </div>
        )}
        {isActive && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '3px',
            height: '20px',
            background: 'white',
            borderRadius: '0 2px 2px 0'
          }} />
        )}
      </button>
    );
  };

  return (
    <div
      style={{
        width: isCollapsed ? '70px' : '260px',
        background: 'white',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        zIndex: 100,
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Header */}
      <div style={{
        padding: isCollapsed ? '16px 10px' : '16px',
        borderBottom: '1px solid #e5e7eb',
        background: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {!isCollapsed && (
            <div>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0
              }}>
                JY Dashboard
              </h2>
              <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                Jagriti Yatra 2024-25
              </p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              padding: '6px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
            }}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div style={{
            marginTop: '12px',
            position: 'relative'
          }}>
            <Search 
              size={14} 
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }}
            />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px 6px 32px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
              }}
            />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div style={{
          padding: '12px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={onAddYatri}
            style={{
              flex: 1,
              padding: '8px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#059669';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#10b981';
            }}
          >
            <UserPlus size={14} />
            Add Yatri
          </button>
          <button
            style={{
              padding: '8px',
              background: notifications > 0 ? '#fbbf24' : '#f3f4f6',
              color: notifications > 0 ? '#92400e' : '#6b7280',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s'
            }}
            title="Notifications"
          >
            <Bell size={14} />
            {notifications > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {notifications}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Menu Items */}
      <div style={{ 
        flex: 1, 
        padding: isCollapsed ? '8px' : '12px',
        overflowY: 'auto'
      }}>
        {categories.map((category) => {
          if (category.items.length === 0) return null;
          
          return (
            <div key={category.id} style={{ marginBottom: '20px' }}>
              {!isCollapsed && (
                <div style={{ 
                  fontSize: '10px', 
                  fontWeight: '600', 
                  color: '#9ca3af', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                  paddingLeft: '8px'
                }}>
                  {category.label}
                </div>
              )}
              <div>
                {category.items.map(renderMenuItem)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: isCollapsed ? '12px 8px' : '12px',
        borderTop: '1px solid #e5e7eb',
        background: 'white'
      }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '8px',
            background: 'transparent',
            color: '#ef4444',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fef2f2';
            e.currentTarget.style.borderColor = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = '#fecaca';
          }}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut size={14} />
          {!isCollapsed && 'Logout'}
        </button>
        
        {!isCollapsed && (
          <div style={{
            marginTop: '12px',
            padding: '8px',
            background: '#f9fafb',
            borderRadius: '6px',
            fontSize: '10px',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: '600' }}>© 2024 Jagriti Yatra</div>
            <div style={{ marginTop: '2px' }}>Dashboard v2.0</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;