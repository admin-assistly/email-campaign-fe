import { useState, useEffect } from 'react';
import { fetchClassificationMetrics, fetchCampaignPerformance } from '@/services/api';

export function useMetrics(campaignId?: string) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshMetrics = async () => {
    try {
      setLoading(true);
      const [classificationMetrics, campaignPerformance] = await Promise.all([
        fetchClassificationMetrics(campaignId),
        campaignId ? null : fetchCampaignPerformance()
      ]);
      
      setMetrics({
        classifications: classificationMetrics,
        campaigns: campaignPerformance
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      console.error('Failed to fetch metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMetrics();
    
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, [campaignId]);

  return { metrics, loading, error, refreshMetrics };
} 