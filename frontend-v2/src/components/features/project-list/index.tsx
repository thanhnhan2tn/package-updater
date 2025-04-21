"use client"

import type { Project } from "@/types/dependency"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Folder, GitBranch, FolderSync, GitPullRequest } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProjectListProps {
  projects: Project[]
  selectedProject: string | null
  onSelectProject: (projectId: string) => void
  onCheckUpdates: (projectId: string) => void
  onCommitChange: (projectId: string) => void
  canCommitChange: (projectId: string) => boolean
}

export function ProjectList({ projects, selectedProject, onSelectProject, onCheckUpdates, onCommitChange, canCommitChange }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects found"
        description="Add projects to your configuration file to get started."
        icon={<Folder className="h-12 w-12" />}
      />
    )
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <div key={project.id} className="relative">
          <Card
            className={`cursor-pointer transition-colors ${
              selectedProject === project.id ? "border-primary bg-primary/5" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation()
              onSelectProject(project.id)
            }}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Folder className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{project.name}</p>
                  <div className="flex items-center text-xs text-muted-foreground truncate">
                    <GitBranch className="mr-1 h-3 w-3" />
                    <span className="truncate">
                      {project.remote
                        ? project.remote
                            .split("/")
                            .slice(-1)
                            .join("/")
                        : project.path}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="absolute right-2 top-2">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="border border-muted-foreground"
                    variant="ghost"
                    size="sm"
                    onClick={() => onCheckUpdates(project.id)}
                  >
                    <FolderSync className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <span className="text-sm font-medium">Fetch updates</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {canCommitChange(project.id) && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="border border-muted-foreground"
                      variant="ghost"
                      size="sm"
                      onClick={() => onCommitChange(project.id)}
                    >
                      <GitPullRequest className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span className="text-sm font-medium">Commit changes</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
