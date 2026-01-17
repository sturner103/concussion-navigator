import { useState, useEffect } from 'react';

// ============================================
// DATA & CONFIGURATION
// ============================================
const searchPromptLibrary = {
  'acute-care': {
    name: "Acute Care",
    prompts: [
      '"concussion clinic" [LOCATION]',
      '"sports medicine doctor" concussion [LOCATION]',
      '"concussion assessment" near me [LOCATION]',
      '"urgent care concussion" [LOCATION]',
      '"concussion specialist" initial [LOCATION]'
    ]
  },
  'active-recovery': {
    name: "Active Recovery",
    prompts: [
      '"concussion physiotherapist" [LOCATION]',
      '"vestibular therapy" concussion [LOCATION]',
      '"concussion rehabilitation" [LOCATION]',
      '"sports physio" concussion [LOCATION]',
      '"concussion recovery" program [LOCATION]'
    ]
  },
  'persistent-symptoms': {
    name: "Persistent Symptoms",
    prompts: [
      '"post-concussion syndrome" treatment [LOCATION]',
      '"chronic concussion" specialist [LOCATION]',
      '"persistent concussion" clinic [LOCATION]',
      '"neurologist" concussion [LOCATION]',
      '"post-concussion" rehabilitation [LOCATION]'
    ]
  },
  'complex-presentation': {
    name: "Complex Presentation",
    prompts: [
      '"multidisciplinary concussion" clinic [LOCATION]',
      '"brain injury" rehabilitation [LOCATION]',
      '"neuropsychologist" concussion [LOCATION]',
      '"complex concussion" treatment [LOCATION]',
      '"TBI clinic" [LOCATION]'
    ]
  },
  'return-to-activity': {
    name: "Return to Activity",
    prompts: [
      '"return to sport" concussion [LOCATION]',
      '"concussion clearance" [LOCATION]',
      '"sports medicine" return to play [LOCATION]',
      '"concussion return" protocol [LOCATION]',
      '"athletic trainer" concussion [LOCATION]'
    ]
  }
};

const questions = [
  // Section 1: Injury Details
  { id: 1, section: 'Injury Details', text: "When did your concussion occur?", type: 'choice', options: [
    { value: 'days', label: "Within the last few days" },
    { value: '1-2weeks', label: "1-2 weeks ago" },
    { value: '2-6weeks', label: "2-6 weeks ago" },
    { value: '6weeks-3months', label: "6 weeks to 3 months ago" },
    { value: '3-6months', label: "3-6 months ago" },
    { value: '6months+', label: "More than 6 months ago" }
  ]},
  { id: 2, section: 'Injury Details', text: "How did your concussion happen?", type: 'choice', options: [
    { value: 'sport', label: "Sports or recreation" },
    { value: 'fall', label: "Fall" },
    { value: 'vehicle', label: "Motor vehicle accident" },
    { value: 'assault', label: "Assault or violence" },
    { value: 'work', label: "Workplace accident" },
    { value: 'other', label: "Other or unknown" }
  ]},
  { id: 3, section: 'Injury Details', text: "Did you lose consciousness?", type: 'choice', options: [
    { value: 'no', label: "No" },
    { value: 'seconds', label: "Yes, for seconds" },
    { value: 'minutes', label: "Yes, for minutes" },
    { value: 'unsure', label: "Not sure" }
  ]},
  { id: 4, section: 'Injury Details', text: "How many concussions have you had in total (including this one)?", type: 'choice', options: [
    { value: '1', label: "This is my first" },
    { value: '2', label: "2 concussions" },
    { value: '3', label: "3 concussions" },
    { value: '4+', label: "4 or more" }
  ]},

  // Section 2: Current Symptoms (scale questions)
  { id: 5, section: 'Current Symptoms', text: "Headache", subtext: "Pain or pressure in the head", type: 'scale' },
  { id: 6, section: 'Current Symptoms', text: "Dizziness", subtext: "Feeling unsteady, lightheaded, or off-balance", type: 'scale' },
  { id: 7, section: 'Current Symptoms', text: "Nausea", subtext: "Feeling sick to your stomach", type: 'scale' },
  { id: 8, section: 'Current Symptoms', text: "Fatigue", subtext: "Feeling tired, low energy, or drowsy", type: 'scale' },
  { id: 9, section: 'Current Symptoms', text: "Light sensitivity", subtext: "Bothered by bright lights", type: 'scale' },
  { id: 10, section: 'Current Symptoms', text: "Noise sensitivity", subtext: "Bothered by loud sounds", type: 'scale' },
  { id: 11, section: 'Current Symptoms', text: "Concentration", subtext: "Difficulty focusing or paying attention", type: 'scale' },
  { id: 12, section: 'Current Symptoms', text: "Memory", subtext: "Trouble remembering things", type: 'scale' },
  { id: 13, section: 'Current Symptoms', text: "Sleep", subtext: "Difficulty falling or staying asleep, or sleeping too much", type: 'scale' },
  { id: 14, section: 'Current Symptoms', text: "Anxiety or nervousness", subtext: "Feeling worried or on edge", type: 'scale' },
  { id: 15, section: 'Current Symptoms', text: "Irritability", subtext: "Easily annoyed or frustrated", type: 'scale' },
  { id: 16, section: 'Current Symptoms', text: "Vision problems", subtext: "Blurry vision, double vision, or eye strain", type: 'scale' },

  // Section 3: Impact
  { id: 17, section: 'Impact', text: "How much are your symptoms affecting your daily life?", type: 'choice', options: [
    { value: 'minimal', label: "Minimal impact, mostly manageable" },
    { value: 'moderate', label: "Moderate impact, noticeably affecting daily activities" },
    { value: 'significant', label: "Significant impact, struggling with normal activities" },
    { value: 'severe', label: "Severe impact, unable to do most normal activities" }
  ]},
  { id: 18, section: 'Impact', text: "How are your symptoms changing over time?", type: 'choice', options: [
    { value: 'improving', label: "Improving steadily" },
    { value: 'stable', label: "Stable, not much change" },
    { value: 'fluctuating', label: "Fluctuating, good days and bad days" },
    { value: 'worsening', label: "Getting worse" }
  ]},

  // Section 4: Medical Context
  { id: 19, section: 'Medical Context', text: "Do any of these apply to you?", subtext: "Select all that apply. These help us understand factors that may affect recovery.", type: 'multi', options: [
    { value: 'migraines', label: "History of migraines" },
    { value: 'mental-health', label: "History of anxiety, depression, or other mental health conditions" },
    { value: 'adhd', label: "ADHD or learning difficulties" },
    { value: 'sleep-disorder', label: "Sleep disorder" },
    { value: 'neck-injury', label: "Neck injury from the same incident" },
    { value: 'none', label: "None of these apply", exclusive: true }
  ]},
  { id: 20, section: 'Medical Context', text: "Are you experiencing any of these red flag symptoms?", subtext: "These require immediate medical attention.", type: 'multi', safetyGate: true, options: [
    { value: 'severe-headache', label: "Severe or rapidly worsening headache" },
    { value: 'seizure', label: "Seizures or convulsions" },
    { value: 'repeated-vomiting', label: "Repeated vomiting" },
    { value: 'slurred-speech', label: "Slurred speech or weakness on one side" },
    { value: 'confusion', label: "Increasing confusion or agitation" },
    { value: 'unequal-pupils', label: "Unequal pupil size" },
    { value: 'none', label: "None of these", exclusive: true }
  ]},

  // Section 5: Care & Goals
  { id: 21, section: 'Care & Goals', text: "What care have you received so far?", type: 'choice', options: [
    { value: 'none', label: "No professional care yet" },
    { value: 'er-only', label: "Emergency room or urgent care only" },
    { value: 'gp', label: "Seen by GP or family doctor" },
    { value: 'specialist', label: "Seen by concussion specialist or clinic" },
    { value: 'ongoing', label: "Currently in active treatment" }
  ]},
  { id: 22, section: 'Care & Goals', text: "What are your main recovery goals?", subtext: "Select all that apply.", type: 'multi', options: [
    { value: 'symptom-relief', label: "Get relief from current symptoms" },
    { value: 'return-work', label: "Return to work or school" },
    { value: 'return-sport', label: "Return to sport or physical activity" },
    { value: 'understand', label: "Better understand my condition" },
    { value: 'second-opinion', label: "Get a second opinion or specialist referral" },
    { value: 'mental-health', label: "Address mood or emotional changes" }
  ]}
];

