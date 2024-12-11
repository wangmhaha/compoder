import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useFile } from "../context/FileContext"
import { FileTree } from "./FileTree"

export function AppSidebar() {
  const { handleFileSelect, files } = useFile()

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {files.map((item, index) => (
                <FileTree
                  key={index}
                  item={item}
                  onFileClick={handleFileSelect}
                  variant="sidebar"
                  defaultOpen={item.name === "components" || item.name === "ui"}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
