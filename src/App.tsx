import { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabase';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function App() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'already'>('idle');
  const [selectedAudience, setSelectedAudience] = useState<'businesses' | 'owners' | null>('businesses');
  const [isChanging, setIsChanging] = useState(false);
  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const hasRole = !!selectedAudience;
  const hasValidEmail = isValidEmail(email);

  let ctaState: 'empty' | 'partial' | 'complete' = 'empty';
  if (!hasRole) {
    ctaState = 'empty';
  } else if (!hasValidEmail) {
    ctaState = 'partial';
  } else {
    ctaState = 'complete';
  }

  const handleAudienceChange = (audience: 'businesses' | 'owners') => {
    if (selectedAudience !== audience) {
      setSelectedAudience(audience);
      setIsChanging(true);
      setTimeout(() => setIsChanging(false), 150);
    }
    // Auto-scroll to bottom on mobile (portrait or landscape) so the email input is visible
    if (window.innerWidth <= 768 || window.innerHeight <= 600) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 200);
    }
  };

  const getButtonText = () => {
    if (isSubmitting) return 'SENDING...';
    if (ctaState === 'empty') return 'Select your role to continue';
    if (ctaState === 'partial') return 'REQUEST DEMO';
    return selectedAudience === 'businesses' ? 'Get Business Access Details' : 'Get Project Access Details';
  };

  const handleCtaClick = (e: React.MouseEvent) => {
    if (ctaState === 'partial') {
      e.preventDefault();
      setStatus('error');
      document.querySelector<HTMLInputElement>('.email-input')?.focus();
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAudience) {
      setStatus('error');
      return;
    }
    if (!isValidEmail(email)) return;

    setIsSubmitting(true);
    setStatus('idle');
    try {
      const { error } = await supabase
        .from('information_requests')
        .insert([
          { 
            email: email.trim().toLowerCase(),
            type: selectedAudience === 'businesses' ? 'business' : 'consumer'
          }
        ]);

      if (error) throw error;

      setStatus('success');
      setEmail('');
    } catch (err: unknown) {
      console.error('Error subscribing details:', err);
      const errorObj = err as { message?: string };
      if (errorObj && errorObj.message && errorObj.message.toLowerCase().includes('duplicate')) {
        setStatus('already');
      } else {
        setStatus('error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTimeLeft = (): TimeLeft => {
    const targetDate = new Date('2026-07-01T00:00:00');
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Ensure double digits
  const pad = (num: number) => num.toString().padStart(2, '0');

  const isSubmitted = status === 'success' || status === 'already';

  return (
    <div className="landing-container">
      {/* Background layer */}
      <div className="background-wrapper">
        <div className="sky"></div>
        {!isSubmitted && <div className="horizon-glow"></div>}
      </div>

      {/* Content layer */}
      <div className={`content-wrapper ${isSubmitted ? 'submitted' : ''}`}>
        {isSubmitted ? (
          <div className="confirmation-wrapper">
            <div className="logo-area logo-submitted">
              <div className="logo-hex">
                <svg viewBox="0 0 100 115" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M50 2.5 L97.5 30 L97.5 85 L50 112.5 L2.5 85 L2.5 30 Z" 
                    fill="none" 
                    stroke="#00ff88" 
                    strokeWidth="4" 
                    strokeLinejoin="round" 
                  />
                </svg>
                GFS
              </div>
              <div className="logo-text-container">
                <h1 className="logo-title">GROUND FORCE</h1>
                <h2 className="logo-subtitle">SOFTWARE™</h2>
              </div>
            </div>

            <div className="conf-text-section seq-1">
              <p className="conf-main-text">Thank you for your interest in</p>
              <p className="conf-main-text">Ground Force Software.</p>
              <p className="conf-sub-text">Your request for more information has been received.</p>
            </div>

            <div className="teaser-section seq-2">
              <h3 className="teaser-title">What's coming:</h3>
              {selectedAudience === 'owners' ? (
                <ul className="teaser-list">
                  <li>• GFS Grid — measure your property on your terms</li>
                  <li>• Request accurate estimates from local professionals</li>
                  <li>• A community forum for ideas, insights, and real projects</li>
                </ul>
              ) : (
                <ul className="teaser-list">
                  <li>• GFS Grid — precision measuring, reimagined</li>
                  <li>• Real-time project visualization</li>
                  <li>• A unified system for planning, estimating, and execution</li>
                </ul>
              )}
            </div>

            {selectedAudience === 'owners' && (
              <p className="conf-supporting seq-3">Plan your project with confidence—before you ever commit.</p>
            )}
            <p className={`conf-expectation ${selectedAudience === 'owners' ? 'seq-4' : 'seq-3'}`}>You'll receive more details by June 1, 2026.</p>
            <p className={`conf-closing ${selectedAudience === 'owners' ? 'seq-5' : 'seq-4'}`}>You're among the first to see what's next.</p>
          </div>
        ) : (
          <>
            <div className="above-divider">
              {/* Logo Section */}
              <div className="logo-area">
                <div className="logo-hex">
                  <svg viewBox="0 0 100 115" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M50 2.5 L97.5 30 L97.5 85 L50 112.5 L2.5 85 L2.5 30 Z" 
                      fill="none" 
                      stroke="#00ff88" 
                      strokeWidth="4" 
                      strokeLinejoin="round" 
                    />
                  </svg>
                  GFS
                </div>
                <div className="logo-text-container">
                  <h1 className="logo-title">GROUND FORCE</h1>
                  <h2 className="logo-subtitle">SOFTWARE™</h2>
                </div>
              </div>
              <p className="logo-tagline">Looking to elevate your business? Let GFS drive your success with personalized support</p>

              {/* New Hero Headline */}
              <div className="hero-headline">
                <div className="hero-top-lines">
                  <h1 className="hero-title-sub">LANDSCAPING OPERATIONS SOFTWARE</h1>
                  <h1 className="hero-title-sub">REBUILT FOR SPEED</h1>
                </div>
                <h1 className="hero-title-main">WITHOUT THE PER-USER COST</h1>
              </div>

              {/* Value Proposition Grid */}
              <p className="guidance-text">Select how you’ll use GFS to continue</p>
              <div className="value-grid">
                <div 
                  className={`value-card ${selectedAudience === 'businesses' ? 'active' : ''} ${selectedAudience && selectedAudience !== 'businesses' ? 'unselected' : ''}`}
                  onClick={() => handleAudienceChange('businesses')}
                >
                  <h3 className="card-title">Service Businesses</h3>
                  <p className="card-desc">
                    Measure remotely, estimate faster<br />
                    Schedule smarter<br />
                    Run your entire operation — without per-user pricing
                  </p>
                  {selectedAudience === 'businesses' && <span className="selected-badge">✓ SELECTED</span>}
                </div>
                <div 
                  className={`value-card ${selectedAudience === 'owners' ? 'active' : ''} ${selectedAudience && selectedAudience !== 'owners' ? 'unselected' : ''}`}
                  onClick={() => handleAudienceChange('owners')}
                >
                  <h3 className="card-title">Property Owners</h3>
                  <p className="card-desc">
                    Find local professionals<br />
                    Request accurate estimates<br />
                    Plan your project with confidence
                  </p>
                  {selectedAudience === 'owners' && <span className="selected-badge">✓ SELECTED</span>}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="divider">
              <div className="divider-line left"></div>
              <svg className="divider-hex" viewBox="0 0 100 115" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M50 2.5 L97.5 30 L97.5 85 L50 112.5 L2.5 85 L2.5 30 Z" 
                  fill="none" 
                  stroke="#00ff88" 
                  strokeWidth="6" 
                  strokeLinejoin="round" 
                />
              </svg>
              <div className="divider-line right"></div>
            </div>

            {/* Launch Info */}
            <div className="launching-text">LAUNCHING</div>
            <h3 className="launch-date">JULY 1, 2026</h3>

            {/* Countdown */}
            <div className="countdown-container">
              <div className="countdown-box">
                <span className="countdown-value">{pad(timeLeft.days)}</span>
                <span className="countdown-label">Days</span>
              </div>
              <div className="countdown-box">
                <span className="countdown-value">{pad(timeLeft.hours)}</span>
                <span className="countdown-label">Hours</span>
              </div>
              <div className="countdown-box">
                <span className="countdown-value">{pad(timeLeft.minutes)}</span>
                <span className="countdown-label">Minutes</span>
              </div>
              <div className="countdown-box">
                <span className="countdown-value">{pad(timeLeft.seconds)}</span>
                <span className="countdown-label">Seconds</span>
              </div>
            {/* Footer / Input Section */}
            <div className="footer-section">
              <form onSubmit={handleSubscribe} className="email-capture-wrapper">
                <div className="email-capture">
                  <input 
                    type="email" 
                    placeholder="ENTER YOUR EMAIL" 
                    className="email-input" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button 
                    type="submit" 
                    className={`submit-btn cta-${ctaState} ${isChanging ? 'pulse-change' : ''}`} 
                    disabled={isSubmitting || ctaState === 'empty'}
                    onClick={handleCtaClick}
                  >
                    {getButtonText()}
                  </button>
                </div>
                {status === 'error' && <p className="status-msg error">{!selectedAudience ? 'Please select an option above' : 'REQUEST DEMO'}</p>}
                {selectedAudience === 'businesses' && <p className="micro-copy tailored-text">Tailored for service businesses</p>}
                {selectedAudience === 'owners' && <p className="micro-copy tailored-text">Tailored for property owners</p>}
                <p className="micro-copy">No spam. One update. That's it.</p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
