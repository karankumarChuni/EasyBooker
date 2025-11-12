import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQueueStats } from '../store/slices/importSlice';
import { fetchJobStats } from '../store/slices/jobSlice';

export default function Stats() {
  const dispatch = useDispatch();
  const { queueStats } = useSelector((state) => state.import);
  const { stats: jobStats } = useSelector((state) => state.job);

  useEffect(() => {
    dispatch(fetchQueueStats());
    dispatch(fetchJobStats());

    const interval = setInterval(() => {
      dispatch(fetchQueueStats());
      dispatch(fetchJobStats());
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">Total Jobs</div>
        <div className="stat-value">{jobStats.total || 0}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Queue: Active</div>
        <div className="stat-value">{queueStats.active || 0}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Queue: Waiting</div>
        <div className="stat-value">{queueStats.waiting || 0}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Queue: Completed</div>
        <div className="stat-value">{queueStats.completed || 0}</div>
      </div>
    </div>
  );
}
