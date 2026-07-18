// Playground.js
import React, { useState } from 'react';
import './TierPage.css';
import './SchemaDesignForm.css';
import playgroundQuestions from '../src/playgroundQuestions';
import SchemaDesignForm from './SchemaDesignForm';

const Playground = ({ onBack }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
  };

  const handleBackToList = () => {
    setSelectedQuestion(null);
  };

  const handleSchemaSubmit = (schemaData) => {
    console.log('Schema submitted:', schemaData);
    // Here you can save to database, update progress, etc.
    alert(`Schema "${schemaData.tableName}" submitted successfully!\n\nSQL Generated:\n${generateSQLFromData(schemaData)}`);
  };

  const generateSQLFromData = (data) => {
    let sql = `CREATE TABLE ${data.tableName} (\n`;
    const columnDefs = data.columns.map(col => {
      let def = `  ${col.name} ${col.type}`;
      if (col.isPrimaryKey) def += ' PRIMARY KEY';
      if (!col.isNullable) def += ' NOT NULL';
      if (col.isUnique) def += ' UNIQUE';
      return def;
    });
    sql += columnDefs.join(',\n');
    sql += `\n);`;
    return sql;
  };

  // Stats
  const solvedCount = playgroundQuestions.filter(q => q.solved === 1).length;
  const unsolvedCount = playgroundQuestions.filter(q => q.solved === 0).length;
  const totalCount = playgroundQuestions.length;
  const progress = totalCount === 0 ? 0 : Math.round((solvedCount / totalCount) * 100);

  const getStatusConfig = (question) => {
    if (question.solved === 1) {
      return { text: '✓ SOLVED', class: 'status-solved' };
    }
    return { text: '○ UNSOLVED', class: 'status-unsolved' };
  };

  if (selectedQuestion) {
    return (
      <SchemaDesignForm
        question={selectedQuestion}
        onBack={handleBackToList}
        onSubmit={handleSchemaSubmit}
      />
    );
  }

  return (
    <div className="tier-page">
      <div className="tier-header">
        <div className="header-left">
        </div>
        <div className="header-center">
          <h2 className="tier-title">SQL Playground - Schema Design</h2>
        </div>
        <div className="header-right"></div>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <span className="label">TOTAL</span>
          <span className="value">{totalCount}</span>
        </div>
        <div className="stat-card">
          <span className="label">COMPLETED</span>
          <span className="value solved-value">{solvedCount}</span>
        </div>
        <div className="stat-card">
          <span className="label">PENDING</span>
          <span className="value unsolved-value">{unsolvedCount}</span>
        </div>
        <div className="stat-card">
          <span className="label">PROGRESS</span>
          <span className="value">{progress}%</span>
        </div>
      </div>

      <div className="questions-list">
        {playgroundQuestions.map((q, index) => {
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
                <span className="question-badge">Schema Design</span>
              </div>
              <div className={`status-badge ${statusConfig.class}`}>
                {statusConfig.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Playground;