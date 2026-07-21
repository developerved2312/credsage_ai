import { useMutation, useQuery, useQueryClient } from 'react-query';
import { creditService } from '@services/creditService';
import type { CreditScoreInput } from '@appTypes/index';

export const useCredit = () => {
  const queryClient = useQueryClient();

  // Calculate credit score mutation
  const calculateScoreMutation = useMutation(creditService.calculateScore, {
    onSuccess: () => {
      queryClient.invalidateQueries(['credit', 'history']);
      queryClient.invalidateQueries(['credit', 'latest']);
      queryClient.invalidateQueries(['credit', 'stats']);
    },
  });

  // Get credit history query
  const {
    data: creditHistory,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useQuery(['credit', 'history'], () => creditService.getHistory({ limit: 10, offset: 0 }));

  // Get latest credit score query
  const {
    data: latestScore,
    isLoading: isLatestLoading,
    refetch: refetchLatest,
  } = useQuery(['credit', 'latest'], creditService.getLatest, {
    retry: false,
  });

  // Get credit stats query
  const { data: creditStats, isLoading: isStatsLoading } = useQuery(
    ['credit', 'stats'],
    creditService.getStats
  );

  // Delete credit score mutation
  const deleteScoreMutation = useMutation(creditService.deleteScore, {
    onSuccess: () => {
      queryClient.invalidateQueries(['credit']);
    },
  });

  // Calculate credit score
  const calculateScore = (data: CreditScoreInput) => {
    return calculateScoreMutation.mutateAsync(data);
  };

  return {
    creditHistory,
    latestScore,
    creditStats,
    calculateScore,
    deleteScore: deleteScoreMutation.mutate,
    isCalculating: calculateScoreMutation.isLoading,
    isHistoryLoading,
    isLatestLoading,
    isStatsLoading,
    calculateError: calculateScoreMutation.error,
    refetchHistory,
    refetchLatest,
  };
};
