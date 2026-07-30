import { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabase';
import gfsLogo from '../Assets/Images/GFS_logo.png';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const launchDate = new Date('2026-10-02T00:00:00');
const launchDateLabel = 'OCTOBER 2, 2026';

function App() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'already' | 'needsSelection'>('idle');
  const [selectedAudience, setSelectedAudience] = useState<'businesses' | 'owners' | null>(null);
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
      if (status === 'needsSelection') {
        setStatus('idle');
      }
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
    if (ctaState === 'empty') return 'Request More Information';
    if (ctaState === 'partial' || ctaState === 'complete') return 'JOIN THE WAITLIST';
    return 'Request More Information';
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
      setStatus('needsSelection');
      return;
    }
    if (!isValidEmail(email)) {
      setStatus('error');
      return;
    }

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
    const now = new Date();
    const difference = launchDate.getTime() - now.getTime();

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

  const handleEmailAttempt = (e: React.MouseEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    if (selectedAudience) return;

    setStatus('needsSelection');
    e.currentTarget.blur();
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedAudience) {
      setStatus('needsSelection');
      return;
    }

    if (status === 'error' || status === 'needsSelection') {
      setStatus('idle');
    }

    setEmail(e.target.value);
  };

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
              <img src={gfsLogo} alt="Ground Force Software Logo" className="logo-image" />
            </div>

            <div className="conf-text-section seq-1">
              {selectedAudience === 'owners' ? (
                <>
                  <p className="conf-main-text">You're in — welcome to the</p>
                  <p className="conf-main-text">GFS early access list</p>
                </>
              ) : (
                <>
                  <p className="conf-main-text">You're in — welcome to the</p>
                  <p className="conf-main-text">Founders Club waitlist</p>
                </>
              )}
              <p className="conf-sub-text">We'll be in touch soon with your early access details</p>
            </div>

            <div className="teaser-section seq-2">
              <h3 className="teaser-title">What's coming:</h3>
              {selectedAudience === 'owners' ? (
                <>
                  <ul className="teaser-list">
                    <li>• <span className="product-highlight">GFS LANDSCAPING GRID</span> — Measure, plan, and visualize your property</li>
                    <li>• Connect with trusted local professionals for accurate estimates</li>
                    <li>• Compare project options and move forward with confidence</li>
                  </ul>
                  <div className="teaser-divider"></div>
                  <ul className="teaser-list">
                    <li>• <span className="product-highlight">GFS NETWORK</span> — The exclusive landscaping network for property owners and pros</li>
                    <li>• Discover trusted local professionals for your next project</li>
                    <li>• Connect, explore ideas, and plan with confidence</li>
                  </ul>
                </>
              ) : (
                <>
                  <ul className="teaser-list">
                    <li>• <span className="product-highlight">GFS LANDSCAPING GRID</span> — Save hours measuring remotely, send accurate estimates</li>
                    <li>• Real-time project visualization in 2D or render in 3D</li>
                    <li>• Streamline measuring, estimating, and project planning in one system</li>
                  </ul>
                  <div className="teaser-divider"></div>
                  <ul className="teaser-list">
                    <li>• <span className="product-highlight">GFS NETWORK</span> — The exclusive landscaping network for property owners and pros</li>
                    <li>• List your business in the GFS directory for FREE</li>
                    <li>• Connect with property owners and professionals in your market</li>
                  </ul>
                </>
              )}
            </div>

            {selectedAudience === 'owners' && (
              <p className="conf-supporting seq-3">Plan your project with confidence—before you ever commit</p>
            )}

            {selectedAudience === 'businesses' && (
              <p className="conf-expectation seq-3">Founders Club members lock in 50% off their subscription</p>
            )}

            <p className={`conf-closing ${selectedAudience === 'owners' ? 'seq-4' : 'seq-3'}`}>
              {selectedAudience === 'businesses' ? 'SHARE WITH YOUR CUSTOMERS' : 'SHARE WITH YOUR LANDSCAPER'}{' '}
              <button
                className="share-link-btn"
                onClick={() => {
                  navigator.clipboard.writeText('https://www.groundforcesoftware.com');
                  const btn = document.querySelector('.share-link-btn') as HTMLButtonElement;
                  if (btn) {
                    btn.textContent = '✓ Link Copied!';
                    setTimeout(() => { btn.textContent = 'Copy Link'; }, 2000);
                  }
                }}
              >
                Copy Link
              </button>
            </p>
          </div>
        ) : (
          <>
            <div className="above-divider">
              {/* Logo Section */}
              <div className="logo-area">
                <img src={gfsLogo} alt="Ground Force Software Logo" className="logo-image" />
              </div>
              <div className="hero-headline">
                <h1 className="hero-title-software">LANDSCAPING OPERATIONS SOFTWARE</h1>
                <h1 className="hero-title-speed">REBUILT FOR SPEED</h1>
                <p className="hero-title-cost">WITHOUT THE PER-USER COST</p>
              </div>

              {/* Value Proposition Grid */}
              <p className={`guidance-text ${!selectedAudience ? 'guidance-pulse' : ''}`}>WHICH BEST DESCRIBES YOU?</p>
              <div className="value-grid">
                <div
                  className={`value-card ${selectedAudience === 'businesses' ? 'active' : ''} ${selectedAudience && selectedAudience !== 'businesses' ? 'unselected' : ''} ${!selectedAudience ? 'awaiting' : ''}`}
                  onClick={() => handleAudienceChange('businesses')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleAudienceChange('businesses');
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <h3 className="card-title">SERVICE PROVIDER</h3>
                  <ul className="card-list">
                    <li>Measure remotely, estimate faster</li>
                    <li>Schedule smarter</li>
                    <li>Grow your business with personalized support</li>
                  </ul>
                  {selectedAudience === 'businesses' && <span className="selected-badge">✓ SELECTED</span>}
                </div>
                <div
                  className={`value-card ${selectedAudience === 'owners' ? 'active' : ''} ${selectedAudience && selectedAudience !== 'owners' ? 'unselected' : ''} ${!selectedAudience ? 'awaiting' : ''}`}
                  onClick={() => handleAudienceChange('owners')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleAudienceChange('owners');
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <h3 className="card-title">PROPERTY OWNER</h3>
                  <ul className="card-list">
                    <li>Find local professionals</li>
                    <li>Request accurate estimates</li>
                    <li>Plan your project with confidence</li>
                  </ul>
                  {selectedAudience === 'owners' && <span className="selected-badge">✓ SELECTED</span>}
                </div>
              </div>
            </div>

            <div className="launch-stack">
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
              <h3 className="launch-date">{launchDateLabel}</h3>
              <p
                className={`founders-hint ${selectedAudience === 'businesses' ? 'is-visible' : ''}`}
                aria-hidden={selectedAudience !== 'businesses'}
              >
                Early sign-ups unlock Founders Club access
              </p>

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
              </div>
            </div>
            {/* Footer / Input Section */}
            <div className="footer-section">
              <form onSubmit={handleSubscribe} className="email-capture-wrapper">
                <div className="email-capture">
                  <input
                    type="email"
                    placeholder={selectedAudience === 'businesses' ? 'ENTER YOUR BUSINESS EMAIL' : selectedAudience === 'owners' ? 'ENTER YOUR EMAIL' : 'SELECT A ROLE ABOVE'}
                    className={`email-input ${!selectedAudience ? 'locked' : ''}`}
                    value={email}
                    onChange={handleEmailChange}
                    onClick={handleEmailAttempt}
                    onFocus={handleEmailAttempt}
                    readOnly={!selectedAudience}
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
                {status === 'needsSelection' && <p className="status-msg prompt">Choose the option above that fits you best first.</p>}
                {status === 'error' && <p className="status-msg error">Please enter your email.</p>}
                <p
                  className={`micro-copy tailored-text ${selectedAudience ? 'is-visible' : ''}`}
                  aria-hidden={!selectedAudience}
                >
                  {selectedAudience === 'businesses' ? 'TAILORED FOR OUTDOOR SERVICE PROVIDERS' : 'Tailored for property owners'}
                </p>
                <p className="micro-copy">One email. First look. No spam.</p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
