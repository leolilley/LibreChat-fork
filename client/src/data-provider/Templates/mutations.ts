import { useMutation, useQueryClient } from '@tanstack/react-query';
import { templateApi } from './queries';

export const useTriggerSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templateApi.triggerSync,
    onSuccess: () => {
      // Invalidate sync status to start polling
      queryClient.invalidateQueries({ queryKey: ['templates', 'sync', 'status'] });
      
      // Invalidate template data after a delay to allow sync to complete
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['templates'] });
      }, 2000);
    },
    onError: (error) => {
      console.error('Failed to trigger template sync:', error);
    }
  });
};