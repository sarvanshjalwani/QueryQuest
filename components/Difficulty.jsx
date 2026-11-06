import React from 'react';
import './Difficulty.css';
import Progress from './Progress';

/* ── Icons ── */

const IconShield = () => (
    <svg viewBox="0 0 32 32" fill="none">
        <path d="M16 3 L28 8 V17 C28 23 23 28 16 30 C9 28 4 23 4 17 V8 Z"
            stroke="#c9a03d" strokeWidth="1.4" strokeLinejoin="round" />
        <polyline points="11,16 14.5,20 21,12"
            stroke="#c9a03d" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconCrosshair = () => (
    <svg viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="10" stroke="#c05a2a" strokeWidth="1.4" />
        <circle cx="16" cy="16" r="4.5" stroke="#c05a2a" strokeWidth="1.2" />
        <circle cx="16" cy="16" r="1.4" fill="#c05a2a" />
        <line x1="16" y1="2" x2="16" y2="8" stroke="#c05a2a" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="16" y1="24" x2="16" y2="30" stroke="#c05a2a" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="2" y1="16" x2="8" y2="16" stroke="#c05a2a" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="24" y1="16" x2="30" y2="16" stroke="#c05a2a" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
);

const IconSkull = () => (
    <svg viewBox="0 0 32 32" fill="none">
        <path d="M16 4 C10 4 6 8.5 6 14 C6 18 8 21 11 22.5 V26 H21 V22.5 C24 21 26 18 26 14 C26 8.5 22 4 16 4Z"
            stroke="#a03030" strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx="12.5" cy="14" r="2" stroke="#a03030" strokeWidth="1.2" />
        <circle cx="19.5" cy="14" r="2" stroke="#a03030" strokeWidth="1.2" />
        <line x1="13" y1="26" x2="13" y2="28" stroke="#a03030" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="16" y1="26" x2="16" y2="29" stroke="#a03030" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="19" y1="26" x2="19" y2="28" stroke="#a03030" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
);

/* ── Config ── */

const CARD_CONFIG = {
    Easy: {
        cls: 'card-easy',
        tier: 'Tier 01',
        icon: <IconShield />,
        tagline: 'Begin your SQL journey with fundamental queries',
    },
    Medium: {
        cls: 'card-medium',
        tier: 'Tier 02',
        icon: <IconCrosshair />,
        tagline: 'Test your skills with intermediate challenges',
    },
    Hard: {
        cls: 'card-hard',
        tier: 'Tier 03',
        icon: <IconSkull />,
        tagline: 'Prove your mastery with advanced problems',
    },
};

/* ── Difficulty Card ── */

export default function Difficulty({ diff, ques, progress, onSelected, cta }) {
    const cfg = CARD_CONFIG[diff];
    
    /* Calculate progress percentage */
    const total = Number(ques);
    const completed = Number(progress);
    const pct = total > 0 ? Math.min(Math.max(Math.round((completed / total) * 100), 0), 100) : 0;
    const solved = Math.min(Math.max(completed, 0), total);

    const handleClick = () => {
        if (onSelected) {
            onSelected(diff);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    return (
        <div
            className={`diff-card ${cfg.cls}`}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            {/* Icon */}
            <div className="card-icon-wrap">{cfg.icon}</div>

            {/* Labels */}
            <span className="card-difficulty-label">{cfg.tier}</span>
            <h2 className="card-title">{diff}</h2>
            <p className="card-tagline">{cfg.tagline}</p>

            <div className="card-rule" />

            {/* Stats */}
            <div className="card-stats">
                <div className="stat-row">
                    <span className="stat-label">Total Questions</span>
                    <span className="stat-value">{ques}</span>
                </div>
            </div>

            {/* Progress — uses your Progress component */}
            <div className="progress-block">
                <div className="progress-meta">
                    <span className="progress-label">Completion</span>
                    <span className="progress-pct">{pct}%</span>
                </div>
                <Progress total={Number(ques)} completed={solved} />
            </div>
            
            {/* CTA */}
            <div className="card-cta">
                <span>{cta}</span>
                <span>→</span>
            </div>
        </div>
    );
}