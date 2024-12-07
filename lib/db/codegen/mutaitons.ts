import { CodegenModel } from "./schema"
import { Codegen } from "./types"

export async function createCodegen(codegen: Codegen | Codegen[]) {
  await CodegenModel.create(codegen)
}
