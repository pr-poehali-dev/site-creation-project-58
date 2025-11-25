import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SubscribeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscribeDialog({ open, onOpenChange }: SubscribeDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('subscribeRequired')}</DialogTitle>
          <DialogDescription>
            {t('subscribeMessage')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-2 mt-4">
          <Button onClick={() => onOpenChange(false)} className="flex-1">
            {t('subscribe')}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('back')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
