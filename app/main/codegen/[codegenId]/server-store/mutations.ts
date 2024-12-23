import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createComponentCode } from "@/app/services/componentCode/componentCode.service"
import { ComponentCodeApi } from "@/app/api/componentCode/type"

export const useCreateComponentCode = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ComponentCodeApi.createResponse,
    Error,
    ComponentCodeApi.createRequest
  >({
    mutationFn: params => createComponentCode(params),
    onSuccess: () => {
      // Invalidate the component list query to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ["componentCodeList"] })
    },
  })
}
