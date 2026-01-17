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
      '"concussion assessment" [LOCATION]',
      '"mTBI doctor" [LOCATION]',
      '"concussion specialist" near me [LOCATION]'
    ] 
  },
  'active-recovery': { 
    name: "Active Recovery", 
    prompts: [
      '"concussion physiotherapist" [LOCATION]',
      '"vestibular therapy" concussion [LOCATION]',
      '"concussion rehabilitation" [LOCATION]',
      '"post-concussion treatment" [LOCATION]',
      '"concussion recovery program" [LOCATION]'
    ] 
  },
  'persistent-symptoms': { 
    name: "Persistent Symptoms", 
    prompts: [
      '"post-concussion syndrome" treatment [LOCATION]',
      '"persistent concussion" clinic [LOCATION]',
      '"chronic concussion" specialist [LOCATION]',
      '"mTBI specialist" [LOCATION]',
      '"concussion neurologist" [LOCATION]'
    ] 
  },
  'complex-presentation': { 
    name: "Complex Presentation", 
    prompts: [
      '"multidisciplinary concussion" clinic [LOCATION]',
      '"brain injury rehabilitation" [LOCATION]',
      '"concussion neuropsychologist" [LOCATION]',
      '"complex concussion" treatment [LOCATION]',
      '"TBI specialist" [LOCATION]'
    ] 
  },
  'return-to-activity': { 
    name: "Return to Activity", 
    prompts: [
      '"return to sport" concussion [LOCATION]',
      '"concussion clearance" [LOCATION]',
      '"sports medicine" concussion [LOCATION]',
      '"return to play" protocol [LOCATION]',
      '"concussion baseline testing" [LOCATION]'
    ] 
  }
};

