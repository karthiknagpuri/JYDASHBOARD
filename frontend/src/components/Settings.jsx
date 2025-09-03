import React, { useState, useEffect } from 'react';
import {
  Save,
  Edit2,
  X,
  Check,
  AlertCircle,
  Settings as SettingsIcon,
  Users,
  Bell,
  Shield,
  Database,
  Calendar,
  Palette,
  Key,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Settings = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [settings, setSettings] = useState({});
  const [editMode, setEditMode] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const categories = [
    {
      id: 'general',
      label: 'General Settings',
      icon: SettingsIcon,
      description: 'Basic configuration'
    },
    {
      id: 'event',
      label: 'Event Details',
      icon: Calendar,
      description: 'Yatra information'
    },
    {
      id: 'capacity',
      label: 'Capacity & Pricing',
      icon: Users,
      description: 'Seats and pricing'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Alert preferences'
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      description: 'Access control'
    },
    {
      id: 'database',
      label: 'Database',
      icon: Database,
      description: 'Data management'
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Palette,
      description: 'Visual customization'
    },
    {
      id: 'api',
      label: 'API Keys',
      icon: Key,
      description: 'External integrations'
    }
  ];

  const settingsSchema = {
    general: [
      { key: 'dashboard_name', label: 'Dashboard Name', type: 'text', default: 'Jagriti Yatra Dashboard' },
      { key: 'organization', label: 'Organization', type: 'text', default: 'Jagriti Yatra' },
      { key: 'timezone', label: 'Timezone', type: 'select', options: ['IST', 'UTC', 'EST', 'PST'], default: 'IST' },
      { key: 'language', label: 'Language', type: 'select', options: ['English', 'Hindi', 'Tamil', 'Telugu'], default: 'English' },
      { key: 'date_format', label: 'Date Format', type: 'select', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], default: 'DD/MM/YYYY' },
      { key: 'currency', label: 'Currency', type: 'select', options: ['INR', 'USD', 'EUR'], default: 'INR' }
    ],
    event: [
      { key: 'event_name', label: 'Event Name', type: 'text', default: 'Jagriti Yatra 2024-25' },
      { key: 'start_date', label: 'Start Date', type: 'date', default: '2024-12-24' },
      { key: 'end_date', label: 'End Date', type: 'date', default: '2025-01-14' },
      { key: 'registration_deadline', label: 'Registration Deadline', type: 'date', default: '2024-12-01' },
      { key: 'total_cities', label: 'Total Cities', type: 'number', default: 12 },
      { key: 'journey_distance', label: 'Journey Distance (km)', type: 'number', default: 8000 },
      { key: 'contact_email', label: 'Contact Email', type: 'email', default: 'info@jagritiyatra.com' },
      { key: 'contact_phone', label: 'Contact Phone', type: 'tel', default: '+91 98765 43210' }
    ],
    capacity: [
      { key: 'total_capacity', label: 'Total Capacity', type: 'number', default: 450 },
      { key: 'participant_capacity', label: 'Participant Seats', type: 'number', default: 450 },
      { key: 'facilitator_capacity', label: 'Facilitator Seats', type: 'number', default: 75 },
      { key: 'waiting_list_size', label: 'Waiting List Size', type: 'number', default: 100 },
      { key: 'ticket_price', label: 'Ticket Price (₹)', type: 'number', default: 31290 },
      { key: 'early_bird_discount', label: 'Early Bird Discount (%)', type: 'number', default: 10 },
      { key: 'group_discount', label: 'Group Discount (%)', type: 'number', default: 15 },
      { key: 'scholarship_budget', label: 'Scholarship Budget (₹)', type: 'number', default: 5000000 }
    ],
    notifications: [
      { key: 'enable_email_notifications', label: 'Email Notifications', type: 'toggle', default: true },
      { key: 'enable_sms_notifications', label: 'SMS Notifications', type: 'toggle', default: false },
      { key: 'enable_whatsapp_notifications', label: 'WhatsApp Notifications', type: 'toggle', default: true },
      { key: 'notification_frequency', label: 'Notification Frequency', type: 'select', options: ['Instant', 'Hourly', 'Daily', 'Weekly'], default: 'Daily' },
      { key: 'payment_alerts', label: 'Payment Alerts', type: 'toggle', default: true },
      { key: 'registration_alerts', label: 'Registration Alerts', type: 'toggle', default: true },
      { key: 'capacity_alerts', label: 'Capacity Alerts', type: 'toggle', default: true },
      { key: 'alert_threshold', label: 'Alert Threshold (%)', type: 'number', default: 80 }
    ],
    security: [
      { key: 'enable_two_factor', label: 'Two-Factor Authentication', type: 'toggle', default: false },
      { key: 'session_timeout', label: 'Session Timeout (minutes)', type: 'number', default: 30 },
      { key: 'password_complexity', label: 'Password Complexity', type: 'select', options: ['Low', 'Medium', 'High'], default: 'Medium' },
      { key: 'max_login_attempts', label: 'Max Login Attempts', type: 'number', default: 5 },
      { key: 'ip_whitelist', label: 'IP Whitelist', type: 'textarea', default: '' },
      { key: 'enable_audit_log', label: 'Audit Logging', type: 'toggle', default: true },
      { key: 'data_encryption', label: 'Data Encryption', type: 'toggle', default: true },
      { key: 'api_rate_limit', label: 'API Rate Limit (per hour)', type: 'number', default: 1000 }
    ],
    database: [
      { key: 'auto_backup', label: 'Auto Backup', type: 'toggle', default: true },
      { key: 'backup_frequency', label: 'Backup Frequency', type: 'select', options: ['Hourly', 'Daily', 'Weekly', 'Monthly'], default: 'Daily' },
      { key: 'backup_retention', label: 'Backup Retention (days)', type: 'number', default: 30 },
      { key: 'database_optimization', label: 'Auto Optimization', type: 'toggle', default: true },
      { key: 'data_export_format', label: 'Export Format', type: 'select', options: ['CSV', 'JSON', 'Excel', 'PDF'], default: 'CSV' },
      { key: 'import_validation', label: 'Import Validation', type: 'toggle', default: true },
      { key: 'duplicate_check', label: 'Duplicate Check', type: 'toggle', default: true },
      { key: 'archive_old_data', label: 'Archive Old Data', type: 'toggle', default: false }
    ],
    appearance: [
      { key: 'theme', label: 'Theme', type: 'select', options: ['Light', 'Dark', 'Auto'], default: 'Light' },
      { key: 'primary_color', label: 'Primary Color', type: 'color', default: '#667eea' },
      { key: 'secondary_color', label: 'Secondary Color', type: 'color', default: '#764ba2' },
      { key: 'font_size', label: 'Font Size', type: 'select', options: ['Small', 'Medium', 'Large'], default: 'Medium' },
      { key: 'sidebar_position', label: 'Sidebar Position', type: 'select', options: ['Left', 'Right'], default: 'Left' },
      { key: 'compact_mode', label: 'Compact Mode', type: 'toggle', default: false },
      { key: 'animations', label: 'Enable Animations', type: 'toggle', default: true },
      { key: 'logo_url', label: 'Logo URL', type: 'text', default: '' }
    ],
    api: [
      { key: 'supabase_url', label: 'Supabase URL', type: 'password', default: '' },
      { key: 'supabase_key', label: 'Supabase Anon Key', type: 'password', default: '' },
      { key: 'google_maps_key', label: 'Google Maps API Key', type: 'password', default: '' },
      { key: 'sendgrid_key', label: 'SendGrid API Key', type: 'password', default: '' },
      { key: 'twilio_sid', label: 'Twilio Account SID', type: 'password', default: '' },
      { key: 'twilio_token', label: 'Twilio Auth Token', type: 'password', default: '' },
      { key: 'razorpay_key', label: 'Razorpay Key', type: 'password', default: '' },
      { key: 'webhook_url', label: 'Webhook URL', type: 'text', default: '' }
    ]
  };

  useEffect(() => {
    loadSettings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Try to load from Supabase
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (!error && data && data.length > 0) {
        const settingsObj = {};
        data.forEach(item => {
          settingsObj[item.key] = item.value;
        });
        setSettings(settingsObj);
      } else {
        // Load from localStorage as fallback
        const localSettings = localStorage.getItem('dashboardSettings');
        if (localSettings) {
          setSettings(JSON.parse(localSettings));
        } else {
          // Initialize with defaults
          const defaults = {};
          Object.keys(settingsSchema).forEach(category => {
            settingsSchema[category].forEach(setting => {
              defaults[setting.key] = setting.default;
            });
          });
          setSettings(defaults);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showAlert('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setUnsavedChanges(true);
  };

  const handleEdit = (key) => {
    setEditMode(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('dashboardSettings', JSON.stringify(settings));
      
      // Try to save to Supabase
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        await supabase
          .from('settings')
          .upsert(update, { onConflict: 'key' });
      }

      setUnsavedChanges(false);
      setEditMode({});
      showAlert('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (category) => {
    if (window.confirm(`Reset all ${category} settings to defaults?`)) {
      const defaults = {};
      settingsSchema[category].forEach(setting => {
        defaults[setting.key] = setting.default;
      });
      
      setSettings(prev => ({
        ...prev,
        ...defaults
      }));
      setUnsavedChanges(true);
      showAlert(`${category} settings reset to defaults`, 'info');
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showAlert('Settings exported successfully', 'success');
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setSettings(imported);
          setUnsavedChanges(true);
          showAlert('Settings imported successfully', 'success');
        } catch (error) {
          showAlert('Invalid settings file', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  const renderSettingInput = (setting) => {
    const value = settings[setting.key] ?? setting.default;
    const isEditing = editMode[setting.key];

    switch (setting.type) {
      case 'toggle':
        return (
          <button
            onClick={() => handleSettingChange(setting.key, !value)}
            style={{
              padding: '4px',
              width: '50px',
              height: '24px',
              borderRadius: '12px',
              background: value ? '#10b981' : '#e5e7eb',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s'
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: '4px',
              left: value ? '30px' : '4px',
              transition: 'all 0.2s'
            }} />
          </button>
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            disabled={!isEditing && setting.type !== 'toggle'}
            style={{
              padding: '6px 10px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '14px',
              background: isEditing ? 'white' : '#f9fafb',
              cursor: isEditing ? 'pointer' : 'default',
              minWidth: '150px'
            }}
          >
            {setting.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'color':
        return (
          <input
            type="color"
            value={value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            disabled={!isEditing}
            style={{
              padding: '2px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              width: '60px',
              height: '32px',
              cursor: isEditing ? 'pointer' : 'default'
            }}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            disabled={!isEditing}
            rows="3"
            style={{
              padding: '6px 10px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '14px',
              background: isEditing ? 'white' : '#f9fafb',
              width: '100%',
              resize: 'vertical'
            }}
          />
        );

      case 'password':
        return (
          <input
            type={isEditing ? 'text' : 'password'}
            value={value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            disabled={!isEditing}
            style={{
              padding: '6px 10px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '14px',
              background: isEditing ? 'white' : '#f9fafb',
              minWidth: '200px'
            }}
          />
        );

      default:
        return (
          <input
            type={setting.type}
            value={value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            disabled={!isEditing}
            style={{
              padding: '6px 10px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '14px',
              background: isEditing ? 'white' : '#f9fafb',
              minWidth: '200px'
            }}
          />
        );
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <RefreshCw className="animate-spin" size={32} style={{ display: 'inline-block' }} />
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', background: '#f9fafb' }}>
      {/* Categories Sidebar */}
      <div style={{
        width: '240px',
        background: 'white',
        borderRight: '1px solid #e5e7eb',
        padding: '16px',
        overflowY: 'auto'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#374151'
        }}>
          Settings Categories
        </h3>
        
        {categories.map(category => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              style={{
                width: '100%',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: 'none',
                borderRadius: '8px',
                background: isActive ? '#f3f4f6' : 'transparent',
                cursor: 'pointer',
                marginBottom: '4px',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={18} style={{ color: isActive ? '#667eea' : '#6b7280' }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? '#111827' : '#374151'
                }}>
                  {category.label}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  marginTop: '2px'
                }}>
                  {category.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Settings Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '24px' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                margin: 0
              }}>
                {categories.find(c => c.id === activeCategory)?.label}
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginTop: '4px'
              }}>
                Configure your {activeCategory} preferences
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleReset(activeCategory)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} />
                Reset
              </button>
              
              <label style={{
                padding: '8px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                background: 'white',
                color: '#6b7280',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Upload size={14} />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  style={{ display: 'none' }}
                />
              </label>
              
              <button
                onClick={handleExport}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} />
                Export
              </button>
              
              {unsavedChanges && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    background: saving ? '#9ca3af' : '#10b981',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {saving ? (
                    <RefreshCw className="animate-spin" size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>

          {/* Alert */}
          {alert && (
            <div style={{
              padding: '12px 16px',
              background: alert.type === 'success' ? '#10b981' : 
                         alert.type === 'error' ? '#ef4444' : '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {alert.type === 'success' ? <Check size={18} /> :
               alert.type === 'error' ? <X size={18} /> :
               <AlertCircle size={18} />}
              {alert.message}
            </div>
          )}

          {/* Settings List */}
          <div style={{
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            {settingsSchema[activeCategory]?.map((setting, index) => (
              <div
                key={setting.key}
                style={{
                  padding: '16px 20px',
                  borderBottom: index < settingsSchema[activeCategory].length - 1 ? '1px solid #e5e7eb' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ flex: 1 }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    display: 'block'
                  }}>
                    {setting.label}
                  </label>
                  {setting.description && (
                    <p style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      marginTop: '2px'
                    }}>
                      {setting.description}
                    </p>
                  )}
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  {renderSettingInput(setting)}
                  
                  {setting.type !== 'toggle' && setting.type !== 'select' && setting.type !== 'color' && (
                    <button
                      onClick={() => handleEdit(setting.key)}
                      style={{
                        padding: '6px',
                        background: editMode[setting.key] ? '#667eea' : 'transparent',
                        color: editMode[setting.key] ? 'white' : '#6b7280',
                        border: '1px solid ' + (editMode[setting.key] ? '#667eea' : '#e5e7eb'),
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {editMode[setting.key] ? <Check size={14} /> : <Edit2 size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;