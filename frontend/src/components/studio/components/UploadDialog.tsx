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
      <DialogContent className="sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">Upload Videos</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Select video files to analyze with AI models.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="relative rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="pr-8 text-[13px]">{error}</AlertDescription>
            {onClearError && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-lg"
                onClick={onClearError}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </Alert>
        )}
        
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
            isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-muted-foreground/15 hover:border-muted-foreground/25'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {isUploading ? (
            <>
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <div className="h-14 w-14 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-1.5">
                Drag and drop videos here
              </p>
              <Label htmlFor={inputId} className="cursor-pointer text-center block">
                <span className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
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