const scaleOptions = [
  { value: 0, label: "None" },
  { value: 1, label: "Mild" },
  { value: 2, label: "Moderate" },
  { value: 3, label: "Severe" }
];

const categoryContent = {
  'acute-care': {
    name: "Acute Care",
    description: "Recent injury requiring initial assessment and guidance.",
    positioning: "Your concussion is recent and you need proper initial assessment. The first few days and weeks are important for setting up a good recovery trajectory.",
    helps: [
      "Medical evaluation to rule out serious injury",
      "Initial symptom management strategies",
      "Clear guidance on rest and activity",
      "Education about what to expect"
    ],
    monitor: [
      "Any red flag symptoms (severe headache, vomiting, confusion)",
      "Symptoms that worsen instead of improve",
      "New symptoms that appear"
    ],
    color: "#4a9bb8"
  },
  'active-recovery': {
    name: "Active Recovery",
    description: "Progressing through recovery with appropriate support.",
    positioning: "You're in the active recovery phase where guided rehabilitation can help speed your recovery and prevent setbacks.",
    helps: [
      "Graduated return to activity protocols",
      "Vestibular and balance rehabilitation",
      "Vision therapy if needed",
      "Cognitive rehabilitation strategies"
    ],
    monitor: [
      "Symptoms that plateau or stop improving",
      "Activities that consistently trigger symptoms",
      "Mood changes or increased anxiety"
    ],
    color: "#5da8c7"
  },
  'persistent-symptoms': {
    name: "Persistent Symptoms",
    description: "Symptoms continuing beyond typical recovery window.",
    positioning: "Your symptoms have persisted longer than typical. This is more common than you might think, and specialized care can help identify what's maintaining your symptoms.",
    helps: [
      "Comprehensive evaluation to identify contributing factors",
      "Targeted rehabilitation for specific symptoms",
      "Multidisciplinary care approach",
      "Medication review if applicable"
    ],
    monitor: [
      "Patterns in symptom triggers",
      "Impact on mental health and quality of life",
      "Sleep quality and patterns"
    ],
    urgent: true,
    color: "#2d7a94"
  },
  'complex-presentation': {
    name: "Complex Presentation",
    description: "Multiple factors requiring comprehensive care.",
    positioning: "Your situation has multiple factors that benefit from comprehensive, coordinated care. This isn't unusual, and a team approach often works best.",
    helps: [
      "Neuropsychological evaluation",
      "Coordinated multidisciplinary care",
      "Management of pre-existing conditions",
      "Specialist referrals as needed"
    ],
    monitor: [
      "How different symptoms interact",
      "Overall functioning and quality of life",
      "Response to different treatments"
    ],
    urgent: true,
    color: "#1d6a84"
  },
  'return-to-activity': {
    name: "Return to Activity",
    description: "Ready to return to sport, work, or school safely.",
    positioning: "You're at the stage where returning to your normal activities is the focus. Proper clearance and a graduated return protocol will help ensure you don't rush back too quickly.",
    helps: [
      "Formal return-to-play or return-to-work assessment",
      "Graduated activity protocols",
      "Clearance documentation if needed",
      "Prevention strategies for future concussions"
    ],
    monitor: [
      "Any symptom return during increased activity",
      "Energy levels and cognitive function",
      "Physical and mental readiness"
    ],
    color: "#3d8aa4"
  }
};

