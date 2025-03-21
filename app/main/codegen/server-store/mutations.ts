import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createComponentCode,
  editComponentCode,
  saveComponentCode,
} from "@/app/services/componentCode/componentCode.service"
import { ComponentCodeApi } from "@/app/api/componentCode/type"
import { useToast } from "@/hooks/use-toast"

export const useCreateComponentCode = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

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
    onError: error => {
      console.error("createComponentCode error", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export const useEditComponentCode = () => {
  return useMutation<
    ComponentCodeApi.editResponse,
    Error,
    ComponentCodeApi.editRequest
  >({
    mutationFn: params => editComponentCode(params),
  })
}

export const useSaveComponentCode = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation<any, Error, ComponentCodeApi.saveRequest>({
    mutationFn: params => saveComponentCode(params),
    onSuccess: () => {
      // Invalidate the component detail query to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ["componentCodeDetail"] })
    },
    onError: error => {
      console.error("saveComponentCode error", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}
