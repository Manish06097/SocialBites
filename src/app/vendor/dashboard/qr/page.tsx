
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QrCode, Download } from 'lucide-react'

// Dummy QR Code Generator - in a real app, you'd use a library like qrcode.react
const QRCodePlaceholder = () => (
    <div className="flex items-center justify-center rounded-lg border-2 border-dashed bg-muted p-4">
        <QrCode className="h-32 w-32 text-muted-foreground" />
    </div>
)


export default function QrCodePage() {
  const [tableNumber, setTableNumber] = useState('T01')
  const [generated, setGenerated] = useState(false)

  const handleGenerate = () => {
    if (tableNumber) {
        setGenerated(true)
    }
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">Generate QR Code</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enter Table Number</CardTitle>
            <CardDescription>
              Enter a table number or identifier to generate a unique QR code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="table-number">Table Number</Label>
              <Input
                id="table-number"
                placeholder="e.g., T1, Table 5, 2A"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </div>
            <Button onClick={handleGenerate} className="w-full">Generate</Button>
          </CardContent>
        </Card>
        <Card className={generated ? '' : 'flex items-center justify-center'}>
            {generated ? (
                 <CardContent className="p-6 text-center">
                    <QRCodePlaceholder />
                    <p className="mt-4 font-bold text-lg">Table: {tableNumber}</p>
                    <p className="text-muted-foreground text-sm">Stall: Gopal Locho (s1)</p>
                    <Button className="mt-4 w-full">
                        <Download className="mr-2 h-4 w-4"/>
                        Download PNG
                    </Button>
                 </CardContent>
            ) : (
                <div className="p-6 text-center text-muted-foreground">
                    <p>Your QR code will appear here once generated.</p>
                </div>
            )}
        </Card>
      </div>
    </>
  )
}
