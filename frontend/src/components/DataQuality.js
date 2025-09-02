import React, { useMemo } from 'react';
import { Box, Typography, Paper, Grid, Alert, Chip } from '@mui/material';

const DataQuality = ({ participants }) => {
  const qualityReport = useMemo(() => {
    if (participants.length === 0) return {};

    const total = participants.length;
    
    // Check missing or invalid data
    const missingData = {
      names: participants.filter(p => !p.first_name || !p.last_name).length,
      emails: participants.filter(p => !p.email || p.email === 'null').length,
      birthDates: participants.filter(p => !p.date_of_birth || p.date_of_birth === 'null').length,
      gender: participants.filter(p => !p.gender || p.gender === 'null').length,
      payments: participants.filter(p => !p.scholarship_total_amount_paid || p.scholarship_total_amount_paid === 'null' || parseFloat(p.scholarship_total_amount_paid) <= 0).length,
      states: participants.filter(p => !p.state || p.state === 'null').length,
      types: participants.filter(p => !p.yatri_type || p.yatri_type === 'null').length,
    };

    // Payment analysis
    const validPayments = participants
      .map(p => parseFloat(p.scholarship_total_amount_paid) || 0)
      .filter(amount => amount > 0);
    
    const paymentStats = {
      validCount: validPayments.length,
      totalAmount: validPayments.reduce((sum, amount) => sum + amount, 0),
      averageAmount: validPayments.length > 0 ? validPayments.reduce((sum, amount) => sum + amount, 0) / validPayments.length : 0,
      minAmount: Math.min(...validPayments),
      maxAmount: Math.max(...validPayments),
    };

    // Age analysis
    const currentYear = new Date().getFullYear();
    const validAges = participants
      .filter(p => p.date_of_birth && p.date_of_birth !== 'null')
      .map(p => {
        const birthYear = new Date(p.date_of_birth).getFullYear();
        return currentYear - birthYear;
      })
      .filter(age => age > 0 && age < 100);

    const ageStats = {
      validCount: validAges.length,
      averageAge: validAges.length > 0 ? validAges.reduce((sum, age) => sum + age, 0) / validAges.length : 0,
      minAge: Math.min(...validAges) || 0,
      maxAge: Math.max(...validAges) || 0,
    };

    // Type distribution
    const typeDistribution = participants.reduce((acc, p) => {
      const type = p.yatri_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Gender distribution
    const genderDistribution = participants.reduce((acc, p) => {
      const gender = p.gender || 'unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      missingData,
      paymentStats,
      ageStats,
      typeDistribution,
      genderDistribution,
      dataCompleteness: ((total - Math.max(...Object.values(missingData))) / total * 100).toFixed(1),
    };
  }, [participants]);

  if (participants.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No data to analyze
        </Typography>
      </Box>
    );
  }

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    } else {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Data Quality Report
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Overall Data Completeness: {qualityReport.dataCompleteness}% • 
        Total Records: {qualityReport.total}
      </Alert>

      <Grid container spacing={3}>
        {/* Missing Data Summary */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="error.main">
              Missing Data Issues
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {Object.entries(qualityReport.missingData).map(([field, count]) => (
                <Chip
                  key={field}
                  label={`${field}: ${count} missing`}
                  color={count > 0 ? 'error' : 'success'}
                  size="small"
                  variant={count > 0 ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary">
              Records with missing critical information that may affect accuracy
            </Typography>
          </Paper>
        </Grid>

        {/* Payment Data Analysis */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="success.main">
              Payment Data Analysis
            </Typography>
            <Typography variant="body1">
              <strong>Valid Payments:</strong> {qualityReport.paymentStats.validCount} / {qualityReport.total}
            </Typography>
            <Typography variant="body1">
              <strong>Total Revenue:</strong> {formatCurrency(qualityReport.paymentStats.totalAmount)}
            </Typography>
            <Typography variant="body1">
              <strong>Average Payment:</strong> {formatCurrency(qualityReport.paymentStats.averageAmount)}
            </Typography>
            <Typography variant="body1">
              <strong>Payment Range:</strong> {formatCurrency(qualityReport.paymentStats.minAmount)} - {formatCurrency(qualityReport.paymentStats.maxAmount)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Payment completion rate: {((qualityReport.paymentStats.validCount / qualityReport.total) * 100).toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>

        {/* Demographics Analysis */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="info.main">
              Demographics Data
            </Typography>
            <Typography variant="body1">
              <strong>Valid Ages:</strong> {qualityReport.ageStats.validCount} / {qualityReport.total}
            </Typography>
            <Typography variant="body1">
              <strong>Average Age:</strong> {qualityReport.ageStats.averageAge.toFixed(1)} years
            </Typography>
            <Typography variant="body1">
              <strong>Age Range:</strong> {qualityReport.ageStats.minAge} - {qualityReport.ageStats.maxAge} years
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(qualityReport.genderDistribution).map(([gender, count]) => (
                <Chip
                  key={gender}
                  label={`${gender}: ${count}`}
                  color="info"
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Type Distribution */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary.main">
              Participant Types
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(qualityReport.typeDistribution).map(([type, count]) => (
                <Chip
                  key={type}
                  label={`${type}: ${count}`}
                  color="primary"
                  size="medium"
                  variant="filled"
                />
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Distribution of facilitators vs participants vs other types
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Data Accuracy Recommendations */}
      <Paper elevation={2} sx={{ p: 3, mt: 3, bgcolor: 'warning.light' }}>
        <Typography variant="h6" gutterBottom>
          Data Accuracy Recommendations
        </Typography>
        <Box sx={{ pl: 2 }}>
          {qualityReport.missingData.payments > 0 && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              • {qualityReport.missingData.payments} participants have missing payment information - this affects revenue calculations
            </Typography>
          )}
          {qualityReport.missingData.birthDates > 0 && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              • {qualityReport.missingData.birthDates} participants have missing birth dates - this affects age demographics
            </Typography>
          )}
          {qualityReport.missingData.gender > 0 && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              • {qualityReport.missingData.gender} participants have missing gender information - this affects gender ratio calculations
            </Typography>
          )}
          {Object.values(qualityReport.missingData).every(count => count === 0) && (
            <Typography variant="body2" color="success.main">
              ✅ All critical data fields appear to be complete!
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default DataQuality;