// Unified revenue calculation utility
const TICKET_PRICES = {
  PRIORITY_PASS: 31290,
  PARTICIPANT: 31290,  // Same price for regular participants
  FACILITATOR: 0       // Facilitators don't pay
};

export const calculateRevenue = (participants = [], priorityPass = []) => {
  // Calculate participant revenue - ONLY from actual scholarship amounts collected
  const participantRevenue = participants.reduce((sum, p) => {
    // Only count actual amounts paid through scholarship column
    const amount = parseFloat(p.scholarship_total_amount_paid) || 0;
    // Don't assume standard pricing - only count what was actually collected
    return sum + amount;
  }, 0);

  // Calculate priority pass revenue - ONLY from actual scholarship amounts collected
  const priorityPassRevenue = priorityPass.reduce((sum, p) => {
    // Only count actual amounts paid through scholarship column
    const amount = parseFloat(p.scholarship_total_amount_paid) || 0;
    return sum + amount;
  }, 0);


  // Get paid participants count - only those who actually paid something
  const paidParticipants = participants.filter(p => 
    parseFloat(p.scholarship_total_amount_paid) > 0
  ).length;

  const paidPriorityPass = priorityPass.filter(p => 
    parseFloat(p.scholarship_total_amount_paid) > 0
  ).length;


  // Calculate totals
  const totalRevenue = participantRevenue + priorityPassRevenue;
  const totalPaidCount = paidParticipants + paidPriorityPass;
  const averageRevenue = totalPaidCount > 0 ? totalRevenue / totalPaidCount : 0;

  // Calculate potential revenue (if all seats were filled)
  const participantCapacity = 450;
  const priorityPassCapacity = 525;
  const totalCapacity = participantCapacity + priorityPassCapacity;
  
  const potentialParticipantRevenue = participantCapacity * TICKET_PRICES.PARTICIPANT;
  const potentialPriorityRevenue = priorityPassCapacity * TICKET_PRICES.PRIORITY_PASS;
  const potentialTotalRevenue = potentialParticipantRevenue + potentialPriorityRevenue;

  // Collection rate
  const collectionRate = potentialTotalRevenue > 0 ? 
    (totalRevenue / potentialTotalRevenue) * 100 : 0;

  return {
    // Actuals
    participantRevenue,
    priorityPassRevenue,
    totalRevenue,
    
    // Counts
    paidParticipants,
    paidPriorityPass,
    totalPaidCount,
    
    // Averages
    averageRevenue,
    averageParticipantRevenue: paidParticipants > 0 ? participantRevenue / paidParticipants : 0,
    averagePriorityRevenue: paidPriorityPass > 0 ? priorityPassRevenue / paidPriorityPass : 0,
    
    // Potentials
    potentialParticipantRevenue,
    potentialPriorityRevenue,
    potentialTotalRevenue,
    
    // Metrics
    collectionRate,
    participantFillRate: (participants.length / participantCapacity) * 100,
    priorityFillRate: (priorityPass.length / priorityPassCapacity) * 100,
    totalFillRate: ((participants.length + priorityPass.length) / totalCapacity) * 100,
    
    // Gaps
    revenueGap: potentialTotalRevenue - totalRevenue,
    participantGap: participantCapacity - participants.length,
    priorityGap: priorityPassCapacity - priorityPass.length,
    
    // Breakdown
    breakdown: {
      participants: {
        count: participants.length,
        paid: paidParticipants,
        revenue: participantRevenue,
        capacity: participantCapacity,
        fillRate: (participants.length / participantCapacity) * 100
      },
      priorityPass: {
        count: priorityPass.length,
        paid: paidPriorityPass,
        revenue: priorityPassRevenue,
        capacity: priorityPassCapacity,
        fillRate: (priorityPass.length / priorityPassCapacity) * 100
      },
      facilitators: {
        count: participants.filter(p => (p.yatri_type || '').toLowerCase() === 'facilitator').length,
        revenue: 0,
        capacity: 75
      }
    }
  };
};

export const formatINR = (amount) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  } else {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
};

export const getTicketPrice = (type) => {
  return TICKET_PRICES[type.toUpperCase()] || 0;
};

// Calculate scholarship statistics
export const calculateScholarshipStats = (participants = [], priorityPass = []) => {
  const allRecords = [...participants, ...priorityPass];
  
  // Group by scholarship amount ranges
  const ranges = {
    full: allRecords.filter(p => parseFloat(p.scholarship_total_amount_paid) >= 31290).length,
    partial75: allRecords.filter(p => {
      const amount = parseFloat(p.scholarship_total_amount_paid) || 0;
      return amount >= 23467.5 && amount < 31290; // 75% and above
    }).length,
    partial50: allRecords.filter(p => {
      const amount = parseFloat(p.scholarship_total_amount_paid) || 0;
      return amount >= 15645 && amount < 23467.5; // 50-75%
    }).length,
    partial25: allRecords.filter(p => {
      const amount = parseFloat(p.scholarship_total_amount_paid) || 0;
      return amount > 0 && amount < 15645; // Less than 50%
    }).length,
    zero: allRecords.filter(p => {
      const amount = parseFloat(p.scholarship_total_amount_paid) || 0;
      return amount === 0;
    }).length
  };
  
  // Calculate actual collection vs standard pricing
  const actualCollection = allRecords.reduce((sum, p) => {
    return sum + (parseFloat(p.scholarship_total_amount_paid) || 0);
  }, 0);
  
  const standardTotal = allRecords.length * TICKET_PRICES.PARTICIPANT;
  const scholarshipProvided = standardTotal - actualCollection;
  const averageScholarship = allRecords.length > 0 ? scholarshipProvided / allRecords.length : 0;
  
  return {
    ranges,
    actualCollection,
    standardTotal,
    scholarshipProvided,
    averageScholarship,
    collectionPercentage: standardTotal > 0 ? (actualCollection / standardTotal) * 100 : 0
  };
};