import React, { useEffect, useRef, useMemo } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const MetricValue = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: theme.palette.primary.main,
}));

const SubMetric = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
}));

const KPIDashboard = ({ participants }) => {
  const revenueChartRef = useRef(null);
  const utilizationChartRef = useRef(null);
  const ageDistributionRef = useRef(null);
  const projectionChartRef = useRef(null);

  // Calculate key metrics
  const metrics = useMemo(() => {
    if (participants.length === 0) return {};

    // Seat utilization
    const totalSeats = 525;
    const participantSeats = 450;
    const facilitatorSeats = 75;
    
    const facilitators = participants.filter(p => p.yatri_type === 'facilitator').length;
    const regularParticipants = participants.filter(p => p.yatri_type === 'participant').length;
    const totalFilled = participants.length;

    // Gender distribution
    const females = participants.filter(p => p.gender === 'female').length;
    const femaleRatio = ((females / participants.length) * 100).toFixed(1);

    // Age calculation
    const currentYear = new Date().getFullYear();
    const validAges = participants
      .filter(p => p.date_of_birth && p.date_of_birth !== 'null')
      .map(p => {
        const birthYear = new Date(p.date_of_birth).getFullYear();
        return currentYear - birthYear;
      })
      .filter(age => age > 0 && age < 100);
    
    const averageAge = validAges.length > 0 ? 
      (validAges.reduce((sum, age) => sum + age, 0) / validAges.length).toFixed(1) : 0;

    // Revenue calculation - more accurate
    const validPayments = participants
      .map(p => parseFloat(p.scholarship_total_amount_paid) || 0)
      .filter(amount => amount > 0);
    
    const totalRevenue = validPayments.reduce((sum, amount) => sum + amount, 0);
    const targetRevenue = 25000000; // 2.5 Crores
    const averageRevenue = validPayments.length > 0 ? totalRevenue / validPayments.length : 0;
    const paymentCount = validPayments.length;
    
    // Projections
    const projectedRevenue = (averageRevenue * totalSeats);
    const revenueProgress = (totalRevenue / targetRevenue) * 100;

    return {
      totalSeats,
      participantSeats,
      facilitatorSeats,
      facilitators,
      regularParticipants,
      totalFilled,
      femaleRatio,
      averageAge,
      totalRevenue,
      targetRevenue,
      averageRevenue,
      projectedRevenue,
      revenueProgress,
      paymentCount,
      seatUtilization: ((totalFilled / totalSeats) * 100).toFixed(1),
      participantUtilization: ((regularParticipants / participantSeats) * 100).toFixed(1),
      facilitatorUtilization: ((facilitators / facilitatorSeats) * 100).toFixed(1),
      validAgeCount: validAges.length,
      paymentAccuracy: ((paymentCount / totalFilled) * 100).toFixed(1),
    };
  }, [participants]);

  useEffect(() => {
    if (typeof window.d3 !== 'undefined' && participants.length > 0) {
      createCharts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants, metrics]);

  const createCharts = () => {
    if (typeof window.d3 === 'undefined' || !metrics.totalFilled) return;
    const d3 = window.d3;

    // Clear previous charts
    d3.select(revenueChartRef.current).selectAll("*").remove();
    d3.select(utilizationChartRef.current).selectAll("*").remove();
    d3.select(ageDistributionRef.current).selectAll("*").remove();
    d3.select(projectionChartRef.current).selectAll("*").remove();

    createRevenueProgressChart(d3);
    createSeatsUtilizationChart(d3);
    createAgeDistributionChart(d3);
    createProjectionChart(d3);
  };

  const createRevenueProgressChart = (d3) => {
    const data = [
      { label: 'Current', value: metrics.totalRevenue },
      { label: 'Target', value: metrics.targetRevenue - metrics.totalRevenue }
    ];

    const width = 300;
    const height = 200;
    const radius = Math.min(width, height) / 2 - 20;

    const svg = d3.select(revenueChartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal()
      .range(['#4caf50', '#e0e0e0']);

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius);

    const arcs = g.selectAll('arc')
      .data(pie(data))
      .enter()
      .append('g');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => color(i));

    // Center text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .attr('font-size', '24px')
      .attr('font-weight', 'bold')
      .attr('fill', '#4caf50')
      .text(`${metrics.revenueProgress.toFixed(1)}%`);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('font-size', '12px')
      .attr('fill', '#666')
      .text('of Target');
  };

  const createSeatsUtilizationChart = (d3) => {
    const data = [
      { type: 'Participants', filled: metrics.regularParticipants, total: metrics.participantSeats },
      { type: 'Facilitators', filled: metrics.facilitators, total: metrics.facilitatorSeats }
    ];

    const margin = { top: 20, right: 30, bottom: 40, left: 80 };
    const width = 350 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = d3.select(utilizationChartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const y = d3.scaleBand()
      .domain(data.map(d => d.type))
      .range([0, height])
      .padding(0.3);

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.total)])
      .range([0, width]);

    // Background bars (total seats)
    g.selectAll('.bg-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bg-bar')
      .attr('x', 0)
      .attr('y', d => y(d.type))
      .attr('width', d => x(d.total))
      .attr('height', y.bandwidth())
      .attr('fill', '#e0e0e0');

    // Filled bars
    g.selectAll('.filled-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'filled-bar')
      .attr('x', 0)
      .attr('y', d => y(d.type))
      .attr('width', d => x(d.filled))
      .attr('height', y.bandwidth())
      .attr('fill', d => d.type === 'Participants' ? '#1976d2' : '#dc004e');

    // Labels
    g.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.filled) + 5)
      .attr('y', d => y(d.type) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .text(d => `${d.filled}/${d.total}`);

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y));

    // X Axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x));
  };

  const createAgeDistributionChart = (d3) => {
    const currentYear = new Date().getFullYear();
    const validAges = participants
      .filter(p => p.date_of_birth && p.date_of_birth !== 'null')
      .map(p => {
        const birthYear = new Date(p.date_of_birth).getFullYear();
        return currentYear - birthYear;
      })
      .filter(age => age > 0 && age < 100);

    if (validAges.length === 0) return;

    const bins = d3.histogram()
      .domain([18, 65])
      .thresholds(8)(validAges);

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 350 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = d3.select(ageDistributionRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleLinear()
      .domain(d3.extent(bins, d => d.x0))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([height, 0]);

    g.selectAll('.bar')
      .data(bins)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.x0))
      .attr('y', d => y(d.length))
      .attr('width', d => x(d.x1) - x(d.x0) - 1)
      .attr('height', d => height - y(d.length))
      .attr('fill', '#ff9800');

    // X Axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y));
  };

  const createProjectionChart = (d3) => {
    const data = [
      { scenario: 'Current', value: metrics.totalRevenue },
      { scenario: 'If Full (525)', value: metrics.projectedRevenue },
      { scenario: 'Target (2.5Cr)', value: metrics.targetRevenue }
    ];

    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const width = 350 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = d3.select(projectionChartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.scenario))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([height, 0]);

    const colors = ['#4caf50', '#2196f3', '#ff9800'];

    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.scenario))
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.value))
      .attr('fill', (d, i) => colors[i]);

    // Value labels
    g.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => x(d.scenario) + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text(d => `₹${(d.value / 1000000).toFixed(1)}M`);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('font-size', '10px');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).tickFormat(d => `₹${(d / 1000000).toFixed(0)}M`));
  };

  if (participants.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No data available for KPI analysis
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
      <Typography variant="h4" gutterBottom color="primary">
        Jagriti Yatra 2025 - Executive Dashboard
      </Typography>
      
      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">Total Seats Filled</Typography>
              <MetricValue>{metrics.totalFilled}</MetricValue>
              <SubMetric>out of {metrics.totalSeats} seats</SubMetric>
              <LinearProgress 
                variant="determinate" 
                value={parseFloat(metrics.seatUtilization)} 
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {metrics.seatUtilization}% Utilization
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">Participants</Typography>
              <MetricValue color="primary">{metrics.regularParticipants}</MetricValue>
              <SubMetric>out of {metrics.participantSeats} seats</SubMetric>
              <LinearProgress 
                variant="determinate" 
                value={parseFloat(metrics.participantUtilization)} 
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
                color="primary"
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {metrics.participantUtilization}% Filled
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">Facilitators</Typography>
              <MetricValue style={{ color: '#dc004e' }}>{metrics.facilitators}</MetricValue>
              <SubMetric>out of {metrics.facilitatorSeats} seats</SubMetric>
              <LinearProgress 
                variant="determinate" 
                value={parseFloat(metrics.facilitatorUtilization)} 
                sx={{ mt: 1, height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { backgroundColor: '#dc004e' } }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {metrics.facilitatorUtilization}% Filled
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">Revenue Collected</Typography>
              <MetricValue style={{ color: '#4caf50' }}>
                {formatCurrency(metrics.totalRevenue)}
              </MetricValue>
              <SubMetric>From {metrics.paymentCount} payments • Target: ₹2.5 Cr</SubMetric>
              <LinearProgress 
                variant="determinate" 
                value={metrics.revenueProgress} 
                sx={{ mt: 1, height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { backgroundColor: '#4caf50' } }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {metrics.revenueProgress.toFixed(1)}% of Target ({metrics.paymentAccuracy}% paid)
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Demographics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">Female Ratio</Typography>
              <MetricValue style={{ color: '#e91e63' }}>{metrics.femaleRatio}%</MetricValue>
              <SubMetric>{participants.filter(p => p.gender === 'female').length} out of {participants.length}</SubMetric>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">Average Age</Typography>
              <MetricValue style={{ color: '#ff9800' }}>{metrics.averageAge}</MetricValue>
              <SubMetric>From {metrics.validAgeCount} valid birth dates</SubMetric>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">Avg Revenue/Person</Typography>
              <MetricValue style={{ color: '#2196f3' }}>
                {formatCurrency(metrics.averageRevenue)}
              </MetricValue>
              <SubMetric>per participant</SubMetric>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">Projected Revenue</Typography>
              <MetricValue style={{ color: '#9c27b0' }}>
                {formatCurrency(metrics.projectedRevenue)}
              </MetricValue>
              <SubMetric>if all seats filled</SubMetric>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Revenue Progress</Typography>
            <Box ref={revenueChartRef} sx={{ textAlign: 'center' }} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Seat Utilization</Typography>
            <Box ref={utilizationChartRef} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Age Distribution</Typography>
            <Box ref={ageDistributionRef} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Revenue Projections</Typography>
            <Box ref={projectionChartRef} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KPIDashboard;