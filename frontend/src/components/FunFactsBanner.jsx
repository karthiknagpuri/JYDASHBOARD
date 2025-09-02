import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';

const FunFactsBanner = ({ participants = [] }) => {
  const [funFact, setFunFact] = useState('');
  const [isLoadingFact, setIsLoadingFact] = useState(false);
  const [showFunFact, setShowFunFact] = useState(true);

  // Extract bio and profile data from participants
  const extractProfileInsights = () => {
    if (participants.length === 0) return [];
    
    const profileFacts = [];
    
    // Look for participants with interesting bio/profile data
    participants.forEach(p => {
      const name = p.name || p.Name || p.full_name || 'A participant';
      const city = p.city || p.City || '';
      const state = p.state || p.State || p.location_state || '';
      
      // Check for bio/profile fields
      const bio = p.bio || p.Bio || p.profile || p.Profile || 
                  p.about || p.About || p.description || p.Description ||
                  p.story || p.Story || p.background || p.Background ||
                  p.introduction || p.Introduction || '';
      
      // Check for achievements/skills
      const achievement = p.achievement || p.Achievement || 
                         p.accomplishment || p.Accomplishment ||
                         p.award || p.Award || p.recognition || p.Recognition || '';
      
      const skills = p.skills || p.Skills || p.expertise || p.Expertise ||
                     p.specialization || p.Specialization || '';
      
      // Check for education/occupation
      const education = p.education || p.Education || p.qualification || 
                       p.Qualification || p.degree || p.Degree ||
                       p.school || p.School || p.college || p.College ||
                       p.university || p.University || '';
      
      const occupation = p.occupation || p.Occupation || p.profession || 
                        p.Profession || p.job || p.Job || p.work || p.Work ||
                        p.designation || p.Designation || p.role || p.Role || '';
      
      const company = p.company || p.Company || p.organization || 
                     p.Organization || p.employer || p.Employer || '';
      
      // Check for interests/hobbies
      const interests = p.interests || p.Interests || p.hobbies || p.Hobbies ||
                       p.passion || p.Passion || '';
      
      // Generate facts from available data
      if (bio && bio.length > 20) {
        const excerpt = bio.substring(0, 150).trim();
        profileFacts.push(`💫 ${name}: "${excerpt}${bio.length > 150 ? '...' : ''}"`);
      }
      
      if (achievement) {
        profileFacts.push(`🏆 ${name} from ${city || state || 'India'} - ${achievement}`);
      }
      
      if (skills && skills.length > 10) {
        profileFacts.push(`🎯 ${name} specializes in ${skills}`);
      }
      
      if (education && occupation) {
        profileFacts.push(`🎓 ${name}, ${education}, works as ${occupation}${company ? ` at ${company}` : ''}`);
      } else if (occupation && company) {
        profileFacts.push(`💼 ${name} is ${occupation} at ${company}`);
      } else if (education) {
        profileFacts.push(`📚 ${name} from ${city || state || 'India'} - ${education}`);
      }
      
      if (interests) {
        profileFacts.push(`✨ ${name} is passionate about ${interests}`);
      }
    });
    
    // Also gather some interesting statistics
    const stateDistribution = {};
    const cities = new Set();
    const occupations = new Set();
    const companies = new Set();
    let genderCount = { male: 0, female: 0 };
    
    participants.forEach(p => {
      // States and cities
      const state = p.state || p.State || p.location_state || p.address_state;
      if (state) {
        const stateName = state.toString().trim();
        stateDistribution[stateName] = (stateDistribution[stateName] || 0) + 1;
      }
      if (p.city || p.City) cities.add((p.city || p.City).toLowerCase());
      
      // Occupations and companies
      const occ = p.occupation || p.Occupation || p.profession || p.Profession;
      if (occ) occupations.add(occ);
      const comp = p.company || p.Company || p.organization || p.Organization;
      if (comp) companies.add(comp);
      
      // Gender
      const gender = (p.gender || p.Gender || '').toLowerCase();
      if (gender.includes('female')) genderCount.female++;
      else if (gender.includes('male')) genderCount.male++;
    });
    
    const topState = Object.entries(stateDistribution)
      .sort((a, b) => b[1] - a[1])[0];
    
    // Add some aggregate insights too
    if (occupations.size > 10) {
      profileFacts.push(`🌟 ${occupations.size} different professions represented`);
    }
    if (companies.size > 10) {
      profileFacts.push(`🏢 Participants from ${companies.size} organizations`);
    }
    if (cities.size > 20) {
      profileFacts.push(`🌍 ${cities.size} cities across ${Object.keys(stateDistribution).length} states`);
    }
    if (genderCount.female > 0) {
      const femalePercent = Math.round(genderCount.female / participants.length * 100);
      if (femalePercent >= 40) {
        profileFacts.push(`💪 ${femalePercent}% women changemakers leading the way`);
      }
    }
    if (topState && topState[1] > 10) {
      profileFacts.push(`📍 ${topState[0]} leads with ${topState[1]} passionate participants`);
    }
    
    // If no profile data found, fall back to basic stats
    if (profileFacts.length === 0) {
      profileFacts.push(
        `👥 ${participants.length} changemakers registered`,
        `🌍 ${cities.size} cities represented`,
        `🚀 ${Object.keys(stateDistribution).length} states united`
      );
    }
    
    return profileFacts;
  };

  // Fetch fun fact from profile data
  const fetchFunFact = async () => {
    setIsLoadingFact(true);
    
    const profileFacts = extractProfileInsights();
    
    if (profileFacts.length === 0) {
      setFunFact('Upload CSV to see participant insights');
      setIsLoadingFact(false);
      return;
    }
    
    // Pick a random fact from available profile insights
    const randomFact = profileFacts[Math.floor(Math.random() * profileFacts.length)];
    setFunFact(randomFact);
    setIsLoadingFact(false);
  };
  
  useEffect(() => {
    if (participants.length > 0) {
      fetchFunFact();
    }
  }, [participants.length]);

  if (!showFunFact || !funFact) return null;

  return (
    <div style={{
      background: '#f9fafb',
      borderRadius: '8px',
      padding: '10px 16px',
      marginBottom: '16px',
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Sparkles size={14} color="#6366f1" />
        <span style={{
          color: '#374151',
          fontSize: '13px',
          fontWeight: '500'
        }}>
          {isLoadingFact ? '...' : funFact}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <button
          onClick={() => fetchFunFact()}
          disabled={isLoadingFact}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '4px',
            cursor: isLoadingFact ? 'not-allowed' : 'pointer',
            opacity: isLoadingFact ? 0.3 : 0.5,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => !isLoadingFact && (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => !isLoadingFact && (e.currentTarget.style.opacity = '0.5')}
        >
          <RefreshCw size={14} color="#6b7280" />
        </button>
        <button
          onClick={() => setShowFunFact(false)}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            opacity: 0.5,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
        >
          <X size={14} color="#6b7280" />
        </button>
      </div>
    </div>
  );
};

export default FunFactsBanner;