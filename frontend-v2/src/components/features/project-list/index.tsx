"use client"

import type { Project } from "@/types/dependency"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Folder, GitBranch, RefreshCw, GitCommit } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

interface ProjectListProps {
  projects: Project[]
  selectedProject: string | null
  onSelectProject: (projectId: string) => void
  onCheckUpdates: (projectId: string) => void
  onCommitChange: (projectId: string) => void
}

export function ProjectList({ projects, selectedProject, onSelectProject, onCheckUpdates, onCommitChange }: ProjectListProps) {
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
        <Card
          key={project.id}
          className={`cursor-pointer transition-colors ${
            selectedProject === project.id ? "border-primary bg-primary/5" : ""
          }`}
          onClick={() => onSelectProject(project.id)}
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
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onCheckUpdates(project.id)}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onCommitChange(project.id)}>
                  <GitCommit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
