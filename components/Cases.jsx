import React, { useState } from 'react';
import './Practice.css';
import Difficulty from './Difficulty';
import TierPage from './TierPage';
import caseQuestions from '../src/questions.js'; // Import case questions

const Cases = () => {
    const [selectedTier, setSelectedTier] = useState(null);

    const onSelected = (tier) => {
        console.log('Selected:', tier);
        setSelectedTier(tier);
    };

    const handleBack = () => {
        setSelectedTier(null);
    };

    // Calculate progress for each difficulty
    const getProgressForDifficulty = (difficulty) => {
        const filteredQuestions = caseQuestions.filter(
            q => q.difficulty === difficulty
        );
        const solvedCount = filteredQuestions.filter(q => q.solved === 1).length;
        const totalCount = filteredQuestions.length;
        return totalCount === 0 ? 0 : Math.round((solvedCount / totalCount) * 100);
    };

    // Get question count for each difficulty
    const getQuestionCount = (difficulty) => {
        return caseQuestions.filter(q => q.difficulty === difficulty).length;
    };

    if (selectedTier) {
        return (
            <TierPage 
                tier={selectedTier} 
                onBack={handleBack} 
                questions={caseQuestions}
                title="Cases Mode"
            />
        );
    }

    return (
        <div className="divv">
            <div className="difficulty-wrapper">
                <div className="diff-header">
                    <div className="diff-eyebrow">
                        <span className="diff-eyebrow-line" />
                        <span className="diff-eyebrow-text">Choose Your Difficulty</span>
                        <span className="diff-eyebrow-line" />
                    </div>
                    <h1 className="diff-title">Select a Tier</h1>
                    <p className="diff-subtitle">How deep do you want to go, detective?</p>
                </div>

                <div className="diff-grid">
                    <Difficulty 
                        diff="Easy" 
                        ques={getQuestionCount('Easy')} 
                        progress={getProgressForDifficulty('Easy')} 
                        onSelected={onSelected} 
                        cta="Start Your Detective Journey" 
                    />
                    <Difficulty 
                        diff="Medium" 
                        ques={getQuestionCount('Medium')} 
                        progress={getProgressForDifficulty('Medium')} 
                        onSelected={onSelected} 
                        cta="Practice Your Detective Skills" 
                    />
                    <Difficulty 
                        diff="Hard" 
                        ques={getQuestionCount('Hard')} 
                        progress={getProgressForDifficulty('Hard')} 
                        onSelected={onSelected} 
                        cta="Become a Master Detective" 
                    />
                </div>

                <div className="diff-footer">
                    <div className="diff-footer-dot" />
                    <span>Click a tier to begin your case</span>
                    <div className="diff-footer-dot" style={{ animationDelay: '0.8s' }} />
                </div>
            </div>
        </div>
    );
};

export default Cases;