import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUploadPropertyImage, useDeletePropertyImage } from '@/hooks/useProperties';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  ImagePlus,
  X,
  Loader2,
  GripVertical,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';

interface PropertyImageUploadProps {
  propertyId: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export const PropertyImageUpload = ({
  propertyId,
  images,
  onImagesChange,
}: PropertyImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = useUploadPropertyImage();
  const deleteImage = useDeletePropertyImage();

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const HARD_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB absolute max
  const TARGET_FILE_SIZE = 4 * 1024 * 1024; // 4MB target after compression
  const MAX_DIMENSION = 2048; // Max width/height
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  const optimizeImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        let { width, height } = img;

        // Scale down if dimensions exceed max
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Start with quality 0.9 and reduce if needed
        const tryCompress = (quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // If still too large and quality can be reduced, try again
              if (blob.size > TARGET_FILE_SIZE && quality > 0.3) {
                tryCompress(quality - 0.1);
              } else {
                const optimizedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(optimizedFile);
              }
            },
            'image/jpeg',
            quality
          );
        };

        tryCompress(0.9);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid file type',
            description: `${file.name} is not an image file.`,
            variant: 'destructive',
          });
          continue;
        }

        let fileToUpload = file;

        // Optimize if file exceeds size limit
        if (file.size > MAX_FILE_SIZE) {
          toast({
            title: 'Optimizing image',
            description: `${file.name} is being compressed...`,
          });

          try {
            fileToUpload = await optimizeImage(file);
            toast({
              title: 'Image optimized',
              description: `Reduced from ${(file.size / 1024 / 1024).toFixed(1)}MB to ${(fileToUpload.size / 1024 / 1024).toFixed(1)}MB`,
            });
          } catch (error) {
            toast({
              title: 'Optimization failed',
              description: `Could not compress ${file.name}. Please try a smaller image.`,
              variant: 'destructive',
            });
            continue;
          }
        }

        const url = await uploadImage.mutateAsync({ propertyId, file: fileToUpload });
        newImages.push(url);
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
        toast({
          title: 'Images uploaded',
          description: `${newImages.length} image(s) uploaded successfully.`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = images[index];
    setDeletingIndex(index);

    try {
      await deleteImage.mutateAsync(imageUrl);
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      toast({
        title: 'Image removed',
        description: 'The image has been deleted.',
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error removing image',
        description: 'Failed to delete the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingIndex(null);
    }
  };

  // Drag and drop handlers for reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newImages = [...images];
      const [draggedImage] = newImages.splice(draggedIndex, 1);
      newImages.splice(dragOverIndex, 0, draggedImage);
      onImagesChange(newImages);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Property Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((imageUrl, index) => (
              <div
                key={imageUrl}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDragLeave={handleDragLeave}
                className={cn(
                  "relative group aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-move",
                  draggedIndex === index && "opacity-50 scale-95",
                  dragOverIndex === index && "border-accent border-dashed",
                  dragOverIndex !== index && "border-transparent"
                )}
              >
                <img
                  src={imageUrl}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay with controls */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <div className="absolute top-2 left-2 text-white/80">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRemoveImage(index)}
                    disabled={deletingIndex === index}
                  >
                    {deletingIndex === index ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* First image badge */}
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded font-medium">
                    Main Image
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {images.length === 0 && (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground mb-1">No images uploaded</p>
            <p className="text-sm text-muted-foreground/70">Add images to showcase your property</p>
          </div>
        )}

        {/* Upload button */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ImagePlus className="h-4 w-4 mr-2" />
                Add Images
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Drag images to reorder. First image will be used as the main image. Images over 2MB are auto-optimized.
        </p>
      </CardContent>
    </Card>
  );
};
