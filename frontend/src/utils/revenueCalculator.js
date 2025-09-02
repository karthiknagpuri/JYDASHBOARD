// Unified revenue calculation utility
const TICKET_PRICES = {
  PRIORITY_PASS: 31290,
  PARTICIPANT: 31290,  // Same price for regular participants
  FACILITATOR: 0       // Facilitators don't pay
};

export const calculateRevenue = (participants = [], priorityPass = []) => {
  // Calculate participant revenue
  const participantRevenue = participants.reduce((sum, p) => {
    // Use scholarship_total_amount_paid if available, otherwise use standard pricing
    const amount = parseFloat(p.scholarship_total_amount_paid) || 0;
    
    // If no amount recorded but participant type is clear, use standard pricing
    if (amount === 0 && p.yatri_type) {
      const type = (p.yatri_type || '').toLowerCase();
      if (type === 'facilitator') {
        return sum; // Facilitators don't pay
      } else if (type === 'participant') {
        return sum + TICKET_PRICES.PARTICIPANT;
      }
    }
    
    return sum + amount;
  }, 0);

  // Calculate priority pass revenue
  const priorityPassRevenue = priorityPass.reduce((sum, p) => {
    const amount = parseFloat(p.scholarship_total_amount_paid) || TICKET_PRICES.PRIORITY_PASS;
    return sum + amount;
  }, 0);


  // Get paid participants count
  const paidParticipants = participants.filter(p => 
    parseFloat(p.scholarship_total_amount_paid) > 0
  ).length;

  const paidPriorityPass = priorityPass.filter(p => 
    parseFloat(p.scholarship_total_amount_paid) > 0 || !p.scholarship_total_amount_paid
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