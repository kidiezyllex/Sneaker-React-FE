import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { chatbotApi } from "@/api/chatbot";

export const useSyncChatbotProducts = (): UseMutationResult<
    { success: boolean; message: string },
    Error,
    void
> => {
    return useMutation({
        mutationFn: () => chatbotApi.syncProducts(),
    });
};