const questions = [
  // Section 1: Your Injury (Q1-4)
  { id: 1, section: "Your Injury", text: "When did your concussion occur?", subtext: "This helps us understand where you are in your recovery timeline.", type: "choice", options: [
    { value: "days", label: "Within the last few days" },
    { value: "1-2-weeks", label: "1-2 weeks ago" },
    { value: "2-4-weeks", label: "2-4 weeks ago" },
    { value: "1-3-months", label: "1-3 months ago" },
    { value: "3-6-months", label: "3-6 months ago" },
    { value: "6plus-months", label: "More than 6 months ago" }
  ]},
  { id: 2, section: "Your Injury", text: "How did your concussion happen?", subtext: "Different causes can affect recovery patterns.", type: "choice", options: [
    { value: "sport", label: "Sports or recreation" },
    { value: "fall", label: "Fall" },
    { value: "vehicle", label: "Motor vehicle accident" },
    { value: "assault", label: "Assault or violence" },
    { value: "work", label: "Workplace injury" },
    { value: "other", label: "Other or unknown" }
  ]},
  { id: 3, section: "Your Injury", text: "Did you lose consciousness?", subtext: "Even brief loss of consciousness is relevant information.", type: "choice", options: [
    { value: "no", label: "No" },
    { value: "brief", label: "Yes, briefly (seconds)" },
    { value: "minutes", label: "Yes, for minutes or longer" },
    { value: "unsure", label: "I'm not sure" }
  ]},
  { id: 4, section: "Your Injury", text: "Have you had previous concussions?", subtext: "History of concussion can affect recovery.", type: "choice", options: [
    { value: "none", label: "No, this is my first" },
    { value: "1-2", label: "1-2 previous concussions" },
    { value: "3plus", label: "3 or more previous concussions" }
  ]},
  
  // Section 2: Your Symptoms (Q5-16) - Scale 0-3
  { id: 5, section: "Your Symptoms", text: "Headaches", subtext: "Rate the severity of your headaches over the past week.", type: "scale" },
  { id: 6, section: "Your Symptoms", text: "Dizziness or balance problems", subtext: "Including feeling unsteady, vertigo, or room spinning.", type: "scale", flag: "vestibular" },
  { id: 7, section: "Your Symptoms", text: "Nausea", subtext: "Feeling sick to your stomach.", type: "scale" },
  { id: 8, section: "Your Symptoms", text: "Fatigue or low energy", subtext: "Feeling unusually tired or needing more rest.", type: "scale" },
  { id: 9, section: "Your Symptoms", text: "Sensitivity to light", subtext: "Light bothering you more than usual.", type: "scale", flag: "vision" },
  { id: 10, section: "Your Symptoms", text: "Sensitivity to noise", subtext: "Sounds bothering you more than usual.", type: "scale" },
  { id: 11, section: "Your Symptoms", text: "Difficulty concentrating", subtext: "Trouble focusing or staying on task.", type: "scale", flag: "cognitive" },
  { id: 12, section: "Your Symptoms", text: "Memory problems", subtext: "Forgetting things more than usual.", type: "scale", flag: "cognitive" },
  { id: 13, section: "Your Symptoms", text: "Sleep disturbance", subtext: "Trouble falling asleep, staying asleep, or sleeping too much.", type: "scale" },
  { id: 14, section: "Your Symptoms", text: "Anxiety or nervousness", subtext: "Feeling worried, anxious, or on edge.", type: "scale", flag: "mental-health" },
  { id: 15, section: "Your Symptoms", text: "Irritability or mood changes", subtext: "Feeling more irritable or emotional than usual.", type: "scale", flag: "mental-health" },
  { id: 16, section: "Your Symptoms", text: "Vision problems", subtext: "Blurred vision, double vision, or trouble focusing eyes.", type: "scale", flag: "vision" },
  
  // Section 3: Overall Impact (Q17-18)
  { id: 17, section: "Overall Impact", text: "How much are your symptoms affecting your daily life?", subtext: "Work, school, relationships, activities.", type: "choice", options: [
    { value: "minimal", label: "Minimal impact - I can do most things" },
    { value: "moderate", label: "Moderate impact - Some activities are difficult" },
    { value: "significant", label: "Significant impact - Many activities are affected" },
    { value: "severe", label: "Severe impact - I struggle with most activities" }
  ]},
  { id: 18, section: "Overall Impact", text: "How have your symptoms been changing?", subtext: "Over the past week or two.", type: "choice", options: [
    { value: "improving", label: "Clearly improving" },
    { value: "stable", label: "About the same" },
    { value: "fluctuating", label: "Fluctuating (good days and bad days)" },
    { value: "worsening", label: "Getting worse" }
  ]},
  
  // Section 4: Medical Context (Q19-20)
  { id: 19, section: "Medical Context", text: "Do you have any of these pre-existing conditions?", subtext: "Select all that apply. These can affect concussion recovery.", type: "multi", options: [
    { value: "migraine", label: "History of migraines" },
    { value: "mental-health", label: "Mental health condition (anxiety, depression, etc.)" },
    { value: "learning", label: "Learning disability or ADHD" },
    { value: "neck", label: "Previous neck injury", flag: "cervical" },
    { value: "vestibular", label: "Previous vestibular/balance issues" },
    { value: "none", label: "None of these", exclusive: true }
  ]},
  { id: 20, section: "Medical Context", text: "Are you experiencing any of these warning signs?", subtext: "These require immediate medical attention.", type: "multi", options: [
    { value: "severe-headache", label: "Severe headache that keeps getting worse" },
    { value: "vomiting", label: "Repeated vomiting" },
    { value: "seizure", label: "Seizures" },
    { value: "weakness", label: "Weakness or numbness in limbs" },
    { value: "slurred", label: "Slurred speech" },
    { value: "none", label: "None of these", exclusive: true }
  ], safetyGate: true },
  
  // Section 5: Your Recovery Goals (Q21-22)
  { id: 21, section: "Your Recovery", text: "What care have you received so far?", subtext: "Select all that apply.", type: "multi", options: [
    { value: "none", label: "None yet", exclusive: true },
    { value: "er", label: "Emergency room visit" },
    { value: "gp", label: "Family doctor/GP" },
    { value: "specialist", label: "Concussion specialist or clinic" },
    { value: "physio", label: "Physiotherapist" },
    { value: "other", label: "Other healthcare provider" }
  ]},
  { id: 22, section: "Your Recovery", text: "What are you hoping to get help with?", subtext: "Select all that apply.", type: "multi", options: [
    { value: "diagnosis", label: "Getting a proper diagnosis" },
    { value: "treatment", label: "Treatment for ongoing symptoms" },
    { value: "return-sport", label: "Returning to sport safely" },
    { value: "return-work", label: "Returning to work or school" },
    { value: "persistent", label: "Help with symptoms lasting months" },
    { value: "second-opinion", label: "Second opinion on my recovery" }
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
    positioning: "Your responses suggest you're in the early phase of concussion recovery. This is when proper assessment and early management are most important.", 
    helps: [
      "Initial assessment by a healthcare provider trained in concussion", 
      "Education about concussion recovery and what to expect", 
      "Guidance on activity modification and symptom management", 
      "Monitoring for any red flag symptoms"
    ], 
    monitor: [
      "Worsening symptoms, especially severe headache", 
      "New symptoms appearing", 
      "Red flag symptoms (see warning signs)"
    ],
    color: "#5da8c7"
  },
  'active-recovery': { 
    name: "Active Recovery", 
    description: "Progressing through recovery with appropriate support.",
    positioning: "Your responses suggest you're in the active recovery phase. With the right support, most people see significant improvement during this stage.", 
    helps: [
      "Concussion-trained physiotherapist for guided rehabilitation", 
      "Graduated return-to-activity protocols", 
      "Symptom-specific therapies (vestibular, vision, etc.)", 
      "Strategies for managing daily activities"
    ], 
    monitor: [
      "Symptoms plateau for more than 2 weeks", 
      "Unable to progress through return-to-activity steps", 
      "Significant impact on work, school, or relationships"
    ],
    color: "#4a9bb8"
  },
  'persistent-symptoms': { 
    name: "Persistent Symptoms", 
    description: "Symptoms lasting longer than typical recovery.",
    positioning: "Your responses suggest your symptoms have persisted longer than the typical recovery window. This isn't uncommon, and specialized help can make a real difference.", 
    helps: [
      "Comprehensive re-evaluation by a concussion specialist", 
      "Specialized therapies targeting specific symptoms", 
      "Multidisciplinary concussion clinic if available", 
      "Addressing factors that may be prolonging recovery"
    ], 
    monitor: [
      "Symptoms continuing to worsen", 
      "New symptoms developing", 
      "Significant decline in daily functioning"
    ],
    color: "#3a8aa6"
  },
  'complex-presentation': { 
    name: "Complex Presentation", 
    description: "Multiple factors requiring comprehensive care.",
    positioning: "Your responses indicate a more complex situation that would benefit from comprehensive, coordinated care. This is about getting the right team in place.", 
    helps: [
      "Multidisciplinary concussion clinic for coordinated care", 
      "Specialist referrals based on specific symptoms", 
      "Neuropsychological assessment if cognitive concerns", 
      "Treatment for co-occurring conditions"
    ], 
    monitor: [
      "Red flag symptoms require immediate emergency care", 
      "Follow recommendations from your healthcare team"
    ], 
    urgent: true,
    color: "#2d7a94"
  },
  'return-to-activity': { 
    name: "Return to Activity", 
    description: "Ready to return to sport, work, or school safely.",
    positioning: "Your responses suggest you're ready to focus on returning to your normal activities. The key is doing this gradually and safely.", 
    helps: [
      "Graduated return-to-sport or return-to-work protocols", 
      "Clearance testing when appropriate", 
      "Strategies for managing any residual symptoms", 
      "Education on preventing future concussions"
    ], 
    monitor: [
      "Symptoms returning with activity", 
      "Difficulty progressing through return stages", 
      "Any new concerns"
    ],
    color: "#4a9bb8"
  }
};

// Determine category based on assessment answers
function determineCategory(answers) {
  // Check for red flags first (Q20)
  const redFlags = answers[20] || [];
  if (Array.isArray(redFlags) && redFlags.length > 0 && !redFlags.includes('none')) {
    return 'complex-presentation';
  }
  
  // Check timeline (Q1)
  const timeline = answers[1];
  const isPersistent = timeline === '6plus-months';
  
  // Check for multiple concussions (Q4)
  const previousConcussions = answers[4];
  const isMultiConcussion = previousConcussions === '3plus';
  
  // Check pre-existing conditions (Q19)
  const preExisting = answers[19] || [];
  const hasComplexFactors = Array.isArray(preExisting) && 
    preExisting.filter(p => p !== 'none').length >= 2;
  
  // Calculate symptom severity
  let symptomScore = 0;
  for (let i = 5; i <= 16; i++) {
    symptomScore += answers[i] || 0;
  }
  
  // Check trajectory (Q18)
  const trajectory = answers[18];
  const isImproving = trajectory === 'improving';
  
  // Check impact (Q17)
  const impact = answers[17];
  const isMinimalImpact = impact === 'minimal';
  
  // Check goals (Q22)
  const goals = answers[22] || [];
  const wantsReturnToActivity = goals.includes('return-sport') || goals.includes('return-work');
  
  // Priority 1: Persistent symptoms
  if (isPersistent || isMultiConcussion) {
    return 'persistent-symptoms';
  }
  
  // Priority 2: Complex presentation
  if (hasComplexFactors) {
    return 'complex-presentation';
  }
  
  // Priority 3: Return to activity focus
  if (wantsReturnToActivity && isMinimalImpact && isImproving) {
    return 'return-to-activity';
  }
  
  // Priority 4: Acute care (very recent)
  if (timeline === 'days' || timeline === '1-2-weeks') {
    return 'acute-care';
  }
  
  // Default: Active recovery
  return 'active-recovery';
}

// Infer resource suggestions based on answers
function inferResourceSuggestions(answers) {
  const suggestions = [];
  
  // Check care received (Q21)
  const careReceived = answers[21] || [];
  if (careReceived.includes('none') || (careReceived.length === 1 && careReceived.includes('er'))) {
    suggestions.push('Concussion clinic or specialist');
  }
  
  // Check vestibular symptoms (Q6)
  if ((answers[6] || 0) >= 2) {
    suggestions.push('Vestibular therapist');
  }
  
  // Check vision symptoms (Q9, Q16)
  if ((answers[9] || 0) >= 2 || (answers[16] || 0) >= 2) {
    suggestions.push('Neuro-optometrist or vision therapy');
  }
  
  // Check cognitive symptoms (Q11, Q12) + timeline
  const timeline = answers[1];
  const hasLongTimeline = ['3-6-months', '6plus-months'].includes(timeline);
  if (((answers[11] || 0) >= 2 || (answers[12] || 0) >= 2) && hasLongTimeline) {
    suggestions.push('Neuropsychologist');
  }
  
  // Check mental health symptoms (Q14, Q15)
  if ((answers[14] || 0) >= 2 || (answers[15] || 0) >= 2) {
    suggestions.push('Mental health support');
  }
  
  // Check for neck injury history (Q19)
  const preExisting = answers[19] || [];
  if (preExisting.includes('neck')) {
    suggestions.push('Physiotherapist (cervical assessment)');
  }
  
  // Check if persistent or multiple concussions
  if (timeline === '6plus-months' || answers[4] === '3plus') {
    suggestions.push('Neurologist');
  }
  
  // Check goals for return to sport/work
  const goals = answers[22] || [];
  if (goals.includes('return-sport') || goals.includes('return-work')) {
    suggestions.push('Physiotherapist (concussion-trained)');
  }
  
  // Check impact level
  const impact = answers[17];
  if (['significant', 'severe'].includes(impact) && !suggestions.includes('Concussion clinic or specialist')) {
    suggestions.push('Concussion clinic or specialist');
  }
  
  // If no care received, suggest GP
  if (careReceived.includes('none')) {
    suggestions.push('Concussion-informed GP');
  }
  
  return [...new Set(suggestions)]; // Remove duplicates
}

// Generate unique job ID
function generateJobId() {
  return 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Export results to PDF
async function exportToPDF(elementId, filename) {
  const element = document.getElementById(elementId);
  if (!element || !window.html2pdf) {
    console.error('PDF export failed: element or html2pdf not found');
    alert('PDF export is not available. Please try again.');
    return;
  }

  const buttons = element.querySelectorAll('button, .pdf-button, .resource-detail-button');
  buttons.forEach(btn => btn.style.display = 'none');

  const opt = {
    margin: [10, 10, 10, 10],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    await window.html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Failed to generate PDF. Please try again.');
  } finally {
    buttons.forEach(btn => btn.style.display = '');
  }
}

// ============================================
// TOP NAV
// ============================================
function TopNav({ currentPage, onNavigate, onStartAssessment, inAssessment }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'categories', label: 'Categories' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'foundations', label: 'Recovery Basics' },
    { id: 'resources', label: 'Resources' }
  ];

  return (
    <nav className="top-nav">
      <div className="nav-container">
        <button className="nav-brand" onClick={() => onNavigate('home')}>
          <svg viewBox="0 0 24 24" className="brand-icon">
            <circle cx="12" cy="12" r="10" fill="#4a9bb8"/>
            <path d="M8 13c-1.5 0-2.5-1-2.5-2.5s1-2.5 2.5-2.5c0.5-1.5 2-2.5 4-2.5 0.5 0 1 0.1 1.5 0.3 0.5-0.8 1.5-1.3 2.5-1.3 1.5 0 2.8 1.2 2.8 2.8 0 0.3 0 0.5-0.1 0.7 0.8 0.5 1.3 1.3 1.3 2.3 0 1.5-1.2 2.8-2.8 2.8h-1c-0.3 1-1.3 1.8-2.4 1.8s-2.1-0.8-2.4-1.8h-3.4z" fill="white" opacity="0.9"/>
          </svg>
          <span>Concussion Navigator</span>
        </button>
        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? <path d="M6 18L18 6M6 6l12 12"/> : <path d="M3 12h18M3 6h18M3 18h18"/>}
          </svg>
        </button>
        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          {navItems.map(item => (
            <button 
              key={item.id}
              className={`nav-item ${currentPage === item.id && !inAssessment ? 'active' : ''}`}
              onClick={() => { 
                onNavigate(item.id); 
                setMenuOpen(false); 
              }}
            >
              {item.label}
            </button>
          ))}
          <button className="nav-cta" onClick={() => { onStartAssessment(); setMenuOpen(false); }}>
            {inAssessment ? 'Restart' : 'Start Assessment'}
          </button>
        </div>
      </div>
    </nav>
  );
}

