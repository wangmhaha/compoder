import { editComponentCode } from "@/app/services/componentCode/componentCode.service"
import { useMutation } from "@tanstack/react-query"
import { ComponentCodeApi } from "@/app/api/componentCode/type"

export const useEditComponentCode = () => {
  return useMutation<
    ComponentCodeApi.editResponse,
    Error,
    ComponentCodeApi.editRequest
  >({
    mutationFn: params => editComponentCode(params),
  })
}
