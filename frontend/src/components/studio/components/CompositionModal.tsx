import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useComposerStore } from '../store/composerStore';

export function CompositionModal() {
  const composition = useComposerStore(s => s.viewingComposition);
  const setViewingComposition = useComposerStore(s => s.setViewingComposition);
  const presets = useComposerStore(s => s.presets);
  const [copied, setCopied] = useState(false);

  const open = composition !== null;
  const presetName = presets.find(p => p.id === composition?.preset)?.name ?? composition?.preset;

  const handleCopy = async () => {
    if (!composition) return;
    await navigator.clipboard.writeText(composition.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setViewingComposition(null); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col overflow-hidden sm:rounded-2xl">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {presetName}
            </DialogTitle>
            <Badge variant="outline" className="text-xs rounded-md">
              {composition?.model}
            </Badge>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Generated on {composition ? new Date(composition.createdAt).toLocaleString() : ''}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 overflow-y-auto -mx-6 px-6">
          <div className="prose prose-sm dark:prose-invert max-w-none py-2">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {composition?.content}
            </div>
          </div>
        </ScrollArea>

        <div className="shrink-0 pt-3 border-t apple-divider flex justify-end bg-white dark:bg-zinc-950">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl h-9 text-sm gap-1.5 bg-white dark:bg-zinc-900"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
