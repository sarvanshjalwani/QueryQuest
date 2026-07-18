import React from 'react';
import './Landing.css';
import { useNavigate } from "react-router-dom";

const IconMagnify = ({ className }) => (
    <svg className={className} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="22" r="14" stroke="#c9a03d" strokeWidth="2.2" />
        <circle cx="22" cy="22" r="8.5" stroke="#8b6914" strokeWidth="1.2" />
        <line x1="17" y1="22" x2="27" y2="22" stroke="#8b6914" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="22" y1="17" x2="22" y2="27" stroke="#8b6914" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="32.5" y1="32.5" x2="49" y2="49" stroke="#c9a03d" strokeWidth="3" strokeLinecap="round" />
    </svg>
);

const IconBook = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="7" width="22" height="30" rx="2" stroke="#c9a03d" strokeWidth="1.8" />
        <rect x="13" y="4" width="22" height="30" rx="2" stroke="#8b6914" strokeWidth="1.2" />
        <line x1="13" y1="14" x2="27" y2="14" stroke="#c9a03d" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="13" y1="19" x2="24" y2="19" stroke="#8b6914" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="13" y1="24" x2="22" y2="24" stroke="#8b6914" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
);

const IconBriefcase = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="7" y="15" width="34" height="24" rx="2" stroke="#c05a2a" strokeWidth="1.8" />
        <path d="M17 15v-4a7 7 0 0 1 14 0v4" stroke="#8b3a10" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="27" r="3.5" stroke="#c05a2a" strokeWidth="1.5" />
        <line x1="24" y1="30.5" x2="24" y2="35" stroke="#c05a2a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const IconChart = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="26" width="10" height="15" rx="1.5" stroke="#3a7a4a" strokeWidth="1.6" />
        <rect x="20" y="18" width="10" height="23" rx="1.5" stroke="#3a7a4a" strokeWidth="1.6" />
        <rect x="34" y="10" width="10" height="31" rx="1.5" stroke="#5aaa6a" strokeWidth="1.4" />
        <line x1="6" y1="44" x2="44" y2="44" stroke="#3a7a4a" strokeWidth="1" strokeLinecap="round" />
    </svg>
);

const IconSmall = ({ type }) => {
    if (type === 'sql') return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="24" height="5" rx="1" stroke="#c9a03d" strokeWidth="1.2" />
            <rect x="4" y="13" width="18" height="5" rx="1" stroke="#8b6914" strokeWidth="1.2" />
            <rect x="4" y="22" width="12" height="5" rx="1" stroke="#8b6914" strokeWidth="1.2" />
        </svg>
    );
    if (type === 'case') return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="14" cy="14" r="8" stroke="#c9a03d" strokeWidth="1.2" />
            <line x1="20" y1="20" x2="28" y2="28" stroke="#c9a03d" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
    if (type === 'hint') return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="11" stroke="#c9a03d" strokeWidth="1.2" />
            <line x1="16" y1="10" x2="16" y2="18" stroke="#c9a03d" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="16" cy="22" r="1.2" fill="#c9a03d" />
        </svg>
    );
    if (type === 'schema') return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="3" y="8" width="10" height="7" rx="1" stroke="#c9a03d" strokeWidth="1.2" />
            <rect x="19" y="4" width="10" height="7" rx="1" stroke="#8b6914" strokeWidth="1.2" />
            <rect x="19" y="20" width="10" height="7" rx="1" stroke="#8b6914" strokeWidth="1.2" />
            <line x1="13" y1="11.5" x2="19" y2="7.5" stroke="#8b6914" strokeWidth="1" />
            <line x1="13" y1="11.5" x2="19" y2="23.5" stroke="#8b6914" strokeWidth="1" />
        </svg>
    );
    if (type === 'score') return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4 L19 12 L28 12 L21 18 L24 26 L16 21 L8 26 L11 18 L4 12 L13 12 Z" stroke="#c9a03d" strokeWidth="1.2" fill="none" />
        </svg>
    );
    if (type === 'progress') return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="11" stroke="#2a2720" strokeWidth="3" />
            <path d="M16 5 A11 11 0 0 1 27 16" stroke="#c9a03d" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
    );
    return null;
};

