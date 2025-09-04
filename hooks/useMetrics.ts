import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchClassificationMetrics, fetchCampaignPerformance } from '@/services/api';
import type { Metrics, ClassificationMetrics, CampaignPerformance } from '@/lib/types';

interface UseMetricsOptions {
  campaignId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useMetrics(options: UseMetricsOptions = {}) {
  const { 
    campaignId, 
    autoRefresh = true, 
    refreshInterval = 30000 
  } = options;
  
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [classificationMetrics, campaignPerformance] = await Promise.all([
        fetchClassificationMetrics(campaignId),
        campaignId ? null : fetchCampaignPerformance()
      ]);
      
      const newMetrics: Metrics = {
        classifications: classificationMetrics,
        campaigns: campaignPerformance || []
      };
      
      setMetrics(newMetrics);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch metrics';
      setError(errorMessage);
      console.error('Failed to fetch metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  // Memoized computed values
  const totalResponses = useMemo(() => {
    if (!metrics?.classifications) return 0;
    return metrics.classifications.total;
  }, [metrics?.classifications]);

  const responseRate = useMemo(() => {
    if (!metrics?.classifications || !metrics?.campaigns) return 0;
    const totalSent = metrics.campaigns.reduce((sum, campaign) => sum + campaign.total_sent, 0);
    return totalSent > 0 ? (totalResponses / totalSent) * 100 : 0;
  }, [metrics, totalResponses]);

  const topPerformingCampaign = useMemo(() => {
    if (!metrics?.campaigns || metrics.campaigns.length === 0) return null;
    return metrics.campaigns.reduce((best, current) => 
      current.response_rate > best.response_rate ? current : best
    );
  }, [metrics?.campaigns]);

  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(refreshMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshMetrics]);

  return { 
    metrics, 
    loading, 
    error, 
    lastUpdated,
    totalResponses,
    responseRate,
    topPerformingCampaign,
    refreshMetrics 
  };
} 