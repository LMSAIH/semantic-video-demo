import { Upload, AlertCircle, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface UploadDialogProps {
  trigger: React.ReactNode;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputId?: string;
  error?: string | null;
  onClearError?: () => void;
  isUploading?: boolean;
}

export function UploadDialog({
  trigger,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  inputId = 'file-upload',
  error,
  onClearError,
  isUploading = false,
}: UploadDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Videos</DialogTitle>
          <DialogDescription>
            Select video files to analyze with AI models.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="relative">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="pr-8">{error}</AlertDescription>
            {onClearError && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={onClearError}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </Alert>
        )}
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop videos here
              </p>
              <Label htmlFor={inputId} className="cursor-pointer text-center block">
                <span className="text-primary hover:underline text-sm">
                  or click to browse
                </span>
                <Input
                  id={inputId}
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={onFileSelect}
                />
              </Label>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
