import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  AttachMoney,
  Assessment,
  Notifications,
  Download,
  Refresh,
  Star,
  CheckCircle,
  Warning,
  CalendarToday,
  School
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';

// Sample data for charts
const revenueData = [
  { month: 'Jan', revenue: 250000, participants: 120 },
  { month: 'Feb', revenue: 320000, participants: 145 },
  { month: 'Mar', revenue: 280000, participants: 130 },
  { month: 'Apr', revenue: 450000, participants: 180 },
  { month: 'May', revenue: 380000, participants: 165 },
  { month: 'Jun', revenue: 520000, participants: 220 },
];

const genderData = [
  { name: 'Male', value: 60, color: '#0088FE' },
  { name: 'Female', value: 35, color: '#00C49F' },
  { name: 'Other', value: 5, color: '#FFBB28' },
];

const stateData = [
  { state: 'Maharashtra', participants: 45 },
  { state: 'Karnataka', participants: 38 },
  { state: 'Tamil Nadu', participants: 32 },
  { state: 'Delhi', participants: 28 },
  { state: 'Gujarat', participants: 25 },
];

// Stat Card Component
const StatCard = ({ title, value, icon, trend, color = 'primary' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                {trend > 0 ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : (
                  <TrendingDown color="error" fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  color={trend > 0 ? 'success.main' : 'error.main'}
                  sx={{ ml: 0.5 }}
                >
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

// Revenue Chart Component
const RevenueChart = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Monthly Revenue & Participants
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue (₹)" />
          <Bar yAxisId="right" dataKey="participants" fill="#82ca9d" name="Participants" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Gender Distribution Chart
const GenderChart = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Gender Distribution
      </Typography>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={genderData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}%`}
          >
            {genderData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// State Distribution Chart
const StateChart = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Top States by Participation
      </Typography>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={stateData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="state" width={80} />
          <Tooltip />
          <Bar dataKey="participants" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Recent Activities Component
const RecentActivities = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Recent Activities
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon>
            <CheckCircle color="success" />
          </ListItemIcon>
          <ListItemText
            primary="New application approved"
            secondary="Rajesh Kumar from Mumbai - 2 hours ago"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <AttachMoney color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Payment received"
            secondary="₹15,000 from Priya Sharma - 4 hours ago"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Warning color="warning" />
          </ListItemIcon>
          <ListItemText
            primary="Document verification pending"
            secondary="5 applications require attention - 1 day ago"
          />
        </ListItem>
      </List>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDashboardData(generateMockData());
      setLoading(false);
    };
    loadData();
  }, [timeRange]);

  // Mock data generator
  const generateMockData = () => {
    return {
      kpis: {
        totalParticipants: { value: 2847, change: 12.5, trend: 'up' },
        totalRevenue: { value: 1250000, change: -3.2, trend: 'down' },
        activeProjects: { value: 34, change: 8.1, trend: 'up' },
        completionRate: { value: 87.3, change: 5.4, trend: 'up' },
      },
      participantGrowth: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        data: [420, 532, 486, 692, 751, 823, 847],
      },
      revenueByCategory: {
        labels: ['Registration', 'Workshops', 'Merchandise', 'Sponsorship'],
        data: [450000, 320000, 180000, 300000],
      },
      geographicDistribution: {
        labels: ['North India', 'South India', 'West India', 'East India', 'Central India'],
        data: [684, 523, 412, 398, 287],
      },
      projectStatus: {
        completed: 24,
        inProgress: 10,
        pending: 8,
        onHold: 2,
      },
      recentActivities: [
        { id: 1, type: 'registration', message: 'New participant registered from Mumbai', time: '2 mins ago' },
        { id: 2, type: 'payment', message: 'Payment received for Workshop Series', time: '15 mins ago' },
        { id: 3, type: 'project', message: 'Project "Tech for Good" completed', time: '1 hour ago' },
        { id: 4, type: 'milestone', message: 'Reached 2800+ participants milestone', time: '3 hours ago' },
        { id: 5, type: 'workshop', message: 'New workshop scheduled for next week', time: '5 hours ago' },
      ],
      topPerformers: [
        { name: 'Rajesh Kumar', role: 'Mentor', score: 98, location: 'Delhi' },
        { name: 'Priya Sharma', role: 'Coordinator', score: 95, location: 'Mumbai' },
        { name: 'Amit Patel', role: 'Participant', score: 92, location: 'Ahmedabad' },
        { name: 'Sneha Reddy', role: 'Mentor', score: 89, location: 'Bangalore' },
      ],
    };
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Dashboard</Typography>
        <LinearProgress />
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Loading dashboard data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Jagriti Yatra Dashboard
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <MenuItem value={2024}>2024</MenuItem>
              <MenuItem value={2023}>2023</MenuItem>
              <MenuItem value={2022}>2022</MenuItem>
            </Select>
          </FormControl>
          <IconButton>
            <Refresh />
          </IconButton>
          <Button variant="outlined" startIcon={<Download />}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Participants"
            value="1,234"
            icon={<People />}
            trend={8.2}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value="₹2.1M"
            icon={<AttachMoney />}
            trend={12.5}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Seats Available"
            value="156"
            icon={<School />}
            trend={-5.2}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. Age"
            value="24.5"
            icon={<CalendarToday />}
            trend={2.1}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <RevenueChart />
        </Grid>
        <Grid item xs={12} lg={4}>
          <RecentActivities />
        </Grid>
        <Grid item xs={12} md={6}>
          <GenderChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <StateChart />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
