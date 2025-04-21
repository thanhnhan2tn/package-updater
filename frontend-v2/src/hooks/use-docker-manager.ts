import { useState, useCallback, useEffect } from "react";
import { DockerImage } from "../types/dependency";
import { fetchDockerImages, upgradeDockerImage } from "../services/api";
import { useToast } from "./use-toast";

export function useDockerManager(initialProjectName: string | null = null) {
  const [dockerImages, setDockerImages] = useState<DockerImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<DockerImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [checkingImages, setCheckingImages] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const loadDockerImages = useCallback(async (projectName: string | null) => {
    if (!projectName) return;
    
    setLoading(true);
    try {
      const images = await fetchDockerImages(projectName);
      // Default to server images only
      const serverOnly = images.filter((img) => img.registry === 'server');
      setDockerImages(serverOnly);
      return serverOnly;
    } catch (error: any) {
      console.error("Error fetching Docker images:", error);
      toast({
        title: "Error fetching Docker images",
        description: error.message || "Failed to load Docker images",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load Docker images if initialProjectName is provided
  useEffect(() => {
    if (initialProjectName) {
      loadDockerImages(initialProjectName);
    }
  }, [initialProjectName, loadDockerImages]);

  const checkDockerImage = useCallback(async (image: DockerImage) => {
    const imageId = `${image.projectId}-${image.registry}-${image.name}-${image.tag}`;
    setCheckingImages(prev => ({ ...prev, [imageId]: true }));
    
    try {
      // In a real app, you'd call an API here. This is a mockup for the demo.
      const currentTagNumber = Number.parseInt(image.tag.replace(/[^\d]/g, "")) || 1;
      const latestTagNumber = currentTagNumber + Math.floor(Math.random() * 3) + 1;
      const latestTag = image.tag.replace(/\d+/, latestTagNumber.toString());
      
      const updatedImage = {
        ...image,
        latestTag,
        outdated: true,
      };
      
      // Update the image in both dockerImages and selectedImages
      setDockerImages(prev => 
        prev.map(img => (
          img.name === image.name &&
          img.tag === image.tag &&
          img.projectId === image.projectId &&
          img.registry === image.registry
        ) ? updatedImage : img)
      );
      
      setSelectedImages(prev => 
        prev.map(img => (
          img.name === image.name &&
          img.tag === image.tag &&
          img.projectId === image.projectId &&
          img.registry === image.registry
        ) ? updatedImage : img)
      );
      
      toast({
        title: "Image checked successfully",
        description: `Latest tag for ${image.name}:${image.tag} is ${latestTag}`,
      });
      
      return updatedImage;
    } catch (error: any) {
      console.error("Check Docker image error", error);
      toast({
        title: "Failed to check image",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setCheckingImages(prev => {
        const newChecking = { ...prev };
        delete newChecking[imageId];
        return newChecking;
      });
    }
  }, [toast]);

  const upgradeDockerImages = useCallback(async () => {
    if (selectedImages.length === 0) return;
    
    setUpgrading(true);
    try {
      await Promise.all(
        selectedImages.map(img =>
          upgradeDockerImage(img.projectId, {
            imageName: img.name,
            latestVersion: img.latestTag || '',
            type: img.registry,
          })
        )
      );
      
      toast({
        title: "Docker images upgraded",
        description: `Upgraded ${selectedImages.length} images`
      });
      
      // Clear selected images after successful upgrade
      setSelectedImages([]);
      
      return true;
    } catch (error: any) {
      console.error("Image upgrade error", error);
      toast({
        title: "Upgrade failed",
        description: error.message || "Failed to upgrade Docker images",
        variant: "destructive"
      });
      return false;
    } finally {
      setUpgrading(false);
    }
  }, [selectedImages, toast]);

  const toggleImageSelection = useCallback((image: DockerImage) => {
    if (!image.latestTag) {
      toast({
        title: "Cannot select image",
        description: "Please check the image status first to get the latest tag information",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedImages(prev => {
      const isSelected = prev.some(
        i => i.name === image.name &&
          i.tag === image.tag &&
          i.projectId === image.projectId &&
          i.registry === image.registry
      );
      
      if (isSelected) {
        return prev.filter(
          i => !(
            i.name === image.name &&
            i.tag === image.tag &&
            i.projectId === image.projectId &&
            i.registry === image.registry
          )
        );
      } else {
        return [...prev, image];
      }
    });
  }, [toast]);

  const clearSelectedImages = useCallback(() => {
    setSelectedImages([]);
  }, []);

  return {
    dockerImages,
    selectedImages,
    loading,
    upgrading,
    checkingImages,
    loadDockerImages,
    checkDockerImage,
    upgradeDockerImages,
    toggleImageSelection,
    clearSelectedImages
  };
} 