// Generate unique job ID
function generateJobId() {
  return 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Determine category based on answers
function determineCategory(answers) {
  // Red flags (Q20) → Complex Presentation
  const redFlags = answers[20] || [];
  if (Array.isArray(redFlags) && redFlags.length > 0 && !redFlags.includes('none')) {
    return 'complex-presentation';
  }

  // Timeline
  const timeline = answers[1];
  const multiConcussions = answers[4] === '3' || answers[4] === '4+';

  // Persistent (6+ months) or multiple concussions → Persistent Symptoms
  if (timeline === '6months+' || (timeline === '3-6months' && multiConcussions)) {
    return 'persistent-symptoms';
  }

  // Multiple pre-existing conditions → Complex Presentation
  const preExisting = answers[19] || [];
  if (Array.isArray(preExisting) && preExisting.filter(v => v !== 'none').length >= 2) {
    return 'complex-presentation';
  }

  // Return-to-activity goals + minimal impact + improving
  const goals = answers[22] || [];
  const hasReturnGoals = goals.includes('return-sport') || goals.includes('return-work');
  const minimalImpact = answers[17] === 'minimal';
  const improving = answers[18] === 'improving';
  if (hasReturnGoals && minimalImpact && improving) {
    return 'return-to-activity';
  }

  // Very recent (days/1-2 weeks) → Acute Care
  if (timeline === 'days' || timeline === '1-2weeks') {
    return 'acute-care';
  }

  // Default → Active Recovery
  return 'active-recovery';
}

// Infer resource suggestions based on answers
function inferResourceSuggestions(answers) {
  const suggestions = [];
  
  if (answers[21] === 'none' || answers[21] === 'er-only') {
    suggestions.push('Concussion clinic or specialist for initial evaluation');
  }
  if ((answers[6] || 0) >= 2) {
    suggestions.push('Vestibular therapist for dizziness/balance');
  }
  if ((answers[16] || 0) >= 2) {
    suggestions.push('Neuro-optometrist for vision symptoms');
  }
  if ((answers[11] || 0) >= 2 || (answers[12] || 0) >= 2) {
    const timeline = answers[1];
    if (timeline === '3-6months' || timeline === '6months+') {
      suggestions.push('Neuropsychologist for cognitive assessment');
    }
  }
  if ((answers[14] || 0) >= 2 || (answers[15] || 0) >= 2) {
    suggestions.push('Mental health support for mood symptoms');
  }
  const preExisting = answers[19] || [];
  if (preExisting.includes('neck-injury')) {
    suggestions.push('Physiotherapist with cervical spine expertise');
  }
  const goals = answers[22] || [];
  if (goals.includes('return-sport')) {
    suggestions.push('Sports medicine physician for return-to-play clearance');
  }
  
  return suggestions.slice(0, 4);
}

// PDF Export
async function exportToPDF(elementId, filename) {
  window.print();
}

// ============================================
// COMPONENTS
// ============================================

function TopNav({ currentPage, onNavigate, onStartAssessment, inAssessment }) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'categories', label: 'Recovery Categories' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'foundations', label: 'Recovery Basics' },
    { id: 'resources', label: 'Resources' }
  ];

  return (
    <nav className="top-nav">
      <div className="top-nav-container">
        <button className="nav-logo" onClick={() => onNavigate('home')}>
          <div className="nav-logo-icon">
            <svg viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="url(#logoGradient)"/>
              <ellipse cx="16" cy="14" rx="8" ry="6" fill="rgba(255,255,255,0.9)"/>
              <ellipse cx="16" cy="18" rx="8" ry="6" fill="rgba(255,255,255,0.6)"/>
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4a9bb8"/>
                  <stop offset="100%" stopColor="#2d7a94"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span>Concussion Navigator</span>
        </button>
        
        <button className="nav-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? <path d="M6 18L18 6M6 6l12 12"/> : <path d="M4 6h16M4 12h16M4 18h16"/>}
          </svg>
        </button>
        
        <div className={`top-nav-links ${menuOpen ? 'open' : ''}`}>
          {navItems.map(item => (
            <button 
              key={item.id} 
              className={`top-nav-link ${currentPage === item.id && !inAssessment ? 'active' : ''}`}
              onClick={() => { onNavigate(item.id); setMenuOpen(false); }}
            >
              {item.label}
            </button>
          ))}
          <button className="nav-cta" onClick={() => { onStartAssessment(); setMenuOpen(false); }}>
            Start Assessment
          </button>
        </div>
      </div>
    </nav>
  );
}

