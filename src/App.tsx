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

  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return;

    setIsSubmitting(true);
    setStatus('idle');
    try {
      const { error } = await supabase
        .from('information_requests')
        .insert([
          { 
            email: email.trim().toLowerCase()
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

  return (
    <div className="landing-container">
      {/* Background layer */}
      <div className="background-wrapper">
        <div className="sky"></div>
        <div className="horizon-glow"></div>
      </div>

      {/* Content layer */}
      <div className="content-wrapper">
        {/* New Hero Headline */}
        <div className="hero-headline">
          <h1 className="hero-title-main">BUSINESS SOFTWARE, REBUILT FOR SPEED</h1>
          <h1 className="hero-title-sub">WITHOUT THE COST</h1>
        </div>
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
            <h2 className="logo-subtitle">SOFTWARE</h2>
          </div>
        </div>

        {/* New Subheadline */}
        <p className="subheadline">
          Estimate, schedule, and manage your entire operation from one platform — without per-user pricing.
        </p>
        <p className="subheadline-secondary">
          Purpose-built for <span className="highlight-word">landscaping</span> and service-based businesses.
        </p>

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
        </div>
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
            />
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isSubmitting || !isValidEmail(email)}
            >
              {isSubmitting ? 'SENDING...' : 'FIND OUT MORE'}
            </button>
          </div>
          {status === 'success' && <p className="status-msg success">Success! You're on the list. Expect to receive an email by June 1, 2026</p>}
          {status === 'already' && <p className="status-msg success">You're already on the list, expect to receive an email by June 1, 2026.</p>}
          {status === 'error' && <p className="status-msg error">There was an error. Please try again.</p>}
          <p className="micro-copy">No spam. Information only, sent one time only.</p>
        </form>
      </div>
    </div>
  );
}

export default App;
