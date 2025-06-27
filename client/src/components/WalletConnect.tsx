
import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Wallet, Copy, ExternalLink, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function WalletConnect() {
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { toast } = useToast()
  const [showWalletModal, setShowWalletModal] = useState(false)

  // Получаем баланс ETH
  const { data: ethBalance } = useBalance({
    address: address,
  })

  // Получаем баланс USDT (пример токена)
  const { data: usdtBalance } = useBalance({
    address: address,
    token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT на Ethereum
  })

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: "Адрес скопирован",
        description: "Адрес кошелька скопирован в буфер обмена",
      })
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleDeposit = () => {
    toast({
      title: "Пополнение кошелька",
      description: "Отправьте криптовалюту на ваш адрес кошелька",
    })
  }

  const handleWithdraw = () => {
    toast({
      title: "Вывод средств",
      description: "Функция вывода будет доступна в ближайшее время",
    })
  }

  if (isConnected && address) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Кошелек подключен
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Адрес:</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {formatAddress(address)}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Сеть:</span>
              <Badge>{connector?.name || 'Unknown'}</Badge>
            </div>
          </div>

          {/* Балансы */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Балансы:</h4>
            <div className="space-y-1">
              {ethBalance && (
                <div className="flex justify-between text-sm">
                  <span>ETH:</span>
                  <span className="font-mono">
                    {parseFloat(ethBalance.formatted).toFixed(6)} {ethBalance.symbol}
                  </span>
                </div>
              )}
              {usdtBalance && (
                <div className="flex justify-between text-sm">
                  <span>USDT:</span>
                  <span className="font-mono">
                    {parseFloat(usdtBalance.formatted).toFixed(2)} {usdtBalance.symbol}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Действия */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDeposit}
              className="flex-1"
            >
              <ArrowDownLeft className="h-4 w-4 mr-2" />
              Пополнить
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleWithdraw}
              className="flex-1"
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Вывести
            </Button>
          </div>

          <Button
            variant="destructive"
            onClick={() => disconnect()}
            className="w-full"
          >
            Отключить кошелек
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Wallet className="h-4 w-4 mr-2" />
          Подключить кошелек
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Выберите кошелек</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              variant="outline"
              onClick={() => {
                connect({ connector })
                setShowWalletModal(false)
              }}
              disabled={isPending}
              className="w-full justify-start"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{connector.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {connector.name === 'MetaMask' && 'Популярный Ethereum кошелек'}
                    {connector.name === 'WalletConnect' && 'Подключение через QR-код'}
                    {connector.name === 'Coinbase Wallet' && 'Кошелек от Coinbase'}
                    {connector.name === 'Injected' && 'Браузерный кошелек'}
                  </div>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>
          ))}
        </div>
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            Подключение кошелька позволит вам торговать NFT, пополнять и выводить криптовалюту.
            Мы поддерживаем Ethereum, Polygon, BSC и другие сети.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