function ContextNav({ context, data }) {
  if (context === 'search') {
    return (
      <div className="context-nav">
        <div className="context-nav-container">
          <div className="context-breadcrumb">
            <span className="context-label">Your Resources</span>
            <span className="context-separator">→</span>
            <span className="context-current">{data.location || 'Searching...'}</span>
          </div>
          {data.onBack && (
            <button onClick={data.onBack} className="context-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          )}
        </div>
      </div>
    );
  }
  
  if (context === 'results') {
    return (
      <div className="context-nav">
        <div className="context-nav-container">
          <div className="context-breadcrumb">
            <span className="context-label">Your Results</span>
            <span className="context-separator">→</span>
            <span className="context-current">{data.categoryName}</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (context === 'page') {
    return (
      <div className="context-nav">
        <div className="context-nav-container">
          <span className="context-page-title">{data.title}</span>
        </div>
      </div>
    );
  }
  
  return null;
}

function SearchLoading({ elapsedTime, status }) {
  const stages = [
    { threshold: 0, text: "Starting your search..." },
    { threshold: 10, text: "Searching for concussion specialists..." },
    { threshold: 30, text: "Finding rehabilitation services..." },
    { threshold: 60, text: "Gathering physiotherapy options..." },
    { threshold: 90, text: "Compiling your results..." },
    { threshold: 120, text: "Almost there..." }
  ];
  
  const currentStage = stages.reduce((acc, stage) => 
    elapsedTime >= stage.threshold ? stage : acc, stages[0]);

  return (
    <div className="search-loading">
      <div className="loading-spinner"></div>
      <h2>{currentStage.text}</h2>
      <p className="loading-time">{Math.floor(elapsedTime)} seconds</p>
      <p className="loading-note">This comprehensive search typically takes 2-3 minutes.</p>
    </div>
  );
}

function FloatingHelper({ isOpen, onToggle }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    
    try {
      const response = await fetch('/.netlify/functions/site-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || 'Sorry, I could not get an answer.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`floating-helper ${isOpen ? 'open' : ''}`}>
      <button className="floating-helper-toggle" onClick={onToggle}>
        {isOpen ? '✕' : '?'}
      </button>
      {isOpen && (
        <div className="floating-helper-panel">
          <div className="floating-helper-header">
            <h3>Questions about this site?</h3>
          </div>
          <div className="floating-helper-messages">
            {messages.length === 0 && <p className="helper-placeholder">Ask anything about how this tool works...</p>}
            {messages.map((msg, idx) => (
              <div key={idx} className={`helper-message ${msg.role}`}>
                <p>{msg.content}</p>
              </div>
            ))}
            {loading && <div className="helper-message assistant"><p>Thinking...</p></div>}
          </div>
          <div className="floating-helper-input">
            <input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} disabled={loading}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

function LandingPage({ onStartAssessment, onNavigate }) {
  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Path to Concussion Recovery</h1>
          <p className="hero-subtitle">A free, private tool to help you find the right concussion care for your situation.</p>
          <div className="hero-buttons">
            <button className="primary-button large" onClick={onStartAssessment}>Start Assessment</button>
            <button className="secondary-button large" onClick={() => onNavigate('how-it-works')}>How It Works</button>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>How We Help</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Understand Your Situation</h3>
            <p>Our assessment helps identify where you are in your recovery journey.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Find Real Resources</h3>
            <p>Get a personalized report with actual clinics and specialists in your area.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Completely Private</h3>
            <p>Your answers are never stored. This is just for you.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to find your recovery path?</h2>
        <p>The assessment takes about 5-8 minutes.</p>
        <button className="primary-button large" onClick={onStartAssessment}>Start Assessment</button>
      </section>
    </div>
  );
}

function CategoriesPage({ onStartAssessment, onQuickSearch, highlightCategory }) {
  const categories = Object.keys(categoryContent);
  
  return (
    <div className="content-page">
      <div className="page-content">
        <h1>Recovery Categories</h1>
        <p className="page-intro">Based on your assessment, we'll match you to one of these recovery categories to help find the most relevant resources.</p>
        
        <div className="categories-grid">
          {categories.map(cat => (
            <div 
              key={cat} 
              className={`category-card ${highlightCategory === cat ? 'highlighted' : ''}`}
              style={{ borderLeftColor: categoryContent[cat].color }}
            >
              <h3>{categoryContent[cat].name}</h3>
              <p className="category-description">{categoryContent[cat].description}</p>
              <p className="category-positioning">{categoryContent[cat].positioning}</p>
            </div>
          ))}
        </div>

        <div className="categories-cta">
          <button className="primary-button large" onClick={onStartAssessment}>Take the Assessment</button>
          <button className="secondary-button large" onClick={onQuickSearch}>Quick Search – I Know My Category</button>
        </div>
      </div>
    </div>
  );
}

function HowItWorksPage({ onStartAssessment }) {
  return (
    <div className="content-page">
      <div className="page-content">
        <h1>How This Works</h1>
        <p className="page-intro">A simple process to help you find the right concussion care.</p>

        <div className="process-steps">
          <div className="process-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Complete the Assessment</h3>
              <p>Answer 22 questions about your injury, symptoms, and goals. Takes about 5-8 minutes.</p>
            </div>
          </div>
          <div className="process-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Get Your Category</h3>
              <p>Based on your answers, we identify which recovery category best matches your situation.</p>
            </div>
          </div>
          <div className="process-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Search for Resources</h3>
              <p>We search for real concussion clinics, physiotherapists, and specialists in your area.</p>
            </div>
          </div>
          <div className="process-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Get Your Report</h3>
              <p>Download a personalized PDF with options to explore.</p>
            </div>
          </div>
        </div>

        <div className="limitations">
          <h2>Important Limitations</h2>
          <div className="limitations-grid">
            <div className="limitation-card not">
              <h3>This is NOT</h3>
              <ul>
                <li>A medical diagnosis</li>
                <li>A substitute for professional evaluation</li>
                <li>Medical advice about treatment</li>
                <li>A guarantee of provider quality</li>
              </ul>
            </div>
            <div className="limitation-card is">
              <h3>This IS</h3>
              <ul>
                <li>A navigation tool to help you find resources</li>
                <li>A way to identify your primary needs</li>
                <li>Information to start conversations with providers</li>
                <li>A starting point, not a final answer</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <button className="primary-button large" onClick={onStartAssessment}>Start Assessment</button>
        </div>
      </div>
    </div>
  );
}

function FoundationsPage() {
  return (
    <div className="content-page">
      <div className="page-content">
        <h1>Recovery Basics</h1>
        <p className="page-intro">Core principles that support concussion recovery, regardless of where you are in your journey.</p>
        
        <section className="foundation-section">
          <h2>🛏️ Relative Rest (Not Complete Rest)</h2>
          <p>The old advice of complete rest in a dark room has been updated. Current evidence supports "relative rest" – reducing activities that worsen symptoms while gradually returning to light activities that you can tolerate.</p>
          <p><strong>Key principle:</strong> Stay below your symptom threshold while remaining gently active.</p>
        </section>
        
        <section className="foundation-section">
          <h2>📈 Gradual Return to Activity</h2>
          <p>Recovery happens through gradual, progressive return to normal activities. This should be guided by your symptoms, not a fixed timeline.</p>
          <p><strong>Key principle:</strong> Increase activity slowly, step back if symptoms worsen significantly.</p>
        </section>
        
        <section className="foundation-section">
          <h2>😴 Sleep Hygiene</h2>
          <p>Good sleep is crucial for brain healing. Prioritize consistent sleep schedules, limit screens before bed, and create a restful environment.</p>
          <p><strong>Key principle:</strong> Protect your sleep as a core part of recovery.</p>
        </section>
        
        <section className="foundation-section">
          <h2>💧 Basic Self-Care</h2>
          <p>Hydration, regular meals, and gentle movement all support recovery. Avoid alcohol and recreational drugs during recovery.</p>
          <p><strong>Key principle:</strong> Give your brain the basics it needs to heal.</p>
        </section>
        
        <div className="foundation-note">
          <p><strong>Note:</strong> These foundations complement professional care – they don't replace it. If your symptoms are severe or persistent, please seek professional evaluation.</p>
        </div>
      </div>
    </div>
  );
}

function ResourcesPage() {
  return (
    <div className="content-page">
      <div className="page-content">
        <h1>Resources</h1>
        <p className="page-intro">Trusted resources for concussion information and support.</p>
        
        <section className="resource-section">
          <h2>Educational Resources</h2>
          <div className="resource-list">
            <div className="resource-item">
              <h4>Concussion Foundation</h4>
              <p>Comprehensive education and support resources</p>
              <a href="https://concussionfoundation.org" target="_blank" rel="noopener noreferrer">concussionfoundation.org</a>
            </div>
            <div className="resource-item">
              <h4>CDC HEADS UP</h4>
              <p>Evidence-based concussion information from the CDC</p>
              <a href="https://www.cdc.gov/headsup" target="_blank" rel="noopener noreferrer">cdc.gov/headsup</a>
            </div>
            <div className="resource-item">
              <h4>Complete Concussion Management</h4>
              <p>Patient resources and clinic finder</p>
              <a href="https://completeconcussions.com" target="_blank" rel="noopener noreferrer">completeconcussions.com</a>
            </div>
          </div>
        </section>

        <section className="resource-section">
          <h2>Clinical Guidelines</h2>
          <div className="resource-list">
            <div className="resource-item">
              <h4>Amsterdam Consensus Statement</h4>
              <p>International consensus on sport-related concussion (2022)</p>
              <a href="https://bjsm.bmj.com/content/57/11/695" target="_blank" rel="noopener noreferrer">View on BJSM</a>
            </div>
            <div className="resource-item">
              <h4>SCAT6</h4>
              <p>Sport Concussion Assessment Tool (for clinicians)</p>
              <a href="https://bjsm.bmj.com/content/57/11/622" target="_blank" rel="noopener noreferrer">View on BJSM</a>
            </div>
          </div>
        </section>

        <section className="resource-section">
          <h2>Community Support</h2>
          <div className="resource-list">
            <div className="resource-item">
              <h4>r/Concussion</h4>
              <p>Reddit community for peer support</p>
              <a href="https://www.reddit.com/r/Concussion" target="_blank" rel="noopener noreferrer">reddit.com/r/Concussion</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ContactPage() {
  return (
    <div className="content-page">
      <div className="page-content">
        <h1>About</h1>
        <p className="page-intro">Concussion Navigator is a free tool to help people find appropriate concussion care.</p>
        
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>Navigating concussion care can be confusing. There are many types of providers, varying quality of care, and it's hard to know where to start. We built this tool to help people find their way to appropriate support.</p>
        </section>
        
        <section className="about-section">
          <h2>Disclaimer</h2>
          <p>This tool does not provide medical advice, diagnosis, or treatment. It is for informational purposes only. Always consult qualified healthcare providers for medical decisions.</p>
        </section>
      </div>
    </div>
  );
}

function CategorySelector({ selectedCategory, assessedCategory, onSelect }) {
  const categories = Object.keys(categoryContent);
  return (
    <div className="category-selector">
      <label className="category-selector-label">Search for resources matching:</label>
      <div className="category-selector-cards">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`category-selector-card ${selectedCategory === cat ? 'selected' : ''}`}
            onClick={() => onSelect(cat)}
          >
            <span className="category-selector-dot" style={{ background: categoryContent[cat].color }}></span>
            <span className="category-selector-name">{categoryContent[cat].name}</span>
            {assessedCategory === cat && <span className="category-selector-badge">Your result</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function QuickSearchModal({ isOpen, onClose, onSelectCategory }) {
  if (!isOpen) return null;
  
  const categories = Object.keys(categoryContent);
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quick-search-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Quick Search</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body">
          <p className="quick-search-intro">Select the category that best matches your needs:</p>
          <div className="quick-search-categories">
            {categories.map(cat => (
              <button 
                key={cat} 
                className="quick-search-category-card"
                onClick={() => onSelectCategory(cat)}
              >
                <div className="quick-category-header">
                  <span className="quick-category-dot" style={{ background: categoryContent[cat].color }}></span>
                  <h3>{categoryContent[cat].name}</h3>
                </div>
                <p>{categoryContent[cat].description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchPromptsPanel({ category, location, isOpen, onClose }) {
  if (!isOpen) return null;
  const prompts = searchPromptLibrary[category];
  const loc = location || '[YOUR CITY]';
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Search It Yourself</h2><button onClick={onClose} className="modal-close">×</button></div>
        <div className="modal-body">
          <p className="search-prompts-intro">Copy these search terms into Google to find resources:</p>
          <div className="search-prompts-list">
            {prompts.prompts.map((prompt, idx) => {
              const filled = prompt.replace('[LOCATION]', loc);
              return <div key={idx} className="search-prompt-item"><code>{filled}</code><button className="copy-button" onClick={() => navigator.clipboard.writeText(filled)}>Copy</button></div>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceDetailModal({ resource, categoryName, location, isOpen, onClose }) {
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
          categoryName: categoryName,
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
      setError('Could not load details.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !resource) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content resource-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{resource.name}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body">
          {resource.type && <span className="resource-type-badge">{resource.type}</span>}
          <p className="resource-description">{resource.description}</p>
          
          <div className="detail-section">
            {loading && <div className="detail-loading"><div className="loading-spinner small"></div><p>Loading details...</p></div>}
            {error && <div className="detail-error"><p>{error}</p><button onClick={fetchDetails} className="text-button">Try again</button></div>}
            {summary && (
              <div className="detail-content">
                <div className="ai-badge">AI-Enhanced Details</div>
                <p>{summary}</p>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          {resource.url && <a href={resource.url} target="_blank" rel="noopener noreferrer" className="primary-button">Visit Website</a>}
          <button onClick={onClose} className="secondary-button">Close</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [inAssessment, setInAssessment] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [resultsView, setResultsView] = useState('results'); // 'results' or 'search'
  const [location, setLocation] = useState('');
  const [searchPreference, setSearchPreference] = useState('both');
  const [searchCategory, setSearchCategory] = useState(null);
  
  // Crisis state
  const [showUrgentCrisis, setShowUrgentCrisis] = useState(false);
  
  // Background search state
  const [searchJobId, setSearchJobId] = useState(null);
  const [searchStatus, setSearchStatus] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [searchStartTime, setSearchStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [floatingHelpOpen, setFloatingHelpOpen] = useState(false);
  const [searchPromptsOpen, setSearchPromptsOpen] = useState(false);
  const [highlightCategory, setHighlightCategory] = useState(null);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  
  // Resource detail modal state
  const [detailResource, setDetailResource] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Poll for search results
  useEffect(() => {
    let pollInterval;
    let timeInterval;

    if (searchJobId && (searchStatus === 'pending' || searchStatus === 'searching')) {
      timeInterval = setInterval(() => {
        if (searchStartTime) {
          setElapsedTime((Date.now() - searchStartTime) / 1000);
        }
      }, 500);

      pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/.netlify/functions/search-status?jobId=${searchJobId}`);
          const data = await response.json();
          
          if (data.status === 'complete') {
            setSearchStatus('complete');
            setSearchResults(data.results);
            clearInterval(pollInterval);
            clearInterval(timeInterval);
          } else if (data.status === 'error') {
            setSearchStatus('error');
            let friendlyError = data.error || 'Search failed';
            if (data.error && data.error.includes('rate_limit')) {
              friendlyError = "Our search service is busy. Please wait a minute and try again.";
            }
            setSearchError(friendlyError);
            clearInterval(pollInterval);
            clearInterval(timeInterval);
          } else {
            setSearchStatus(data.status);
          }
        } catch (err) {
          console.error('Poll error:', err);
        }
      }, 3000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (timeInterval) clearInterval(timeInterval);
    };
  }, [searchJobId, searchStatus, searchStartTime]);

  const navigate = (page) => { 
    setCurrentPage(page); 
    setInAssessment(false); 
    setShowResults(false); 
    setResultsView('results'); 
    window.scrollTo(0, 0); 
  };
  
  const startAssessment = () => {
    setShowUrgentCrisis(false);
    setShowResults(false);
    setSearchResults(null);
    setSearchCategory(null);
    setSearchJobId(null);
    setSearchStatus(null);
    setAnswers({});
    setInAssessment(true);
    setResultsView('results');
    window.scrollTo(0, 0);
  };

  const handleQuickSearch = (category) => {
    setQuickSearchOpen(false);
    setSearchCategory(category);
    setShowUrgentCrisis(false);
    setShowResults(true);
    setSearchResults(null);
    setSearchJobId(null);
    setSearchStatus(null);
    setAnswers({});
    setInAssessment(true);
    setResultsView('results');
    window.scrollTo(0, 0);
  };

  const exitAssessment = () => { 
    setInAssessment(false); 
    setCurrentPage('home'); 
    setShowUrgentCrisis(false);
    setShowResults(false); 
    setAnswers({}); 
    setHighlightCategory(null); 
    setResultsView('results'); 
  };

  const performSearch = async () => {
    if (!location.trim()) return;
    const category = searchCategory || determineCategory(answers);
    const categoryInfo = categoryContent[category];
    const suggestions = inferResourceSuggestions(answers);
    const jobId = generateJobId();
    
    setSearchJobId(jobId);
    setSearchStatus('pending');
    setSearchError(null);
    setSearchResults(null);
    setSearchStartTime(Date.now());
    setElapsedTime(0);

    try {
      const response = await fetch('/.netlify/functions/search-resources-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          category,
          categoryName: categoryInfo.name,
          categoryHelps: categoryInfo.helps,
          location: location.trim(),
          preference: searchPreference,
          resourceSuggestions: suggestions
        })
      });

      if (response.status !== 202 && !response.ok) {
        throw new Error('Failed to start search');
      }
    } catch (err) {
      setSearchStatus('error');
      setSearchError(err.message || 'Failed to start search');
    }
  };

  const getContext = () => {
    if (showResults && resultsView === 'results') { 
      const category = searchCategory || determineCategory(answers); 
      return { type: 'results', data: { categoryName: categoryContent[category].name } }; 
    }
    if (showResults && resultsView === 'search') {
      return { type: 'search', data: { location, onBack: () => setResultsView('results') } };
    }
    if (!inAssessment && currentPage !== 'home') { 
      const titles = { 'categories': 'Recovery Categories', 'how-it-works': 'How This Works', 'foundations': 'Recovery Basics', 'resources': 'Resources', 'contact': 'About' }; 
      return { type: 'page', data: { title: titles[currentPage] || '' } }; 
    }
    return null;
  };
  const context = getContext();

  // Non-assessment pages
  if (!inAssessment) {
    return (
      <div className="app-wrapper">
        <TopNav currentPage={currentPage} onNavigate={navigate} onStartAssessment={startAssessment} inAssessment={inAssessment} />
        {context && <ContextNav context={context.type} data={context.data} />}
        <main className="main-content">
          {currentPage === 'home' && <LandingPage onStartAssessment={startAssessment} onNavigate={navigate} />}
          {currentPage === 'categories' && <CategoriesPage onStartAssessment={startAssessment} onQuickSearch={() => setQuickSearchOpen(true)} highlightCategory={highlightCategory} />}
          {currentPage === 'how-it-works' && <HowItWorksPage onStartAssessment={startAssessment} />}
          {currentPage === 'foundations' && <FoundationsPage />}
          {currentPage === 'resources' && <ResourcesPage />}
          {currentPage === 'contact' && <ContactPage />}
        </main>
        <FloatingHelper isOpen={floatingHelpOpen} onToggle={() => setFloatingHelpOpen(!floatingHelpOpen)} />
        <QuickSearchModal 
          isOpen={quickSearchOpen} 
          onClose={() => setQuickSearchOpen(false)} 
          onSelectCategory={handleQuickSearch}
        />
      </div>
    );
  }

  // Search view
  if (showResults && resultsView === 'search') {
    const assessedCategory = Object.keys(answers).length > 0 ? determineCategory(answers) : null;
    const selectedCategory = searchCategory || assessedCategory || 'active-recovery';

    // Show loading while searching
    if (searchStatus === 'pending' || searchStatus === 'searching') {
      return (
        <div className="app-wrapper">
          <TopNav currentPage={currentPage} onNavigate={navigate} onStartAssessment={startAssessment} inAssessment={inAssessment} />
          <ContextNav context="search" data={{ location, onBack: () => { setResultsView('results'); setSearchJobId(null); setSearchStatus(null); } }} />
          <main className="main-content"><div className="search-page"><SearchLoading elapsedTime={elapsedTime} status={searchStatus} /></div></main>
        </div>
      );
    }

    // Show results
    if (searchResults) {
      return (
        <div className="app-wrapper">
          <TopNav currentPage={currentPage} onNavigate={navigate} onStartAssessment={startAssessment} inAssessment={inAssessment} />
          <ContextNav context="search" data={{ location, onBack: () => setResultsView('results') }} />
          <main className="main-content">
            {showUrgentCrisis && (
              <div className="crisis-banner" style={{maxWidth: '1200px', margin: '0 auto 1.5rem', padding: '0 1.5rem'}}>
                <p><strong>⚠️ Important:</strong> You indicated red flag symptoms. Please seek immediate medical attention if you haven't already.</p>
              </div>
            )}
            <div className="resource-results-container" id="resource-results-container">
              <div className="resource-results-header">
                <div className="results-header-top">
                  <div>
                    <h1>Resources for You</h1>
                    <p className="results-context">Based on {categoryContent[selectedCategory].name} in {location}</p>
                  </div>
                  <button 
                    onClick={() => exportToPDF('resource-results-container', `concussion-navigator-${location.replace(/\s+/g, '-').toLowerCase()}.pdf`)}
                    className="secondary-button pdf-button"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                    </svg>
                    Save as PDF
                  </button>
                </div>
              </div>
              {(searchResults.introduction || searchResults.additionalNotes) && (
                <div className="results-insights">
                  <div className="insights-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                    <h2>What We Found</h2>
                  </div>
                  <div className="insights-content">
                    {searchResults.introduction && <p>{searchResults.introduction}</p>}
                    {searchResults.additionalNotes && <p>{searchResults.additionalNotes}</p>}
                  </div>
                </div>
              )}
              {searchResults.categories && searchResults.categories.map((cat, idx) => (
                <div key={idx} className="resource-category">
                  <h2>{cat.name}</h2>
                  <div className="resource-list">
                    {cat.resources && cat.resources.map((r, rIdx) => (
                      <div key={rIdx} className="resource-card">
                        <div className="resource-card-header"><h3>{r.name}</h3>{r.type && <span className="resource-type">{r.type}</span>}</div>
                        <p className="resource-description">{r.description}</p>
                        {r.notes && <p className="resource-notes">{r.notes}</p>}
                        <div className="resource-links">
                          <button 
                            className="resource-detail-button"
                            onClick={() => {
                              setDetailResource(r);
                              setDetailModalOpen(true);
                            }}
                          >
                            More Detail
                          </button>
                          {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="resource-link">Visit Website →</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="results-actions-bottom">
                <button onClick={() => { setSearchResults(null); setSearchJobId(null); setSearchStatus(null); }} className="secondary-button">Search Again</button>
                <button onClick={exitAssessment} className="primary-button">Done</button>
              </div>
            </div>
          </main>
          <SearchPromptsPanel category={selectedCategory} location={location} isOpen={searchPromptsOpen} onClose={() => setSearchPromptsOpen(false)} />
          <ResourceDetailModal 
            resource={detailResource}
            categoryName={categoryContent[selectedCategory].name}
            location={location}
            isOpen={detailModalOpen}
            onClose={() => { setDetailModalOpen(false); setDetailResource(null); }}
          />
        </div>
      );
    }

    // Search form
    const resourceSuggestions = inferResourceSuggestions(answers);
    return (
      <div className="app-wrapper">
        <TopNav currentPage={currentPage} onNavigate={navigate} onStartAssessment={startAssessment} inAssessment={inAssessment} />
        <ContextNav context="search" data={{ location, onBack: () => setResultsView('results') }} />
        <main className="main-content">
          <div className="search-page">
            <div className="search-form-container">
              <h1>Find Resources</h1>
              <p className="search-intro">We'll search for real concussion clinics, physiotherapists, and specialists in your area.</p>
              
              {resourceSuggestions.length > 0 && (
                <div className="resource-suggestions">
                  <p><strong>Based on your responses, we'll prioritize:</strong></p>
                  <ul>{resourceSuggestions.map((r, idx) => <li key={idx}>{r}</li>)}</ul>
                </div>
              )}
              
              <div className="search-form">
                <div className="form-group"><label>Where are you located?</label><input type="text" placeholder="City, region, or country" value={location} onChange={(e) => setLocation(e.target.value)} className="location-input"/></div>
                <CategorySelector selectedCategory={selectedCategory} assessedCategory={assessedCategory} onSelect={(c) => setSearchCategory(c)}/>
                <div className="form-group">
                  <label>Type of support:</label>
                  <div className="preference-options">
                    {['both', 'local', 'remote'].map(pref => <button key={pref} className={`preference-option ${searchPreference === pref ? 'selected' : ''}`} onClick={() => setSearchPreference(pref)}><span className="preference-icon">{pref === 'both' ? '🌐' : pref === 'local' ? '📍' : '💻'}</span><span>{pref === 'both' ? 'Both' : pref === 'local' ? 'In-person' : 'Remote'}</span></button>)}
                  </div>
                </div>
                {searchError && <div className="search-error"><p>{searchError}</p><button className="text-button" onClick={() => setSearchPromptsOpen(true)}>Try DIY search prompts →</button></div>}
                <button className="primary-button large full-width" onClick={performSearch} disabled={!location.trim()}>Search for Resources</button>
                <div className="search-note"><p>This comprehensive search can take 2-3 minutes. Please be patient.</p></div>
              </div>
            </div>
          </div>
        </main>
        <SearchPromptsPanel category={selectedCategory} location={location} isOpen={searchPromptsOpen} onClose={() => setSearchPromptsOpen(false)} />
      </div>
    );
  }

  // Results summary
  if (showResults && resultsView === 'results') {
    const category = searchCategory || determineCategory(answers);
    const content = categoryContent[category];
    const resourceSuggestions = inferResourceSuggestions(answers);
    
    return (
      <div className="app-wrapper">
        <TopNav currentPage={currentPage} onNavigate={navigate} onStartAssessment={startAssessment} inAssessment={inAssessment} />
        <ContextNav context="results" data={{ categoryName: content.name }} />
        <main className="main-content">
          <div className="results-page">
            {showUrgentCrisis && (
              <div className="crisis-banner">
                <p><strong>⚠️ Important:</strong> You indicated red flag symptoms. These require immediate medical attention. Please go to an emergency room or call emergency services.</p>
              </div>
            )}
            
            <div className="results-top">
              <div className="results-main">
                <div className="results-header"><span className="results-label">Your Results</span><h1>{content.name}</h1></div>
                <div className="results-positioning"><p>{content.positioning}</p></div>
                {content.urgent && <div className="urgent-notice"><p>We encourage you to seek professional evaluation soon.</p></div>}
              </div>
              <div className="results-cta-box">
                <button className="build-report-button" onClick={() => setResultsView('search')}>Build My Report →</button>
                <h3>Find Resources</h3>
                <p>We'll search for real options in your area.</p>
              </div>
            </div>
            
            <div className="results-details">
              <div className="results-section"><h2>What often helps</h2><ul>{content.helps.map((item, idx) => <li key={idx}>{item}</li>)}</ul></div>
              <div className="results-section"><h2>What to watch for</h2><ul>{content.monitor.map((item, idx) => <li key={idx}>{item}</li>)}</ul></div>
              {resourceSuggestions.length > 0 && (
                <div className="results-section"><h2>Suggested resource types</h2><ul>{resourceSuggestions.map((item, idx) => <li key={idx}>{item}</li>)}</ul></div>
              )}
            </div>
            
            <div className="results-footer"><button className="text-button" onClick={() => navigate('categories')}>View all categories →</button><p className="disclaimer">This is not a diagnosis. Please consult a healthcare provider for clinical assessment.</p></div>
          </div>
        </main>
      </div>
    );
  }

  // Assessment
  const answeredCount = Object.keys(answers).filter(k => {
    const val = answers[k];
    if (Array.isArray(val)) return val.length > 0;
    return val !== undefined && val !== null && val !== '';
  }).length;
  const allAnswered = answeredCount === questions.length;
  
  const handleAnswer = (questionId, value, isMulti = false, exclusive = false) => {
    if (isMulti) {
      const current = answers[questionId] || [];
      let newValue;
      
      if (exclusive) {
        newValue = current.includes(value) ? [] : [value];
      } else {
        const filtered = current.filter(v => {
          const q = questions.find(q => q.id === questionId);
          const opt = q?.options.find(o => o.value === v);
          return !opt?.exclusive;
        });
        
        if (filtered.includes(value)) {
          newValue = filtered.filter(v => v !== value);
        } else {
          newValue = [...filtered, value];
        }
      }
      setAnswers({ ...answers, [questionId]: newValue });
      
      // Check safety gate for Q20
      const q = questions.find(q => q.id === questionId);
      if (q && q.safetyGate) {
        if (newValue.length > 0 && !newValue.includes('none')) {
          setShowUrgentCrisis(true);
        } else {
          setShowUrgentCrisis(false);
        }
      }
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };
  
  const handleSubmitAssessment = () => {
    if (!allAnswered) return;
    const category = determineCategory(answers);
    setSearchCategory(category);
    setHighlightCategory(category);
    setShowResults(true);
    window.scrollTo(0, 0);
  };

  const sections = [...new Set(questions.map(q => q.section))];

  return (
    <div className="app-wrapper">
      <TopNav currentPage={currentPage} onNavigate={navigate} onStartAssessment={startAssessment} inAssessment={inAssessment} />
      <div className="assessment-header-bar">
        <div className="assessment-header-content">
          <span className="assessment-progress-text">{answeredCount} of {questions.length} answered</span>
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
            <h1>Concussion Recovery Assessment</h1>
            <p>Answer each question based on your current experience. Takes about 5-8 minutes.</p>
          </div>
          
          {sections.map(section => (
            <div key={section} className="assessment-section">
              <h2 className="section-title">{section}</h2>
              <div className="questions-list">
                {questions.filter(q => q.section === section).map((q) => (
                  <div key={q.id} className={`question-row ${answers[q.id] !== undefined && (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : true) ? 'answered' : ''}`}>
                    <div className="question-number">{q.id}</div>
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
                      
                      {q.type === 'choice' && (
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
                                onClick={() => handleAnswer(q.id, option.value, true, option.exclusive)}
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
                ))}
              </div>
            </div>
          ))}
          
          <div className="assessment-submit">
            <button 
              className={`primary-button large ${!allAnswered ? 'disabled' : ''}`}
              onClick={handleSubmitAssessment}
              disabled={!allAnswered}
            >
              {allAnswered ? 'See My Results →' : `Complete all questions (${answeredCount}/${questions.length})`}
            </button>
            <p className="assessment-note">Your answers are private and never stored.</p>
          </div>
        </div>
      </main>
      <FloatingHelper isOpen={floatingHelpOpen} onToggle={() => setFloatingHelpOpen(!floatingHelpOpen)} />
    </div>
  );
}

export default App;
