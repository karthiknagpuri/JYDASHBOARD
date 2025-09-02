import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Button,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Search,
  Download,
  Clear
} from '@mui/icons-material';

const ParticipantTable = ({ participants, onAlert }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  // Get unique values for filters
  const uniqueStatuses = useMemo(() => {
    return [...new Set(participants.map(p => p.status).filter(Boolean))];
  }, [participants]);

  const uniqueTypes = useMemo(() => {
    return [...new Set(participants.map(p => p.yatri_type).filter(Boolean))];
  }, [participants]);

  const uniqueGenders = useMemo(() => {
    return [...new Set(participants.map(p => p.gender).filter(Boolean))];
  }, [participants]);

  // Filter participants
  const filteredParticipants = useMemo(() => {
    return participants.filter(participant => {
      const matchesSearch = searchTerm === '' || 
        Object.values(participant).some(value => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesStatus = statusFilter === '' || participant.status === statusFilter;
      const matchesType = typeFilter === '' || participant.yatri_type === typeFilter;
      const matchesGender = genderFilter === '' || participant.gender === genderFilter;

      return matchesSearch && matchesStatus && matchesType && matchesGender;
    });
  }, [participants, searchTerm, statusFilter, typeFilter, genderFilter]);

  // Paginated participants
  const paginatedParticipants = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredParticipants.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredParticipants, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setGenderFilter('');
    setPage(0);
  };

  const exportToCsv = () => {
    if (filteredParticipants.length === 0) {
      onAlert('No data to export', 'warning');
      return;
    }

    const headers = Object.keys(filteredParticipants[0]).join(',');
    const csvData = filteredParticipants.map(participant => 
      Object.values(participant).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    ).join('\n');

    const csv = `${headers}\n${csvData}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    window.URL.revokeObjectURL(url);
    onAlert('CSV exported successfully', 'success');
  };

  const getStatusColor = (status) => {
    const colors = {
      'confirmed': 'success',
      'pending': 'warning',
      'rejected': 'error',
      'waitlisted': 'info',
      'applied': 'default'
    };
    return colors[status?.toLowerCase()] || 'default';
  };

  if (participants.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No participants uploaded yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload a CSV file to view participant data
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Participants ({filteredParticipants.length})
        </Typography>
        <Button
          startIcon={<Download />}
          onClick={exportToCsv}
          variant="contained"
          disabled={filteredParticipants.length === 0}
        >
          Export CSV
        </Button>
      </Box>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
            }}
            sx={{ minWidth: 250 }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              {uniqueStatuses.map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Type"
            >
              <MenuItem value="">All</MenuItem>
              {uniqueTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Gender</InputLabel>
            <Select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              label="Gender"
            >
              <MenuItem value="">All</MenuItem>
              {uniqueGenders.map(gender => (
                <MenuItem key={gender} value={gender}>{gender}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title="Clear all filters">
            <IconButton onClick={clearFilters} size="small">
              <Clear />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Amount Paid</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedParticipants.map((participant, index) => (
              <TableRow key={participant.yatri_id || index} hover>
                <TableCell>{participant.yatri_id}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {`${participant.first_name || ''} ${participant.last_name || ''}`.trim()}
                  </Typography>
                </TableCell>
                <TableCell>{participant.email}</TableCell>
                <TableCell>{participant.contact_number}</TableCell>
                <TableCell>
                  <Chip 
                    label={participant.yatri_type} 
                    size="small" 
                    variant="outlined"
                    color={participant.yatri_type === 'facilitator' ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell>{participant.gender}</TableCell>
                <TableCell>{participant.state}</TableCell>
                <TableCell>
                  <Chip 
                    label={participant.status} 
                    size="small" 
                    color={getStatusColor(participant.status)}
                  />
                </TableCell>
                <TableCell>
                  {participant.scholarship_total_amount_paid 
                    ? `₹${participant.scholarship_total_amount_paid}` 
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredParticipants.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Box>
  );
};

export default ParticipantTable;