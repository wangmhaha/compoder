export interface ComponentCodeVersionsContainerProps {
  /** Version number list */
  versions: number[]
  /** Currently active version */
  activeVersion: number
  /** Version change callback */
  onVersionChange: (version: number) => void
  /** Container content */
  children: React.ReactNode
  /** Bubble content */
  bubbleContent: React.ReactNode
}
