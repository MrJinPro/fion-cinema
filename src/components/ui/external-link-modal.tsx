import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { ExternalLink, AlertTriangle } from 'lucide-react';

interface ExternalLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  serviceName: string;
}

export function ExternalLinkModal({ isOpen, onClose, onConfirm, serviceName }: ExternalLinkModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Переход на внешний сайт
          </DialogTitle>
          <DialogDescription className="text-left">
            Вы переходите на сайт <strong>{serviceName}</strong>. 
            Этот ресурс не контролируется нашим сервисом.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={onConfirm} className="flex items-center gap-2">
            Продолжить
            <ExternalLink className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}