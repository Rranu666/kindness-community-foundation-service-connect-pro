import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook for optimistic mutations with instant UI feedback
 * @param {Object} options
 * @param {Function} options.mutationFn - The async function to execute
 * @param {string|string[]} options.queryKeys - Query key(s) to invalidate on success
 * @param {Function} options.onSuccess - Optional success callback
 * @param {Function} options.onError - Optional error callback
 * @param {Function} options.optimisticData - Optional function to generate optimistic data
 * @returns {Object} Mutation object with isPending state
 */
export function useOptimisticMutation({
  mutationFn,
  queryKeys = [],
  onSuccess,
  onError,
  optimisticData,
}) {
  const queryClient = useQueryClient();
  const keys = Array.isArray(queryKeys) ? queryKeys : [queryKeys];

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await Promise.all(keys.map(key => queryClient.cancelQueries({ queryKey: [key] })));

      // Snapshot the previous data
      const previousData = {};
      keys.forEach(key => {
        previousData[key] = queryClient.getQueryData([key]);
      });

      // Optimistically update the cache if function provided
      if (optimisticData) {
        const optimistic = optimisticData(variables);
        keys.forEach(key => {
          queryClient.setQueryData([key], optimistic);
        });
      }

      return previousData;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate queries to refetch fresh data
      keys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Rollback to previous data on error
      if (context) {
        Object.entries(context).forEach(([key, data]) => {
          queryClient.setQueryData([key], data);
        });
      }
      onError?.(error, variables, context);
    },
  });
}