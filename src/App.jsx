import { useState, useEffect } from 'react';

// ============================================
// DATA & CONFIGURATION
// ============================================

const sections = [
  { id: 'injury', name: 'Your Injury', questions: [1, 2, 3, 4] },
  { id: 'symptoms', name: 'Your Symptoms', questions: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
  { id: 'impact', name: 'Overall Impact', questions: [17, 18] },
  { id: 'medical', name: 'Medical Context', questions: [19, 20] },
  { id: 'journey', name: 'Your Recovery Journey', questions: [21, 22] }
];

const questions = [
  // Section 1: Injury Details
  { id: 1, section: 'injury', text: "How long ago did your concussion occur?", subtext: "This helps us understand where you are in recovery.", type: 'single', options: [
    { value: 'days', label: "Within the last few days" },
    { value: '1-2weeks', label: "1-2 weeks ago" },
    { value: '2-4weeks', label: "2-4 weeks ago" },
    { value: '1-3months', label: "1-3 months ago" },
    { value: '3-6months', label: "3-6 months ago" },
    { value: '6months+', label: "More than 6 months ago", flag: 'persistent' }
  ]},
  { id: 2, section: 'injury', text: "How did the concussion happen?", subtext: "Different causes can affect recovery.", type: 'single', options: [
    { value: 'sport', label: "Sports injury (contact or collision)" },
    { value: 'fall', label: "Fall (at home, work, or other)" },
    { value: 'vehicle', label: "Motor vehicle accident" },
    { value: 'assault', label: "Assault or violence" },
    { value: 'work', label: "Workplace injury" },
    { value: 'other', label: "Other or unsure" }
  ]},
  { id: 3, section: 'injury', text: "Did you lose consciousness?", subtext: "This is one factor in understanding injury severity.", type: 'single', options: [
    { value: 'no', label: "No" },
    { value: 'brief', label: "Yes, briefly (seconds)" },
    { value: 'minutes', label: "Yes, for minutes", flag: 'moderate' },
    { value: 'unsure', label: "I'm not sure" }
  ]},
  { id: 4, section: 'injury', text: "Have you had previous concussions?", subtext: "History of concussions can affect recovery.", type: 'single', options: [
    { value: 'none', label: "This is my first concussion" },
    { value: '1-2', label: "1-2 previous concussions" },
    { value: '3+', label: "3 or more previous concussions", flag: 'multi-concussion' },
    { value: 'unsure', label: "I'm not sure" }
  ]},
  
  // Section 2: Symptoms (scale questions)
  { id: 5, section: 'symptoms', text: "Headaches", subtext: "Pain, pressure, or tension in the head.", type: 'scale' },
  { id: 6, section: 'symptoms', text: "Dizziness or balance problems", subtext: "Feeling unsteady, lightheaded, or off-balance.", type: 'scale', flag: 'vestibular' },
  { id: 7, section: 'symptoms', text: "Nausea", subtext: "Feeling sick to your stomach.", type: 'scale' },
  { id: 8, section: 'symptoms', text: "Fatigue", subtext: "Unusual tiredness or exhaustion.", type: 'scale' },
  { id: 9, section: 'symptoms', text: "Light sensitivity", subtext: "Discomfort in bright light or screens.", type: 'scale', flag: 'vision' },
  { id: 10, section: 'symptoms', text: "Noise sensitivity", subtext: "Discomfort with sounds that didn't bother you before.", type: 'scale' },
  { id: 11, section: 'symptoms', text: "Difficulty concentrating", subtext: "Trouble focusing or staying on task.", type: 'scale', flag: 'cognitive' },
  { id: 12, section: 'symptoms', text: "Memory problems", subtext: "Difficulty remembering things or feeling foggy.", type: 'scale', flag: 'cognitive' },
  { id: 13, section: 'symptoms', text: "Sleep disturbance", subtext: "Trouble falling asleep, staying asleep, or sleeping too much.", type: 'scale' },
  { id: 14, section: 'symptoms', text: "Anxiety or nervousness", subtext: "Feeling worried, nervous, or on edge.", type: 'scale', flag: 'mental-health' },
  { id: 15, section: 'symptoms', text: "Irritability or mood changes", subtext: "Feeling more emotional, easily frustrated, or not yourself.", type: 'scale', flag: 'mental-health' },
  { id: 16, section: 'symptoms', text: "Vision problems", subtext: "Blurry vision, trouble reading, or eye strain.", type: 'scale', flag: 'vision' },
  
  // Section 3: Overall Impact
  { id: 17, section: 'impact', text: "How much are concussion symptoms affecting your daily life?", subtext: "Consider work, school, relationships, and activities.", type: 'single', options: [
    { value: 'minimal', label: "Minimal impact — mostly able to do normal activities" },
    { value: 'moderate', label: "Moderate impact — have to limit some activities" },
    { value: 'significant', label: "Significant impact — struggling with work, school, or daily tasks" },
    { value: 'severe', label: "Severe impact — unable to function normally most days" }
  ]},
  { id: 18, section: 'impact', text: "Are symptoms improving, stable, or getting worse?", subtext: "This helps us understand your recovery trajectory.", type: 'single', options: [
    { value: 'improving', label: "Gradually improving" },
    { value: 'stable', label: "About the same — not much change" },
    { value: 'fluctuating', label: "Up and down — good days and bad days" },
    { value: 'worsening', label: "Getting worse or new symptoms appearing" }
  ]},
  
  // Section 4: Medical Context
  { id: 19, section: 'medical', text: "Do any of these apply to you?", subtext: "Select all that apply. These may affect your recovery.", type: 'multi', options: [
    { value: 'migraine-history', label: "History of migraines before concussion", flag: 'migraine' },
    { value: 'mental-health', label: "History of anxiety, depression, or other mental health conditions", flag: 'mental-health-history' },
    { value: 'learning', label: "Learning disability or ADHD" },
    { value: 'neck-injury', label: "Neck pain or injury from the same incident", flag: 'cervical' },
    { value: 'vestibular', label: "Pre-existing balance or inner ear issues" },
    { value: 'none', label: "None of these apply to me", exclusive: true }
  ]},
  { id: 20, section: 'medical', text: "Have you experienced any of these warning signs?", subtext: "These may require urgent medical attention.", type: 'multi', options: [
    { value: 'severe-headache', label: "Severe headache that keeps getting worse", flag: 'red-flag' },
    { value: 'repeated-vomiting', label: "Repeated vomiting", flag: 'red-flag' },
    { value: 'seizure', label: "Seizure or convulsion", flag: 'red-flag' },
    { value: 'weakness', label: "Weakness or numbness in arms or legs", flag: 'red-flag' },
    { value: 'slurred-speech', label: "Slurred speech or confusion getting worse", flag: 'red-flag' },
    { value: 'none', label: "None of these", exclusive: true }
  ]},
  
  // Section 5: Recovery Journey
  { id: 21, section: 'journey', text: "What healthcare have you received for this concussion?", subtext: "This helps us understand your care so far.", type: 'single', options: [
    { value: 'none', label: "I haven't seen anyone yet" },
    { value: 'er-only', label: "Emergency room or urgent care only" },
    { value: 'gp', label: "My regular doctor (GP)" },
    { value: 'specialist', label: "Concussion specialist or clinic" },
    { value: 'multiple', label: "Multiple providers (therapists, specialists, etc.)" }
  ]},
  { id: 22, section: 'journey', text: "What are you hoping to find?", subtext: "Select all that apply.", type: 'multi', options: [
    { value: 'diagnosis', label: "Proper diagnosis and assessment" },
    { value: 'treatment', label: "Active treatment to speed recovery" },
    { value: 'return-sport', label: "Guidance on returning to sport safely" },
    { value: 'return-work', label: "Help returning to work or school" },
    { value: 'persistent', label: "Help with symptoms that aren't improving" },
    { value: 'second-opinion', label: "A second opinion on my care" }
  ]}
];

const scaleOptions = [
  { value: 0, label: "Not experiencing this" },
  { value: 1, label: "Mild — occasionally bothersome" },
  { value: 2, label: "Moderate — frequently affecting me" },
  { value: 3, label: "Severe — significantly impacting my life" }
];

// Resource types for the confirmation screen
const resourceTypes = [
  { id: 'concussion-clinic', label: "Concussion clinic or specialist", description: "Comprehensive concussion assessment and management" },
  { id: 'neurologist', label: "Neurologist", description: "Specialist in brain and nervous system conditions" },
  { id: 'physio', label: "Physiotherapist (concussion-trained)", description: "Physical therapy for concussion recovery" },
  { id: 'vestibular', label: "Vestibular therapist", description: "Treatment for dizziness and balance issues" },
  { id: 'vision', label: "Neuro-optometrist or vision therapy", description: "Assessment and treatment for vision-related symptoms" },
  { id: 'neuropsych', label: "Neuropsychologist", description: "Cognitive assessment and rehabilitation" },
  { id: 'mental-health', label: "Mental health support", description: "Counseling for anxiety, mood, and adjustment" },
  { id: 'gp', label: "Concussion-informed GP", description: "Primary care with concussion expertise" }
];

const categoryContent = {
  'acute-care': {
    name: "Acute Care",
    description: "Recent injury requiring initial assessment and monitoring.",
    positioning: "You're in the early days after your concussion. This is a critical time for proper assessment and beginning the right approach to recovery.",
    helps: [
      "Initial concussion assessment and diagnosis",
      "Education about what to expect during recovery",
      "Guidance on activity modification",
      "Monitoring for any warning signs"
    ],
    monitor: [
      "Any red flag symptoms (severe headache, vomiting, confusion)",
      "Symptoms that significantly worsen",
      "New symptoms appearing"
    ],
    color: "#5da8c7"
  },
  'active-recovery': {
    name: "Active Recovery",
    description: "Progressing through recovery with proper support.",
    positioning: "You're in the active recovery phase. With the right guidance, most people recover well from concussion. Active treatment can help speed your recovery.",
    helps: [
      "Concussion-trained physiotherapy",
      "Gradual return-to-activity guidance",
      "Symptom management strategies",
      "Addressing specific symptoms (vestibular, vision, etc.)"
    ],
    monitor: [
      "Symptoms plateau or stop improving",
      "Unable to progress with return-to-activity",
      "Significant impact on work or school"
    ],
    color: "#4a9bb8"
  },
  'persistent-symptoms': {
    name: "Persistent Symptoms",
    description: "Symptoms lasting longer than typical recovery.",
    positioning: "Recovery is taking longer than expected, which happens for some people. You may benefit from more specialized assessment and targeted treatment.",
    helps: [
      "Comprehensive re-evaluation",
      "Specialized therapies (vestibular, vision, cognitive)",
      "Multidisciplinary concussion clinic",
      "Addressing contributing factors"
    ],
    monitor: [
      "Symptoms continuing to worsen",
      "New symptoms developing",
      "Significant functional decline"
    ],
    urgent: false,
    color: "#3a8aa6"
  },
  'complex-presentation': {
    name: "Complex Presentation",
    description: "Multiple factors requiring comprehensive care.",
    positioning: "Your situation has some complexity that benefits from specialist expertise. This isn't about severity — it's about getting the right team to address your specific needs.",
    helps: [
      "Multidisciplinary concussion clinic",
      "Specialist referrals based on your specific symptoms",
      "Coordinated care approach",
      "Treatment for co-occurring issues"
    ],
    monitor: [
      "Any red flag symptoms require immediate attention",
      "Follow specialist recommendations closely",
      "Track progress with specific treatments"
    ],
    urgent: true,
    color: "#2d7a94"
  },
  'return-to-activity': {
    name: "Return-to-Activity Focus",
    description: "Ready to return to sport, work, or school safely.",
    positioning: "You're looking to get back to your normal activities. Proper guidance ensures you return safely without risking setbacks.",
    helps: [
      "Graduated return-to-play or return-to-learn protocols",
      "Clearance testing and assessment",
      "Managing any residual symptoms",
      "Prevention strategies for the future"
    ],
    monitor: [
      "Symptoms returning or worsening with activity",
      "Difficulty progressing through stages",
      "Any new concerns"
    ],
    color: "#4a9bb8"
  }
};

// Generate unique job ID
function generateJobId() {
  return 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ============================================
// CATEGORY DETERMINATION LOGIC
// ============================================
function determineCategory(answers) {
  const flags = [];
  
  // Check for red flags (Q20)
  const q20 = answers[20] || [];
  if (Array.isArray(q20) && q20.some(v => v !== 'none')) {
    flags.push('red-flag');
  }
  
  // Check for persistent symptoms (6+ months)
  if (answers[1] === '6months+') {
    flags.push('persistent');
  }
  
  // Check for multiple concussions
  if (answers[4] === '3+') {
    flags.push('multi-concussion');
  }
  
  // Check for complex factors (Q19)
  const q19 = answers[19] || [];
  const complexFactors = Array.isArray(q19) && q19.filter(v => v !== 'none').length >= 2;
  if (complexFactors) {
    flags.push('complex');
  }
  
  // Red flags = urgent/complex
  if (flags.includes('red-flag')) {
    return 'complex-presentation';
  }
  
  // Persistent symptoms pathway
  if (flags.includes('persistent') || flags.includes('multi-concussion')) {
    return 'persistent-symptoms';
  }
  
  // Complex factors
  if (flags.includes('complex')) {
    return 'complex-presentation';
  }
  
  // Check what they're hoping for (Q22)
  const hopes = answers[22] || [];
  if (hopes.includes('return-sport') || hopes.includes('return-work')) {
    // If symptoms minimal and looking to return
    if (answers[17] === 'minimal' && answers[18] === 'improving') {
      return 'return-to-activity';
    }
  }
  
  // Timeline-based
  const timeline = answers[1];
  if (timeline === 'days' || timeline === '1-2weeks') {
    return 'acute-care';
  }
  
  // Default to active recovery
  return 'active-recovery';
}

// ============================================
// SMART INFERENCE LOGIC
// ============================================
function inferResourceSuggestions(answers) {
  const suggestions = [];
  
  // Haven't seen anyone or ER only → need proper assessment
  const careReceived = answers[21];
  if (careReceived === 'none' || careReceived === 'er-only') {
    suggestions.push({ id: 'concussion-clinic', reason: "You need proper concussion assessment" });
  }
  
  // Vestibular symptoms (Q6 dizziness)
  if ((answers[6] || 0) >= 2) {
    suggestions.push({ id: 'vestibular', reason: "Your balance symptoms would benefit from specialist treatment" });
  }
  
  // Vision symptoms (Q9 light sensitivity, Q16 vision problems)
  if ((answers[9] || 0) >= 2 || (answers[16] || 0) >= 2) {
    suggestions.push({ id: 'vision', reason: "Your visual symptoms suggest vision therapy may help" });
  }
  
  // Cognitive symptoms (Q11, Q12)
  if ((answers[11] || 0) >= 2 || (answers[12] || 0) >= 2) {
    if (answers[1] === '3-6months' || answers[1] === '6months+') {
      suggestions.push({ id: 'neuropsych', reason: "Ongoing cognitive symptoms may benefit from assessment" });
    }
  }
  
  // Mental health symptoms (Q14 anxiety, Q15 mood)
  if ((answers[14] || 0) >= 2 || (answers[15] || 0) >= 2) {
    suggestions.push({ id: 'mental-health', reason: "Mood and anxiety symptoms are common and treatable" });
  }
  
  // Neck involvement (Q19)
  const q19 = answers[19] || [];
  if (q19.includes('neck-injury')) {
    suggestions.push({ id: 'physio', reason: "Neck involvement often benefits from physio" });
  }
  
  // Persistent or complex → neurologist
  if (answers[1] === '6months+' || answers[4] === '3+') {
    suggestions.push({ id: 'neurologist', reason: "Complex or persistent symptoms may need neurologist input" });
  }
  
  // Return to activity focus
  const hopes = answers[22] || [];
  if (hopes.includes('return-sport') || hopes.includes('return-work')) {
    if (!suggestions.find(s => s.id === 'physio')) {
      suggestions.push({ id: 'physio', reason: "Physio can guide safe return to activity" });
    }
  }
  
  // If no clinic suggested yet and significant impact
  if (!suggestions.find(s => s.id === 'concussion-clinic') && 
      (answers[17] === 'significant' || answers[17] === 'severe')) {
    suggestions.push({ id: 'concussion-clinic', reason: "Your symptoms warrant comprehensive care" });
  }
  
  // Always suggest GP if haven't seen one
  if (careReceived === 'none' && !suggestions.find(s => s.id === 'gp')) {
    suggestions.push({ id: 'gp', reason: "A good starting point for concussion care" });
  }
  
  return suggestions;
}

function getSymptomProfile(answers) {
  const symptoms = [];
  
  // Headache
  if ((answers[5] || 0) >= 2) symptoms.push({ name: 'Headaches', severity: answers[5] });
  
  // Vestibular
  if ((answers[6] || 0) >= 2) symptoms.push({ name: 'Dizziness/balance', severity: answers[6] });
  
  // Fatigue
  if ((answers[8] || 0) >= 2) symptoms.push({ name: 'Fatigue', severity: answers[8] });
  
  // Vision
  const vision = Math.max(answers[9] || 0, answers[16] || 0);
  if (vision >= 2) symptoms.push({ name: 'Vision/light sensitivity', severity: vision });
  
  // Cognitive
  const cognitive = Math.max(answers[11] || 0, answers[12] || 0);
  if (cognitive >= 2) symptoms.push({ name: 'Cognitive (focus/memory)', severity: cognitive });
  
  // Sleep
  if ((answers[13] || 0) >= 2) symptoms.push({ name: 'Sleep problems', severity: answers[13] });
  
  // Mood
  const mood = Math.max(answers[14] || 0, answers[15] || 0);
  if (mood >= 2) symptoms.push({ name: 'Mood changes', severity: mood });
  
  // Sort by severity
  symptoms.sort((a, b) => b.severity - a.severity);
  
  return symptoms.slice(0, 3); // Top 3
}

// ============================================
// COMPONENTS
// ============================================

function TopNav({ currentPage, onNavigate, onStartAssessment, inAssessment }) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'categories', label: 'The Categories' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'foundations', label: 'Foundations' },
    { id: 'resources', label: 'Resources' },
  ];

  return (
    <nav className="top-nav">
      <div className="top-nav-container">
        <button className="nav-logo" onClick={() => onNavigate('home')}>
          <div className="nav-logo-icon">
            <svg viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="url(#logoGradientConc)"/>
              <path d="M16 8 C12 8, 9 11, 9 15 C9 19, 12 22, 16 24 C20 22, 23 19, 23 15 C23 11, 20 8, 16 8" fill="white" opacity="0.9"/>
              <circle cx="16" cy="15" r="3" fill="url(#logoGradientConc)"/>
              <defs>
                <linearGradient id="logoGradientConc" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5da8c7"/>
                  <stop offset="100%" stopColor="#2d7a94"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          Concussion Navigator
        </button>
        
        <button className="nav-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        
        <div className={`top-nav-links ${menuOpen ? 'open' : ''}`}>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`top-nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => { onNavigate(item.id); setMenuOpen(false); }}
            >
              {item.label}
            </button>
          ))}
          {!inAssessment && (
            <button className="nav-cta" onClick={() => { onStartAssessment(); setMenuOpen(false); }}>
              Start Assessment
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function ContextNav({ context, data }) {
  if (context === 'results') {
    return (
      <div className="context-nav">
        <div className="context-nav-container">
          <div className="context-breadcrumb">
            <span className="context-label">Your Results</span>
            <span className="context-separator">→</span>
            <span className="context-current">{categoryContent[data.category]?.name}</span>
          </div>
          <div className="context-actions">
            <button 
              className={`context-tab ${data.view === 'results' ? 'active' : ''}`}
              onClick={() => data.setView('results')}
            >
              Your Category
            </button>
            <button 
              className={`context-tab ${data.view === 'search' ? 'active' : ''}`}
              onClick={() => data.setView('search')}
            >
              Find Resources
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (context === 'search') {
    return (
      <div className="context-nav">
        <div className="context-nav-container">
          <div className="context-breadcrumb">
            <span className="context-label">Find Resources</span>
            <span className="context-separator">→</span>
            <span className="context-current">{data.location || 'Enter location'}</span>
          </div>
          <button onClick={data.onBack} className="context-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  if (context === 'page') {
    return (
      <div className="context-nav">
        <div className="context-nav-container">
          <div className="context-breadcrumb">
            <span className="context-current">{data.title}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function SearchLoading({ elapsedTime }) {
  const stages = [
    { name: "Starting search", minTime: 0 },
    { name: "Searching for concussion clinics", minTime: 5 },
    { name: "Finding physiotherapists", minTime: 15 },
    { name: "Looking for specialists", minTime: 25 },
    { name: "Searching vestibular and vision therapy", minTime: 35 },
    { name: "Compiling results", minTime: 45 }
  ];

  const currentStageIndex = stages.reduce((acc, stage, idx) => 
    elapsedTime >= stage.minTime ? idx : acc, 0);

  return (
    <div className="search-loading-container">
      <div className="search-loading-spinner">
        <svg viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke="#d4e9f0" strokeWidth="4"/>
          <circle cx="25" cy="25" r="20" fill="none" stroke="#5da8c7" strokeWidth="4" 
                  strokeDasharray="125.6" strokeDashoffset="100" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
      <h2>Building your resource report...</h2>
      <p className="search-stage">{stages[currentStageIndex].name}...</p>
      <p className="search-time">{Math.floor(elapsedTime)} seconds</p>
      <p className="search-note">This comprehensive search can take 2-3 minutes. We're searching for real, verified resources in your area.</p>
    </div>
  );
}

function LandingPage({ onStartAssessment, onNavigate }) {
  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Navigation for Concussion Recovery</span>
          <h1>Find the right support for your concussion recovery</h1>
          <p className="hero-subtitle">
            A free, private assessment that helps you understand your symptoms and connects you with concussion specialists, therapists, and support in your area.
          </p>
          <div className="hero-actions">
            <button className="primary-button large" onClick={onStartAssessment}>
              Start the Assessment
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="secondary-button large" onClick={() => onNavigate('how-it-works')}>
              How It Works
            </button>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-content">
          <h2>Recovery isn't always straightforward</h2>
          <p>Headaches, brain fog, dizziness, fatigue — these symptoms are real, and they affect your life. Yet many people are told to "just rest" without proper guidance, or struggle to find specialists who understand concussion.</p>
          <p style={{marginTop: '1rem'}}>Our assessment helps you understand your recovery stage and find healthcare providers who can actually help.</p>
        </div>
      </section>

      <section className="landing-section alt-bg">
        <div className="section-content">
          <h2>Who this is for</h2>
          <div className="audience-grid">
            <div className="audience-card">
              <div className="audience-icon">🤕</div>
              <h4>Recently concussed</h4>
              <p>Looking for proper assessment and guidance on recovery</p>
            </div>
            <div className="audience-card">
              <div className="audience-icon">⏳</div>
              <h4>Not improving as expected</h4>
              <p>Symptoms lasting longer than you were told they would</p>
            </div>
            <div className="audience-card">
              <div className="audience-icon">🏃</div>
              <h4>Ready to return to activity</h4>
              <p>Want safe guidance to get back to sport, work, or school</p>
            </div>
            <div className="audience-card">
              <div className="audience-icon">🔍</div>
              <h4>Seeking specialist care</h4>
              <p>Need help finding the right concussion experts</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-content">
          <h2>How it works</h2>
          <div className="process-cards">
            <div className="process-card">
              <div className="process-icon">📝</div>
              <h4>Complete the Assessment</h4>
              <p>22 questions about your injury, symptoms, and recovery. Takes about 8 minutes.</p>
            </div>
            <div className="process-card">
              <div className="process-icon">✓</div>
              <h4>Confirm Your Needs</h4>
              <p>We'll suggest resources based on your answers. Add or remove anything before we search.</p>
            </div>
            <div className="process-card">
              <div className="process-icon">🔍</div>
              <h4>Find Local Resources</h4>
              <p>We search for real concussion specialists, clinics, and therapists in your area.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section cta-section">
        <div className="section-content centered">
          <h2>Ready to find the right support?</h2>
          <p>Our assessment is free, private, and takes about 8 minutes.</p>
          <button className="primary-button large" onClick={onStartAssessment}>
            Start the Assessment
          </button>
        </div>
      </section>
    </div>
  );
}

function CategoriesPage({ onStartAssessment }) {
  return (
    <div className="content-page">
      <div className="page-content">
        <h1>Understanding the Categories</h1>
        <p className="page-intro">Based on your assessment, we'll help you understand where you are in recovery and what kind of support typically helps at each stage.</p>
        
        <div className="categories-grid">
          {Object.entries(categoryContent).map(([key, cat]) => (
            <div key={key} className="category-preview" style={{'--cat-color': cat.color}}>
              <h3>{cat.name}</h3>
              <p className="cat-desc">{cat.description}</p>
              <p className="cat-positioning">{cat.positioning}</p>
            </div>
          ))}
        </div>
        
        <div className="page-cta">
          <button className="primary-button" onClick={onStartAssessment}>Take the Assessment</button>
        </div>
      </div>
    </div>
  );
}

function HowItWorksPage() {
  return (
    <div className="content-page">
      <div className="page-content narrow">
        <h1>How It Works</h1>
        
        <section className="content-section">
          <h2>The Assessment</h2>
          <p>Our 22-question assessment covers your injury details, current symptoms, their impact on your life, and your recovery journey so far. It takes about 8 minutes.</p>
          <p>Your answers are completely private — we don't store them or share them with anyone.</p>
        </section>
        
        <section className="content-section">
          <h2>Smart Recommendations</h2>
          <p>Based on your answers, we identify patterns that suggest which types of support would help most. For example:</p>
          <ul>
            <li>Dizziness and balance problems → Vestibular therapy</li>
            <li>Light sensitivity and reading difficulty → Vision therapy</li>
            <li>Persistent cognitive symptoms → Neuropsychology assessment</li>
            <li>Returning to sport → Concussion-trained physiotherapy</li>
          </ul>
        </section>
        
        <section className="content-section">
          <h2>Finding Real Resources</h2>
          <p>Once you confirm what you're looking for, we search for actual providers in your area. Not just generic advice — real clinics, named specialists, and verified services.</p>
        </section>
        
        <section className="content-section">
          <h2>Important Notes</h2>
          <p><strong>This is not a diagnosis.</strong> Only a qualified healthcare provider can diagnose a concussion or concussion-related conditions.</p>
          <p><strong>If you have red flag symptoms</strong> (severe worsening headache, repeated vomiting, seizures, weakness, or worsening confusion), seek emergency care immediately.</p>
        </section>
      </div>
    </div>
  );
}

function FoundationsPage() {
  return (
    <div className="content-page">
      <div className="page-content narrow">
        <h1>Concussion Recovery Foundations</h1>
        <p className="page-intro">While you're finding the right professional support, here are evidence-based foundations for concussion recovery.</p>
        
        <section className="content-section">
          <h2>Relative Rest, Not Complete Rest</h2>
          <p>Current evidence supports "relative rest" rather than complete rest in a dark room. This means reducing cognitive and physical demands while still maintaining some light activity.</p>
          <p>Complete rest for more than 1-2 days can actually slow recovery. Gentle walking and light activity are usually beneficial.</p>
        </section>
        
        <section className="content-section">
          <h2>Gradual Return to Activity</h2>
          <p>Recovery involves gradually increasing activity levels. This applies to physical activity, cognitive tasks (work, school, screen time), and social activity.</p>
          <p>The key is staying below the threshold that significantly worsens symptoms. Some mild increase in symptoms with activity can be normal.</p>
        </section>
        
        <section className="content-section">
          <h2>Sleep and Rest</h2>
          <p>Good sleep is crucial for brain recovery. Maintain regular sleep schedules, avoid screens before bed, and allow for extra rest if needed.</p>
          <p>Napping can help in early recovery, but try to limit naps if they're affecting nighttime sleep.</p>
        </section>
        
        <section className="content-section">
          <h2>Managing Symptoms</h2>
          <p>Identify triggers that worsen your symptoms and modify exposure to them. Common triggers include screens, bright lights, loud environments, and prolonged concentration.</p>
          <p>Use strategies like taking breaks, wearing sunglasses, using blue light filters, and breaking tasks into smaller chunks.</p>
        </section>
        
        <section className="content-section">
          <h2>When to Seek Help</h2>
          <p>Contact a healthcare provider if:</p>
          <ul>
            <li>Symptoms are not improving after 2 weeks</li>
            <li>Symptoms significantly worsen</li>
            <li>You're unable to return to work, school, or normal activities</li>
            <li>You experience any red flag symptoms</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function ResourcesPage() {
  return (
    <div className="content-page">
      <div className="page-content narrow">
        <h1>Helpful Resources</h1>
        <p className="page-intro">Trusted information and tools for concussion recovery.</p>
        
        <section className="content-section">
          <h2>Education</h2>
          <ul className="resource-list">
            <li><a href="https://concussionfoundation.org/" target="_blank" rel="noopener noreferrer">Concussion Foundation</a> — Education and advocacy</li>
            <li><a href="https://www.cdc.gov/heads-up/" target="_blank" rel="noopener noreferrer">CDC HEADS UP</a> — Concussion information for various audiences</li>
            <li><a href="https://completeconcussions.com/resources/" target="_blank" rel="noopener noreferrer">Complete Concussions</a> — Educational resources and research</li>
          </ul>
        </section>
        
        <section className="content-section">
          <h2>Return-to-Sport Protocols</h2>
          <ul className="resource-list">
            <li><a href="https://bjsm.bmj.com/content/57/11/695" target="_blank" rel="noopener noreferrer">Amsterdam Consensus Statement (2023)</a> — Latest international guidelines</li>
          </ul>
        </section>
        
        <section className="content-section">
          <h2>Support Communities</h2>
          <ul className="resource-list">
            <li><a href="https://www.reddit.com/r/Concussion/" target="_blank" rel="noopener noreferrer">r/Concussion</a> — Reddit community for peer support</li>
          </ul>
        </section>
        
        <section className="content-section">
          <h2>Find Specialists</h2>
          <ul className="resource-list">
            <li><a href="https://concussionfoundation.org/clinicdirectory" target="_blank" rel="noopener noreferrer">Concussion Clinic Directory</a> — Find clinics in the US</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function ContactPage() {
  return (
    <div className="content-page">
      <div className="page-content narrow">
        <h1>Contact Us</h1>
        <p>Have feedback or questions about Concussion Navigator? We'd love to hear from you.</p>
        <form className="contact-form" name="contact" method="POST" data-netlify="true">
          <input type="hidden" name="form-name" value="contact" />
          <div className="form-group">
            <label htmlFor="email">Your email (optional)</label>
            <input type="email" id="email" name="email" />
          </div>
          <div className="form-group">
            <label htmlFor="message">Your message</label>
            <textarea id="message" name="message" rows="5" required></textarea>
          </div>
          <button type="submit" className="primary-button">Send Message</button>
        </form>
      </div>
    </div>
  );
}

// ============================================
// CONFIRMATION SCREEN COMPONENT
// ============================================
function ConfirmationScreen({ suggestions, onConfirm, onBack, symptoms }) {
  const [selected, setSelected] = useState(() => suggestions.map(s => s.id));

  const toggleResource = (id) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  // Resources not in suggestions
  const otherResources = resourceTypes.filter(r => !suggestions.find(s => s.id === r.id));

  return (
    <div className="confirmation-screen">
      <div className="confirmation-header">
        <h1>Based on what you shared...</h1>
        <p>We think these resources would help. Add or remove anything before we search.</p>
      </div>

      {symptoms.length > 0 && (
        <div className="confirmation-symptoms">
          <h3>Your top symptoms:</h3>
          <div className="symptom-tags">
            {symptoms.map((s, idx) => (
              <span key={idx} className={`symptom-tag severity-${s.severity}`}>
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="confirmation-suggestions">
        <h2>Suggested for you</h2>
        <div className="suggestion-list">
          {suggestions.map(suggestion => {
            const resource = resourceTypes.find(r => r.id === suggestion.id);
            const isSelected = selected.includes(suggestion.id);
            return (
              <button
                key={suggestion.id}
                className={`suggestion-item ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleResource(suggestion.id)}
              >
                <span className="suggestion-check">{isSelected ? '✓' : ''}</span>
                <div className="suggestion-content">
                  <span className="suggestion-label">{resource?.label}</span>
                  <span className="suggestion-reason">{suggestion.reason}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {otherResources.length > 0 && (
        <div className="confirmation-other">
          <h3>Add others</h3>
          <div className="other-resources">
            {otherResources.map(resource => {
              const isSelected = selected.includes(resource.id);
              return (
                <button
                  key={resource.id}
                  className={`other-resource-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleResource(resource.id)}
                >
                  <span className="suggestion-check">{isSelected ? '✓' : '+'}</span>
                  <span>{resource.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="confirmation-actions">
        <button className="primary-button large" onClick={() => onConfirm(selected)}>
          Continue with {selected.length} resource type{selected.length !== 1 ? 's' : ''} →
        </button>
        <button className="text-button" onClick={onBack}>
          ← Back to questions
        </button>
      </div>
    </div>
  );
}

// ============================================
// RESOURCE DETAIL MODAL
// ============================================
function ResourceDetailModal({ isOpen, onClose, resource, stageName, location }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && resource && !summary) {
      fetchDetails();
    }
  }, [isOpen, resource]);

  useEffect(() => {
    if (!isOpen) {
      setSummary(null);
      setError(null);
    }
  }, [isOpen]);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/.netlify/functions/resource-detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: resource.url || null,
          resourceName: resource.name,
          resourceType: resource.type,
          stageName: stageName,
          location: location
        })
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSummary(data.summary);
      }
    } catch (err) {
      setError('Could not load additional details.');
    } finally {
      setLoading(false);
    }
  };

  const renderSummary = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return <h3 key={idx}>{trimmed.replace(/\*\*/g, '')}</h3>;
      }
      if (trimmed.startsWith('- ')) {
        return <li key={idx}>{trimmed.substring(2)}</li>;
      }
      return <p key={idx}>{trimmed}</p>;
    });
  };

  const isValidPhone = (phone) => {
    if (!phone || phone.trim() === '') return false;
    const lower = phone.toLowerCase();
    if (lower.includes('not specified') || lower.includes('n/a') || 
        lower.includes('not available') || lower.includes('none')) return false;
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>{resource.name}</h2>
        <p className="modal-type">{resource.type}</p>
        
        <div className="modal-section">
          <h3>From search results:</h3>
          <p>{resource.description}</p>
          {resource.notes && <p className="modal-notes">{resource.notes}</p>}
        </div>
        
        <div className="modal-section">
          <h3>Additional details:</h3>
          {loading && <p className="modal-loading">Researching this provider...</p>}
          {error && <p className="modal-error">{error}</p>}
          {summary && <div className="modal-summary">{renderSummary(summary)}</div>}
        </div>
        
        <div className="modal-actions">
          {resource.url && (
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="primary-button">
              Visit Website
            </a>
          )}
          {isValidPhone(resource.phone) && (
            <a href={`tel:${resource.phone}`} className="secondary-button">
              Call {resource.phone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN APP COMPONENT
// ============================================
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [inAssessment, setInAssessment] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [results, setResults] = useState(null);
  const [resultsView, setResultsView] = useState('results');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchPreference, setSearchPreference] = useState('both');
  const [selectedResources, setSelectedResources] = useState([]);
  const [searchStatus, setSearchStatus] = useState('idle');
  const [searchResults, setSearchResults] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [searchStartTime, setSearchStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [detailModal, setDetailModal] = useState({ open: false, resource: null });

  // Timer for search elapsed time
  useEffect(() => {
    let interval;
    if (searchStatus === 'searching' && searchStartTime) {
      interval = setInterval(() => {
        setElapsedTime((Date.now() - searchStartTime) / 1000);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [searchStatus, searchStartTime]);

  // Poll for search results
  useEffect(() => {
    let pollInterval;
    if (jobId && searchStatus === 'searching') {
      pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/.netlify/functions/search-status?jobId=${jobId}`);
          const data = await response.json();
          
          if (data.status === 'complete') {
            setSearchResults(data.results);
            setSearchStatus('complete');
            clearInterval(pollInterval);
          } else if (data.status === 'error') {
            setSearchStatus('error');
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error('Poll error:', err);
        }
      }, 2000);
    }
    return () => clearInterval(pollInterval);
  }, [jobId, searchStatus]);

  const navigate = (page) => {
    setCurrentPage(page);
    setInAssessment(false);
    setShowConfirmation(false);
    setResults(null);
    setResultsView('results');
    setSearchStatus('idle');
    setSearchResults(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startAssessment = () => {
    setAnswers({});
    setInAssessment(true);
    setCurrentPage('assessment');
    setShowConfirmation(false);
    setResults(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exitAssessment = () => {
    setInAssessment(false);
    setCurrentPage('home');
    setAnswers({});
  };

  const handleAnswer = (questionId, value) => {
    const question = questions.find(q => q.id === questionId);
    
    if (question.type === 'multi') {
      const currentAnswers = answers[questionId] || [];
      const option = question.options.find(o => o.value === value);
      
      if (option?.exclusive) {
        setAnswers(prev => ({ ...prev, [questionId]: [value] }));
      } else {
        let newAnswers;
        if (currentAnswers.includes(value)) {
          newAnswers = currentAnswers.filter(v => v !== value);
        } else {
          newAnswers = [...currentAnswers.filter(v => {
            const opt = question.options.find(o => o.value === v);
            return !opt?.exclusive;
          }), value];
        }
        setAnswers(prev => ({ ...prev, [questionId]: newAnswers }));
      }
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: value }));
    }
  };

  const handleSubmitAssessment = () => {
    setShowConfirmation(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToAssessment = () => {
    setShowConfirmation(false);
  };

  const handleConfirmResources = (selected) => {
    setSelectedResources(selected);
    const category = determineCategory(answers);
    setResults({ category, answers });
    setShowConfirmation(false);
    setResultsView('search');
  };

  const startSearch = async () => {
    if (!searchLocation.trim()) return;
    
    const newJobId = generateJobId();
    setJobId(newJobId);
    setSearchStatus('searching');
    setSearchStartTime(Date.now());
    setElapsedTime(0);
    
    const category = results?.category || 'active-recovery';
    const content = categoryContent[category];
    
    try {
      await fetch('/.netlify/functions/search-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: newJobId,
          stage: category,
          stageName: content.name,
          stageHelps: content.helps,
          location: searchLocation,
          preference: searchPreference,
          resourceTypes: selectedResources
        })
      });
    } catch (err) {
      console.error('Search start error:', err);
      setSearchStatus('error');
    }
  };

  // Computed values
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).filter(k => {
    const val = answers[k];
    if (Array.isArray(val)) return val.length > 0;
    return val !== undefined;
  }).length;
  const allAnswered = answeredCount === totalQuestions;

  // ============================================
  // RENDER LOGIC
  // ============================================

  // Static pages
  if (!inAssessment && !results) {
    let PageComponent;
    let pageTitle;
    
    switch (currentPage) {
      case 'categories':
        PageComponent = () => <CategoriesPage onStartAssessment={startAssessment} />;
        pageTitle = 'The Categories';
        break;
      case 'how-it-works':
        PageComponent = HowItWorksPage;
        pageTitle = 'How It Works';
        break;
      case 'foundations':
        PageComponent = FoundationsPage;
        pageTitle = 'Foundations';
        break;
      case 'resources':
        PageComponent = ResourcesPage;
        pageTitle = 'Resources';
        break;
      case 'contact':
        PageComponent = ContactPage;
        pageTitle = 'Contact';
        break;
      default:
        return (
          <div className="app-wrapper">
            <TopNav currentPage={currentPage} onNavigate={navigate} onStartAssessment={startAssessment} inAssessment={inAssessment} />
            <main className="main-content">
              <LandingPage onStartAssessment={startAssessment} onNavigate={navigate} />
            </main>
          </div>
        );
    }
    
    return (
      <div className="app-wrapper">
        <TopNav currentPage={currentPage} onNavigate={navigate} onStartAssessment={startAssessment} inAssessment={inAssessment} />
        <ContextNav context="page" data={{ title: pageTitle }} />
        <main className="main-content">
          <PageComponent />
        </main>
      </div>
    );
  }

  // Results view
  if (results && !inAssessment) {
    const content = categoryContent[results.category];
    
    // Search interface
    if (resultsView === 'search') {
      return (
        <div className="app-wrapper">
          <TopNav currentPage={currentPage} onNavigate={navigate} onStartAssessment={startAssessment} inAssessment={false} />
          <ContextNav context="results" data={{ category: results.category, view: resultsView, setView: setResultsView }} />
          <main className="main-content">
            <div className="search-page">
              {searchStatus === 'idle' && (
                <div className="search-form-container">
                  <h1>Find Resources Near You</h1>
                  <p>We'll search for {selectedResources.length} types of concussion support in your area.</p>
                  
                  <div className="search-form">
                    <div className="form-group">
                      <label htmlFor="location">Your location</label>
                      <input
                        type="text"
                        id="location"
                        placeholder="City, region, or postcode"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Preference</label>
                      <div className="preference-options">
                        <button 
                          className={`pref-option ${searchPreference === 'local' ? 'selected' : ''}`}
                          onClick={() => setSearchPreference('local')}
                        >
                          In-person only
                        </button>
                        <button 
                          className={`pref-option ${searchPreference === 'both' ? 'selected' : ''}`}
                          onClick={() => setSearchPreference('both')}
                        >
                          Both
                        </button>
                        <button 
                          className={`pref-option ${searchPreference === 'remote' ? 'selected' : ''}`}
                          onClick={() => setSearchPreference('remote')}
                        >
                          Telehealth only
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      className="primary-button large full-width" 
                      onClick={startSearch}
                      disabled={!searchLocation.trim()}
                    >
                      Search for Resources
                    </button>
                  </div>
                </div>
              )}
              
              {searchStatus === 'searching' && (
                <SearchLoading elapsedTime={elapsedTime} />
              )}
              
              {searchStatus === 'complete' && searchResults && (
                <div className="search-results">
                  <div className="results-header">
                    <h1>Resources in {searchLocation}</h1>
                    <p>{searchResults.introduction}</p>
                  </div>
                  
                  {searchResults.categories?.map((cat, idx) => (
                    <div key={idx} className="results-category">
                      <h2>{cat.name}</h2>
                      <div className="resources-list">
                        {cat.resources?.map((resource, rIdx) => (
                          <div key={rIdx} className="resource-card">
                            <div className="resource-header">
                              <h3>{resource.name}</h3>
                              <span className="resource-type">{resource.type}</span>
                            </div>
                            <p>{resource.description}</p>
                            {resource.notes && <p className="resource-notes">{resource.notes}</p>}
                            <div className="resource-actions">
                              {resource.url && (
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                                  Website →
                                </a>
                              )}
                              <button 
                                className="text-button"
                                onClick={() => setDetailModal({ open: true, resource })}
                              >
                                More Detail
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {searchResults.additionalNotes && (
                    <div className="results-notes">
                      <p>{searchResults.additionalNotes}</p>
                    </div>
                  )}
                  
                  <div className="results-actions">
                    <button className="secondary-button" onClick={() => {
                      setSearchStatus('idle');
                      setSearchResults(null);
                    }}>
                      Search Another Location
                    </button>
                  </div>
                </div>
              )}
              
              {searchStatus === 'error' && (
                <div className="search-error">
                  <h2>Search encountered an issue</h2>
                  <p>We couldn't complete the search. Please try again.</p>
                  <button className="primary-button" onClick={() => setSearchStatus('idle')}>
                    Try Again
                  </button>
                </div>
              )}
            </div>
            
            <ResourceDetailModal
              isOpen={detailModal.open}
              onClose={() => setDetailModal({ open: false, resource: null })}
              resource={detailModal.resource}
              stageName={content.name}
              location={searchLocation}
            />
          </main>
        </div>
      );
    }
    
    // Category results view
    return (
      <div className="app-wrapper">
        <TopNav currentPage={currentPage} onNavigate={navigate} onStartAssessment={startAssessment} inAssessment={false} />
        <ContextNav context="results" data={{ category: results.category, view: resultsView, setView: setResultsView }} />
        <main className="main-content">
          <div className="results-page">
            <div className="results-card" style={{'--cat-color': content.color}}>
              <div className="results-badge">{content.name}</div>
              <p className="results-desc">{content.description}</p>
              <p className="results-positioning">{content.positioning}</p>
              
              <div className="results-section">
                <h3>What typically helps:</h3>
                <ul>{content.helps.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
              </div>
              
              <div className="results-section">
                <h3>What to monitor:</h3>
                <ul>{content.monitor.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
              </div>
            </div>
            
            <div className="results-footer">
              <button className="text-button" onClick={() => navigate('categories')}>View all categories →</button>
              <p className="disclaimer">This is not a diagnosis. Please consult a healthcare provider for clinical assessment.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Confirmation screen (after assessment, before results)
  if (showConfirmation) {
    const suggestions = inferResourceSuggestions(answers);
    const symptoms = getSymptomProfile(answers);
    
    return (
      <div className="app-wrapper">
        <TopNav currentPage={currentPage} onNavigate={navigate} onStartAssessment={startAssessment} inAssessment={inAssessment} />
        <main className="main-content">
          <ConfirmationScreen 
            suggestions={suggestions}
            symptoms={symptoms}
            onConfirm={handleConfirmResources}
            onBack={handleBackToAssessment}
          />
        </main>
      </div>
    );
  }

  // Assessment - All questions on one page, grouped by section
  return (
    <div className="app-wrapper">
      <TopNav currentPage={currentPage} onNavigate={navigate} onStartAssessment={startAssessment} inAssessment={inAssessment} />
      <div className="assessment-header-bar">
        <div className="assessment-header-content">
          <span className="assessment-progress-text">{answeredCount} of {totalQuestions} answered</span>
          <button onClick={exitAssessment} className="context-exit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Exit
          </button>
        </div>
      </div>
      <main className="main-content">
        <div className="assessment-single-page">
          <div className="assessment-intro">
            <h1>Concussion Assessment</h1>
            <p>Answer each question based on your current experience. This helps us understand your situation and find the right resources for you.</p>
          </div>
          
          {sections.map((section) => (
            <div key={section.id} className="assessment-section">
              <h2 className="section-title">{section.name}</h2>
              <div className="questions-list">
                {section.questions.map((qId) => {
                  const q = questions.find(qu => qu.id === qId);
                  const idx = questions.findIndex(qu => qu.id === qId);
                  
                  return (
                    <div key={q.id} className={`question-row ${answers[q.id] !== undefined ? 'answered' : ''}`}>
                      <div className="question-number">{idx + 1}</div>
                      <div className="question-content">
                        <p className="question-text-inline">{q.text}</p>
                        {q.subtext && <p className="question-subtext-inline">{q.subtext}</p>}
                        
                        {q.type === 'scale' && (
                          <div className="answer-options-text">
                            {scaleOptions.map((option) => (
                              <button 
                                key={option.value} 
                                className={`answer-option-text ${answers[q.id] === option.value ? 'selected' : ''}`}
                                onClick={() => handleAnswer(q.id, option.value)}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {q.type === 'single' && (
                          <div className="answer-options-vertical">
                            {q.options.map((option) => (
                              <button 
                                key={option.value} 
                                className={`answer-option-vertical ${answers[q.id] === option.value ? 'selected' : ''}`}
                                onClick={() => handleAnswer(q.id, option.value)}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {q.type === 'multi' && (
                          <div className="answer-options-vertical">
                            {q.options.map((option) => {
                              const selected = (answers[q.id] || []).includes(option.value);
                              return (
                                <button 
                                  key={option.value} 
                                  className={`answer-option-vertical multi ${selected ? 'selected' : ''}`}
                                  onClick={() => handleAnswer(q.id, option.value)}
                                >
                                  <span className="checkbox">{selected ? '✓' : ''}</span>
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          <div className="assessment-submit">
            <button 
              className={`primary-button large ${!allAnswered ? 'disabled' : ''}`}
              onClick={handleSubmitAssessment}
              disabled={!allAnswered}
            >
              {allAnswered ? 'Continue →' : `Answer more questions (${answeredCount}/${totalQuestions})`}
            </button>
            <p className="assessment-note">Your answers are private and never stored.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
