import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, X, TrendingUp, Users, Target, Heart, Zap, ChevronLeft, ChevronRight, Pause, Play, Copy, Share2, Maximize2, Minimize2, MessageCircle, Mail, FileText } from 'lucide-react';

const UnifiedInsightsBanner = ({ participants = [] }) => {
  const [currentInsight, setCurrentInsight] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allInsights, setAllInsights] = useState([]);
  const [insightType, setInsightType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedAlert, setCopiedAlert] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('');
  const intervalRef = useRef(null);

  // Extract all types of insights from participant data
  const generateComprehensiveInsights = () => {
    if (participants.length === 0) return [];
    
    const insights = [];
    const stats = {
      total: participants.length,
      states: new Set(),
      districts: new Set(),
      occupations: new Set(),
      companies: new Set(),
      genderCount: { male: 0, female: 0 },
      stateDistribution: {},
      profileStories: [],
      achievements: [],
      impacts: [],
      growth: [],
      educationLevels: new Set(),
      ageGroups: { '18-25': 0, '26-35': 0, '36-45': 0, '46+': 0 }
    };
    
    // Process each participant for comprehensive data
    participants.forEach(p => {
      const name = p.name || p.Name || p.full_name || 'A participant';
      const district = p.district || p.District || p.city || p.City || '';
      const state = p.state || p.State || p.location_state || '';
      const age = parseInt(p.age || p.Age || 0);
      
      // Collect stats
      if (state) {
        stats.states.add(state);
        stats.stateDistribution[state] = (stats.stateDistribution[state] || 0) + 1;
      }
      if (district) stats.districts.add(district.toLowerCase());
      
      // Age groups
      if (age) {
        if (age <= 25) stats.ageGroups['18-25']++;
        else if (age <= 35) stats.ageGroups['26-35']++;
        else if (age <= 45) stats.ageGroups['36-45']++;
        else stats.ageGroups['46+']++;
      }
      
      // Gender
      const gender = (p.gender || p.Gender || '').toLowerCase();
      if (gender.includes('female')) stats.genderCount.female++;
      else if (gender.includes('male')) stats.genderCount.male++;
      
      // Profile data extraction
      const bio = p.bio || p.Bio || p.profile || p.Profile || 
                  p.about || p.About || p.description || p.Description ||
                  p.story || p.Story || p.background || p.Background || '';
      
      const achievement = p.achievement || p.Achievement || 
                         p.accomplishment || p.Accomplishment ||
                         p.award || p.Award || p.recognition || p.Recognition || '';
      
      const skills = p.skills || p.Skills || p.expertise || p.Expertise || '';
      
      const education = p.education || p.Education || p.qualification || 
                       p.Qualification || p.degree || p.Degree || '';
      
      const occupation = p.occupation || p.Occupation || p.profession || 
                        p.Profession || p.job || p.Job || p.role || p.Role || '';
      
      const company = p.company || p.Company || p.organization || p.Organization || '';
      
      const interests = p.interests || p.Interests || p.hobbies || p.Hobbies ||
                       p.passion || p.Passion || '';
      
      const impact = p.impact || p.Impact || p.contribution || p.Contribution || '';
      
      const journey = p.journey || p.Journey || p.experience || p.Experience || '';
      
      if (occupation) stats.occupations.add(occupation);
      if (company) stats.companies.add(company);
      if (education) stats.educationLevels.add(education);
      
      // Collect stories and achievements with priority scoring
      if (bio && bio.length > 20) {
        insights.push({
          type: 'story',
          icon: '📖',
          content: `${name} from ${district || state || 'India'}: "${bio}"`,
          priority: bio.length > 100 ? 3 : 2,
          category: 'personal'
        });
      }
      
      if (achievement) {
        insights.push({
          type: 'achievement',
          icon: '🏆',
          content: `${name} - ${achievement}`,
          priority: 4,
          category: 'success'
        });
      }
      
      if (impact) {
        insights.push({
          type: 'impact',
          icon: '💫',
          content: `Impact Story: ${name} - ${impact}`,
          priority: 5,
          category: 'impact'
        });
      }
      
      if (journey) {
        insights.push({
          type: 'journey',
          icon: '🛤️',
          content: `Journey: ${name} - ${journey}`,
          priority: 3,
          category: 'personal'
        });
      }
      
      // Growth & Learning
      if (skills) {
        insights.push({
          type: 'growth',
          icon: '💡',
          content: `${name} specializes in ${skills}`,
          priority: 2,
          category: 'skills'
        });
      }
      
      if (interests) {
        insights.push({
          type: 'passion',
          icon: '✨',
          content: `${name} is passionate about ${interests}`,
          priority: 2,
          category: 'personal'
        });
      }
      
      if (education && occupation) {
        insights.push({
          type: 'professional',
          icon: '🎓',
          content: `${name}: ${education} graduate, working as ${occupation}${company ? ` at ${company}` : ''}`,
          priority: 3,
          category: 'professional'
        });
      }
    });
    
    // Statistical insights with context
    const topState = Object.entries(stats.stateDistribution)
      .sort((a, b) => b[1] - a[1])[0];
    
    // Geographic diversity
    insights.push({
      type: 'funfact',
      icon: '🌍',
      content: `Uniting ${stats.districts.size} districts across ${stats.states.size} states - One vision, infinite possibilities`,
      priority: 1,
      category: 'statistics'
    });
    
    // State leadership
    if (topState) {
      insights.push({
        type: 'funfact',
        icon: '📍',
        content: `${topState[0]} is leading the movement with ${topState[1]} passionate changemakers (${Math.round(topState[1]/stats.total*100)}% of total)`,
        priority: 1,
        category: 'statistics'
      });
    }
    
    // Gender diversity
    const femalePercent = Math.round(stats.genderCount.female / stats.total * 100);
    if (femalePercent >= 30) {
      insights.push({
        type: 'diversity',
        icon: '💪',
        content: `Celebrating ${femalePercent}% women leaders who are breaking barriers and driving transformation`,
        priority: 2,
        category: 'diversity'
      });
    }
    
    // Professional diversity
    if (stats.occupations.size > 10) {
      insights.push({
        type: 'diversity',
        icon: '🎨',
        content: `${stats.occupations.size} different professions united - From tech to teaching, art to agriculture`,
        priority: 1,
        category: 'diversity'
      });
    }
    
    // Organizational reach
    if (stats.companies.size > 10) {
      insights.push({
        type: 'network',
        icon: '🏢',
        content: `Leaders from ${stats.companies.size} organizations creating a powerful network for change`,
        priority: 1,
        category: 'network'
      });
    }
    
    // Age diversity insights
    const dominantAgeGroup = Object.entries(stats.ageGroups)
      .sort((a, b) => b[1] - a[1])[0];
    if (dominantAgeGroup && dominantAgeGroup[1] > 0) {
      insights.push({
        type: 'demographic',
        icon: '👥',
        content: `Multi-generational force: ${dominantAgeGroup[0]} age group leading with ${dominantAgeGroup[1]} participants`,
        priority: 1,
        category: 'diversity'
      });
    }
    
    // Education insights
    if (stats.educationLevels.size > 5) {
      insights.push({
        type: 'education',
        icon: '📚',
        content: `${stats.educationLevels.size} different educational backgrounds converging for social impact`,
        priority: 1,
        category: 'diversity'
      });
    }
    
    // Inspirational insights
    insights.push({
      type: 'inspiration',
      icon: '🚀',
      content: `${stats.total} changemakers, ${stats.states.size} states, 1 mission: Transform India`,
      priority: 2,
      category: 'inspiration'
    });
    
    insights.push({
      type: 'inspiration',
      icon: '🔥',
      content: `Every one of these ${stats.total} stories represents hope, courage, and the power to create change`,
      priority: 2,
      category: 'inspiration'
    });
    
    // Board Meeting Insights - Professional metrics and strategic impact
    insights.push({
      type: 'board',
      icon: '📊',
      content: `Strategic Impact: ${stats.total} participants across ${stats.states.size} states, creating a nationwide network for sustainable development`,
      priority: 5,
      category: 'board-meeting'
    });
    
    insights.push({
      type: 'board',
      icon: '💼',
      content: `Organizational Reach: Partnerships with ${stats.companies.size} organizations, demonstrating strong stakeholder engagement`,
      priority: 5,
      category: 'board-meeting'
    });
    
    insights.push({
      type: 'board',
      icon: '📈',
      content: `Growth Metrics: ${Math.round((stats.total / 525) * 100)}% capacity utilization with participants from ${stats.districts.size} districts`,
      priority: 5,
      category: 'board-meeting'
    });
    
    if (femalePercent >= 30) {
      insights.push({
        type: 'board',
        icon: '⚖️',
        content: `Diversity & Inclusion: ${femalePercent}% female participation, exceeding industry benchmarks for gender diversity`,
        priority: 5,
        category: 'board-meeting'
      });
    }
    
    insights.push({
      type: 'board',
      icon: '🎯',
      content: `Strategic Alignment: ${stats.occupations.size} professional domains represented, enabling cross-sector innovation`,
      priority: 4,
      category: 'board-meeting'
    });
    
    // Social Media Insights - Engaging and shareable content
    insights.push({
      type: 'social',
      icon: '✨',
      content: `🌟 Meet our changemakers! ${stats.total} passionate individuals from ${stats.districts.size} districts are ready to transform India! #JagritiYatra #ChangeTheWorld`,
      priority: 3,
      category: 'social-media'
    });
    
    insights.push({
      type: 'social',
      icon: '💪',
      content: `Breaking barriers! ${femalePercent}% women leaders in our cohort are redefining possibilities 🚀 #WomenLeaders #Empowerment`,
      priority: 3,
      category: 'social-media'
    });
    
    insights.push({
      type: 'social',
      icon: '🌍',
      content: `From ${stats.states.size} states to ONE mission! United we stand for social change 🇮🇳 #UnityInDiversity #SocialImpact`,
      priority: 3,
      category: 'social-media'
    });
    
    insights.push({
      type: 'social',
      icon: '🎉',
      content: `${stats.occupations.size} professions, ${stats.districts.size} districts, infinite possibilities! Join the movement 🚀 #JagritiYatra #Innovation`,
      priority: 3,
      category: 'social-media'
    });
    
    // Meeting Insights - Team updates and progress reports
    insights.push({
      type: 'meeting',
      icon: '📝',
      content: `Team Update: Successfully onboarded ${stats.total} participants, achieving ${Math.round((stats.total / 525) * 100)}% of target capacity`,
      priority: 4,
      category: 'team-meeting'
    });
    
    insights.push({
      type: 'meeting',
      icon: '🎯',
      content: `Regional Distribution: ${topState[0]} leads with ${topState[1]} participants, followed by strong representation from ${stats.states.size - 1} other states`,
      priority: 4,
      category: 'team-meeting'
    });
    
    insights.push({
      type: 'meeting',
      icon: '👥',
      content: `Participant Profile: Diverse cohort with ${stats.occupations.size} professional backgrounds and ${stats.educationLevels.size} educational qualifications`,
      priority: 4,
      category: 'team-meeting'
    });
    
    // Executive Summary Insights
    insights.push({
      type: 'executive',
      icon: '🏆',
      content: `Executive Summary: ${stats.total} high-potential changemakers selected from across India, representing the top talent in social entrepreneurship`,
      priority: 5,
      category: 'executive'
    });
    
    insights.push({
      type: 'executive',
      icon: '💎',
      content: `Value Proposition: Creating India's largest network of social entrepreneurs with participants from ${stats.companies.size}+ organizations`,
      priority: 5,
      category: 'executive'
    });
    
    // Fun Facts for casual sharing
    insights.push({
      type: 'funfact',
      icon: '🤝',
      content: `If all ${stats.total} participants held hands, they'd form a chain stretching over ${Math.round(stats.total * 1.5)} meters!`,
      priority: 1,
      category: 'fun'
    });
    
    insights.push({
      type: 'funfact',
      icon: '☕',
      content: `Together, our ${stats.total} changemakers will consume approximately ${stats.total * 15} cups of chai during the journey!`,
      priority: 1,
      category: 'fun'
    });
    
    insights.push({
      type: 'funfact',
      icon: '🚂',
      content: `Our participants will collectively travel over ${stats.total * 8000} km - that's like circling Earth ${Math.round((stats.total * 8000) / 40000)} times!`,
      priority: 1,
      category: 'fun'
    });
    
    // Sort by priority for better flow
    return insights.sort((a, b) => b.priority - a.priority);
  };

  // Load and setup insights
  const loadInsights = () => {
    const insights = generateComprehensiveInsights();
    if (insights.length > 0) {
      setAllInsights(insights);
      setCurrentIndex(0);
      updateCurrentInsight(insights, 0);
    }
  };

  // Update current insight display
  const updateCurrentInsight = (insights, index) => {
    if (insights.length === 0) {
      setCurrentInsight('Upload CSV to see participant insights');
      setInsightType('info');
      return;
    }
    
    const insight = insights[index];
    setCurrentInsight(`${insight.icon} ${insight.content}`);
    setInsightType(insight.type);
  };

  // Navigation functions
  const goToNext = () => {
    if (allInsights.length === 0) return;
    const nextIndex = (currentIndex + 1) % allInsights.length;
    setCurrentIndex(nextIndex);
    updateCurrentInsight(allInsights, nextIndex);
  };

  const goToPrevious = () => {
    if (allInsights.length === 0) return;
    const prevIndex = currentIndex === 0 ? allInsights.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    updateCurrentInsight(allInsights, prevIndex);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (currentInsight) {
      navigator.clipboard.writeText(currentInsight.replace(/[^\w\s:,"'-]/g, ''));
      setCopiedAlert(true);
      setTimeout(() => setCopiedAlert(false), 2000);
    }
  };

  // Share functionality
  const shareInsight = () => {
    if (navigator.share && currentInsight) {
      navigator.share({
        title: 'Jagriti Yatra Insight',
        text: currentInsight.replace(/[^\w\s:,"'-]/g, ''),
      });
    } else {
      copyToClipboard();
    }
  };

  // Generate WhatsApp report
  const generateWhatsAppReport = () => {
    const stats = generateComprehensiveInsights();
    const stateCount = new Set(participants.map(p => p.state || p.State || p.location_state).filter(Boolean)).size;
    const districtCount = new Set(participants.map(p => p.district || p.District || p.city || p.City).filter(Boolean)).size;
    const femaleCount = participants.filter(p => (p.gender || p.Gender || '').toLowerCase().includes('female')).length;
    const femalePercent = Math.round((femaleCount / participants.length) * 100);
    const topState = Object.entries(participants.reduce((acc, p) => {
      const state = p.state || p.State || p.location_state;
      if (state) acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {})).sort((a, b) => b[1] - a[1])[0];
    
    const today = new Date().toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });

    const report = `📊 *Jagriti Yatra Daily Update*
📅 ${today}

*Key Metrics:*
• Total Participants: ${participants.length}/525 (${Math.round((participants.length / 525) * 100)}%)
• States Covered: ${stateCount}
• Districts Represented: ${districtCount}
• Gender Diversity: ${femalePercent}% Women

*Top State:* ${topState ? `${topState[0]} (${topState[1]} participants)` : 'N/A'}

*Categories:*
• Participants: ${participants.filter(p => !p.yatri_type || p.yatri_type.toLowerCase() === 'participant').length}/450
• Facilitators: ${participants.filter(p => p.yatri_type && p.yatri_type.toLowerCase() === 'facilitator').length}/75

_Building India's largest network of changemakers!_ 🚀

#JagritiYatra`;

    return report;
  };

  // Generate Email report
  const generateEmailReport = () => {
    const stateCount = new Set(participants.map(p => p.state || p.State || p.location_state).filter(Boolean)).size;
    const districtCount = new Set(participants.map(p => p.district || p.District || p.city || p.City).filter(Boolean)).size;
    const femaleCount = participants.filter(p => (p.gender || p.Gender || '').toLowerCase().includes('female')).length;
    const femalePercent = Math.round((femaleCount / participants.length) * 100);
    const occupationCount = new Set(participants.map(p => p.occupation || p.Occupation || p.profession).filter(Boolean)).size;
    const companyCount = new Set(participants.map(p => p.company || p.Company || p.organization).filter(Boolean)).size;
    
    const today = new Date().toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    const topStates = Object.entries(participants.reduce((acc, p) => {
      const state = p.state || p.State || p.location_state;
      if (state) acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {})).sort((a, b) => b[1] - a[1]).slice(0, 3);

    const report = `Subject: Jagriti Yatra Progress Report - ${today}

Dear Team,

Please find below the updated metrics for Jagriti Yatra as of ${today}:

EXECUTIVE SUMMARY
------------------
Total Registrations: ${participants.length} out of 525 (${Math.round((participants.length / 525) * 100)}% capacity)
Geographic Reach: ${stateCount} states, ${districtCount} districts
Gender Diversity: ${femalePercent}% female participation
Professional Diversity: ${occupationCount} different professions from ${companyCount}+ organizations

PARTICIPANT BREAKDOWN
---------------------
• Participants: ${participants.filter(p => !p.yatri_type || p.yatri_type.toLowerCase() === 'participant').length} / 450 seats
• Facilitators: ${participants.filter(p => p.yatri_type && p.yatri_type.toLowerCase() === 'facilitator').length} / 75 seats

TOP PERFORMING STATES
---------------------
${topStates.map((state, idx) => `${idx + 1}. ${state[0]}: ${state[1]} participants`).join('\n')}

KEY HIGHLIGHTS
--------------
• Strong nationwide representation with participants from ${stateCount} states
• Diverse professional backgrounds ensuring cross-sector collaboration
• Excellent gender diversity exceeding industry benchmarks
• On track to meet capacity targets

Best regards,
Jagriti Yatra Team`;

    return report;
  };

  // Generate crisp report
  const generateCrispReport = () => {
    const stateCount = new Set(participants.map(p => p.state || p.State || p.location_state).filter(Boolean)).size;
    const districtCount = new Set(participants.map(p => p.district || p.District || p.city || p.City).filter(Boolean)).size;
    const femalePercent = Math.round((participants.filter(p => (p.gender || p.Gender || '').toLowerCase().includes('female')).length / participants.length) * 100);
    
    const report = `📊 Quick Stats:
• ${participants.length}/525 registered (${Math.round((participants.length / 525) * 100)}%)
• ${stateCount} states, ${districtCount} districts
• ${femalePercent}% women
• ${participants.filter(p => !p.yatri_type || p.yatri_type.toLowerCase() === 'participant').length}/450 participants
• ${participants.filter(p => p.yatri_type && p.yatri_type.toLowerCase() === 'facilitator').length}/75 facilitators`;

    return report;
  };

  // Copy report to clipboard
  const copyReport = (type) => {
    let report = '';
    switch(type) {
      case 'whatsapp':
        report = generateWhatsAppReport();
        break;
      case 'email':
        report = generateEmailReport();
        break;
      case 'crisp':
        report = generateCrispReport();
        break;
    }
    navigator.clipboard.writeText(report);
    setCopiedAlert(true);
    setTimeout(() => setCopiedAlert(false), 2000);
    setShowReportModal(false);
  };

  // Auto-rotation setup
  useEffect(() => {
    if (participants.length > 0) {
      loadInsights();
    }
  }, [participants]);

  useEffect(() => {
    if (allInsights.length > 0 && !isPaused) {
      intervalRef.current = setInterval(goToNext, 15000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [allInsights, currentIndex, isPaused]);

  if (!showBanner || !currentInsight) return null;

  // Dynamic color based on insight type
  const getTypeColor = () => {
    switch(insightType) {
      case 'story': return '#8b5cf6';
      case 'achievement': return '#f59e0b';
      case 'impact': return '#ec4899';
      case 'journey': return '#06b6d4';
      case 'growth': return '#10b981';
      case 'passion': return '#f43f5e';
      case 'professional': return '#3b82f6';
      case 'funfact': return '#6366f1';
      case 'diversity': return '#06b6d4';
      case 'network': return '#3b82f6';
      case 'demographic': return '#8b5cf6';
      case 'education': return '#10b981';
      case 'inspiration': return '#ef4444';
      case 'board': return '#1e293b'; // Dark professional color for board meetings
      case 'social': return '#e11d48'; // Vibrant pink for social media
      case 'meeting': return '#0891b2'; // Business cyan for meetings
      case 'executive': return '#7c3aed'; // Executive purple
      default: return '#6366f1';
    }
  };

  return (
    <>
      {/* Copied Alert */}
      {copiedAlert && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#10b981',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease'
        }}>
          ✓ Copied to clipboard
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
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
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Generate Report
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} color="#6b7280" />
              </button>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* WhatsApp Report */}
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: '#f9fafb'
              }}
              onClick={() => copyReport('whatsapp')}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#25d366',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MessageCircle size={20} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 4px 0'
                    }}>
                      WhatsApp Report
                    </h4>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      Daily update with key metrics and emojis
                    </p>
                  </div>
                  <Copy size={16} color="#6b7280" />
                </div>
              </div>

              {/* Email Report */}
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: '#f9fafb'
              }}
              onClick={() => copyReport('email')}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Mail size={20} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 4px 0'
                    }}>
                      Email Report
                    </h4>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      Professional format with executive summary
                    </p>
                  </div>
                  <Copy size={16} color="#6b7280" />
                </div>
              </div>

              {/* Crisp Report */}
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: '#f9fafb'
              }}
              onClick={() => copyReport('crisp')}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={20} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 4px 0'
                    }}>
                      Quick Stats
                    </h4>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      Bullet points for quick sharing
                    </p>
                  </div>
                  <Copy size={16} color="#6b7280" />
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#6b7280',
              textAlign: 'center'
            }}>
              Click any report type to copy to clipboard
            </div>
          </div>
        </div>
      )}

      <div style={{
        background: isExpanded 
          ? 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)' 
          : 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
        borderRadius: '16px',
        padding: isExpanded ? '24px 32px' : '16px 24px',
        marginBottom: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: isExpanded 
          ? '0 10px 40px rgba(0,0,0,0.08)' 
          : '0 2px 8px rgba(0,0,0,0.04)',
        position: 'relative',
        minHeight: isExpanded ? '200px' : (insightType === 'story' ? '120px' : 'auto'),
        transition: 'all 0.3s ease'
      }}>
        {/* Animated background accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: `linear-gradient(90deg, ${getTypeColor()} 0%, ${getTypeColor()}88 50%, ${getTypeColor()} 100%)`,
          opacity: 0.8,
          borderRadius: '16px 16px 0 0',
          animation: 'shimmer 3s infinite'
        }} />
        
        {/* Progress indicator */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '2px',
          background: '#e5e7eb',
          borderRadius: '0 0 16px 16px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${((currentIndex + 1) / allInsights.length) * 100}%`,
            height: '100%',
            background: getTypeColor(),
            transition: 'width 0.3s ease'
          }} />
        </div>

        <div style={{
          display: 'flex',
          flexDirection: isExpanded ? 'column' : 'row',
          gap: isExpanded ? '20px' : '16px'
        }}>
          {/* Header with type and counter */}
          {isExpanded && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  padding: '6px 12px',
                  background: `${getTypeColor()}15`,
                  borderRadius: '8px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: getTypeColor(),
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {insightType}
                  </span>
                </div>
                <span style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  {currentIndex + 1} of {allInsights.length} insights
                </span>
              </div>
            </div>
          )}

          {/* Main content area */}
          <div style={{ 
            display: 'flex', 
            alignItems: isExpanded ? 'flex-start' : 'center',
            gap: '12px',
            flex: 1,
            minWidth: 0
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: isExpanded ? '48px' : '32px',
              height: isExpanded ? '48px' : '32px',
              borderRadius: '12px',
              background: `${getTypeColor()}15`,
              flexShrink: 0
            }}>
              <Sparkles size={isExpanded ? 24 : 16} color={getTypeColor()} />
            </div>
            
            <div style={{ flex: 1 }}>
              <span style={{
                color: '#1f2937',
                fontSize: isExpanded ? '16px' : '14px',
                fontWeight: '500',
                lineHeight: '1.6',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                display: 'block'
              }}>
                {isLoading ? 'Loading insights...' : currentInsight}
              </span>
              
              {/* Show category in expanded mode */}
              {isExpanded && allInsights[currentIndex] && (
                <div style={{
                  marginTop: '12px',
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: '#f3f4f6',
                    borderRadius: '4px',
                    color: '#6b7280',
                    textTransform: 'capitalize'
                  }}>
                    {allInsights[currentIndex].category}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: '#f3f4f6',
                    borderRadius: '4px',
                    color: '#6b7280'
                  }}>
                    Priority: {'⭐'.repeat(allInsights[currentIndex].priority)}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Controls */}
          <div style={{ 
            display: 'flex', 
            alignItems: isExpanded ? 'flex-start' : 'center',
            gap: isExpanded ? '8px' : '4px',
            flexShrink: 0,
            flexWrap: isExpanded ? 'wrap' : 'nowrap'
          }}>
            {/* Type indicator (compact mode only) */}
            {!isExpanded && (
              <div style={{
                padding: '4px 8px',
                background: `${getTypeColor()}15`,
                borderRadius: '6px',
                marginRight: '8px'
              }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: getTypeColor(),
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {insightType}
                </span>
              </div>
            )}
            
            {/* Navigation */}
            <button
              onClick={goToPrevious}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                opacity: 0.6,
                transition: 'all 0.2s',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1', e.currentTarget.style.background = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6', e.currentTarget.style.background = 'transparent')}
              title="Previous insight"
            >
              <ChevronLeft size={14} color="#6b7280" />
            </button>
            
            <button
              onClick={goToNext}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                opacity: 0.6,
                transition: 'all 0.2s',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1', e.currentTarget.style.background = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6', e.currentTarget.style.background = 'transparent')}
              title="Next insight"
            >
              <ChevronRight size={14} color="#6b7280" />
            </button>
            
            {/* Play/Pause */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                opacity: 0.6,
                transition: 'all 0.2s',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1', e.currentTarget.style.background = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6', e.currentTarget.style.background = 'transparent')}
              title={isPaused ? "Resume auto-play" : "Pause auto-play"}
            >
              {isPaused ? <Play size={14} color="#6b7280" /> : <Pause size={14} color="#6b7280" />}
            </button>
            
            {/* Refresh */}
            <button
              onClick={goToNext}
              disabled={isLoading}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.3 : 0.6,
                transition: 'all 0.2s',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.opacity = '1', e.currentTarget.style.background = '#f3f4f6')}
              onMouseLeave={(e) => !isLoading && (e.currentTarget.style.opacity = '0.6', e.currentTarget.style.background = 'transparent')}
              title="Refresh"
            >
              <RefreshCw size={14} color="#6b7280" className={isLoading ? 'animate-spin' : ''} />
            </button>
            
            {/* Copy */}
            <button
              onClick={copyToClipboard}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                opacity: 0.6,
                transition: 'all 0.2s',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1', e.currentTarget.style.background = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6', e.currentTarget.style.background = 'transparent')}
              title="Copy to clipboard"
            >
              <Copy size={14} color="#6b7280" />
            </button>
            
            {/* Share */}
            <button
              onClick={shareInsight}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                opacity: 0.6,
                transition: 'all 0.2s',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1', e.currentTarget.style.background = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6', e.currentTarget.style.background = 'transparent')}
              title="Share"
            >
              <Share2 size={14} color="#6b7280" />
            </button>
            
            {/* Generate Report */}
            <button
              onClick={() => setShowReportModal(true)}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                padding: '6px 12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'white',
                fontSize: '12px',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Generate Report"
            >
              <FileText size={14} />
              Report
            </button>
            
            {/* Expand/Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                opacity: 0.6,
                transition: 'all 0.2s',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1', e.currentTarget.style.background = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6', e.currentTarget.style.background = 'transparent')}
              title={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? <Minimize2 size={14} color="#6b7280" /> : <Maximize2 size={14} color="#6b7280" />}
            </button>
            
            {/* Close */}
            <button
              onClick={() => setShowBanner(false)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                opacity: 0.6,
                transition: 'all 0.2s',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1', e.currentTarget.style.background = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6', e.currentTarget.style.background = 'transparent')}
              title="Close"
            >
              <X size={14} color="#6b7280" />
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </>
  );
};

export default UnifiedInsightsBanner;