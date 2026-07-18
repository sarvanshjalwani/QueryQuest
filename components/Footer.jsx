import React from 'react';
import './Footer.css';

const IconMagnify = () => (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="9" r="6" stroke="#c9a03d" strokeWidth="1.4" />
        <circle cx="9" cy="9" r="3" stroke="#8b6914" strokeWidth="1" />
        <line x1="13.5" y1="13.5" x2="20" y2="20"
            stroke="#c9a03d" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);
const Footer = () => (
    <footer className="footer">

        <div className="footer-container">

            <div className="footer-grid">

                {/* Brand */}
                <div className="footer-brand">
                    <div className="footer-logo">
                        <IconMagnify />
                        <span className="footer-logo-text">QueryQuest</span>
                    </div>

                    <p className="footer-brand-desc">
                        Master databases through noir-style interactive learning.
                    </p>

                    <div className="footer-brand-badges">
                        <span>Est. 2024</span>
                        <span>Free</span>
                        <span>Open Source</span>
                    </div>
                </div>

                {/* Columns */}
                <div className="footer-col">
                    <span className="footer-col-title">Explore</span>
                    <a href="/practice">Practice Challenges</a>
                    <a href="/cases">Mystery Cases</a>
                    <a href="/playground">Schema Playground</a>
                    <a href="#">Leaderboard</a>
                </div>

                <div className="footer-col">
                    <span className="footer-col-title">Resources</span>
                    <a href="#">SQL Reference</a>
                    <a href="#">Design Guide</a>
                    <a href="#">Changelog</a>
                    <a href="#">Report a Bug</a>
                </div>

                <div className="footer-col">
                    <span className="footer-col-title">Connect</span>
                    <a href="#">GitHub</a>
                    <a href="#">Discord</a>
                    <a href="#">Twitter</a>
                    <a href="#">About</a>
                </div>

            </div>

            {/* Bottom */}
            <div className="footer-bottom">
                <p>© 2024 <span>QueryQuest</span></p>

                <div className="footer-status">
                    <div className="dot" />
                    <span>All systems operational</span>
                </div>

                <div className="footer-legal">
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                    <a href="#">Cookies</a>
                </div>
            </div>

        </div>

    </footer>
);
export default Footer;