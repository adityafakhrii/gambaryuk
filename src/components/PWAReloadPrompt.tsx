import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DownloadCloud, RefreshCw, X } from 'lucide-react'

export function PWAReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const isId = (() => {
    try { return localStorage.getItem('language') !== 'en'; } catch { return true; }
  })();

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] animate-in slide-in-from-bottom-5">
      <Card className="border shadow-lg bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 w-[320px]">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              {offlineReady ? (
                <>
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <DownloadCloud className="w-4 h-4 text-green-500" />
                    {isId ? 'Aplikasi Siap Offline' : 'App ready to work offline'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isId ? 'Anda sekarang dapat menggunakan GambarYuk tanpa koneksi internet.' : 'You can now use GambarYuk without an internet connection.'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                    {isId ? 'Pembaruan Tersedia' : 'Update available'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isId ? 'Versi baru GambarYuk telah tersedia. Muat ulang untuk log fitur terbaru.' : 'A new version of GambarYuk is available. Reload to update.'}
                  </p>
                </>
              )}
            </div>
            <button
              onClick={close}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-2">
            {needRefresh && (
              <Button
                variant="default"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => updateServiceWorker(true)}
              >
                {isId ? 'Muat Ulang' : 'Reload'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs"
              onClick={close}
            >
              {isId ? 'Tutup' : 'Close'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
