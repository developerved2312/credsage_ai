import { useMutation, useQuery, useQueryClient } from 'react-query';
import { investmentService } from '@services/investmentService';

export const useInvestment = () => {
  const queryClient = useQueryClient();

  // Portfolio queries
  const {
    data: portfolios,
    isLoading: isPortfoliosLoading,
    refetch: refetchPortfolios,
  } = useQuery(['portfolios'], investmentService.portfolio.getAll);

  // Create portfolio mutation
  const createPortfolioMutation = useMutation(investmentService.portfolio.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(['portfolios']);
    },
  });

  // Update portfolio mutation
  const updatePortfolioMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => investmentService.portfolio.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['portfolios']);
      },
    }
  );

  // Delete portfolio mutation
  const deletePortfolioMutation = useMutation(investmentService.portfolio.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['portfolios']);
    },
  });

  // Investment queries
  const {
    data: investments,
    isLoading: isInvestmentsLoading,
    refetch: refetchInvestments,
  } = useQuery(['investments'], () => investmentService.investment.getAll());

  // Add investment mutation
  const addInvestmentMutation = useMutation(investmentService.investment.add, {
    onSuccess: () => {
      queryClient.invalidateQueries(['investments']);
      queryClient.invalidateQueries(['portfolios']);
      queryClient.invalidateQueries(['analytics']);
    },
  });

  // Update investment mutation
  const updateInvestmentMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => investmentService.investment.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['investments']);
        queryClient.invalidateQueries(['portfolios']);
        queryClient.invalidateQueries(['analytics']);
      },
    }
  );

  // Delete investment mutation
  const deleteInvestmentMutation = useMutation(investmentService.investment.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['investments']);
      queryClient.invalidateQueries(['portfolios']);
      queryClient.invalidateQueries(['analytics']);
    },
  });

  // Get recommendations query
  const {
    data: recommendations,
    isLoading: isRecommendationsLoading,
    refetch: refetchRecommendations,
  } = useQuery(['recommendations'], () =>
    investmentService.getRecommendations({ riskTolerance: 'medium', investmentAmount: 10000 })
  );

  // Get analytics query
  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery(['analytics'], investmentService.getAnalytics);

  return {
    // Data
    portfolios,
    investments,
    recommendations,
    analytics,

    // Loading states
    isPortfoliosLoading,
    isInvestmentsLoading,
    isRecommendationsLoading,
    isAnalyticsLoading,

    // Portfolio methods
    createPortfolio: createPortfolioMutation.mutate,
    updatePortfolio: updatePortfolioMutation.mutate,
    deletePortfolio: deletePortfolioMutation.mutate,

    // Investment methods
    addInvestment: addInvestmentMutation.mutate,
    updateInvestment: updateInvestmentMutation.mutate,
    deleteInvestment: deleteInvestmentMutation.mutate,

    // Refetch methods
    refetchPortfolios,
    refetchInvestments,
    refetchRecommendations,
    refetchAnalytics,

    // Loading states for mutations
    isCreatingPortfolio: createPortfolioMutation.isLoading,
    isAddingInvestment: addInvestmentMutation.isLoading,
  };
};
