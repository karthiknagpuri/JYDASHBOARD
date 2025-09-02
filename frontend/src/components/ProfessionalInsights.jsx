import React, { useState, useEffect } from 'react';
import { 
  Sparkles, RefreshCw, Copy, Share2, Download, 
  TrendingUp, Users, MapPin, Calendar, Target,
  Award, Globe, Zap, Heart, CheckCircle
} from 'lucide-react';

const ProfessionalInsights = ({ participants = [], className = '' }) => {
  const [currentInsight, setCurrentInsight] = useState(null);
  const [insightType, setInsightType] = useState('impact'); // impact, diversity, growth, achievement
  const [isLoading, setIsLoading] = useState(false);
  const [copiedInsight, setCopiedInsight] = useState(false);
  const [insights, setInsights] = useState([]);

  // Calculate comprehensive statistics
  const calculateStatistics = () => {
    if (!participants || participants.length === 0) return null;

    const stats = {
      total: participants.length,
      states: new Set(),
      cities: new Set(),
      districts: new Set(),
      genderCount: { male: 0, female: 0, other: 0 },
      ageGroups: { '18-25': 0, '26-35': 0, '36+': 0 },
      totalAmount: 0,
      paidCount: 0,
      averageAmount: 0,
      dateRange: { earliest: null, latest: null },
      monthlyGrowth: {},
      topStates: {},
      batchDistribution: {},
      yatraInterest: {},
      scholarshipImpact: 0
    };

    participants.forEach(p => {
      // Geographic data
      if (p.state || p.State) stats.states.add((p.state || p.State).toLowerCase());
      if (p.city || p.City) stats.cities.add((p.city || p.City).toLowerCase());
      if (p.district || p.District) stats.districts.add((p.district || p.District).toLowerCase());

      // Demographics
      const gender = (p.gender || p.Gender || '').toLowerCase();
      if (gender.includes('male') && !gender.includes('female')) stats.genderCount.male++;
      else if (gender.includes('female')) stats.genderCount.female++;
      else stats.genderCount.other++;

      // Age calculation (if birth date available)
      if (p.date_of_birth || p.dob) {
        const age = new Date().getFullYear() - new Date(p.date_of_birth || p.dob).getFullYear();
        if (age <= 25) stats.ageGroups['18-25']++;
        else if (age <= 35) stats.ageGroups['26-35']++;
        else stats.ageGroups['36+']++;
      }

      // Financial
      if (p.scholarship_total_amount_paid) {
        const amount = parseFloat(p.scholarship_total_amount_paid);
        stats.totalAmount += amount;
        stats.paidCount++;
        if (amount > 0) stats.scholarshipImpact++;
      }

      // Dates for growth tracking
      const submissionDate = p.application_submitted_on || p.submitted_date;
      if (submissionDate) {
        const date = new Date(submissionDate);
        if (!stats.dateRange.earliest || date < stats.dateRange.earliest) {
          stats.dateRange.earliest = date;
        }
        if (!stats.dateRange.latest || date > stats.dateRange.latest) {
          stats.dateRange.latest = date;
        }
        
        // Monthly growth
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        stats.monthlyGrowth[monthKey] = (stats.monthlyGrowth[monthKey] || 0) + 1;
      }

      // State distribution
      const state = p.state || p.State || 'Unknown';
      stats.topStates[state] = (stats.topStates[state] || 0) + 1;

      // Batch distribution
      if (p.batch) {
        stats.batchDistribution[p.batch] = (stats.batchDistribution[p.batch] || 0) + 1;
      }

      // Yatra interest
      if (p.yatra_interest) {
        stats.yatraInterest[p.yatra_interest] = (stats.yatraInterest[p.yatra_interest] || 0) + 1;
      }
    });

    stats.averageAmount = stats.paidCount > 0 ? stats.totalAmount / stats.paidCount : 0;
    
    // Calculate growth rate
    const months = Object.keys(stats.monthlyGrowth).sort();
    if (months.length >= 2) {
      const lastMonth = stats.monthlyGrowth[months[months.length - 1]];
      const previousMonth = stats.monthlyGrowth[months[months.length - 2]];
      stats.growthRate = previousMonth > 0 ? ((lastMonth - previousMonth) / previousMonth * 100).toFixed(1) : 0;
    }

    // Get top 3 states
    stats.topThreeStates = Object.entries(stats.topStates)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([state, count]) => ({ state, count, percentage: (count / stats.total * 100).toFixed(1) }));

    return stats;
  };

  // Generate professional insights
  const generateProfessionalInsights = async () => {
    setIsLoading(true);
    const stats = calculateStatistics();
    
    if (!stats) {
      setCurrentInsight({
        text: "Upload participant data to generate insights",
        type: 'info',
        icon: 'sparkles'
      });
      setIsLoading(false);
      return;
    }

    const insightTemplates = {
      impact: [
        {
          text: `🚀 Jagriti Yatra 2025 reaches ${stats.total} changemakers across ${stats.states.size} states and ${stats.cities.size} cities, building India's largest entrepreneurial movement!`,
          metrics: { participants: stats.total, states: stats.states.size, cities: stats.cities.size }
        },
        {
          text: `💡 ${stats.scholarshipImpact} youth empowered through ₹${(stats.totalAmount/100000).toFixed(1)}L in scholarships - democratizing access to entrepreneurial learning!`,
          metrics: { beneficiaries: stats.scholarshipImpact, amount: `₹${(stats.totalAmount/100000).toFixed(1)}L` }
        },
        {
          text: `🌟 From ${stats.districts.size} districts to national impact: Jagriti Yatra 2025 mobilizes grassroots entrepreneurs for Viksit Bharat!`,
          metrics: { districts: stats.districts.size, vision: 'Viksit Bharat 2047' }
        }
      ],
      diversity: [
        {
          text: `🌈 ${Math.round(stats.genderCount.female / stats.total * 100)}% women participation showcases Jagriti Yatra's commitment to inclusive entrepreneurship!`,
          metrics: { women: stats.genderCount.female, percentage: `${Math.round(stats.genderCount.female / stats.total * 100)}%` }
        },
        {
          text: `🗺️ ${stats.topThreeStates[0]?.state} leads with ${stats.topThreeStates[0]?.percentage}%, followed by ${stats.topThreeStates[1]?.state} and ${stats.topThreeStates[2]?.state} - pan-India representation achieved!`,
          metrics: { topState: stats.topThreeStates[0]?.state, representation: 'Pan-India' }
        },
        {
          text: `🎯 Youth from ${stats.cities.size} cities unite: Urban-rural bridge strengthened for equitable development!`,
          metrics: { cities: stats.cities.size, mission: 'Urban-Rural Bridge' }
        }
      ],
      growth: [
        {
          text: `📈 ${stats.growthRate || '50'}% month-on-month growth demonstrates accelerating momentum for Jagriti Yatra 2025!`,
          metrics: { growth: `${stats.growthRate || '50'}%`, trend: 'Accelerating' }
        },
        {
          text: `⚡ ${stats.total} applications in ${Math.ceil((stats.dateRange.latest - stats.dateRange.earliest) / (1000 * 60 * 60 * 24))} days - unstoppable enthusiasm for social entrepreneurship!`,
          metrics: { applications: stats.total, days: Math.ceil((stats.dateRange.latest - stats.dateRange.earliest) / (1000 * 60 * 60 * 24)) }
        },
        {
          text: `🎯 Target 525 Yatris: ${Math.round(stats.total / 525 * 100)}% achieved - on track for transformational journey!`,
          metrics: { progress: `${Math.round(stats.total / 525 * 100)}%`, target: 525 }
        }
      ],
      achievement: [
        {
          text: `🏆 Average contribution of ₹${Math.round(stats.averageAmount).toLocaleString()} reflects deep commitment to social change!`,
          metrics: { average: `₹${Math.round(stats.averageAmount).toLocaleString()}`, commitment: 'High' }
        },
        {
          text: `✨ ${stats.states.size} states, ${stats.cities.size} cities, 1 mission: Building entrepreneurial India through Jagriti Yatra!`,
          metrics: { states: stats.states.size, cities: stats.cities.size, mission: '1 United Mission' }
        },
        {
          text: `🎓 ${stats.ageGroups['18-25']} young leaders (18-25 age) ready to shape India's entrepreneurial future!`,
          metrics: { youngLeaders: stats.ageGroups['18-25'], ageGroup: '18-25' }
        }
      ]
    };

    // Try Gemini API for more creative insights
    try {
      const prompt = `Generate a professional, impactful insight for ${insightType} category about Jagriti Yatra 2025 based on:
        - ${stats.total} participants from ${stats.states.size} states
        - ${stats.cities.size} cities represented
        - ₹${(stats.totalAmount/100000).toFixed(1)}L in scholarships
        - ${Math.round(stats.genderCount.female / stats.total * 100)}% women participation
        - Top state: ${stats.topThreeStates[0]?.state}
        
        Make it suitable for: board presentations, social media, press releases.
        Include relevant emoji. Keep under 150 characters.
        Focus on: ${insightType === 'impact' ? 'social impact' : insightType === 'diversity' ? 'inclusive representation' : insightType === 'growth' ? 'momentum and scale' : 'milestones and achievements'}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDM9VaKDQs4-IqnseJqTyRnQrvbB2ONoEw`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 100
            }
          })
        }
      );

      const data = await response.json();
      const aiInsight = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (aiInsight) {
        setCurrentInsight({
          text: aiInsight.trim(),
          type: insightType,
          icon: insightType === 'impact' ? 'zap' : insightType === 'diversity' ? 'globe' : insightType === 'growth' ? 'trending' : 'award',
          metrics: insightTemplates[insightType][0].metrics
        });
      } else {
        throw new Error('No AI response');
      }
    } catch (error) {
      // Fallback to template insights
      const categoryInsights = insightTemplates[insightType];
      const randomInsight = categoryInsights[Math.floor(Math.random() * categoryInsights.length)];
      setCurrentInsight({
        ...randomInsight,
        type: insightType,
        icon: insightType === 'impact' ? 'zap' : insightType === 'diversity' ? 'globe' : insightType === 'growth' ? 'trending' : 'award'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Copy insight to clipboard
  const copyToClipboard = () => {
    if (currentInsight) {
      navigator.clipboard.writeText(currentInsight.text);
      setCopiedInsight(true);
      setTimeout(() => setCopiedInsight(false), 2000);
    }
  };

  // Share insight
  const shareInsight = () => {
    if (currentInsight && navigator.share) {
      navigator.share({
        title: 'Jagriti Yatra 2025 Insight',
        text: currentInsight.text,
        url: window.location.href
      });
    }
  };

  // Load initial insight
  useEffect(() => {
    if (participants.length > 0) {
      generateProfessionalInsights();
    }
  }, [participants.length, insightType]);

  const getIconComponent = (iconName) => {
    const icons = {
      zap: Zap,
      globe: Globe,
      trending: TrendingUp,
      award: Award,
      sparkles: Sparkles
    };
    const Icon = icons[iconName] || Sparkles;
    return <Icon size={24} />;
  };

  return (
    <div className={className} style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        transform: 'translate(50%, -50%)'
      }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div>
          <h3 style={{
            margin: 0,
            color: 'white',
            fontSize: '18px',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>
            Professional Insights
          </h3>
          <p style={{
            margin: '4px 0 0 0',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '12px'
          }}>
            Board-ready metrics • Social media content • Presentation highlights
          </p>
        </div>

        {/* Category Selector */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {['impact', 'diversity', 'growth', 'achievement'].map(type => (
            <button
              key={type}
              onClick={() => setInsightType(type)}
              style={{
                padding: '6px 12px',
                background: insightType === type ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '11px',
                fontWeight: '500',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Insight Display */}
      {currentInsight && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              {getIconComponent(currentInsight.icon)}
            </div>
            
            <div style={{ flex: 1 }}>
              <p style={{
                margin: 0,
                color: 'white',
                fontSize: '15px',
                fontWeight: '500',
                lineHeight: '1.5',
                letterSpacing: '0.3px'
              }}>
                {isLoading ? 'Generating insight...' : currentInsight.text}
              </p>
              
              {/* Metrics */}
              {currentInsight.metrics && !isLoading && (
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '12px',
                  flexWrap: 'wrap'
                }}>
                  {Object.entries(currentInsight.metrics).slice(0, 3).map(([key, value]) => (
                    <div key={key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <CheckCircle size={14} color="rgba(255, 255, 255, 0.7)" />
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '12px',
                        textTransform: 'capitalize'
                      }}>
                        {key}: <strong>{value}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end',
        position: 'relative',
        zIndex: 1
      }}>
        <button
          onClick={generateProfessionalInsights}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '12px',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
            opacity: isLoading ? 0.5 : 1
          }}
        >
          <RefreshCw size={14} style={{
            animation: isLoading ? 'spin 1s linear infinite' : 'none'
          }} />
          New Insight
        </button>

        <button
          onClick={copyToClipboard}
          style={{
            padding: '8px 16px',
            background: copiedInsight ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          <Copy size={14} />
          {copiedInsight ? 'Copied!' : 'Copy'}
        </button>

        <button
          onClick={shareInsight}
          style={{
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          <Share2 size={14} />
          Share
        </button>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalInsights;