import { useState, useEffect, useCallback } from "react";
import { Project } from "../types/dependency";
import { fetchProjects, checkForUpdates, commitPackageFix } from "../services/api";
import { useToast } from "./use-toast";

export function useProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const { toast } = useToast();

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔍 Loading projects");
      const data = await fetchProjects();
      setProjects(data);
      
      // Select first project by default if there's at least one project
      if (data.length > 0 && !selectedProject) {
        console.log(`🔍 Auto-selecting first project: ${data[0].id}`);
        setSelectedProject(data[0].id);
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({ 
        title: "Error fetching projects", 
        description: error.message || "Failed to load projects", 
        variant: "destructive" 
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load projects on mount
  useEffect(() => {
    console.log("🔄 Initial project load effect running");
    loadProjects();
  }, [loadProjects]);

  // Set project based on data
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      console.log(`🔄 Setting initial project to ${projects[0].id}`);
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  const getSelectedProjectName = useCallback(() => {
    if (!selectedProject) return null;
    const project = projects.find(p => p.id === selectedProject);
    return project ? project.name : null;
  }, [selectedProject, projects]);

  const handleCheckUpdates = useCallback(async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    try {
      await checkForUpdates(project.name);
      toast({ 
        title: "Codebase updated", 
        description: `Pulled latest changes for ${project.name}` 
      });
      return true;
    } catch (error: any) {
      toast({ 
        title: "Update failed", 
        description: error.message, 
        variant: "destructive" 
      });
      return false;
    }
  }, [projects, toast]);

  const handleCommitChange = useCallback(async (projectId: string, summary: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    try {
      const res = await commitPackageFix(project.name, summary);
      toast({ 
        title: "Commit created", 
        description: `Branch ${res.branch}` 
      });
      return res;
    } catch (error: any) {
      toast({ 
        title: "Commit failed", 
        description: error.message, 
        variant: "destructive" 
      });
      return null;
    }
  }, [projects, toast]);

  return {
    projects,
    loading,
    selectedProject,
    setSelectedProject,
    loadProjects,
    getSelectedProjectName,
    handleCheckUpdates,
    handleCommitChange
  };
} 