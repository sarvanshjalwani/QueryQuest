import React, { useMemo, useState } from 'react';
import './TierPage.css';
import QuestionRun from './QuestionRun';

const TierPage = ({ 
  tier, 
  onBack, 
  questions,
  title,
  showStats = true,
  solvedQuestionIds,
  progressError,
  onQuestionSolved,
}) => {
  const [clicked, setClicked] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const filteredQuestions = useMemo(() => questions
    .filter((question) => question.difficulty === tier)
    .map((question) => ({
      ...question,
      solved: question.solved === 1 || solvedQuestionIds.has(String(question.id)) ? 1 : 0,
    })), [questions, tier, solvedQuestionIds]);

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    setClicked(true);
  };

  const handleBackToList = () => {
    setSelectedQuestion(null);
    setClicked(false);
  };

  // Stats based on solved field (0 = unsolved, 1 = solved)
  const solvedCount = filteredQuestions.filter(q => q.solved === 1).length;
  const unsolvedCount = filteredQuestions.filter(q => q.solved === 0).length;
  const totalCount = filteredQuestions.length;
  const progress = totalCount === 0 ? 0 : Math.round((solvedCount / totalCount) * 100);

  const getStatusConfig = (question) => {
    if (question.solved === 1) {
      return { text: '✓ SOLVED', class: 'status-solved' };
    }
    return { text: '○ UNSOLVED', class: 'status-unsolved' };
  };

  return (
    <div className="tier-page">
      {/* Header */}
      <div className="tier-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            ← BACK
          </button>
        </div>
        
        {title && (
          <div className="header-center">
            <h2 className="tier-title">{title} - {tier}</h2>
          </div>
        )}

        <div className="header-right"></div>
      </div>

      {/* If clicked → show QuestionRun */}
      {clicked && selectedQuestion ? (
        <QuestionRun
          selectedQuestion={selectedQuestion}
          questions={filteredQuestions}
          handleBackToList={handleBackToList}
          onQuestionSolved={onQuestionSolved}
        />
      ) : (
        <>
          {/* Stats - only show if enabled */}
          {showStats && (
            <div className="stats-container">
              <div className="stat-card">
                <span className="label">TOTAL</span>
                <span className="value">{totalCount}</span>
              </div>

              <div className="stat-card">
                <span className="label">SOLVED</span>
                <span className="value solved-value">{solvedCount}</span>
              </div>

              <div className="stat-card">
                <span className="label">UNSOLVED</span>
                <span className="value unsolved-value">{unsolvedCount}</span>
              </div>

              <div className="stat-card">
                <span className="label">PROGRESS</span>
                <span className="value">{progress}%</span>
              </div>
            </div>
          )}

          {/* Questions List */}
          <div className="questions-list">
            {progressError && <p className="no-questions" role="alert">{progressError}</p>}
            {filteredQuestions.length === 0 && (
              <p className="no-questions">No questions found for {tier} tier</p>
            )}

            {filteredQuestions.map((q, index) => {
              const statusConfig = getStatusConfig(q);

              return (
                <div
                  key={q.id}
                  className="question-item"
                  onClick={() => handleQuestionClick(q)}
                >
                  <div className="question-left">
                    <div className="q-number">{index + 1}</div>
                    <div className="q-title">{q.title}</div>
                  </div>

                  <div className={`status-badge ${statusConfig.class}`}>
                    {statusConfig.text}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default TierPage;