// ============================================
// CONTEXT NAV
// ============================================
function ContextNav({ context, data }) {
  if (context === 'assessment') {
    const progress = ((data.currentQuestion) / data.totalQuestions) * 100;
    return (
      <div className="context-nav">
        <div className="context-nav-container">
          <div className="context-breadcrumb">
            <span className="context-label">Assessment</span>
            <span className="context-separator">→</span>
            <span className="context-current">Question {data.currentQuestion + 1} of {data.totalQuestions}</span>
          </div>
          <div className="context-progress">
            <div className="context-progress-bar">
              <div className="context-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <button onClick={data.onExit} className="context-exit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Exit
          </button>
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
          <div className="context-actions">
            <button 
              className={`context-tab ${data.view === 'results' ? 'active' : ''}`}
              onClick={() => data.setView('results')}
            >
              Summary
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

// ============================================
// SEARCH LOADING
// ============================================
function SearchLoading({ elapsedTime, status }) {
  const stages = [
    { name: "Starting search", minTime: 0 },
    { name: "Searching for concussion clinics", minTime: 5 },
    { name: "Finding physiotherapists", minTime: 15 },
    { name: "Looking for specialists", minTime: 25 },
    { name: "Checking vestibular & vision therapists", minTime: 35 },
    { name: "Compiling results", minTime: 45 }
  ];

  const currentStageIndex = stages.reduce((acc, stage, idx) => 
    elapsedTime >= stage.minTime ? idx : acc, 0);

  return (
    <div className="search-loading-container">
      <div className="search-loading-spinner">
        <svg viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke="#d4e9f0" strokeWidth="4"/>
          <circle cx="25" cy="25" r="20" fill="none" stroke="#4a9bb8" strokeWidth="4" strokeLinecap="round" strokeDasharray="80" strokeDashoffset="60" className="spinner-circle"/>
        </svg>
      </div>
      <h2>Searching for Resources</h2>
      
      <div className="search-stages">
        {stages.map((stage, idx) => (
          <div key={idx} className={`search-stage ${idx < currentStageIndex ? 'complete' : ''} ${idx === currentStageIndex ? 'active' : ''}`}>
            <span className="stage-indicator">
              {idx < currentStageIndex ? '✓' : idx === currentStageIndex ? '●' : '○'}
            </span>
            <span className="stage-name">{stage.name}</span>
          </div>
        ))}
      </div>
      
      <p className="search-loading-time">{Math.floor(elapsedTime)} seconds</p>
      
      <div className="search-loading-note">
        <p>This comprehensive search can take 120+ seconds. Please be patient.</p>
        <p>We are searching for resources and building you a personalized report.</p>
      </div>
    </div>
  );
}

// ============================================
// CATEGORY SELECTOR
// ============================================
function CategorySelector({ selectedCategory, assessedCategory, onSelect }) {
  const categories = Object.keys(categoryContent);
  
  return (
    <div className="form-group">
      <label>Recovery category:</label>
      <div className="category-selector">
        {categories.map(cat => (
          <button 
            key={cat}
            className={`category-option ${selectedCategory === cat ? 'selected' : ''} ${assessedCategory === cat ? 'assessed' : ''}`}
            onClick={() => onSelect(cat)}
            style={{ borderColor: selectedCategory === cat ? categoryContent[cat].color : undefined }}
          >
            <span className="category-dot" style={{ background: categoryContent[cat].color }}></span>
            <span className="category-name">{categoryContent[cat].name}</span>
            {assessedCategory === cat && <span className="assessed-badge">Your result</span>}
          </button>
        ))}
      </div>
      {selectedCategory !== assessedCategory && assessedCategory && (
        <p className="category-note">You've selected a different category than your assessment result. That's okay - you know your situation best.</p>
      )}
    </div>
  );
}

// ============================================
// FLOATING HELPER
// ============================================
function FloatingHelper({ isOpen, onToggle }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    try {
      const response = await fetch('/.netlify/functions/site-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || "I'm here to help." }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't respond." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button className="floating-help-button" onClick={onToggle}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>
        </svg>
        <span>Help with Site</span>
      </button>
    );
  }

  return (
    <>
      <button className="floating-help-button open" onClick={onToggle}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 18L18 6M6 6l12 12"/>
        </svg>
        <span>Close</span>
      </button>
      <div className="floating-help-panel">
        <div className="floating-help-header"><h3>How can I help?</h3></div>
        <div className="floating-help-content">
          {messages.length === 0 && <div className="help-welcome"><p>I can answer questions about this tool or help you navigate.</p></div>}
          {messages.map((msg, idx) => <div key={idx} className={`help-message ${msg.role}`}>{msg.content}</div>)}
          {isLoading && <div className="help-message assistant loading">Thinking...</div>}
        </div>
        <div className="floating-help-input">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Ask anything..." disabled={isLoading}/>
          <button onClick={sendMessage} disabled={isLoading || !input.trim()}>Send</button>
        </div>
      </div>
    </>
  );
}

// ============================================
// HELP PANEL
// ============================================
function HelpPanel({ isOpen, onClose, question, questionText }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    try {
      const response = await fetch('/.netlify/functions/question-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, questionText, userMessage })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || "I'm here to help." }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't respond." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="help-panel-side">
      <div className="help-panel-header">
        <h3>Question Helper</h3>
        <button onClick={onClose} className="help-close-button">×</button>
      </div>
      <div className="help-current-question">
        <span className="help-question-label">Question {question}:</span>
        <p>{questionText}</p>
      </div>
      <div className="help-panel-content">
        {messages.length === 0 && <div className="help-welcome"><p>I can help clarify what this question is asking.</p></div>}
        {messages.map((msg, idx) => <div key={idx} className={`help-message ${msg.role}`}>{msg.content}</div>)}
        {isLoading && <div className="help-message assistant loading">Thinking...</div>}
      </div>
      <div className="help-panel-input">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Ask about this question..." disabled={isLoading}/>
        <button onClick={sendMessage} disabled={isLoading || !input.trim()}>Send</button>
      </div>
    </div>
  );
}

// ============================================
// LANDING PAGE
// ============================================
function LandingPage({ onStartAssessment, onNavigate }) {
  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">Free · Private · No sign-up required</p>
          <h1>Find the right support for your concussion recovery</h1>
          <p className="hero-subtitle">A free tool to help you understand your symptoms and connect with appropriate healthcare providers—clinics, physiotherapists, and specialists—anywhere in the world.</p>
          <div className="hero-actions">
            <button className="primary-button large" onClick={onStartAssessment}>
              Take the Assessment
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="secondary-button" onClick={() => onNavigate('categories')}>Learn about the categories</button>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-content">
          <h2>Is this for me?</h2>
          <div className="audience-grid">
            <div className="audience-card"><div className="audience-icon">🤕</div><h4>Recently concussed</h4><p>Looking for guidance on what to do and who to see</p></div>
            <div className="audience-card"><div className="audience-icon">😔</div><h4>Not improving</h4><p>Symptoms persisting longer than expected</p></div>
            <div className="audience-card"><div className="audience-icon">⚽</div><h4>Ready to return</h4><p>Want to get back to sport, work, or school safely</p></div>
            <div className="audience-card"><div className="audience-icon">🔍</div><h4>Seeking specialists</h4><p>Need help finding concussion-trained providers</p></div>
          </div>
        </div>
      </section>

      <section className="landing-section alt-bg">
        <div className="section-content">
          <h2>How it works</h2>
          <div className="process-cards">
            <div className="process-card">
              <div className="process-icon">📝</div>
              <h4>Answer 22 questions</h4>
              <p>About your injury, symptoms, and goals. Takes about 8 minutes.</p>
            </div>
            <div className="process-card">
              <div className="process-icon">🧭</div>
              <h4>Get your recovery category</h4>
              <p>Understand what type of support might help most.</p>
            </div>
            <div className="process-card">
              <div className="process-icon">🔍</div>
              <h4>Find real resources</h4>
              <p>We search for clinics, physiotherapists, and specialists near you.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section cta-section">
        <div className="section-content centered">
          <h2>Ready to explore?</h2>
          <p>No sign-up, no email, completely private.</p>
          <button className="primary-button large" onClick={onStartAssessment}>Begin the Assessment<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <p><strong>Concussion Navigator</strong> — A free navigation tool for concussion recovery support.</p>
          <p>This is not a medical service. If you have emergency symptoms, seek immediate medical care.</p>
          <p><button onClick={() => onNavigate('contact')} className="footer-link">Contact</button></p>
        </div>
      </footer>
    </div>
  );
}

// ============================================
// CATEGORIES PAGE
// ============================================
function CategoriesPage({ onStartAssessment, onQuickSearch, highlightCategory = null }) {
  const categories = Object.keys(categoryContent);
  
  return (
    <div className="content-page">
      <div className="page-content wide">
        <section className="content-section">
          <h2 className="stages-title">Understanding the Recovery Categories</h2>
          <div className="stages-explainer">
            <p>We're not clinicians, and these categories aren't diagnoses. So why use them?</p>
            <p>To search effectively for resources—clinics, physiotherapists, specialists—our search engine needs to understand what <em>type</em> of support might be most helpful. Our five categories help our AI search engine return better and more personalized results in your area.</p>
          </div>
        </section>
        <div className="stages-grid-2x2">
          {categories.map(cat => (
            <div key={cat} className={`stage-card ${highlightCategory === cat ? 'highlighted' : ''}`}>
              <div className="stage-card-header" style={{ borderLeftColor: categoryContent[cat].color }}>
                <span className="stage-dot" style={{ background: categoryContent[cat].color }}></span>
                <div><h3>{categoryContent[cat].name}</h3><p className="stage-description">{categoryContent[cat].description}</p></div>
                {highlightCategory === cat && <span className="your-result-badge">Your result</span>}
              </div>
              <div className="stage-card-body">
                <p>{categoryContent[cat].positioning}</p>
                <div className="stage-helps"><h4>What typically helps:</h4><ul>{categoryContent[cat].helps.map((help, idx) => <li key={idx}>{help}</li>)}</ul></div>
              </div>
            </div>
          ))}
        </div>
        <div className="page-cta page-cta-dual">
          <button className="primary-button large" onClick={onStartAssessment}>Take the Assessment<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
          <button className="secondary-button large" onClick={onQuickSearch}>Search Now – I Know What I Need</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HOW IT WORKS PAGE
// ============================================
function HowItWorksPage({ onStartAssessment }) {
  return (
    <div className="content-page how-it-works-page">
      <div className="page-content wide">
        <div className="hiw-hero">
          <h1>How Concussion Navigator Works</h1>
          <p>A simple, private way to explore your options and find concussion care that fits.</p>
        </div>

        <div className="hiw-process">
          <h2>The Process</h2>
          <div className="hiw-steps-simple">
            <div className="hiw-step-simple">
              <div className="hiw-step-icon">📝</div>
              <div className="hiw-step-content">
                <h4>Take the Assessment</h4>
                <p>Answer 22 questions about your injury, symptoms, and recovery goals. Takes about 8 minutes.</p>
              </div>
            </div>
            <div className="hiw-step-arrow">→</div>
            <div className="hiw-step-simple">
              <div className="hiw-step-icon">🔍</div>
              <div className="hiw-step-content">
                <h4>Find Resources</h4>
                <p>We build a personalized report of clinics, physiotherapists, and specialists in your area.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="hiw-philosophy">
          <div className="philosophy-item">
            <div className="philosophy-icon">🧭</div>
            <div className="philosophy-text">
              <h3>Our Philosophy</h3>
              <p>Finding concussion care shouldn't require you to already understand the healthcare system.</p>
            </div>
          </div>
          
          <div className="philosophy-item">
            <div className="philosophy-icon">💬</div>
            <div className="philosophy-text">
              <h3>Navigation, Not Diagnosis</h3>
              <p>We help identify patterns and point you toward resources that typically help people in similar situations.</p>
            </div>
          </div>
        </div>

        <div className="hiw-cta">
          <button className="primary-button large" onClick={onStartAssessment}>
            Start the Assessment
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <p>Free · Private · No sign-up required</p>
        </div>

        <div className="hiw-limitations" id="limitations">
          <h2>Important Notes</h2>
          <div className="limitations-list">
            <div className="limitation-item">
              <h4>🏥 Not a Medical Service</h4>
              <p>This tool provides navigation assistance, not medical advice. Always consult healthcare providers for diagnosis and treatment.</p>
            </div>
            <div className="limitation-item">
              <h4>🚨 Red Flag Symptoms</h4>
              <p>Seek emergency care immediately for: severe worsening headache, repeated vomiting, seizures, weakness/numbness, slurred speech, or worsening confusion.</p>
            </div>
            <div className="limitation-item">
              <h4>🔍 Search Results</h4>
              <p>Our AI searches for real providers but may not find everything. Verify information and call ahead before visiting.</p>
            </div>
            <div className="limitation-item">
              <h4>🌍 Coverage</h4>
              <p>We search globally but results vary by location. Urban areas typically have more specialized concussion resources.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// FOUNDATIONS PAGE (Recovery Basics)
// ============================================
function FoundationsPage() {
  return (
    <div className="content-page">
      <div className="page-content">
        <h1>Concussion Recovery Basics</h1>
        <p className="page-intro">Understanding these fundamentals can help support your recovery. This is general information—always follow guidance from your healthcare providers.</p>
        
        <section className="content-section">
          <h2>Relative Rest, Not Complete Rest</h2>
          <p>Current evidence shows that <strong>complete rest is not helpful</strong> after the first 24-48 hours. Instead, "relative rest" means:</p>
          <ul>
            <li>Gentle activity that doesn't significantly worsen symptoms</li>
            <li>Light walking, gentle stretching</li>
            <li>Gradually returning to normal activities</li>
            <li>Avoiding activities with high risk of another head injury</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>Gradual Return to Activity</h2>
          <p>Recovery typically involves a stepwise return to normal activities:</p>
          <ul>
            <li><strong>Stage 1:</strong> Symptom-limited activity (daily activities that don't worsen symptoms)</li>
            <li><strong>Stage 2:</strong> Light aerobic exercise (walking, swimming)</li>
            <li><strong>Stage 3:</strong> Sport-specific exercise</li>
            <li><strong>Stage 4:</strong> Non-contact training drills</li>
            <li><strong>Stage 5:</strong> Full contact practice (after medical clearance)</li>
            <li><strong>Stage 6:</strong> Return to competition</li>
          </ul>
          <p>Each stage should take at least 24 hours. If symptoms worsen, return to the previous stage.</p>
        </section>

        <section className="content-section">
          <h2>Sleep and Rest</h2>
          <p>Good sleep is important for recovery:</p>
          <ul>
            <li>Maintain a regular sleep schedule</li>
            <li>Create a dark, quiet sleep environment</li>
            <li>Limit screens before bed</li>
            <li>Short daytime naps (20-30 min) are okay if needed</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>Managing Symptoms</h2>
          <p>Common strategies that may help:</p>
          <ul>
            <li><strong>Headaches:</strong> Regular breaks, hydration, avoiding triggers</li>
            <li><strong>Light/noise sensitivity:</strong> Sunglasses, earplugs, gradual exposure</li>
            <li><strong>Cognitive fatigue:</strong> Pacing activities, taking breaks, prioritizing tasks</li>
            <li><strong>Balance issues:</strong> Move carefully, use handrails, avoid rushing</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>When to Seek Help</h2>
          <p>Contact a healthcare provider if:</p>
          <ul>
            <li>Symptoms aren't improving after 2-4 weeks</li>
            <li>Symptoms are significantly interfering with daily life</li>
            <li>You're unsure about returning to activities</li>
            <li>You have specific concerns about your recovery</li>
          </ul>
          <p><strong>Seek emergency care immediately</strong> for: severe worsening headache, repeated vomiting, seizures, weakness or numbness, slurred speech, or worsening confusion.</p>
        </section>
      </div>
    </div>
  );
}

// ============================================
// RESOURCES PAGE
// ============================================
function ResourcesPage() {
  return (
    <div className="content-page">
      <div className="page-content">
        <h1>Additional Resources</h1>
        <p className="page-intro">Trusted organizations and information sources for concussion recovery.</p>
        
        <section className="content-section">
          <h2>Information & Education</h2>
          <div className="resource-list-simple">
            <a href="https://concussionfoundation.org/" target="_blank" rel="noopener noreferrer" className="resource-link-card">
              <h4>Concussion Foundation</h4>
              <p>Education, support, and advocacy for concussion and CTE</p>
            </a>
            <a href="https://www.cdc.gov/heads-up/" target="_blank" rel="noopener noreferrer" className="resource-link-card">
              <h4>CDC HEADS UP</h4>
              <p>Comprehensive concussion information from the CDC</p>
            </a>
            <a href="https://completeconcussions.com/" target="_blank" rel="noopener noreferrer" className="resource-link-card">
              <h4>Complete Concussions</h4>
              <p>Evidence-based concussion education and resources</p>
            </a>
          </div>
        </section>

        <section className="content-section">
          <h2>Clinical Guidelines</h2>
          <div className="resource-list-simple">
            <a href="https://bjsm.bmj.com/content/57/11/695" target="_blank" rel="noopener noreferrer" className="resource-link-card">
              <h4>Amsterdam Consensus Statement (2022)</h4>
              <p>Latest international consensus on sport-related concussion</p>
            </a>
            <a href="https://cattonline.com/" target="_blank" rel="noopener noreferrer" className="resource-link-card">
              <h4>Concussion Assessment Tool (SCAT6)</h4>
              <p>Standardized concussion assessment tool</p>
            </a>
          </div>
        </section>

        <section className="content-section">
          <h2>Community Support</h2>
          <div className="resource-list-simple">
            <a href="https://www.reddit.com/r/Concussion/" target="_blank" rel="noopener noreferrer" className="resource-link-card">
              <h4>r/Concussion</h4>
              <p>Reddit community for peer support and shared experiences</p>
            </a>
          </div>
        </section>

        <section className="content-section">
          <h2>Finding Providers</h2>
          <div className="resource-list-simple">
            <a href="https://www.concussionclinics.com/" target="_blank" rel="noopener noreferrer" className="resource-link-card">
              <h4>Concussion Clinic Directory</h4>
              <p>Directory of concussion clinics (US-focused)</p>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

// ============================================
// CONTACT PAGE
// ============================================
function ContactPage() {
  return (
    <div className="content-page">
      <div className="page-content">
        <h1>Contact</h1>
        <p className="page-intro">Concussion Navigator is a free tool designed to help people find appropriate concussion care.</p>
        <section className="content-section">
          <h2>About This Tool</h2>
          <p>This tool was created to address a common challenge: when you have a concussion, it can be hard to know what kind of help you need or where to find it. We use AI to search for real providers in your area based on your specific situation.</p>
          <p>We are not a medical service and cannot provide diagnosis or treatment. Always consult with healthcare providers for medical advice.</p>
        </section>
        <section className="content-section">
          <h2>Feedback</h2>
          <p>This tool is continuously being improved. If you have feedback, suggestions, or found an issue, we'd love to hear from you.</p>
        </section>
      </div>
    </div>
  );
}

// ============================================
// QUICK SEARCH MODAL
// ============================================
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
          <div className="quick-search-stages">
            {categories.map(cat => (
              <button 
                key={cat} 
                className="quick-search-stage-card"
                onClick={() => onSelectCategory(cat)}
              >
                <div className="quick-stage-header">
                  <span className="quick-stage-dot" style={{ background: categoryContent[cat].color }}></span>
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

// ============================================
// SEARCH PROMPTS PANEL
// ============================================
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

// ============================================
// RESOURCE DETAIL MODAL
// ============================================
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
    if (!phone) return false;
    const lower = phone.toLowerCase();
    return phone.match(/\d/) && 
      !lower.includes('not specified') && 
      !lower.includes('n/a') &&
      !lower.includes('website') &&
      !lower.includes('contact');
  };

  if (!isOpen || !resource) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content resource-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{resource.name}</h2>
            {resource.type && <span className="resource-type-badge">{resource.type}</span>}
          </div>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <div className="modal-body">
          <div className="resource-basic-info">
            <p className="resource-description-full">{resource.description}</p>
            {resource.notes && <p className="resource-notes-full"><strong>Note:</strong> {resource.notes}</p>}
          </div>

          <div className="resource-detail-section">
            <h3>More Details</h3>
            <div className="detail-content-area">
              {loading && (
                <div className="detail-loading-inline">
                  <div className="detail-spinner-small"></div>
                  <span>Getting more details...</span>
                </div>
              )}
              {error && !summary && (
                <div className="detail-error-inline">
                  <span>{error}</span>
                  <button onClick={fetchDetails} className="text-button">Try again</button>
                </div>
              )}
              {summary && (
                <div className="detail-content">
                  <div className="ai-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                    AI-Enhanced Details
                  </div>
                  {renderSummary(summary)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {resource.url && (
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="primary-button">
              Visit Website
            </a>
          )}
          {isValidPhone(resource.phone) && (
            <a href={`tel:${resource.phone.replace(/\s/g, '')}`} className="secondary-button">
              {resource.phone}
            </a>
          )}
          <button onClick={onClose} className="text-button">Close</button>
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
  const [resultsView, setResultsView] = useState('results');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showUrgentCrisis, setShowUrgentCrisis] = useState(false);
  const [location, setLocation] = useState('');
  const [searchPreference, setSearchPreference] = useState('both');
  const [searchCategory, setSearchCategory] = useState(null);
  
  // Background search state
  const [searchJobId, setSearchJobId] = useState(null);
  const [searchStatus, setSearchStatus] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [searchStartTime, setSearchStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpQuestionIndex, setHelpQuestionIndex] = useState(0);
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
              friendlyError = "Our search service is busy right now. Please wait a minute and try again.";
            } else if (data.error && data.error.includes('timeout')) {
              friendlyError = "The search took too long. Please try again with a more specific location.";
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

  const navigate = (page, scrollTo = null) => { 
    setCurrentPage(page); 
    setInAssessment(false); 
    setShowResults(false); 
    setResultsView('results'); 
    if (scrollTo) {
      setTimeout(() => {
        const element = document.getElementById(scrollTo);
        if (element) {
          const headerOffset = 120;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0); 
    }
  };
  
  const startAssessment = () => {
    setShowUrgentCrisis(false); setShowResults(false); setSearchResults(null);
    setSearchCategory(null); setSearchJobId(null); setSearchStatus(null); setCurrentQuestion(0); setAnswers({});
    setHelpOpen(false); setInAssessment(true); setResultsView('results'); window.scrollTo(0, 0);
  };

  const handleQuickSearch = (category) => {
    setQuickSearchOpen(false);
    setSearchCategory(category);
    setShowUrgentCrisis(false); setShowResults(true); setSearchResults(null);
    setSearchJobId(null); setSearchStatus(null); setAnswers({});
    setInAssessment(true); setResultsView('results'); window.scrollTo(0, 0);
  };

  const exitAssessment = () => { 
    setInAssessment(false); setCurrentPage('home'); setShowUrgentCrisis(false); 
    setShowResults(false); setAnswers({}); setCurrentQuestion(0); 
    setHighlightCategory(null); setResultsView('results'); 
  };

  // Start background search
  const performSearch = async () => {
    if (!location.trim()) return;
    const category = searchCategory || determineCategory(answers);
    const catInfo = categoryContent[category];
    const resourceSuggestions = inferResourceSuggestions(answers);
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
          categoryName: catInfo.name,
          categoryHelps: catInfo.helps,
          resourceTypes: resourceSuggestions,
          location: location.trim(),
          preference: searchPreference
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
    if (inAssessment && !showResults) return { type: 'assessment', data: { currentQuestion, totalQuestions: questions.length, onExit: exitAssessment } };
    if (showResults && resultsView === 'results') { 
      const category = searchCategory || determineCategory(answers); 
      return { type: 'results', data: { categoryName: categoryContent[category].name, view: resultsView, setView: setResultsView } }; 
    }
    if (showResults && resultsView === 'search') return { type: 'search', data: { location, onBack: () => setResultsView('results') } };
    if (!inAssessment && currentPage !== 'home') { 
      const titles = { 'categories': 'Recovery Categories', 'how-it-works': 'How This Works', 'foundations': 'Recovery Basics', 'resources': 'Resources', 'contact': 'Contact' }; 
      return { type: 'page', data: { title: titles[currentPage] || '' } }; 
    }
    return null;
  };
  const context = getContext();

  // Search view - check this FIRST
  if (showResults && resultsView === 'search') {
    const assessedCategory = determineCategory(answers);
    const selectedCategory = searchCategory || assessedCategory;

    if (searchStatus === 'pending' || searchStatus === 'searching') {
      return (
        <div className="app-wrapper">
          <TopNav currentPage={currentPage} onNavigate={navigate} onStartAssessment={startAssessment} inAssessment={inAssessment} />
          <ContextNav context="search" data={{ location, onBack: () => { setResultsView('results'); setSearchJobId(null); setSearchStatus(null); } }} />
          <main className="main-content"><div className="search-page"><SearchLoading elapsedTime={elapsedTime} status={searchStatus} /></div></main>
        </div>
      );
    }

    if (searchResults) {
      return (
        <div className="app-wrapper">
          <TopNav currentPage={currentPage} onNavigate={navigate} onStartAssessment={startAssessment} inAssessment={inAssessment} />
          <ContextNav context="search" data={{ location, onBack: () => setResultsView('results') }} />
          <main className="main-content">
            {showUrgentCrisis && (
              <div className="crisis-banner" style={{maxWidth: '1200px', margin: '0 auto 1.5rem', padding: '0 1.5rem'}}>
                <p><strong>⚠️ Warning:</strong> You indicated red flag symptoms. Please seek emergency medical care immediately if you haven't already.</p>
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
                          {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="resource-link-button">Visit Website</a>}
                          {r.phone && 
                            r.phone.trim() !== '' && 
                            !r.phone.toLowerCase().includes('not specified') && 
                            !r.phone.toLowerCase().includes('n/a') && 
                            !r.phone.toLowerCase().includes('contact') && 
                            !r.phone.toLowerCase().includes('website') && 
                            !r.phone.toLowerCase().includes('see ') && 
                            !r.phone.toLowerCase().includes('visit') && 
                            !r.phone.toLowerCase().includes('available') && 
                            r.phone.match(/\d/) && (
                            <a href={`tel:${r.phone.replace(/\s/g, '')}`} className="resource-phone-link">{r.phone}</a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="diy-search-section"><h2>Want to search yourself?</h2><p>Try these search terms for more options:</p><button className="secondary-button" onClick={() => setSearchPromptsOpen(true)}>View Search Prompts</button></div>
              <div className="resource-results-footer">
                <div className="results-caveat"><p>These are options to explore, not recommendations. Please verify before contacting any provider.</p></div>
                <div className="results-actions">
                  <button 
                    onClick={() => exportToPDF('resource-results-container', `concussion-navigator-${location.replace(/\s+/g, '-').toLowerCase()}.pdf`)}
                    className="secondary-button pdf-button"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                    </svg>
                    Save as PDF
                  </button>
                  <button onClick={() => { setSearchResults(null); setSearchJobId(null); setSearchStatus(null); }} className="secondary-button">Search Again</button>
                  <button onClick={exitAssessment} className="primary-button">Done</button>
                </div>
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
    const assessedCategory = Object.keys(answers).length > 0 ? determineCategory(answers) : null;
    const selectedCategory = searchCategory || assessedCategory || 'active-recovery';
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
                  <ul>
                    {resourceSuggestions.map((r, idx) => <li key={idx}>{r}</li>)}
                  </ul>
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
                <div className="search-note"><p>This comprehensive search can take 120+ seconds. Please be patient.</p></div>
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
        <ContextNav context="results" data={{ categoryName: content.name, view: resultsView, setView: setResultsView }} />
        <main className="main-content">
          <div className="results-page">
            {showUrgentCrisis && (
              <div className="crisis-banner">
                <p><strong>⚠️ Important:</strong> You indicated red flag symptoms. These require immediate medical attention. Please go to an emergency room or call emergency services if you haven't already.</p>
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
                <p>We will build you a report with options in your area.</p>
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

  // Non-assessment pages (landing, categories, etc.)
  if (!inAssessment && !showResults) {
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

  // Assessment - All questions on one page
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  
  const handleSingleAnswer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    // Check safety gate for question 20 (red flags)
    const q = questions.find(q => q.id === questionId);
    if (q && q.safetyGate) {
      if (Array.isArray(value) && value.length > 0 && !value.includes('none')) {
        setShowUrgentCrisis(true);
      } else {
        setShowUrgentCrisis(false);
      }
    }
  };

  const handleMultiAnswer = (questionId, optionValue, exclusive) => {
    const current = answers[questionId] || [];
    let newValue;
    
    if (exclusive) {
      // If clicking exclusive option, clear others
      newValue = current.includes(optionValue) ? [] : [optionValue];
    } else {
      // If clicking non-exclusive, remove any exclusive options
      const nonExclusive = current.filter(v => {
        const opt = questions.find(q => q.id === questionId)?.options.find(o => o.value === v);
        return !opt?.exclusive;
      });
      
      if (nonExclusive.includes(optionValue)) {
        newValue = nonExclusive.filter(v => v !== optionValue);
      } else {
        newValue = [...nonExclusive, optionValue];
      }
    }
    
    handleSingleAnswer(questionId, newValue);
  };
  
  const handleSubmitAssessment = () => {
    if (!allAnswered) return;
    const category = determineCategory(answers);
    setSearchCategory(category);
    setHighlightCategory(category);
    setShowResults(true);
    setInAssessment(false);
    window.scrollTo(0, 0);
  };

  // Group questions by section
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
            <p>Answer each question based on your current experience. There are no right or wrong answers.</p>
          </div>
          
          {sections.map(section => (
            <div key={section} className="assessment-section">
              <h2 className="section-title">{section}</h2>
              <div className="questions-list">
                {questions.filter(q => q.section === section).map((q) => (
                  <div key={q.id} className={`question-row ${answers[q.id] !== undefined && (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : true) ? 'answered' : ''}`}>
                    <div className="question-number">{q.id}</div>
                    <div className="question-content">
                      <div className="question-header">
                        <p className="question-text-inline">{q.text}</p>
                      </div>
                      {q.subtext && <p className="question-subtext-inline">{q.subtext}</p>}
                      
                      {q.type === 'scale' && (
                        <div className="answer-options-text">
                          {scaleOptions.map((option) => (
                            <button 
                              key={option.value} 
                              className={`answer-option-text ${answers[q.id] === option.value ? 'selected' : ''}`}
                              onClick={() => handleSingleAnswer(q.id, option.value)}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {q.type === 'choice' && (
                        <div className="answer-options-choice">
                          {q.options.map((option) => (
                            <button 
                              key={option.value} 
                              className={`answer-option-choice ${answers[q.id] === option.value ? 'selected' : ''}`}
                              onClick={() => handleSingleAnswer(q.id, option.value)}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {q.type === 'multi' && (
                        <div className="answer-options-multi">
                          {q.options.map((option) => (
                            <button 
                              key={option.value} 
                              className={`answer-option-multi ${(answers[q.id] || []).includes(option.value) ? 'selected' : ''}`}
                              onClick={() => handleMultiAnswer(q.id, option.value, option.exclusive)}
                            >
                              <span className="multi-checkbox">{(answers[q.id] || []).includes(option.value) ? '✓' : ''}</span>
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <button 
                        className="question-help-icon" 
                        onClick={() => { setHelpQuestionIndex(questions.findIndex(qu => qu.id === q.id)); setHelpOpen(true); }}
                        title="Get help with this question"
                      >
                        <span className="help-icon-text">?</span>
                      </button>
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
              {allAnswered ? 'See My Results →' : `Answer all questions (${answeredCount}/${questions.length})`}
            </button>
            <p className="assessment-note">Your answers are private and never stored.</p>
          </div>
        </div>
      </main>
      <HelpPanel isOpen={helpOpen} onClose={() => setHelpOpen(false)} question={helpQuestionIndex + 1} questionText={questions[helpQuestionIndex]?.text || ''} />
    </div>
  );
}

export default App;
