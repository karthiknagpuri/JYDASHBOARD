import React, { useState, useMemo, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Users, TrendingUp, Target, MapPin, X, Mail, Phone, Calendar, User, ChevronDown, ChevronUp, Sparkles, RefreshCw } from 'lucide-react';

const StateWiseAnalysis = ({ participants = [] }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'table'
  const [selectedState, setSelectedState] = useState(null);
  const [showProfiles, setShowProfiles] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [funFact, setFunFact] = useState('');
  const [isLoadingFact, setIsLoadingFact] = useState(false);
  const [showFunFact, setShowFunFact] = useState(true);

  // Jagriti Yatra 2025 Diversity Seat Plan (Total: 525 seats)
  const statesData = [
    // Large States (380 total)
    { name: 'Uttar Pradesh', code: 'UP', seats: 35, category: 'Large', color: '#3b82f6', variations: ['uttar pradesh', 'up', 'lucknow', 'noida', 'agra', 'kanpur', 'varanasi', 'allahabad', 'meerut', 'ghaziabad'] },
    { name: 'Bihar', code: 'BR', seats: 32, category: 'Large', color: '#8b5cf6', variations: ['bihar', 'br', 'patna', 'gaya', 'bhagalpur', 'muzaffarpur', 'darbhanga', 'purnia'] },
    { name: 'Maharashtra', code: 'MH', seats: 35, category: 'Large', color: '#3b82f6', variations: ['maharashtra', 'mh', 'mumbai', 'pune', 'nagpur', 'nashik', 'aurangabad', 'solapur'] },
    { name: 'West Bengal', code: 'WB', seats: 30, category: 'Large', color: '#8b5cf6', variations: ['west bengal', 'wb', 'kolkata', 'calcutta', 'howrah', 'durgapur', 'asansol', 'siliguri'] },
    { name: 'Madhya Pradesh', code: 'MP', seats: 30, category: 'Large', color: '#ef4444', variations: ['madhya pradesh', 'mp', 'bhopal', 'indore', 'gwalior', 'jabalpur', 'ujjain', 'sagar'] },
    { name: 'Tamil Nadu', code: 'TN', seats: 32, category: 'Large', color: '#10b981', variations: ['tamil nadu', 'tamilnadu', 'tn', 'chennai', 'coimbatore', 'madurai', 'trichy', 'salem', 'tiruppur'] },
    { name: 'Rajasthan', code: 'RJ', seats: 28, category: 'Large', color: '#f59e0b', variations: ['rajasthan', 'rj', 'jaipur', 'jodhpur', 'udaipur', 'ajmer', 'kota', 'bikaner'] },
    { name: 'Gujarat', code: 'GJ', seats: 28, category: 'Large', color: '#f59e0b', variations: ['gujarat', 'gj', 'ahmedabad', 'surat', 'vadodara', 'rajkot', 'gandhinagar', 'bhavnagar'] },
    { name: 'Karnataka', code: 'KA', seats: 30, category: 'Large', color: '#10b981', variations: ['karnataka', 'ka', 'bangalore', 'bengaluru', 'mysore', 'mysuru', 'mangalore', 'hubli'] },
    { name: 'Kerala', code: 'KL', seats: 25, category: 'Large', color: '#10b981', variations: ['kerala', 'kl', 'kochi', 'cochin', 'thiruvananthapuram', 'trivandrum', 'kozhikode', 'calicut'] },
    { name: 'Telangana', code: 'TS', seats: 28, category: 'Large', color: '#10b981', variations: ['telangana', 'ts', 'hyderabad', 'secunderabad', 'warangal', 'nizamabad', 'karimnagar'] },
    { name: 'Andhra Pradesh', code: 'AP', seats: 28, category: 'Large', color: '#10b981', variations: ['andhra pradesh', 'ap', 'vijayawada', 'visakhapatnam', 'vizag', 'tirupati', 'guntur'] },
    { name: 'Punjab', code: 'PB', seats: 19, category: 'Large', color: '#3b82f6', variations: ['punjab', 'pb', 'ludhiana', 'amritsar', 'jalandhar', 'patiala', 'bathinda'] },
    
    // Medium States (50 total)
    { name: 'Odisha', code: 'OD', seats: 10, category: 'Medium', color: '#8b5cf6', variations: ['odisha', 'orissa', 'od', 'bhubaneswar', 'cuttack', 'puri', 'rourkela'] },
    { name: 'Jharkhand', code: 'JH', seats: 10, category: 'Medium', color: '#8b5cf6', variations: ['jharkhand', 'jh', 'ranchi', 'jamshedpur', 'dhanbad', 'bokaro', 'deoghar'] },
    { name: 'Haryana', code: 'HR', seats: 10, category: 'Medium', color: '#3b82f6', variations: ['haryana', 'hr', 'gurugram', 'gurgaon', 'faridabad', 'ambala', 'rohtak', 'panipat'] },
    { name: 'Chhattisgarh', code: 'CG', seats: 10, category: 'Medium', color: '#ef4444', variations: ['chhattisgarh', 'chattisgarh', 'cg', 'raipur', 'bhilai', 'bilaspur', 'durg'] },
    { name: 'Assam', code: 'AS', seats: 10, category: 'Medium', color: '#06b6d4', variations: ['assam', 'as', 'guwahati', 'dispur', 'silchar', 'dibrugarh', 'jorhat'] },
    
    // Small States (40 total)
    { name: 'Goa', code: 'GA', seats: 4, category: 'Small', color: '#f59e0b', variations: ['goa', 'ga', 'panaji', 'panjim', 'vasco', 'margao'] },
    { name: 'Himachal Pradesh', code: 'HP', seats: 4, category: 'Small', color: '#3b82f6', variations: ['himachal pradesh', 'hp', 'shimla', 'manali', 'dharamshala', 'kullu', 'mandi'] },
    { name: 'Uttarakhand', code: 'UK', seats: 4, category: 'Small', color: '#3b82f6', variations: ['uttarakhand', 'uk', 'dehradun', 'haridwar', 'nainital', 'rishikesh', 'roorkee'] },
    { name: 'Tripura', code: 'TR', seats: 4, category: 'Small', color: '#06b6d4', variations: ['tripura', 'tr', 'agartala', 'udaipur', 'dharmanagar'] },
    { name: 'Meghalaya', code: 'ML', seats: 4, category: 'Small', color: '#06b6d4', variations: ['meghalaya', 'ml', 'shillong', 'tura', 'jowai'] },
    { name: 'Manipur', code: 'MN', seats: 4, category: 'Small', color: '#06b6d4', variations: ['manipur', 'mn', 'imphal', 'thoubal', 'kakching'] },
    { name: 'Nagaland', code: 'NL', seats: 4, category: 'Small', color: '#06b6d4', variations: ['nagaland', 'nl', 'kohima', 'dimapur', 'mokokchung'] },
    { name: 'Mizoram', code: 'MZ', seats: 4, category: 'Small', color: '#06b6d4', variations: ['mizoram', 'mz', 'aizawl', 'lunglei', 'champhai'] },
    { name: 'Arunachal Pradesh', code: 'AR', seats: 4, category: 'Small', color: '#06b6d4', variations: ['arunachal pradesh', 'ar', 'itanagar', 'naharlagun', 'pasighat'] },
    { name: 'Sikkim', code: 'SK', seats: 4, category: 'Small', color: '#06b6d4', variations: ['sikkim', 'sk', 'gangtok', 'namchi', 'mangan'] },
    
    // Union Territories (15 total)
    { name: 'Delhi', code: 'DL', seats: 3, category: 'UT', color: '#3b82f6', variations: ['delhi', 'dl', 'new delhi', 'ncr', 'north delhi', 'south delhi'] },
    { name: 'Jammu & Kashmir', code: 'JK', seats: 2, category: 'UT', color: '#3b82f6', variations: ['jammu', 'kashmir', 'j&k', 'jk', 'srinagar', 'jammu and kashmir'] },
    { name: 'Ladakh', code: 'LA', seats: 1, category: 'UT', color: '#3b82f6', variations: ['ladakh', 'la', 'leh', 'kargil'] },
    { name: 'Puducherry', code: 'PY', seats: 2, category: 'UT', color: '#10b981', variations: ['puducherry', 'pondicherry', 'py', 'karaikal'] },
    { name: 'Chandigarh', code: 'CH', seats: 2, category: 'UT', color: '#3b82f6', variations: ['chandigarh', 'ch'] },
    { name: 'Andaman & Nicobar', code: 'AN', seats: 2, category: 'UT', color: '#06b6d4', variations: ['andaman', 'nicobar', 'a&n', 'an', 'port blair'] },
    { name: 'DNH & Daman Diu', code: 'DD', seats: 2, category: 'UT', color: '#f59e0b', variations: ['dadra', 'nagar haveli', 'daman', 'diu', 'dnh', 'dd', 'silvassa'] },
    { name: 'Lakshadweep', code: 'LD', seats: 1, category: 'UT', color: '#06b6d4', variations: ['lakshadweep', 'ld', 'kavaratti'] },
    
    // Flex Pool
    { name: 'Flex Pool', code: 'FP', seats: 40, category: 'Flex', color: '#6b7280', variations: [] }
  ];

  // Enhanced state detection function with improved accuracy
  const detectState = (participant) => {
    // Check all possible state-related fields with priority order
    const priorityFields = [
      // Direct state fields (highest priority)
      participant.state,
      participant.State,
      participant.location_state,
      participant.address_state,
      participant.region,
      participant.Region,
      // District/City fields (medium priority)
      participant.district,
      participant.District,
      participant.city,
      participant.City,
      participant.town,
      participant.Town,
      // Address fields (lower priority)
      participant.address,
      participant.Address,
      participant.location,
      participant.Location,
      participant.permanent_address,
      participant.current_address,
      participant.correspondence_address,
      participant.postal_address,
      // Composite fields
      participant.full_address,
      participant.complete_address
    ].filter(Boolean).map(field => {
      // Convert to string and clean
      const str = field.toString().trim();
      return {
        original: str,
        cleaned: str.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ').replace(/\s+/g, ' ').trim()
      };
    });

    // First pass: Check for exact state matches in priority fields
    for (const stateData of statesData) {
      for (const field of priorityFields) {
        // Check exact match with state name or code
        if (field.cleaned === stateData.name.toLowerCase() || 
            field.cleaned === stateData.code.toLowerCase()) {
          return { code: stateData.code, name: stateData.name, source: field.original };
        }
        
        // Check if field starts with state name (e.g., "Maharashtra, India")
        if (field.cleaned.startsWith(stateData.name.toLowerCase())) {
          return { code: stateData.code, name: stateData.name, source: field.original };
        }
      }
    }
    
    // Second pass: Check for variations and city matches
    for (const stateData of statesData) {
      for (const field of priorityFields) {
        // Check variations (cities, alternate names)
        for (const variation of stateData.variations) {
          // Exact variation match
          if (field.cleaned === variation) {
            return { code: stateData.code, name: stateData.name, source: field.original };
          }
          // Field starts with variation (e.g., "Mumbai, Maharashtra")
          if (field.cleaned.startsWith(variation + ' ') || field.cleaned.startsWith(variation + ',')) {
            return { code: stateData.code, name: stateData.name, source: field.original };
          }
        }
      }
    }
    
    // Third pass: Partial matches (contains state name or variation)
    for (const stateData of statesData) {
      for (const field of priorityFields) {
        // Check if field contains state name
        if (field.cleaned.includes(' ' + stateData.name.toLowerCase()) || 
            field.cleaned.includes(stateData.name.toLowerCase() + ' ')) {
          return { code: stateData.code, name: stateData.name, source: field.original };
        }
        
        // Check variations with word boundaries
        for (const variation of stateData.variations) {
          if (field.cleaned.includes(' ' + variation + ' ') || 
              field.cleaned.includes(' ' + variation + ',') ||
              field.cleaned.endsWith(' ' + variation)) {
            return { code: stateData.code, name: stateData.name, source: field.original };
          }
        }
      }
    }
    
    // If no match found but we have location data, return 'OT' (Others)
    if (priorityFields.length > 0) {
      return { code: 'OT', name: 'Others', source: priorityFields[0].original };
    }
    
    return null;
  };

  // Calculate actual filled seats from participant data
  const calculateStateFilled = useMemo(() => {
    const stateCount = {};
    const stateParticipants = {};
    
    // Count participants by state from actual data
    participants.forEach(participant => {
      const stateInfo = detectState(participant);
      
      if (stateInfo) {
        const stateCode = stateInfo.code;
        stateCount[stateCode] = (stateCount[stateCode] || 0) + 1;
        if (!stateParticipants[stateCode]) {
          stateParticipants[stateCode] = [];
        }
        // Add state info to participant for display
        stateParticipants[stateCode].push({
          ...participant,
          detectedState: stateInfo.name,
          detectedStateSource: stateInfo.source
        });
      }
    });
    
    return { stateCount, stateParticipants };
  }, [participants]);

  // Enhance states data with actual counts
  const enhancedStatesData = useMemo(() => {
    return statesData.map(state => {
      const filled = calculateStateFilled.stateCount[state.code] || 0;
      const occupancyRate = state.seats > 0 ? ((filled / state.seats) * 100) : 0;
      const avgContribution = 52668; // Average contribution per participant
      
      return {
        ...state,
        filled: Math.min(filled, state.seats), // Cap at max seats
        actualFilled: filled, // Keep actual count for display
        occupancyRate: Math.min(occupancyRate, 100).toFixed(1),
        revenue: Math.min(filled, state.seats) * avgContribution,
        gap: Math.max(0, state.seats - filled),
        status: occupancyRate >= 80 ? 'good' : occupancyRate >= 50 ? 'moderate' : 'needs-attention',
        participants: calculateStateFilled.stateParticipants[state.code] || []
      };
    });
  }, [calculateStateFilled]);

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    const totalSeats = 525;
    const stateSeats = 485; // Total allocated to states/UTs (excluding flex pool)
    const flexPoolSeats = 40;
    const totalFilled = enhancedStatesData.reduce((sum, s) => sum + (s.code !== 'FP' ? s.filled : 0), 0);
    const totalActualParticipants = enhancedStatesData.reduce((sum, s) => sum + (s.code !== 'FP' ? s.actualFilled : 0), 0);
    const totalRevenue = enhancedStatesData.reduce((sum, s) => sum + s.revenue, 0);
    
    // Calculate category-wise metrics
    const categoryMetrics = {
      Large: { total: 380, filled: 0, states: 13 },
      Medium: { total: 50, filled: 0, states: 5 },
      Small: { total: 40, filled: 0, states: 10 },
      UT: { total: 15, filled: 0, states: 8 },
      Flex: { total: 40, filled: 0, states: 1 }
    };
    
    enhancedStatesData.forEach(state => {
      if (state.category && categoryMetrics[state.category]) {
        categoryMetrics[state.category].filled += state.filled;
      }
    });
    
    return {
      totalSeats,
      stateSeats,
      flexPoolSeats,
      totalFilled,
      totalActualParticipants,
      occupancyRate: ((totalFilled / stateSeats) * 100).toFixed(1),
      totalRevenue,
      avgOccupancy: (enhancedStatesData.filter(s => s.code !== 'FP').reduce((sum, s) => sum + parseFloat(s.occupancyRate), 0) / (enhancedStatesData.length - 1)).toFixed(1),
      categoryMetrics
    };
  }, [enhancedStatesData]);

  // Format currency
  const formatINR = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'good': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'needs-attention': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Handle state click
  const handleStateClick = (state) => {
    setSelectedState(state);
    setShowProfiles(true);
  };

  // Sort states by filled seats for chart (exclude Others if empty)
  const sortedStates = [...enhancedStatesData]
    .filter(s => s.filled > 0)
    .sort((a, b) => b.filled - a.filled)
    .slice(0, 10);

  // Chart data
  const chartData = {
    labels: sortedStates.map(s => s.code),
    datasets: [{
      label: 'Filled Seats',
      data: sortedStates.map(s => s.filled),
      backgroundColor: sortedStates.map(s => s.color),
      borderRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const state = sortedStates[context.dataIndex];
            return `${state.name}: ${state.filled}/${state.seats} seats`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { font: { size: 10 } }
      },
      x: {
        ticks: { font: { size: 10 } }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        handleStateClick(sortedStates[index]);
      }
    }
  };

  // Generate fun facts from participant data
  const generateParticipantInsights = () => {
    if (participants.length === 0) return null;
    
    // Gather interesting statistics
    const stateDistribution = {};
    const cities = new Set();
    let earliestDate = null;
    let latestDate = null;
    let totalAmount = 0;
    let paidCount = 0;
    
    participants.forEach(p => {
      const stateInfo = detectState(p);
      if (stateInfo) {
        stateDistribution[stateInfo.name] = (stateDistribution[stateInfo.name] || 0) + 1;
      }
      
      if (p.city || p.City) cities.add((p.city || p.City).toLowerCase());
      
      if (p.scholarship_total_amount_paid) {
        totalAmount += parseFloat(p.scholarship_total_amount_paid);
        paidCount++;
      }
      
      const date = p.application_submitted_on || p.submitted_date;
      if (date) {
        const d = new Date(date);
        if (!earliestDate || d < earliestDate) earliestDate = d;
        if (!latestDate || d > latestDate) latestDate = d;
      }
    });
    
    const topState = Object.entries(stateDistribution)
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      totalParticipants: participants.length,
      topState: topState ? topState[0] : 'Unknown',
      topStateCount: topState ? topState[1] : 0,
      uniqueCities: cities.size,
      averageContribution: paidCount > 0 ? Math.round(totalAmount / paidCount) : 0,
      totalContribution: Math.round(totalAmount),
      dateRange: earliestDate && latestDate ? 
        Math.ceil((latestDate - earliestDate) / (1000 * 60 * 60 * 24)) : 0,
      statesRepresented: Object.keys(stateDistribution).length
    };
  };

  // Fetch fun fact from Gemini API
  const fetchFunFact = async () => {
    setIsLoadingFact(true);
    const insights = generateParticipantInsights();
    
    if (!insights) {
      setFunFact('No participant data available yet. Upload CSV to see insights!');
      setIsLoadingFact(false);
      return;
    }
    
    try {
      const prompt = `Based on this Jagriti Yatra 2025 participant data, generate ONE interesting, inspiring, or fun fact (keep it under 100 characters):
        - Total participants: ${insights.totalParticipants}
        - Top state: ${insights.topState} with ${insights.topStateCount} participants
        - Cities represented: ${insights.uniqueCities}
        - States represented: ${insights.statesRepresented}
        - Average contribution: ₹${insights.averageContribution}
        - Applications received over ${insights.dateRange} days
        
        Make it engaging, positive, and specific. Examples:
        - "${insights.topState} leads with ${Math.round(insights.topStateCount/insights.totalParticipants*100)}% of all Yatris!"
        - "Yatris from ${insights.uniqueCities} cities united for change!"
        - "₹${(insights.totalContribution/100000).toFixed(1)}L raised for social impact!"
        
        Return ONLY the fact, no quotes or extra text.`;
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDM9VaKDQs4-IqnseJqTyRnQrvbB2ONoEw`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 50
            }
          })
        }
      );
      
      const data = await response.json();
      const fact = data.candidates?.[0]?.content?.parts?.[0]?.text || 
        `${insights.topState} leads with ${insights.topStateCount} amazing Yatris!`;
      
      setFunFact(fact.trim());
    } catch (error) {
      // Fallback to local facts if API fails
      const localFacts = [
        `${insights.topState} is leading with ${insights.topStateCount} passionate changemakers!`,
        `Yatris from ${insights.uniqueCities} unique cities are ready to transform India!`,
        `${insights.statesRepresented} states united for Jagriti Yatra 2025!`,
        `Average contribution of ₹${insights.averageContribution.toLocaleString()} shows commitment!`,
        `Applications spanning ${insights.dateRange} days show growing momentum!`,
        `${Math.round(insights.topStateCount/insights.totalParticipants*100)}% Yatris from ${insights.topState} alone!`
      ];
      
      setFunFact(localFacts[Math.floor(Math.random() * localFacts.length)]);
    } finally {
      setIsLoadingFact(false);
    }
  };
  
  // Load fun fact on mount and when participants change
  useEffect(() => {
    if (participants.length > 0) {
      fetchFunFact();
    }
  }, [participants.length]);

  return (
    <div>
      {/* Fun Fact Banner */}
      {showFunFact && funFact && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          position: 'relative',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
          animation: 'slideDown 0.5s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={20} color="white" />
              </div>
              <div>
                <p style={{
                  margin: 0,
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  letterSpacing: '0.5px'
                }}>
                  {isLoadingFact ? 'Discovering insights...' : funFact}
                </p>
                <p style={{
                  margin: '4px 0 0 0',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '11px'
                }}>
                  Did you know?
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => fetchFunFact()}
                disabled={isLoadingFact}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: isLoadingFact ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  opacity: isLoadingFact ? 0.5 : 1
                }}
                onMouseEnter={(e) => !isLoadingFact && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
                onMouseLeave={(e) => !isLoadingFact && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
              >
                <RefreshCw 
                  size={16} 
                  color="white" 
                  style={{
                    animation: isLoadingFact ? 'spin 1s linear infinite' : 'none'
                  }}
                />
              </button>
              <button
                onClick={() => setShowFunFact(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              >
                <X size={16} color="white" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Summary Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Users size={14} color="#3b82f6" />
            <span style={{ fontSize: '11px', color: '#6b7280' }}>TOTAL SEATS</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>525</div>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>485 + 40 flex</div>
        </div>

        <div style={{
          padding: '12px',
          background: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Target size={14} color="#10b981" />
            <span style={{ fontSize: '11px', color: '#6b7280' }}>FILLED</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#047857' }}>
            {overallMetrics.totalFilled}
          </div>
          {overallMetrics.totalActualParticipants > overallMetrics.totalFilled && (
            <div style={{ fontSize: '10px', color: '#f59e0b' }}>
              Total: {overallMetrics.totalActualParticipants}
            </div>
          )}
        </div>

        <div style={{
          padding: '12px',
          background: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fde68a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <TrendingUp size={14} color="#f59e0b" />
            <span style={{ fontSize: '11px', color: '#6b7280' }}>OCCUPANCY</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#92400e' }}>
            {overallMetrics.occupancyRate}%
          </div>
        </div>

        <div style={{
          padding: '12px',
          background: '#fae8ff',
          borderRadius: '8px',
          border: '1px solid #e9d5ff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <MapPin size={14} color="#8b5cf6" />
            <span style={{ fontSize: '11px', color: '#6b7280' }}>REVENUE</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#6b21a8' }}>
            {formatINR(overallMetrics.totalRevenue)}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div style={{
        padding: '16px',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '20px'
      }}>
        <h4 style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#374151',
          marginBottom: '12px'
        }}>
          Category-wise Distribution
        </h4>
        <div style={{ display: 'grid', gap: '8px' }}>
          {Object.entries(overallMetrics.categoryMetrics).filter(([key]) => key !== 'Flex').map(([category, data]) => {
            const isExpanded = expandedCategories[category];
            const categoryStates = enhancedStatesData.filter(s => s.category === category && s.filled > 0);
            
            return (
              <div key={category}>
                <div 
                  onClick={() => setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }))}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#f9fafb',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    ':hover': { background: '#f3f4f6' }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '2px',
                      background: category === 'Large' ? '#3b82f6' : 
                                   category === 'Medium' ? '#10b981' : 
                                   category === 'Small' ? '#f59e0b' : '#06b6d4'
                    }} />
                    <span style={{ fontWeight: '500', color: '#374151' }}>
                      {category} States ({data.states})
                    </span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: '#6b7280' }}>
                      {data.filled}/{data.total}
                    </span>
                    <div style={{
                      width: '60px',
                      height: '4px',
                      background: '#e5e7eb',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(data.filled / data.total) * 100}%`,
                        height: '100%',
                        background: category === 'Large' ? '#3b82f6' : 
                                     category === 'Medium' ? '#10b981' : 
                                     category === 'Small' ? '#f59e0b' : '#06b6d4',
                        borderRadius: '2px'
                      }} />
                    </div>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '600',
                      color: (data.filled / data.total) >= 0.5 ? '#10b981' : '#ef4444'
                    }}>
                      {((data.filled / data.total) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                {/* Expanded State List */}
                {isExpanded && (
                  <div style={{
                    marginTop: '8px',
                    marginLeft: '16px',
                    padding: '8px',
                    background: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }}>
                    {categoryStates.length > 0 ? (
                      <div style={{ display: 'grid', gap: '4px' }}>
                        {categoryStates
                          .sort((a, b) => b.filled - a.filled)
                          .map(state => (
                            <div 
                              key={state.code}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStateClick(state);
                              }}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '6px 8px',
                                background: '#f9fafb',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MapPin size={10} color={state.color} />
                                <span style={{ fontWeight: '500' }}>{state.name}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#6b7280' }}>
                                  {state.filled}/{state.seats}
                                </span>
                                <div style={{
                                  width: '40px',
                                  height: '3px',
                                  background: '#e5e7eb',
                                  borderRadius: '2px',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{
                                    width: `${state.occupancyRate}%`,
                                    height: '100%',
                                    background: state.color,
                                    borderRadius: '2px'
                                  }} />
                                </div>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: '600',
                                  color: parseFloat(state.occupancyRate) >= 50 ? '#10b981' : '#ef4444'
                                }}>
                                  {state.occupancyRate}%
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div style={{
                        padding: '12px',
                        textAlign: 'center',
                        color: '#9ca3af',
                        fontSize: '11px'
                      }}>
                        No participants yet in this category
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {overallMetrics.categoryMetrics.Flex && (
          <div style={{
            marginTop: '8px',
            padding: '8px 12px',
            background: '#fef3c7',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#92400e'
          }}>
            <strong>Flex Pool:</strong> {overallMetrics.flexPoolSeats} seats available for balancing & exceptional candidates
          </div>
        )}
      </div>

      {/* Top States Chart */}
      {sortedStates.length > 0 && (
        <div style={{
          padding: '16px',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          marginBottom: '20px'
        }}>
          <h4 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '8px'
          }}>
            Top States by Participation
          </h4>
          <p style={{
            fontSize: '11px',
            color: '#6b7280',
            marginBottom: '16px'
          }}>
            Click on any bar to view participant profiles from that state
          </p>
          <div style={{ height: '200px', cursor: 'pointer' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'grid' ? '#3b82f6' : '#f3f4f6',
              color: viewMode === 'grid' ? 'white' : '#6b7280',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'table' ? '#3b82f6' : '#f3f4f6',
              color: viewMode === 'table' ? 'white' : '#6b7280',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Table
          </button>
        </div>
      </div>

      {/* States Display */}
      {viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          {enhancedStatesData.filter(s => s.seats > 0 && s.code !== 'FP' && (s.filled > 0 || s.category !== 'Flex')).map((state, index) => (
            <div 
              key={index}
              onClick={() => handleStateClick(state)}
              style={{
                padding: '12px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                cursor: state.participants.length > 0 ? 'pointer' : 'default',
                opacity: state.filled === 0 ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                    {state.name}
                  </h5>
                  <span style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {state.category}
                  </span>
                </div>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: `${getStatusColor(state.status)}15`,
                  color: getStatusColor(state.status),
                  fontSize: '10px',
                  fontWeight: '600'
                }}>
                  {state.occupancyRate}%
                </span>
              </div>

              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Seats:</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>
                    {state.filled}/{state.seats}
                  </span>
                </div>
                {state.actualFilled > state.seats && (
                  <div style={{ color: '#f59e0b', fontSize: '10px', marginTop: '2px' }}>
                    +{state.actualFilled - state.seats} overflow
                  </div>
                )}
              </div>

              <div style={{
                width: '100%',
                height: '4px',
                background: '#f3f4f6',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${state.occupancyRate}%`,
                  height: '100%',
                  background: getStatusColor(state.status),
                  borderRadius: '2px'
                }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>State</th>
                <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Total Seats</th>
                <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Filled</th>
                <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Gap</th>
                <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Occupancy</th>
                <th style={{ padding: '8px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Revenue</th>
                <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {enhancedStatesData.filter(s => s.seats > 0 && s.code !== 'FP').map((state, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '8px' }}>
                    <div>
                      <span style={{ fontWeight: '500' }}>{state.name}</span>
                      <span style={{ 
                        fontSize: '9px', 
                        color: '#9ca3af', 
                        marginLeft: '8px',
                        textTransform: 'uppercase'
                      }}>
                        ({state.category})
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{state.seats}</td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#10b981', fontWeight: '600' }}>
                    {state.filled}
                    {state.actualFilled > state.seats && (
                      <span style={{ color: '#f59e0b', fontSize: '10px', marginLeft: '4px' }}>
                        (+{state.actualFilled - state.seats})
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center', color: state.gap > 0 ? '#ef4444' : '#10b981' }}>
                    {state.gap}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <div style={{
                        width: '40px',
                        height: '4px',
                        background: '#f3f4f6',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${state.occupancyRate}%`,
                          height: '100%',
                          background: getStatusColor(state.status),
                          borderRadius: '2px'
                        }} />
                      </div>
                      <span style={{ fontWeight: '600' }}>{state.occupancyRate}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}>
                    {formatINR(state.revenue)}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleStateClick(state)}
                      disabled={state.participants.length === 0}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: state.participants.length > 0 ? '#3b82f6' : '#e5e7eb',
                        color: state.participants.length > 0 ? 'white' : '#9ca3af',
                        border: 'none',
                        fontSize: '11px',
                        cursor: state.participants.length > 0 ? 'pointer' : 'not-allowed'
                      }}
                    >
                      View ({state.participants.length})
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #e5e7eb', fontWeight: '700', background: '#f9fafb' }}>
                <td style={{ padding: '8px' }}>Total</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>{overallMetrics.stateSeats}</td>
                <td style={{ padding: '8px', textAlign: 'center', color: '#10b981' }}>
                  {overallMetrics.totalFilled}
                  {overallMetrics.totalActualParticipants > overallMetrics.totalFilled && (
                    <span style={{ color: '#f59e0b', fontSize: '10px', marginLeft: '4px' }}>
                      ({overallMetrics.totalActualParticipants})
                    </span>
                  )}
                </td>
                <td style={{ padding: '8px', textAlign: 'center', color: '#ef4444' }}>
                  {overallMetrics.stateSeats - overallMetrics.totalFilled}
                </td>
                <td style={{ padding: '8px', textAlign: 'center' }}>{overallMetrics.occupancyRate}%</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  {formatINR(overallMetrics.totalRevenue)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Participant Profiles Modal */}
      {showProfiles && selectedState && (
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
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '12px'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  {selectedState.name} Participants
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                  Showing {selectedState.participants.length} participants
                  {selectedState.actualFilled > selectedState.seats && (
                    <span style={{ color: '#f59e0b' }}>
                      {' '}(Seats: {selectedState.seats}, Overflow: {selectedState.actualFilled - selectedState.seats})
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowProfiles(false);
                  setSelectedState(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} color="#6b7280" />
              </button>
            </div>

            {/* Participants List */}
            {selectedState.participants.length > 0 ? (
              <div style={{
                display: 'grid',
                gap: '12px',
                maxHeight: '60vh',
                overflowY: 'auto'
              }}>
                {selectedState.participants.map((participant, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '16px',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                          {participant.full_name || participant.name || participant.first_name || 'Participant ' + (index + 1)}
                        </h4>
                        
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                          {participant.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Mail size={12} color="#6b7280" />
                              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                {participant.email}
                              </span>
                            </div>
                          )}
                          
                          {(participant.phone || participant.mobile_no) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={12} color="#6b7280" />
                              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                {participant.phone || participant.mobile_no}
                              </span>
                            </div>
                          )}
                          
                          {(participant.application_submitted_on || participant.submitted_date) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} color="#6b7280" />
                              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                {new Date(participant.application_submitted_on || participant.submitted_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {/* State Badge - Show detected state */}
                          {participant.detectedState && (
                            <span style={{
                              padding: '3px 10px',
                              borderRadius: '6px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                              <MapPin size={12} />
                              {participant.detectedState}
                            </span>
                          )}
                          
                          {/* Show original location if different from detected state */}
                          {participant.detectedStateSource && 
                           participant.detectedStateSource !== participant.detectedState && (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: '#f3f4f6',
                              color: '#6b7280',
                              fontSize: '10px',
                              fontStyle: 'italic'
                            }}>
                              {participant.detectedStateSource}
                            </span>
                          )}

                          {participant.scholarship_total_amount_paid && (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: '#dcfce7',
                              color: '#047857',
                              fontSize: '11px',
                              fontWeight: '500'
                            }}>
                              ₹{parseFloat(participant.scholarship_total_amount_paid).toLocaleString()} Paid
                            </span>
                          )}
                          
                          {participant.batch && (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: '#dbeafe',
                              color: '#1e40af',
                              fontSize: '11px',
                              fontWeight: '500'
                            }}>
                              {participant.batch}
                            </span>
                          )}
                          
                          {participant.yatra_interest && (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: '#fef3c7',
                              color: '#92400e',
                              fontSize: '11px',
                              fontWeight: '500'
                            }}>
                              {participant.yatra_interest}
                            </span>
                          )}

                          {participant.yatri_id && (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: '#e9d5ff',
                              color: '#6b21a8',
                              fontSize: '11px',
                              fontWeight: '500'
                            }}>
                              ID: {participant.yatri_id}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '20px',
                        background: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <User size={20} color="#6b7280" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <Users size={40} color="#e5e7eb" style={{ marginBottom: '12px' }} />
                <p style={{ margin: 0, fontSize: '14px' }}>
                  No participants found from {selectedState.name}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StateWiseAnalysis;