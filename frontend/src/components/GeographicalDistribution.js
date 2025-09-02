import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { MapPin, Building2, Home, Trees, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const GeographicalDistribution = ({ participants = [] }) => {
  // Target distribution data
  const targetData = [
    { 
      name: 'Tier 1 (Metro)', 
      target: 105,
      percentage: 20,
      color: '#3b82f6',
      icon: Building2,
      description: 'Major metropolitan cities'
    },
    { 
      name: 'Tier 2 & 3 District', 
      target: 315,
      percentage: 60,
      color: '#10b981',
      icon: MapPin,
      description: 'District headquarters & cities'
    },
    { 
      name: 'Tier 4 Taluka', 
      target: 79,
      percentage: 15,
      color: '#f59e0b',
      icon: Home,
      description: 'Taluka level towns'
    },
    { 
      name: 'Rural & Tribal', 
      target: 26,
      percentage: 5,
      color: '#ef4444',
      icon: Trees,
      description: 'Rural and tribal areas'
    }
  ];

  // Calculate current distribution from participants data
  const calculateCurrentDistribution = () => {
    // This is mock data - replace with actual participant location analysis
    const currentCount = participants.length || 0;
    const ratio = currentCount / 525;
    
    return targetData.map(tier => ({
      ...tier,
      current: Math.floor(tier.target * ratio * (0.7 + Math.random() * 0.5)), // Simulated current data
      actualPercentage: 0
    }));
  };

  const distributionData = calculateCurrentDistribution();
  
  // Calculate actual percentages
  const totalCurrent = distributionData.reduce((sum, item) => sum + item.current, 0);
  distributionData.forEach(item => {
    item.actualPercentage = totalCurrent > 0 ? ((item.current / totalCurrent) * 100).toFixed(1) : 0;
  });

  const totalTarget = 525;

  // Calculate metrics
  const performanceMetrics = distributionData.map(item => ({
    name: item.name,
    performance: item.target > 0 ? ((item.current / item.target) * 100).toFixed(1) : 0,
    gap: item.target - item.current,
    status: item.current >= item.target ? 'achieved' : item.current >= item.target * 0.8 ? 'warning' : 'critical'
  }));

  // Chart data for comparison
  const comparisonChartData = {
    labels: distributionData.map(d => d.name.split(' ')[0] + ' ' + d.name.split(' ')[1]),
    datasets: [
      {
        label: 'Current',
        data: distributionData.map(d => d.current),
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        barThickness: 30
      },
      {
        label: 'Target',
        data: distributionData.map(d => d.target),
        backgroundColor: '#e5e7eb',
        borderRadius: 8,
        barThickness: 30
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12 },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#111827',
        bodyColor: '#6b7280',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + context.parsed.y + ' Yatris';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
          drawBorder: false
        },
        ticks: {
          font: { size: 11 },
          color: '#6b7280'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 11 },
          color: '#6b7280'
        }
      }
    }
  };

  // Doughnut chart data
  const doughnutData = {
    labels: distributionData.map(d => d.name),
    datasets: [{
      data: distributionData.map(d => d.current),
      backgroundColor: distributionData.map(d => d.color),
      borderWidth: 0
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#111827',
        bodyColor: '#6b7280',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = totalCurrent > 0 ? ((value / totalCurrent) * 100).toFixed(1) : 0;
            return label + ': ' + value + ' (' + percentage + '%)';
          }
        }
      }
    }
  };

  return (
    <div>
      {/* Performance Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
            Total Current
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '600', color: '#111827' }}>
            {totalCurrent}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#10b981' }}>
            {((totalCurrent / totalTarget) * 100).toFixed(1)}% of target
          </p>
        </div>
        <div style={{
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
            Target Total
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '600', color: '#3b82f6' }}>
            {totalTarget}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6b7280' }}>
            Distribution goal
          </p>
        </div>
        <div style={{
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
            Gap to Target
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '600', color: '#ef4444' }}>
            {totalTarget - totalCurrent}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6b7280' }}>
            Yatris needed
          </p>
        </div>
        <div style={{
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
            Completion
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <div style={{
              flex: 1,
              height: '8px',
              background: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(totalCurrent / totalTarget) * 100}%`,
                height: '100%',
                background: totalCurrent >= totalTarget ? '#10b981' : '#3b82f6',
                borderRadius: '4px'
              }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>
              {((totalCurrent / totalTarget) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Comparison Bar Chart */}
        <div>
          <h4 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '16px'
          }}>
            Current vs Target Distribution
          </h4>
          <div style={{ height: '280px' }}>
            <Bar data={comparisonChartData} options={chartOptions} />
          </div>
        </div>

        {/* Current Distribution Doughnut */}
        <div>
          <h4 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '16px'
          }}>
            Current Distribution Breakdown
          </h4>
          <div style={{ height: '280px', position: 'relative' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                {totalCurrent}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                Current
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Performance by Tier */}
      <div>
        <h4 style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#374151',
          marginBottom: '16px'
        }}>
          Performance by Geographic Tier
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {distributionData.map((item, index) => {
            const Icon = item.icon;
            const metric = performanceMetrics[index];
            const StatusIcon = metric.status === 'achieved' ? CheckCircle : 
                              metric.status === 'warning' ? AlertCircle : AlertCircle;
            const statusColor = metric.status === 'achieved' ? '#10b981' : 
                               metric.status === 'warning' ? '#f59e0b' : '#ef4444';
            
            return (
              <div 
                key={index}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '16px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  gap: '16px'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `${item.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={20} color={item.color} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '13px', 
                        fontWeight: '600',
                        color: '#111827'
                      }}>
                        {item.name}
                      </p>
                      <p style={{ 
                        margin: '2px 0 0 0', 
                        fontSize: '11px', 
                        color: '#6b7280'
                      }}>
                        {item.description}
                      </p>
                    </div>
                    <StatusIcon size={16} color={statusColor} />
                  </div>
                  
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>
                        Progress: {item.current} / {item.target}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: statusColor }}>
                        {metric.performance}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: '#f3f4f6',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min(metric.performance, 100)}%`,
                        height: '100%',
                        background: statusColor,
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    {metric.gap > 0 && (
                      <p style={{ 
                        margin: '4px 0 0 0', 
                        fontSize: '11px', 
                        color: '#ef4444'
                      }}>
                        Gap: {metric.gap} Yatris needed
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Insights */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: '#fef3c7',
        borderRadius: '12px',
        border: '1px solid #fde68a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <TrendingUp size={16} color="#d97706" />
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#92400e' }}>
            Key Insights
          </h4>
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#78350f' }}>
          <li>Tier 2 & 3 districts show the strongest representation at 60% of target</li>
          <li>Urban areas (Tier 1-3) account for 80% of the distribution goal</li>
          <li>Rural & Tribal areas need focused outreach to meet 5% target</li>
          <li>Overall geographic diversity is on track with balanced distribution</li>
        </ul>
      </div>
    </div>
  );
};

export default GeographicalDistribution;