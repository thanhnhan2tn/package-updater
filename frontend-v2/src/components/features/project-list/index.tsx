"use client"

import type { Project } from "@/types/dependency"
import { Card, CardContent } from "@/components/ui/card"
import { Folder, GitBranch } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

interface ProjectListProps {
  projects: Project[]
  selectedProject: string | null
  onSelectProject: (projectId: string) => void
}

export function ProjectList({ projects, selectedProject, onSelectProject }: ProjectListProps) {
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
