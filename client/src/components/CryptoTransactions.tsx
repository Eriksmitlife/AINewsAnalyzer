
import { useState } from 'react'
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function CryptoTransactions() {
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  
  // Состояния для отправки транзакций
  const [sendTo, setSendTo] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  
  const {
    data: sendHash,
    sendTransaction,
    isPending: isSendPending,
    error: sendError
  } = useSendTransaction()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({
      hash: sendHash,
    })

  // Демо данные транзакций
  const [transactions] = useState([
    {
      id: '1',
      type: 'deposit',
      amount: '0.5',
      currency: 'ETH',
      status: 'completed',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      hash: '0x1234567890abcdef...',
    },
    {
      id: '2',
      type: 'withdraw',
      amount: '100',
      currency: 'USDT',
      status: 'pending',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      hash: '0xabcdef1234567890...',
    },
    {
      id: '3',
      type: 'nft_purchase',
      amount: '0.1',
      currency: 'ETH',
      status: 'completed',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      hash: '0x567890abcdef1234...',
    },
  ])

  const handleSend = async () => {
    if (!sendTo || !sendAmount) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive",
      })
      return
    }

    try {
      await sendTransaction({
        to: sendTo as `0x${string}`,
        value: parseEther(sendAmount),
      })
      
      toast({
        title: "Транзакция отправлена",
        description: "Ожидайте подтверждения в блокчейне",
      })
    } catch (error) {
      toast({
        title: "Ошибка транзакции",
        description: "Не удалось отправить транзакцию",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Пополнение'
      case 'withdraw':
        return 'Вывод'
      case 'nft_purchase':
        return 'Покупка NFT'
      case 'nft_sale':
        return 'Продажа NFT'
      default:
        return 'Транзакция'
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Подключите кошелек для работы с криптовалютой
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Криптовалютные операции</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">История</TabsTrigger>
            <TabsTrigger value="send">Отправить</TabsTrigger>
            <TabsTrigger value="receive">Получить</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions" className="space-y-4">
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {tx.type === 'deposit' ? (
                      <ArrowDownLeft className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-blue-500" />
                    )}
                    <div>
                      <div className="font-medium">{getTransactionTypeText(tx.type)}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">
                      {tx.amount} {tx.currency}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(tx.status)}
                      <Badge variant={
                        tx.status === 'completed' ? 'default' : 
                        tx.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {tx.status === 'completed' ? 'Завершено' : 
                         tx.status === 'pending' ? 'В обработке' : 'Ошибка'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="send" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="sendTo">Адрес получателя</Label>
                <Input
                  id="sendTo"
                  placeholder="0x..."
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sendAmount">Сумма (ETH)</Label>
                <Input
                  id="sendAmount"
                  type="number"
                  step="0.001"
                  placeholder="0.1"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={isSendPending || !sendTo || !sendAmount}
                className="w-full"
              >
                {isSendPending ? 'Отправка...' : 'Отправить ETH'}
              </Button>
              
              {sendHash && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    Хэш транзакции: <code className="font-mono text-xs">{sendHash}</code>
                  </p>
                  {isConfirming && <p className="text-sm text-yellow-600 mt-1">Ожидание подтверждения...</p>}
                  {isConfirmed && <p className="text-sm text-green-600 mt-1">Транзакция подтверждена!</p>}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="receive" className="space-y-4">
            <div className="text-center space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Ваш адрес для получения:</p>
                <div className="font-mono text-sm bg-background p-2 rounded border">
                  {address}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    if (address) {
                      navigator.clipboard.writeText(address)
                      toast({
                        title: "Адрес скопирован",
                        description: "Адрес кошелька скопирован в буфер обмена",
                      })
                    }
                  }}
                >
                  Скопировать адрес
                </Button>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Поддерживаемые сети: Ethereum, Polygon, BSC, Arbitrum</p>
                <p>• Поддерживаемые токены: ETH, USDT, USDC, BNB, MATIC</p>
                <p>• Минимальная сумма пополнения: $10</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
