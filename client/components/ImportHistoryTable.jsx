import { useState } from 'react';

export default function ImportHistoryTable({ data }) {
  const [expandedRow, setExpandedRow] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in_progress':
        return 'status-progress';
      case 'failed':
        return 'status-failed';
      default:
        return '';
    }
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <p>No import history available</p>
        <p className="empty-state-subtitle">Trigger an import to see results here</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="import-table">
        <thead>
          <tr>
            <th>File Name / URL</th>
            <th>Total</th>
            <th>New</th>
            <th>Updated</th>
            <th>Failed</th>
            <th>Status</th>
            <th>Timestamp</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((log) => (
            <>
              <tr key={log._id}>
                <td className="file-name">{log.fileName}</td>
                <td className="number">{log.totalImported || 0}</td>
                <td className="number success">{log.newJobs || 0}</td>
                <td className="number warning">{log.updatedJobs || 0}</td>
                <td className="number danger">{log.failedJobs || 0}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(log.status)}`}>
                    {log.status}
                  </span>
                </td>
                <td className="timestamp">{formatDate(log.timestamp)}</td>
                <td>
                  {log.failedJobs > 0 && (
                    <button
                      className="btn-details"
                      onClick={() => toggleRow(log._id)}
                    >
                      {expandedRow === log._id ? 'Hide' : 'Details'}
                    </button>
                  )}
                </td>
              </tr>
              {expandedRow === log._id && log.failedJobDetails && (
                <tr className="expanded-row">
                  <td colSpan="8">
                    <div className="failed-details">
                      <h4>Failed Jobs Details</h4>
                      <div className="failed-list">
                        {log.failedJobDetails.map((failed, idx) => (
                          <div key={idx} className="failed-item">
                            <strong>Job ID:</strong> {failed.jobId}
                            <br />
                            <strong>Reason:</strong> {failed.reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