const Landing = () => {
    const navigate = useNavigate();
    
    const handleNavigateToCases = () => {
        navigate("/cases");
    };
    
    const handleNavigateToPractice = () => {
        navigate("/practice");
    };
    
    const handleNavigateToPlayground = () => {
        navigate("/playground");
    };
    
    return (
        <div className="landing-page">
            {/* ── Navbar ── */}
            <nav className="navbar">
                <div className="nav-brand">
                    <IconMagnify className="nav-logo-icon" />
                    <span className="nav-title">QueryQuest</span>
                </div>
                <ul className="nav-links">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#howto">How It Works</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#start" className="nav-cta">Start Now</a></li>
                </ul>
            </nav>

            {/* ── Hero ── */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-eyebrow">
                        <span className="eyebrow-line" />
                        <span className="eyebrow-text">The SQL Training Ground</span>
                        <span className="eyebrow-line" />
                    </div>

                    <div className="hero-logo-row">
                        <IconMagnify className="hero-icon" />
                        <h1 className="hero-title">
                            <span className="title-query">Query</span>
                            <span className="title-quest">Quest</span>
                        </h1>
                    </div>

                    <div className="hero-rule" />

                    <p className="hero-tagline">
                        Step into the shadows &nbsp;&bull;&nbsp; Master the data<br />
                        Conquer SQL &nbsp;&bull;&nbsp; Become the expert
                    </p>

                    <p className="hero-prompt">
                        <span className="cursor">▌</span> Press start to begin your journey <span className="cursor">▌</span>
                    </p>
                </div>
            </section>

            {/* ── Mode Cards ── */}
            <section className="modes-section" id="start">
                <div className="modes-grid">
                    <button className="mode-card card-practice" onClick={handleNavigateToPractice}>
                        <IconBook className="card-icon" />
                        <span className="card-label">Practice Mode</span>
                        <span className="card-desc">Drill SQL fundamentals with<br />guided exercises & feedback</span>
                        <span className="card-tag tag-gold">Beginner Friendly</span>
                    </button>

                    <button className="mode-card card-cases" onClick={handleNavigateToCases}>
                        <IconBriefcase className="card-icon" />
                        <span className="card-label">Cases Mode</span>
                        <span className="card-desc">Solve noir mysteries using<br />real investigative queries</span>
                        <span className="card-tag tag-ember">Story Driven</span>
                    </button>

                    <button className="mode-card card-playground" onClick={handleNavigateToPlayground}>
                        <IconChart className="card-icon" />
                        <span className="card-label">Playground</span>
                        <span className="card-desc">Design schemas, explore data<br />and run free-form queries</span>
                        <span className="card-tag tag-moss">Open Sandbox</span>
                    </button>
                </div>
                <p className="modes-hint">Choose your path</p>
            </section>

            {/* ── Stats Strip ── */}
            <div className="stats-strip">
                <div className="stat-item">
                    <span className="stat-number">15</span>
                    <span className="stat-label">SQL Exercises</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">15</span>
                    <span className="stat-label">Detective Cases</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">3</span>
                    <span className="stat-label">Skill Levels</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">Free</span>
                    <span className="stat-label">Always Open</span>
                </div>
            </div>

            {/* ── Features ── */}
            <section className="features-section" id="features">
                <div className="section-header">
                    <p className="section-label">— What You Get —</p>
                    <h2 className="section-title">Built for You</h2>
                </div>
                <div className="features-grid">
                    {[
                        { type: 'sql', name: 'Live SQL Engine', text: 'Write and run real queries in the browser. Instant results, no setup required.' },
                        { type: 'case', name: 'Story Cases', text: 'Each case is a self-contained mystery with clues buried in the data.' },
                        { type: 'hint', name: 'Adaptive Hints', text: 'Stuck? The system nudges you without giving away the answer.' },
                        { type: 'schema', name: 'Schema Visualiser', text: 'See your tables and relationships as a live diagram while you query.' },
                        { type: 'score', name: 'Scoring System', text: 'Earn points for efficiency, accuracy and elegant queries.' },
                        { type: 'progress', name: 'Progress Tracking', text: 'Bookmark cases, track streaks and revisit weak areas.' },
                    ].map(f => (
                        <div className="feature-item" key={f.type}>
                            <IconSmall type={f.type} />
                            <span className="feature-name">{f.name}</span>
                            <p className="feature-text">{f.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="howto-section" id="howto">
                <div className="howto-inner">
                    <div className="section-header">
                        <p className="section-label">— The Method —</p>
                        <h2 className="section-title">How the Investigation Works</h2>
                    </div>
                    <div className="steps-row">
                        {[
                            { n: '01', title: 'Pick a Mode', text: 'Practice drills, a story case, or free-form sandbox.' },
                            { n: '02', title: 'Read the Brief', text: 'Study the schema and the mission brief carefully.' },
                            { n: '03', title: 'Write the Query', text: 'Interrogate the database using SQL.' },
                            { n: '04', title: 'Crack the Case', text: 'Submit your answer and collect your badge.' },
                        ].map(s => (
                            <div className="step-item" key={s.n}>
                                <div className="step-number">{s.n}</div>
                                <span className="step-title">{s.title}</span>
                                <p className="step-text">{s.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="cta-banner">
                <p className="section-label">— The Case Awaits —</p>
                <h2 className="cta-title">Ready to Open the File?</h2>
                <p className="cta-sub">No signup required. Pick a mode and start interrogating the data.</p>
                <div className="cta-buttons">
                    <button className="btn-primary" onClick={handleNavigateToCases}>Open a Case</button>
                    <button className="btn-secondary" onClick={handleNavigateToPractice}>Start Practising</button>
                </div>
            </section>
        </div>
    );
};

export default Landing;