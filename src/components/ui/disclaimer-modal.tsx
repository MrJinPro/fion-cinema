import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Info, Shield } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  movieTitle: string;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
  movieTitle
}) => {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [understood, setUnderstood] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setHasReadTerms(false);
      setUnderstood(false);
    }
  }, [isOpen]);

  const canProceed = hasReadTerms && understood;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Важное предупреждение
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Перед просмотром "{movieTitle}" ознакомьтесь с условиями использования
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-destructive/20 bg-destructive/5">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>ВНИМАНИЕ:</strong> Видеоконтент предоставляется сторонними неофициальными источниками без защиты sandbox режима
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm">
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-info" />
                Об источниках контента
              </h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Видео размещено на сторонних сервисах</li>
                <li>• Мы не контролируем качество и доступность контента</li>
                <li>• Источники могут содержать рекламу и вредоносный код</li>
                <li>• Отключена защита sandbox для корректного воспроизведения</li>
                <li>• Некоторые источники могут быть недоступны в вашем регионе</li>
                <li>• <strong className="text-orange-600">Система автоматически парсит сайты Kinogo для поиска дополнительных источников</strong></li>
                <li>• <strong className="text-red-600">Вы несете полную ответственность за просмотр контента и соблюдение авторских прав</strong></li>
              </ul>
            </div>

            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold mb-2 text-destructive">Отказ от ответственности</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Наш сервис НЕ хранит и НЕ размещает видеофайлы</li>
                <li>• Мы НЕ несем ответственности за контент сторонних источников</li>
                <li>• Использование неофициальных источников - на ваш страх и риск</li>
                <li>• Мы рекомендуем использовать только официальные платформы</li>
              </ul>
            </div>

            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold mb-2 text-orange">Рекомендации</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Используйте официальные кинотеатры и стриминговые сервисы</li>
                <li>• Поддерживайте создателей контента законными способами</li>
                <li>• При возникновении проблем - обратитесь к официальным источникам</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-start gap-3">
              <Checkbox 
                id="terms" 
                checked={hasReadTerms}
                onCheckedChange={(checked) => setHasReadTerms(checked === true)}
              />
              <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                Я прочитал(а) и понимаю, что видеоконтент предоставляется сторонними источниками, 
                и наш сервис не несет ответственности за его содержание
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox 
                id="understood" 
                checked={understood}
                onCheckedChange={(checked) => setUnderstood(checked === true)}
              />
              <label htmlFor="understood" className="text-sm leading-relaxed cursor-pointer">
                Я понимаю риски использования неофициальных источников и использую их 
                на свой страх и риск
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onDecline}
            >
              Отменить
            </Button>
            <Button 
              className="flex-1 bg-gradient-primary hover:opacity-90"
              disabled={!canProceed}
              onClick={onAccept}
            >
              Принимаю условия и продолжить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};