import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CommentsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
  recordId: string;
  recordTitle?: string;
}

export function CommentsPanel({ open, onOpenChange, tableName, recordId, recordTitle }: CommentsPanelProps) {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { data: comments, isLoading } = useComments(tableName, recordId);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    createComment.mutate(
      { table_name: tableName, record_id: recordId, comment: newComment.trim() },
      {
        onSuccess: () => { setNewComment(''); toast({ title: 'Comment added' }); },
        onError: () => toast({ title: 'Failed to add comment', variant: 'destructive' }),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteComment.mutate(
      { id, table_name: tableName, record_id: recordId },
      { onSuccess: () => toast({ title: 'Comment deleted' }) }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Notes {recordTitle && `— ${recordTitle}`}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 my-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
          ) : comments?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No notes yet. Add the first one!</p>
          ) : (
            <div className="space-y-3 pr-4">
              {comments?.map((c) => (
                <div key={c.id} className="rounded-lg bg-muted/50 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">
                      {c.user_id.slice(0, 8)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                      {(isAdmin || c.user_id === user?.id) && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm">{c.comment}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2 pt-2 border-t border-border">
          <Textarea
            placeholder="Add a note..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[60px]"
            onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleSubmit(); }}
          />
          <Button size="icon" onClick={handleSubmit} disabled={!newComment.trim() || createComment.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
