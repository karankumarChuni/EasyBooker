import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchImportHistory, triggerImport } from '../store/slices/importSlice';
import ImportHistoryTable from '../components/ImportHistoryTable';
import Stats from '../components/Stats';

export default function Home() {
  const dispatch = useDispatch();
  const { history, loading, error } = useSelector((state) => state.import);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    dispatch(fetchImportHistory());
    const interval = setInterval(() => {
      dispatch(fetchImportHistory());
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleTriggerImport = async () => {
    setTriggering(true);
    try {
      await dispatch(triggerImport()).unwrap();
      setTimeout(() => {
        dispatch(fetchImportHistory());
      }, 2000);
    } catch (err) {
      console.error('Failed to trigger import:', err);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Job Import Dashboard</h1>
        <p className="subtitle">Track and manage job feed imports with real-time updates</p>
      </header>

      <div className="actions">
        <button 
          className="btn-primary" 
          onClick={handleTriggerImport}
          disabled={triggering}
        >
          {triggering ? 'Importing...' : 'Trigger Manual Import'}
        </button>
      </div>

      <Stats />

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Import History</h2>
          <p className="section-description">
            View detailed logs of all job import operations
          </p>
        </div>

        {loading && history.length === 0 ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading import history...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        ) : (
          <ImportHistoryTable data={history} />
        )}
      </div>
    </div>
  );
}
