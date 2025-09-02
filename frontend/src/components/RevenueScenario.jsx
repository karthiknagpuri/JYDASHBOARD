import React, { useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';

const RevenueScenario = () => {
  const scenarioData = [
    { tier: 'L1', fees: 73000, pax: 65, revenue: 4745000 },
    { tier: 'L2', fees: 59800, pax: 90, revenue: 5382000 },
    { tier: 'L3', fees: 46500, pax: 200, revenue: 9300000 },
    { tier: 'L4', fees: 29800, pax: 100, revenue: 2980000 },
    { tier: 'International', fees: 130500, pax: 20, revenue: 2610000 }
  ];

  const totals = {
    pax: 475,
    revenue: 25017000
  };

  const [view, setView] = useState('table'); // 'table', 'chart', 'distribution'

  // Chart data for revenue by tier
  const revenueChartData = {
    labels: scenarioData.map(d => d.tier),
    datasets: [{
      label: 'Revenue (₹)',
      data: scenarioData.map(d => d.revenue),
      backgroundColor: [
        'rgba(147, 51, 234, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgba(147, 51, 234, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(251, 146, 60, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 1
    }]
  };

  // Chart data for participant distribution
  const paxDistributionData = {
    labels: scenarioData.map(d => `${d.tier} (${d.pax})`),
    datasets: [{
      data: scenarioData.map(d => d.pax),
      backgroundColor: [
        'rgba(147, 51, 234, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: '#fff',
      borderWidth: 2
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: view === 'distribution',
        position: 'right'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (view === 'distribution') {
              const percentage = ((context.parsed / totals.pax) * 100).toFixed(1);
              return `${context.label}: ${percentage}%`;
            }
            return `₹${context.parsed.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: view === 'chart' ? {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${(value / 100000).toFixed(0)}L`
        }
      }
    } : undefined
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const calculateMetrics = () => {
    const avgFee = scenarioData.reduce((sum, d) => sum + (d.fees * d.pax), 0) / totals.pax;
    const maxRevenueTier = scenarioData.reduce((max, d) => d.revenue > max.revenue ? d : max);
    const maxPaxTier = scenarioData.reduce((max, d) => d.pax > max.pax ? d : max);
    
    return {
      avgFee: Math.round(avgFee),
      maxRevenueTier,
      maxPaxTier,
      revenuePerPax: Math.round(totals.revenue / totals.pax)
    };
  };

  const metrics = calculateMetrics();

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
            Revenue Scenario Analysis
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
            Pricing tiers and participant distribution
          </p>
        </div>
        
        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['table', 'chart', 'distribution'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: view === v ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f3f4f6',
                color: view === v ? 'white' : '#6b7280',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                textTransform: 'capitalize'
              }}
            >
              {v === 'distribution' ? 'Pax Mix' : v}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          padding: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '8px',
          color: 'white'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Total Revenue</div>
          <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>
            ₹{(totals.revenue / 10000000).toFixed(2)} Cr
          </div>
        </div>
        
        <div style={{ 
          padding: '16px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          borderRadius: '8px',
          color: 'white'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Total Participants</div>
          <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>
            {totals.pax}
          </div>
        </div>
        
        <div style={{ 
          padding: '16px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '8px',
          color: 'white'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Avg Fee/Participant</div>
          <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>
            ₹{metrics.avgFee.toLocaleString('en-IN')}
          </div>
        </div>
        
        <div style={{ 
          padding: '16px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '8px',
          color: 'white'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Top Revenue Tier</div>
          <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>
            {metrics.maxRevenueTier.tier}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.9 }}>
            {formatCurrency(metrics.maxRevenueTier.revenue)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {view === 'table' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>
                  TIER
                </th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>
                  FEES (₹)
                </th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>
                  PARTICIPANTS
                </th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>
                  REVENUE (₹)
                </th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>
                  % OF TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {scenarioData.map((row, index) => (
                <tr key={row.tier} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: index === 0 ? '#fef3c7' : 
                                 index === 1 ? '#dbeafe' :
                                 index === 2 ? '#d1fae5' :
                                 index === 3 ? '#fed7aa' : '#fce7f3',
                      color: index === 0 ? '#92400e' :
                             index === 1 ? '#1e40af' :
                             index === 2 ? '#065f46' :
                             index === 3 ? '#9a3412' : '#831843',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {row.tier}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {row.fees.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {row.pax}
                    <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '4px' }}>
                      ({((row.pax / totals.pax) * 100).toFixed(1)}%)
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>
                    {formatCurrency(row.revenue)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '8px'
                    }}>
                      <div style={{
                        flex: 1,
                        maxWidth: '60px',
                        height: '6px',
                        background: '#f3f4f6',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(row.revenue / totals.revenue) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #667eea, #764ba2)',
                          borderRadius: '3px'
                        }} />
                      </div>
                      <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '45px', textAlign: 'right' }}>
                        {((row.revenue / totals.revenue) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid #e5e7eb', fontWeight: '700' }}>
                <td style={{ padding: '12px' }}>Total</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>-</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{totals.pax}</td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#7c3aed' }}>
                  {formatCurrency(totals.revenue)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {view === 'chart' && (
        <div style={{ height: '400px' }}>
          <Bar data={revenueChartData} options={chartOptions} />
        </div>
      )}

      {view === 'distribution' && (
        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '500px' }}>
            <Doughnut data={paxDistributionData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueScenario;