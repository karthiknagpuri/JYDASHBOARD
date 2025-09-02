import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import ProfessionalInsights from './ProfessionalInsights';
import { 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Users,
  Calendar,
  MapPin,
  Phone,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

const CSVSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    participants: 0,
    facilitators: 0,
    male: 0,
    female: 0,
    other: 0
  });
  const [alert, setAlert] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch submissions from Supabase
  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error, count } = await supabase
        .from('csv_submissions')
        .select('*', { count: 'exact' })
        .order('submitted_date', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (error) {
        console.error('Fetch error:', error);
        if (error.code === '42P01') {
          console.log('Table does not exist yet. Please create it in Supabase.');
          setSubmissions([]);
          setStats({
            total: 0,
            participants: 0,
            facilitators: 0,
            male: 0,
            female: 0,
            other: 0
          });
          setLoading(false);
          return;
        }
        throw error;
      }

      setSubmissions(data || []);
      
      // Calculate stats
      const { data: statsData, error: statsError } = await supabase
        .from('csv_submissions')
        .select('role, gender');

      if (!statsError && statsData) {
        const newStats = {
          total: count || 0,
          participants: statsData.filter(s => s.role?.toLowerCase() === 'participant').length,
          facilitators: statsData.filter(s => s.role?.toLowerCase() === 'facilitator').length,
          male: statsData.filter(s => s.gender?.toLowerCase() === 'male').length,
          female: statsData.filter(s => s.gender?.toLowerCase() === 'female').length,
          other: statsData.filter(s => !['male', 'female'].includes(s.gender?.toLowerCase())).length
        };
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      showAlert('Failed to load submissions', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Apply filters
  useEffect(() => {
    let filtered = [...submissions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.yatri_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.mobile_no?.includes(searchTerm) ||
        s.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(s => s.role?.toLowerCase() === filterRole);
    }

    // Gender filter
    if (filterGender !== 'all') {
      filtered = filtered.filter(s => s.gender?.toLowerCase() === filterGender);
    }

    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, filterRole, filterGender]);

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Parse CSV data - handles both regular CSV and complex CSV with quoted fields
  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    // Parse header
    const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row = {};
      
      headers.forEach((header, index) => {
        // Map CSV headers to database columns
        const columnMap = {
          'yatri_id': 'yatri_id',
          'yatra_id': 'yatri_id', // Support both formats for backward compatibility
          'first_name': 'first_name',
          'last_name': 'last_name',
          'gender': 'gender',
          'role': 'role',
          'mobile_no': 'mobile_no',
          'mobile_number': 'mobile_no',
          'phone': 'mobile_no',
          'age': 'age',
          'address': 'address',
          'submitted_date': 'submitted_date',
          'date': 'submitted_date'
        };
        
        const dbColumn = columnMap[header] || header;
        row[dbColumn] = values[index] || null;
      });
      
      // Ensure required fields
      if (row.yatri_id && row.first_name) {
        // Convert yatri_id to string and add JY prefix if needed
        row.yatri_id = String(row.yatri_id);
        if (!row.yatri_id.startsWith('JY')) {
          row.yatri_id = 'JY' + row.yatri_id;
        }
        
        // Parse date if present (handle DD-MM-YYYY format)
        if (row.submitted_date) {
          try {
            // Check if date is in DD-MM-YYYY format
            if (row.submitted_date.includes('-')) {
              const parts = row.submitted_date.split('-');
              if (parts.length === 3 && parts[0].length <= 2) {
                // Convert DD-MM-YYYY to YYYY-MM-DD
                row.submitted_date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            }
            const date = new Date(row.submitted_date);
            if (!isNaN(date.getTime())) {
              row.submitted_date = date.toISOString();
            } else {
              row.submitted_date = new Date().toISOString();
            }
          } catch {
            row.submitted_date = new Date().toISOString();
          }
        } else {
          row.submitted_date = new Date().toISOString();
        }
        
        // Parse age to integer
        if (row.age) {
          row.age = parseInt(row.age) || null;
        }
        
        data.push(row);
      }
    }
    
    return data;
  };

  // Helper function to parse CSV line with proper quote handling
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add last field
    result.push(current.trim());
    
    return result;
  };

  // Handle CSV upload with batch processing for large files
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      showAlert('Please upload a CSV file', 'error');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const text = await file.text();
      console.log('CSV file loaded, size:', text.length, 'characters');
      console.log('First 500 characters:', text.substring(0, 500));
      
      const data = parseCSV(text);
      console.log('Parsed data length:', data.length);
      console.log('First parsed record:', data[0]);
      console.log('Last parsed record:', data[data.length - 1]);
      
      if (data.length === 0) {
        showAlert('No valid data found in CSV', 'error');
        setUploading(false);
        return;
      }

      showAlert(`Processing ${data.length} records...`, 'info');

      // Batch upload in chunks of 500 for better performance
      const batchSize = 500;
      const batches = [];
      
      for (let i = 0; i < data.length; i += batchSize) {
        batches.push(data.slice(i, i + batchSize));
      }

      let totalUploaded = 0;
      let totalErrors = 0;

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        
        try {
          console.log(`Processing batch ${i + 1}/${batches.length} with ${batch.length} records`);
          
          // Check for duplicates before inserting
          const yatriIds = batch.map(r => r.yatri_id).filter(Boolean);
          console.log('Checking for existing IDs:', yatriIds.slice(0, 5));
          
          const { data: existing, error: checkError } = await supabase
            .from('csv_submissions')
            .select('yatri_id')
            .in('yatri_id', yatriIds);

          if (checkError) {
            console.error('Error checking existing records:', checkError);
            if (checkError.code === '42P01') {
              showAlert('❌ Table "csv_submissions" does not exist. Please create the table in Supabase first.', 'error');
              setUploading(false);
              setUploadProgress(0);
              return;
            }
          }

          const existingIds = new Set(existing?.map(e => e.yatri_id) || []);
          const newRecords = batch.filter(r => !existingIds.has(r.yatri_id));
          
          console.log(`Found ${existingIds.size} existing records, ${newRecords.length} new records to insert`);
          
          if (newRecords.length > 0) {
            // Log sample record to check data format
            console.log('Sample record to insert:', newRecords[0]);
            
            const { data: insertedData, error } = await supabase
              .from('csv_submissions')
              .insert(newRecords)
              .select();

            if (error) {
              console.error('Batch upload error:', error);
              console.error('Failed records sample:', newRecords.slice(0, 2));
              
              // Show specific error message
              if (error.code === '42P01') {
                showAlert('❌ Table "csv_submissions" does not exist. Please create the table in Supabase first.', 'error');
                setUploading(false);
                setUploadProgress(0);
                return;
              } else if (error.code === '23505') {
                showAlert(`⚠️ Some records already exist (duplicate Yatra IDs)`, 'warning');
                totalErrors += newRecords.length;
              } else if (error.message) {
                showAlert(`❌ Upload error: ${error.message}`, 'error');
                totalErrors += newRecords.length;
              } else {
                totalErrors += newRecords.length;
              }
            } else {
              console.log(`Successfully inserted ${insertedData?.length || newRecords.length} records`);
              totalUploaded += (insertedData?.length || newRecords.length);
            }
          } else {
            console.log('No new records to insert in this batch (all duplicates)');
          }

          // Update progress
          const progress = Math.round(((i + 1) / batches.length) * 100);
          setUploadProgress(progress);
        } catch (error) {
          console.error('Batch processing error:', error);
          console.error('Error details:', error.message);
          totalErrors += batch.length;
        }
      }

      // Show final results
      if (totalUploaded > 0) {
        showAlert(`✅ Successfully uploaded ${totalUploaded} new records`, 'success');
        fetchSubmissions(); // Refresh the list
      } else if (totalErrors > 0) {
        showAlert(`❌ Failed to upload ${totalErrors} records`, 'error');
      } else {
        showAlert('ℹ️ All records already exist in the database', 'info');
      }

    } catch (error) {
      console.error('Upload error:', error);
      showAlert('Failed to process CSV file', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Yatri ID', 'First Name', 'Last Name', 'Gender', 'Role', 'Mobile No', 'Age', 'Address', 'Submitted Date'];
    const csvContent = [
      headers.join(','),
      ...filteredSubmissions.map(s => [
        s.yatri_id || '',
        s.first_name || '',
        s.last_name || '',
        s.gender || '',
        s.role || '',
        s.mobile_no || '',
        s.age || '',
        `"${(s.address || '').replace(/"/g, '""')}"`,
        s.submitted_date ? new Date(s.submitted_date).toLocaleDateString() : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(stats.total / pageSize);

  return (
    <div style={{ padding: '24px' }}>
      {/* Professional Insights Banner */}
      {filteredSubmissions.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <ProfessionalInsights participants={filteredSubmissions} />
        </div>
      )}
      
      {/* Header */}
      <div style={{ 
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
              CSV Submissions
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
              Manage and view all submitted participant data
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: uploading ? '#e5e7eb' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: uploading ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: uploading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {uploading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Uploading... {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload CSV
                </>
              )}
            </button>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'white',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
            borderRadius: '12px',
            borderLeft: '4px solid #667eea'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={20} color="#667eea" />
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Total Records</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                  {stats.total.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #10b98120 0%, #34d39920 100%)',
            borderRadius: '12px',
            borderLeft: '4px solid #10b981'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <User size={20} color="#10b981" />
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Participants</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                  {stats.participants.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #f59e0b20 0%, #fbbf2420 100%)',
            borderRadius: '12px',
            borderLeft: '4px solid #f59e0b'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={20} color="#f59e0b" />
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Facilitators</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                  {stats.facilitators.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #3b82f620 0%, #60a5fa20 100%)',
            borderRadius: '12px',
            borderLeft: '4px solid #3b82f6'
          }}>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Gender Distribution</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  M: {stats.male}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  F: {stats.female}
                </span>
                {stats.other > 0 && (
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>
                    O: {stats.other}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: '1', minWidth: '250px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search by name, ID, mobile, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            <option value="all">All Roles</option>
            <option value="participant">Participants</option>
            <option value="facilitator">Facilitators</option>
          </select>

          {/* Gender Filter */}
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <div style={{
          marginBottom: '24px',
          padding: '12px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          ...(alert.type === 'error' && {
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#dc2626'
          }),
          ...(alert.type === 'success' && {
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#16a34a'
          }),
          ...(alert.type === 'info' && {
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#2563eb'
          })
        }}>
          {alert.type === 'success' && <CheckCircle size={20} />}
          {alert.type === 'error' && <XCircle size={20} />}
          {alert.type === 'info' && <AlertCircle size={20} />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Table */}
      <div style={{ 
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Loader size={32} className="animate-spin" style={{ margin: '0 auto', color: '#667eea' }} />
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <FileText size={48} style={{ margin: '0 auto', color: '#e5e7eb' }} />
            <p style={{ marginTop: '16px', color: '#6b7280' }}>No submissions found</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                      Yatri ID
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                      Name
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                      Gender
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                      Role
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                      Mobile
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                      Age
                    </th>

                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                      Submitted
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission, index) => (
                    <tr key={submission.id || index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#667eea' }}>
                        {submission.yatri_id}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937' }}>
                        {submission.first_name} {submission.last_name}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          ...(submission.gender?.toLowerCase() === 'male' && {
                            background: '#dbeafe',
                            color: '#1e40af'
                          }),
                          ...(submission.gender?.toLowerCase() === 'female' && {
                            background: '#fce7f3',
                            color: '#a21caf'
                          }),
                          ...(submission.gender?.toLowerCase() === 'other' && {
                            background: '#f3f4f6',
                            color: '#6b7280'
                          })
                        }}>
                          {submission.gender || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          ...(submission.role?.toLowerCase() === 'participant' && {
                            background: '#dcfce7',
                            color: '#166534'
                          }),
                          ...(submission.role?.toLowerCase() === 'facilitator' && {
                            background: '#fef3c7',
                            color: '#a16207'
                          })
                        }}>
                          {submission.role || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                        {submission.mobile_no || '-'}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                        {submission.age || '-'}
                      </td>
                      
                      <td style={{ padding: '16px', fontSize: '13px', color: '#6b7280' }}>
                        {submission.submitted_date ? new Date(submission.submitted_date).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          style={{
                            padding: '6px',
                            background: 'transparent',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#f9fafb';
                            e.target.style.borderColor = '#667eea';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.borderColor = '#e5e7eb';
                          }}
                        >
                          <Eye size={16} color="#6b7280" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ 
              padding: '16px 24px',
              background: '#f9fafb',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, stats.total)} of {stats.total} records
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 12px',
                    background: currentPage === 1 ? '#f3f4f6' : 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        style={{
                          padding: '8px 12px',
                          background: pageNum === currentPage ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                          color: pageNum === currentPage ? 'white' : '#6b7280',
                          border: pageNum === currentPage ? 'none' : '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: pageNum === currentPage ? '600' : '400',
                          cursor: 'pointer'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 12px',
                    background: currentPage === totalPages ? '#f3f4f6' : 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                Submission Details
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '24px',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>
                    Yatra ID
                  </label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                    {selectedSubmission.yatri_id}
                  </p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>
                      First Name
                    </label>
                    <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#1f2937' }}>
                      {selectedSubmission.first_name}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>
                      Last Name
                    </label>
                    <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#1f2937' }}>
                      {selectedSubmission.last_name || '-'}
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>
                      Gender
                    </label>
                    <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#1f2937' }}>
                      {selectedSubmission.gender || '-'}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>
                      Role
                    </label>
                    <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#1f2937' }}>
                      {selectedSubmission.role || '-'}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>
                      Age
                    </label>
                    <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#1f2937' }}>
                      {selectedSubmission.age || '-'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>
                    Mobile Number
                  </label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#1f2937' }}>
                    {selectedSubmission.mobile_no || '-'}
                  </p>
                </div>
                
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>
                    Address
                  </label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#1f2937' }}>
                    {selectedSubmission.address || '-'}
                  </p>
                </div>
                
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>
                    Submitted Date
                  </label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#1f2937' }}>
                    {selectedSubmission.submitted_date ? new Date(selectedSubmission.submitted_date).toLocaleString() : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading/Upload Progress Overlay */}
      {uploading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            minWidth: '300px'
          }}>
            <Loader size={48} className="animate-spin" style={{ margin: '0 auto', color: '#667eea' }} />
            <p style={{ marginTop: '16px', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
              Uploading CSV...
            </p>
            <div style={{
              marginTop: '16px',
              height: '8px',
              background: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${uploadProgress}%`,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
              {uploadProgress}% Complete
            </p>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
        `
      }} />
    </div>
  );
};

export default CSVSubmissions;