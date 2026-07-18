// SchemaDesignForm.js
import React, { useState } from 'react';
import './SchemaDesignForm.css';

const SchemaDesignForm = ({ question, onBack, onSubmit }) => {
  const [formData, setFormData] = useState({
    tableName: '',
    columns: []
  });
  const [currentColumn, setCurrentColumn] = useState({
    name: '',
    type: 'VARCHAR',
    isPrimaryKey: false,
    isNullable: true,
    isUnique: false
  });
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [errors, setErrors] = useState([]);

  const dataTypes = ['VARCHAR', 'INTEGER', 'DECIMAL', 'DATE', 'BOOLEAN', 'TEXT'];

  const addColumn = () => {
    if (!currentColumn.name.trim()) {
      setErrors(['Column name is required']);
      return;
    }

    setFormData({
      ...formData,
      columns: [...formData.columns, { ...currentColumn }]
    });
    setCurrentColumn({
      name: '',
      type: 'VARCHAR',
      isPrimaryKey: false,
      isNullable: true,
      isUnique: false
    });
    setShowColumnForm(false);
    setErrors([]);
  };

  const removeColumn = (index) => {
    const newColumns = formData.columns.filter((_, i) => i !== index);
    setFormData({ ...formData, columns: newColumns });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.tableName.trim()) {
      setErrors(['Table name is required']);
      return;
    }
    
    if (formData.columns.length === 0) {
      setErrors(['At least one column is required']);
      return;
    }

    // Check if there's a primary key
    const hasPrimaryKey = formData.columns.some(col => col.isPrimaryKey);
    if (!hasPrimaryKey) {
      setErrors(['Table must have a primary key column']);
      return;
    }

    onSubmit(formData);
  };

  const generateSQLPreview = () => {
    let sql = `CREATE TABLE ${formData.tableName} (\n`;
    const columnDefs = formData.columns.map(col => {
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

  return (
    <div className="schema-design-form">
      <div className="form-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Questions
        </button>
        <h2>{question.title}</h2>
        <p className="question-text">{question.question}</p>
      </div>

      <div className="requirements-section">
        <h3>📋 Design Requirements</h3>
        <ul>
          {question.requirements.map((req, idx) => (
            <li key={idx}>{req}</li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="design-form">
        <div className="form-group">
          <label>Table Name *</label>
          <input
            type="text"
            value={formData.tableName}
            onChange={(e) => setFormData({ ...formData, tableName: e.target.value })}
            placeholder="e.g., users, products, employees"
            className="form-input"
          />
        </div>

        <div className="columns-section">
          <div className="columns-header">
            <h3>📊 Columns</h3>
            {!showColumnForm && (
              <button 
                type="button"
                className="add-column-btn"
                onClick={() => setShowColumnForm(true)}
              >
                + Add Column
              </button>
            )}
          </div>

          {formData.columns.length > 0 && (
            <div className="columns-list">
              <table className="columns-table">
                <thead>
                  <tr>
                    <th>Column Name</th>
                    <th>Data Type</th>
                    <th>Primary Key</th>
                    <th>Nullable</th>
                    <th>Unique</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.columns.map((col, idx) => (
                    <tr key={idx}>
                      <td><strong>{col.name}</strong></td>
                      <td>{col.type}</td>
                      <td>{col.isPrimaryKey ? '✓' : ''}</td>
                      <td>{col.isNullable ? 'Yes' : 'No'}</td>
                      <td>{col.isUnique ? '✓' : ''}</td>
                      <td>
                        <button 
                          type="button"
                          className="remove-col-btn"
                          onClick={() => removeColumn(idx)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showColumnForm && (
            <div className="column-form">
              <h4>Add New Column</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Column Name *</label>
                  <input
                    type="text"
                    value={currentColumn.name}
                    onChange={(e) => setCurrentColumn({ ...currentColumn, name: e.target.value })}
                    placeholder="e.g., id, name, email"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Data Type</label>
                  <select
                    value={currentColumn.type}
                    onChange={(e) => setCurrentColumn({ ...currentColumn, type: e.target.value })}
                    className="form-select"
                  >
                    {dataTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={currentColumn.isPrimaryKey}
                    onChange={(e) => setCurrentColumn({ ...currentColumn, isPrimaryKey: e.target.checked })}
                  />
                  Primary Key
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={!currentColumn.isNullable}
                    onChange={(e) => setCurrentColumn({ ...currentColumn, isNullable: !e.target.checked })}
                  />
                  NOT NULL
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={currentColumn.isUnique}
                    onChange={(e) => setCurrentColumn({ ...currentColumn, isUnique: e.target.checked })}
                  />
                  Unique
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-primary" onClick={addColumn}>
                  Add Column
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowColumnForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {formData.columns.length > 0 && (
          <div className="preview-section">
            <h3>🔍 SQL Preview</h3>
            <pre className="sql-preview">{generateSQLPreview()}</pre>
          </div>
        )}

        {errors.length > 0 && (
          <div className="error-section">
            {errors.map((error, idx) => (
              <p key={idx} className="error-message">⚠️ {error}</p>
            ))}
          </div>
        )}

        <div className="submit-section">
          <button type="submit" className="submit-btn">
            Submit Schema Design
          </button>
        </div>
      </form>
    </div>
  );
};

export default SchemaDesignForm;