import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Coffee, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000];

export function DonationModal({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<number>(25000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');

  const handleAmountClick = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
    if (val) {
      setAmount(parseInt(val, 10));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 10000) {
      toast.error(
        language === 'id'
          ? 'Minimal donasi adalah Rp 10.000'
          : 'Minimum donation is Rp 10.000'
      );
      return;
    }

    setIsLoading(true);

    try {
      // 1. Call Supabase Edge Function to create Mayar payment link
      const { data, error } = await supabase.functions.invoke('create-mayar-payment', {
        body: {
          amount,
          customerName: name || 'Orang Baik',
          customerEmail: email || 'anonymous@gambaryuk.com',
          customerMobile: mobile,
          description: `Donasi GambarYuk dari ${name || 'Orang Baik'}${message ? ` - Pesan: ${message}` : ''}`,
        },
      });

      if (error) throw error;

      if (data?.link) {
        // Redirect to Mayar checkout page
        window.location.href = data.link;
      } else {
        throw new Error('Invalid response from payment gateway');
      }
    } catch (err: any) {
      console.error('Payment creation failed:', err);
      toast.error(
        language === 'id'
          ? 'Gagal membuat pembayaran. Coba lagi nanti.'
          : 'Failed to create payment. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Coffee className="h-5 w-5 text-primary" />
            {language === 'id' ? 'Traktir Kopi Kreator' : 'Buy Creator a Coffee'}
          </DialogTitle>
          <DialogDescription>
            {language === 'id'
              ? 'Dukunganmu sangat berarti untuk menjaga server GambarYuk tetap menyala dan gratis selamanya.'
              : 'Your support means the world and helps keep GambarYuk running and free forever.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Amount Selection */}
          <div className="space-y-2">
            <Label>{language === 'id' ? 'Pilih Nominal' : 'Select Amount'}</Label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset && !customAmount ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => handleAmountClick(preset)}
                >
                  Rp {preset.toLocaleString('id-ID')}
                </Button>
              ))}
            </div>
            <Input
              type="text"
              placeholder={language === 'id' ? 'Nominal Lainnya (Min. 10.000)' : 'Custom Amount (Min. 10.000)'}
              value={customAmount ? `Rp ${parseInt(customAmount, 10).toLocaleString('id-ID')}` : ''}
              onChange={handleCustomAmountChange}
              className="mt-2"
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="donator-name">{language === 'id' ? 'Nama' : 'Name'}</Label>
              <Input
                id="donator-name"
                placeholder={language === 'id' ? 'Nama Panggilanmu' : 'Your Nickname'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="donator-email">{language === 'id' ? 'Email' : 'Email'}</Label>
              <Input
                id="donator-email"
                type="email"
                placeholder="email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="donator-mobile">{language === 'id' ? 'Nomor WhatsApp / HP' : 'WhatsApp / Phone Number'}</Label>
              <Input
                id="donator-mobile"
                type="tel"
                placeholder="081234567890"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="donator-message">{language === 'id' ? 'Pesan (Opsional)' : 'Message (Optional)'}</Label>
              <Textarea
                id="donator-message"
                placeholder={language === 'id' ? 'Pesan penyemangat untuk kreator...' : 'Encouragement message...'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none h-20"
              />
            </div>
          </div>

          <div className="pt-2 text-center">
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Coffee className="mr-2 h-4 w-4" />
              )}
              {language === 'id' 
                ? `Lanjut Bayar Rp ${amount.toLocaleString('id-ID')}` 
                : `Pay Rp ${amount.toLocaleString('id-ID')}`
              }
            </Button>
            <p className="mt-3 text-[11px] text-muted-foreground font-medium">
              {language === 'id' 
                ? 'Pembayaran aman didukung oleh Mayar.id' 
                : 'Secure payment powered by Mayar.id'}
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
