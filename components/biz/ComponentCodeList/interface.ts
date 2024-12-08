export interface ComponentItem {
  id: string
  title: string
  description: string
}

export interface ComponentCodeListProps {
  items: ComponentItem[]
  onItemClick?: (id: string) => void
  onEditClick?: (id: string) => void
  onDeleteClick?: (id: string) => void
  className?: string
}
