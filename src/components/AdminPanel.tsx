import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addVideo } from '@/lib/videos';
import { useToast } from '@/hooks/use-toast';

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVideoAdded: () => void;
}

export default function AdminPanel({ open, onOpenChange, onVideoAdded }: AdminPanelProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    tags: '',
    external_url: '',
    image1_url: '',
    image2_url: '',
    image3_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.external_url || !formData.image1_url || !formData.image2_url || !formData.image3_url) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      
      const result = await addVideo({
        title: formData.title,
        tags,
        external_url: formData.external_url,
        image1_url: formData.image1_url,
        image2_url: formData.image2_url,
        image3_url: formData.image3_url,
      }, true);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Video added successfully',
        });
        setFormData({
          title: '',
          tags: '',
          external_url: '',
          image1_url: '',
          image2_url: '',
          image3_url: '',
        });
        onVideoAdded();
        onOpenChange(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to add video',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('adminPanel')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">{t('videoTitle')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="tags">{t('tags')}</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              disabled={loading}
              placeholder="tag1, tag2, tag3"
            />
          </div>
          
          <div>
            <Label htmlFor="external_url">{t('externalUrl')}</Label>
            <Input
              id="external_url"
              type="url"
              value={formData.external_url}
              onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="image1">{t('image1')}</Label>
            <Input
              id="image1"
              type="url"
              value={formData.image1_url}
              onChange={(e) => setFormData({ ...formData, image1_url: e.target.value })}
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="image2">{t('image2')}</Label>
            <Input
              id="image2"
              type="url"
              value={formData.image2_url}
              onChange={(e) => setFormData({ ...formData, image2_url: e.target.value })}
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="image3">{t('image3')}</Label>
            <Input
              id="image3"
              type="url"
              value={formData.image3_url}
              onChange={(e) => setFormData({ ...formData, image3_url: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {t('save')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
