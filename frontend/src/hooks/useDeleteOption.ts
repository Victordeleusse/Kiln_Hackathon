import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteOption() {
  const queryClient = useQueryClient();

  const deleteOption = async (id: number) => {
    const response = await fetch(`/api/options/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete option');
    }

    return true;
  };

  const mutation = useMutation({
    mutationFn: deleteOption,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['options'] });

      const previousOptions = queryClient.getQueryData(['options']);

      queryClient.setQueryData(['options'], (old: any) =>
        old.filter((option: any) => option.id !== id)
      );

      return { previousOptions };
    },
    onError: (error: Error, id: number, context: any) => {
      console.error('Error deleting option:', error.message);
      queryClient.setQueryData(['options'], context.previousOptions);
    },
    onSuccess: () => {
      console.log('Option deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['options'] });
    },
  });

  return {
    deleteOption: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
