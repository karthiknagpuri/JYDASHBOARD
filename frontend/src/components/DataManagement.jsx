import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Download, Filter, Grid3X3, List, Mail, MessageSquare, 
  XCircle, RefreshCw, DollarSign, AlertCircle,
  Check, X, MoreVertical, Eye,
  Users, Edit, CheckCircle
} from 'lucide-react';

const DataManagement = ({ participants: initialParticipants = [] }) => {
  // View states
  const [viewMode, setViewMode] = useState('sheet'); // 'sheet' or 'cards'
  
  // Data states - initialize with mapped participants
  const [participants, setParticipants] = useState(() => {
    return initialParticipants.map(p => ({
      ...p,
      status: p.status || 'active',
      selected: false
    }));
  });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: [],
    state: [],
    gender: [],
    paymentStatus: [],
    ageRange: [16, 35],
    scholarshipRange: [0, 100],
    dateRange: { start: null, end: null }
  });

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active', color: '#10b981' },
    { value: 'confirmed', label: 'Confirmed', color: '#3b82f6' },
    { value: 'waitlisted', label: 'Waitlisted', color: '#f59e0b' },
    { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
    { value: 'deferred', label: 'Deferred', color: '#8b5cf6' },
    { value: 'refund_requested', label: 'Refund Requested', color: '#f97316' },
    { value: 'refund_in_progress', label: 'Refund In Progress', color: '#eab308' },
    { value: 'refunded', label: 'Refunded', color: '#6b7280' }
  ];

  // Initialize participants on mount and when props change
  useEffect(() => {
    console.log('DataManagement received participants:', initialParticipants.length);
    if (initialParticipants && initialParticipants.length > 0) {
      const updatedParticipants = initialParticipants.map(p => ({
        ...p,
        status: p.status || 'active',
        selected: false
      }));
      setParticipants(updatedParticipants);
      console.log('DataManagement set participants:', updatedParticipants.length);
    }
  }, [initialParticipants]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const stats = {
      total: participants.length,
      active: participants.filter(p => p.status === 'active').length,
      confirmed: participants.filter(p => p.status === 'confirmed').length,
      cancelled: participants.filter(p => p.status === 'cancelled').length,
      refundInProgress: participants.filter(p => 
        p.status === 'refund_requested' || p.status === 'refund_in_progress'
      ).length,
      pendingPayments: participants.filter(p => 
        parseFloat(p.scholarship_total_amount_paid || 0) === 0
      ).length,
      totalRevenue: participants.reduce((sum, p) => 
        sum + parseFloat(p.scholarship_total_amount_paid || 0), 0
      )
    };
    return stats;
  }, [participants]);

  // Filter participants based on search and filters
  const filteredParticipants = useMemo(() => {
    let filtered = [...participants];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm) ||
        p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.state?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(p => filters.status.includes(p.status));
    }

    // State filter
    if (filters.state.length > 0) {
      filtered = filtered.filter(p => filters.state.includes(p.state));
    }

    // Gender filter
    if (filters.gender.length > 0) {
      filtered = filtered.filter(p => filters.gender.includes(p.gender));
    }

    // Payment status filter
    if (filters.paymentStatus.length > 0) {
      filtered = filtered.filter(p => {
        const paid = parseFloat(p.scholarship_total_amount_paid || 0) > 0;
        if (filters.paymentStatus.includes('paid') && paid) return true;
        if (filters.paymentStatus.includes('unpaid') && !paid) return true;
        return false;
      });
    }

    // Age filter
    if (filters.ageRange) {
      filtered = filtered.filter(p => {
        const age = parseInt(p.age || 0);
        return age >= filters.ageRange[0] && age <= filters.ageRange[1];
      });
    }

    return filtered;
  }, [participants, searchTerm, filters]);

  // Handle status change
  const handleStatusChange = (participantId, newStatus) => {
    setParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, status: newStatus } : p
    ));
  };

  // Handle bulk status change
  const handleBulkStatusChange = (newStatus) => {
    if (selectedRows.size === 0) return;
    
    setParticipants(prev => prev.map(p => 
      selectedRows.has(p.id) ? { ...p, status: newStatus } : p
    ));
    setSelectedRows(new Set());
    setShowBulkActions(false);
  };

  // Handle row selection
  const handleRowSelect = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === filteredParticipants.length) {
      setSelectedRows(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedRows(new Set(filteredParticipants.map(p => p.id)));
      setShowBulkActions(true);
    }
  };

  // Export functions
  const exportToCSV = () => {
    const headers = [
      'Name', 'Email', 'Phone', 'City', 'State', 'Age', 'Gender',
      'Status', 'Amount Paid', 'Registration Date'
    ];
    
    const data = filteredParticipants.map(p => [
      p.name || '',
      p.email || '',
      p.phone || '',
      p.city || '',
      p.state || '',
      p.age || '',
      p.gender || '',
      p.status || '',
      p.scholarship_total_amount_paid || '0',
      p.created_at || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Get unique states for filter
  const uniqueStates = [...new Set(participants.map(p => p.state).filter(Boolean))];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header - Yatris Profiles */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Yatris Profiles</h2>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>Manage all participant data, status, and operations</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Users size={20} color="#3b82f6" />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Total Participants</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{summary.total}</div>
        </div>

        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircle size={20} color="#10b981" />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Active</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{summary.active}</div>
        </div>

        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <XCircle size={20} color="#ef4444" />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Cancelled</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{summary.cancelled}</div>
        </div>

        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <RefreshCw size={20} color="#f59e0b" />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Refunds in Progress</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{summary.refundInProgress}</div>
        </div>

        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertCircle size={20} color="#ef4444" />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Pending Payments</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{summary.pendingPayments}</div>
        </div>

        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <DollarSign size={20} color="#10b981" />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Total Revenue</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
            ₹{(summary.totalRevenue / 100000).toFixed(2)}L
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ background: 'white', padding: '16px', borderRadius: '8px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Search by name, email, phone, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 40px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '8px 16px',
                background: showFilters ? '#3b82f6' : 'white',
                color: showFilters ? 'white' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <Filter size={16} />
              Filters
              {(filters.status.length > 0 || filters.state.length > 0) && (
                <span style={{
                  background: showFilters ? 'white' : '#3b82f6',
                  color: showFilters ? '#3b82f6' : 'white',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '12px'
                }}>
                  {filters.status.length + filters.state.length}
                </span>
              )}
            </button>

            {/* View Toggle */}
            <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
              <button
                onClick={() => setViewMode('sheet')}
                style={{
                  padding: '8px 12px',
                  background: viewMode === 'sheet' ? '#3b82f6' : 'white',
                  color: viewMode === 'sheet' ? 'white' : '#374151',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <List size={16} />
                Sheet
              </button>
              <button
                onClick={() => setViewMode('cards')}
                style={{
                  padding: '8px 12px',
                  background: viewMode === 'cards' ? '#3b82f6' : 'white',
                  color: viewMode === 'cards' ? 'white' : '#374151',
                  border: 'none',
                  borderLeft: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Grid3X3 size={16} />
                Cards
              </button>
            </div>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              style={{
                padding: '8px 16px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {/* Status Filter */}
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>Status</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {statusOptions.map(status => (
                    <label key={status.value} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, status: [...prev.status, status.value] }));
                          } else {
                            setFilters(prev => ({ ...prev, status: prev.status.filter(s => s !== status.value) }));
                          }
                        }}
                      />
                      <span style={{ color: status.color }}>{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* State Filter */}
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>State</label>
                <select
                  multiple
                  value={filters.state}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFilters(prev => ({ ...prev, state: selected }));
                  }}
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    fontSize: '14px',
                    minHeight: '80px'
                  }}
                >
                  {uniqueStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>Payment Status</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      checked={filters.paymentStatus.includes('paid')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ ...prev, paymentStatus: [...prev.paymentStatus, 'paid'] }));
                        } else {
                          setFilters(prev => ({ ...prev, paymentStatus: prev.paymentStatus.filter(s => s !== 'paid') }));
                        }
                      }}
                    />
                    Paid
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      checked={filters.paymentStatus.includes('unpaid')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ ...prev, paymentStatus: [...prev.paymentStatus, 'unpaid'] }));
                        } else {
                          setFilters(prev => ({ ...prev, paymentStatus: prev.paymentStatus.filter(s => s !== 'unpaid') }));
                        }
                      }}
                    />
                    Unpaid
                  </label>
                </div>
              </div>

              {/* Clear Filters */}
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={() => setFilters({
                    status: [],
                    state: [],
                    gender: [],
                    paymentStatus: [],
                    ageRange: [16, 35],
                    scholarshipRange: [0, 100],
                    dateRange: { start: null, end: null }
                  })}
                  style={{
                    padding: '6px 12px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div style={{
          background: '#fef3c7',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: '600', color: '#92400e' }}>
              {selectedRows.size} participants selected
            </span>
            <button
              onClick={() => { setSelectedRows(new Set()); setShowBulkActions(false); }}
              style={{
                padding: '4px 8px',
                background: 'white',
                border: '1px solid #fbbf24',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Clear Selection
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleBulkStatusChange('confirmed')}
              style={{
                padding: '6px 12px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Check size={14} />
              Confirm
            </button>
            <button
              onClick={() => handleBulkStatusChange('cancelled')}
              style={{
                padding: '6px 12px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <X size={14} />
              Cancel
            </button>
            <button
              style={{
                padding: '6px 12px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Mail size={14} />
              Email
            </button>
            <button
              style={{
                padding: '6px 12px',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <MessageSquare size={14} />
              SMS
            </button>
            <button
              onClick={exportToCSV}
              style={{
                padding: '6px 12px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Download size={14} />
              Export Selected
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area - Full Profiles View */}
      {viewMode === 'sheet' ? (
          // Sheet View - Full Profiles
          <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '2000px' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb', position: 'sticky', left: 0, background: '#f9fafb' }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.size === filteredParticipants.length && filteredParticipants.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    {/* Personal Info */}
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>ID</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Phone</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>WhatsApp</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>DOB</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Age</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Gender</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Address</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>City</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>State</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Pincode</th>
                    {/* Academic/Professional */}
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Education</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>College</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Course</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Occupation</th>
                    {/* Program Details */}
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Reg Date</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Yatri Type</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>T-Shirt</th>
                    {/* Financial */}
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Total Fee</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Scholarship %</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Amount Paid</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Payment Date</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Payment Mode</th>
                    {/* Status */}
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Documents</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Emergency Contact</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Notes</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((p, index) => {
                    const scholarshipPercent = p.scholarship_total_amount_paid ? 
                      (100 - (parseFloat(p.scholarship_total_amount_paid) / 31290 * 100)).toFixed(0) : 0;
                    
                    return (
                      <tr key={p.id || index} style={{ borderBottom: '1px solid #e5e7eb', fontSize: '13px' }}>
                        <td style={{ padding: '8px', position: 'sticky', left: 0, background: 'white' }}>
                          <input
                            type="checkbox"
                            checked={selectedRows.has(p.id)}
                            onChange={() => handleRowSelect(p.id)}
                          />
                        </td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.id || index + 1}</td>
                        <td style={{ padding: '8px', color: '#111827', fontWeight: '500' }}>{p.name || '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.email || '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.phone || '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.whatsapp || p.phone || '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.dob || '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.age || '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.gender || '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.address || '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.city || '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.state || '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.pincode || '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.education || '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.college || '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.course || '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.occupation || '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.yatri_type || 'Participant'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.tshirt_size || '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>₹31,290</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{scholarshipPercent}%</td>
                        <td style={{ padding: '8px', color: '#111827', fontWeight: '500' }}>
                          ₹{parseFloat(p.scholarship_total_amount_paid || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.payment_date || '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.payment_mode || '-'}</td>
                        <td style={{ padding: '8px' }}>
                          <select
                            value={p.status || 'active'}
                            onChange={(e) => handleStatusChange(p.id, e.target.value)}
                            style={{
                              padding: '2px 4px',
                              fontSize: '11px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                              background: statusOptions.find(s => s.value === p.status)?.color || '#10b981',
                              color: 'white'
                            }}
                          >
                            {statusOptions.map(status => (
                              <option key={status.value} value={status.value} style={{ background: 'white', color: '#374151' }}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.documents_verified ? '✓' : 'Pending'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.emergency_contact || '-'}</td>
                        <td style={{ padding: '8px', color: '#6b7280' }}>{p.notes || '-'}</td>
                        <td style={{ padding: '8px' }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            <button style={{ padding: '2px', background: 'none', border: 'none', cursor: 'pointer' }}>
                              <Eye size={14} />
                            </button>
                            <button style={{ padding: '2px', background: 'none', border: 'none', cursor: 'pointer' }}>
                              <Edit size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredParticipants.length === 0 && (
                <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
                  No participants found matching your filters
                </div>
              )}
            </div>
          </div>
        ) : (
          // Cards View
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filteredParticipants.map((participant, index) => {
              const statusConfig = statusOptions.find(s => s.value === participant.status) || statusOptions[0];
              return (
                <div key={participant.id || index} style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: selectedRows.has(participant.id) ? '2px solid #3b82f6' : '2px solid transparent'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(participant.id)}
                        onChange={() => handleRowSelect(participant.id)}
                      />
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#374151'
                      }}>
                        {participant.name ? participant.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 8px',
                      background: statusConfig.color,
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                    {participant.name || 'Unknown'}
                  </h3>
                  
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                    <div>{participant.email || 'No email'}</div>
                    <div>{participant.phone || 'No phone'}</div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginBottom: '12px' }}>
                    <div>
                      <span style={{ color: '#6b7280' }}>City:</span>
                      <span style={{ marginLeft: '4px', color: '#111827', fontWeight: '500' }}>{participant.city || '-'}</span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>State:</span>
                      <span style={{ marginLeft: '4px', color: '#111827', fontWeight: '500' }}>{participant.state || '-'}</span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>Age:</span>
                      <span style={{ marginLeft: '4px', color: '#111827', fontWeight: '500' }}>{participant.age || '-'}</span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>Paid:</span>
                      <span style={{ marginLeft: '4px', color: '#111827', fontWeight: '500' }}>
                        ₹{parseFloat(participant.scholarship_total_amount_paid || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                    <button style={{
                      flex: 1,
                      padding: '6px',
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}>
                      <Eye size={14} />
                      View
                    </button>
                    <button style={{
                      flex: 1,
                      padding: '6px',
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}>
                      <Edit size={14} />
                      Edit
                    </button>
                    <button style={{
                      flex: 1,
                      padding: '6px',
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}>
                      <Mail size={14} />
                      Email
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
};

export default DataManagement;