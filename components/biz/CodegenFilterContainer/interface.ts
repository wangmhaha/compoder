import { StackType } from "../CodegenList/interface"

export interface CodegenFilterContainerProps {
  /** 是否有更多数据 */
  hasMore?: boolean
  /** 是否正在加载 */
  isLoading?: boolean
  /** 当前选中的技术栈 */
  selectedStack?: StackType | "all"
  /** 搜索关键词 */
  searchKeyword?: string
  /** 技术栈变化回调 */
  onStackChange?: (stack: StackType | "all") => void
  /** 搜索关键词变化回调 */
  onSearchChange?: (keyword: string) => void
  /** 加载更多回调 */
  onLoadMore?: () => void
  /** 子组件 */
  children: React.ReactNode
  /** 自定义类名 */
  className?: string
}
