
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QrCode, Download } from 'lucide-react'

// Dummy QR Code Generator - in a real app, you'd use a library like qrcode.react
const QRCodePlaceholder = ({ tableNumber }: { tableNumber: string }) => (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted p-4">
        <QrCode className="h-32 w-32 text-muted-foreground" />
        <p className="mt-2 text-sm font-semibold">Simulated QR Code</p>
        <p className="text-xs text-muted-foreground">for Table {tableNumber}</p>
    </div>
)

export default function QrCodePage() {
  const [tableNumber, setTableNumber] = useState('T01')
  const [generatedTable, setGeneratedTable] = useState<string | null>(null)

  const handleGenerate = () => {
    if (tableNumber) {
        setGeneratedTable(tableNumber)
    }
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">Generate QR Code</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Enter Table Number</CardTitle>
            <CardDescription>
              Enter a table identifier to generate its unique QR code for ordering.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="table-number">Table Number</Label>
              <Input
                id="table-number"
                placeholder="e.g., T1, Table 5, 2A"
                value={tableNumber}
                onChange={(e) => {
                    setTableNumber(e.target.value)
                    setGeneratedTable(null) // Reset on change
                }}
              />
            </div>
            <Button onClick={handleGenerate} className="w-full">
                <QrCode className="mr-2 h-4 w-4" />
                Generate
            </Button>
          </CardContent>
        </Card>
        <Card className={`lg:col-span-2 ${generatedTable ? '' : 'flex items-center justify-center'}`}>
            {generatedTable ? (
                 <CardContent className="p-6 text-center">
                    <QRCodePlaceholder tableNumber={generatedTable} />
                    <p className="mt-4 font-bold text-lg">Table: {generatedTable}</p>
                    <p className="text-muted-foreground text-sm">Stall: Gopal Locho (s1) • Food Court: Vesu Food Plaza (fc1)</p>
                    <Button className="mt-4 w-full">
                        <Download className="mr-2 h-4 w-4"/>
                        Download PNG
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">In a real app, this would download a high-quality image of the QR code.</p>
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
