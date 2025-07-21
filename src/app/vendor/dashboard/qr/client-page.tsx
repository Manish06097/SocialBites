
'use client'

import { useState, useRef, createRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QrCode as QrCodeIcon, Download, Loader2 } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react';
import { toPng } from 'html-to-image';


interface QrCodeGeneratorClientProps {
  stall: {
    id: string;
    name: string;
    foodCourtId: string;
  };
}

interface GeneratedCode {
  tableNumber: number;
  url: string;
}

const QRCodeCard = ({ url, tableId, stallName, onDownload }: { url: string; tableId: string; stallName: string; onDownload: () => Promise<void> }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    await onDownload();
    setIsDownloading(false);
  }

  return (
    <Card className="flex flex-col">
      <CardContent className="p-4 flex-grow flex flex-col items-center justify-center text-center">
        <QRCodeCanvas value={url} size={160} includeMargin={true} />
        <p className="mt-4 font-bold text-lg">Table: {tableId}</p>
        <p className="text-muted-foreground text-sm">{stallName}</p>
      </CardContent>
      <CardFooter className="p-2 border-t">
        <Button onClick={handleDownload} disabled={isDownloading} className="w-full">
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download PNG
        </Button>
      </CardFooter>
    </Card>
  )
}

export function QrCodeGeneratorClient({ stall }: QrCodeGeneratorClientProps) {
  const [numTables, setNumTables] = useState(10);
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([]);
  const qrCardRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);


  const handleGenerate = () => {
    if (numTables > 0 && numTables <= 100) { // Limit to 100 at a time
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const newCodes = Array.from({ length: numTables }, (_, i) => {
        const tableNumber = i + 1;
        const tableId = `T${tableNumber}`;
        return {
          tableNumber,
          url: `${baseUrl}/welcome?foodCourtId=${stall.foodCourtId}&stallId=${stall.id}&table=${tableId}`,
        };
      });
      qrCardRefs.current = newCodes.map(() => createRef<HTMLDivElement>());
      setGeneratedCodes(newCodes);
    }
  }

  const handleDownload = async (index: number, tableId: string) => {
    const element = qrCardRefs.current[index]?.current;
    if (!element) return;
    
    // Select the content part for a cleaner image
    const contentElement = element.querySelector<HTMLElement>('.p-4');
    if (!contentElement) return;

    try {
      const dataUrl = await toPng(contentElement, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `qr-table-${tableId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download QR code image', err);
    }
  }

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>QR Code Generator</CardTitle>
          <CardDescription>
            Enter the number of tables to generate unique QR codes for ordering at <span className="font-semibold">{stall.name}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-end gap-4">
          <div className="space-y-2 flex-grow w-full sm:w-auto">
            <Label htmlFor="num-tables">Number of Tables</Label>
            <Input
              id="num-tables"
              type="number"
              placeholder="e.g., 20"
              value={numTables}
              onChange={(e) => setNumTables(parseInt(e.target.value, 10) || 0)}
              min="1"
              max="100"
            />
          </div>
          <Button onClick={handleGenerate} className="w-full sm:w-auto">
              <QrCodeIcon className="mr-2 h-4 w-4" />
              Generate Codes
          </Button>
        </CardContent>
      </Card>
      
      {generatedCodes.length > 0 && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {generatedCodes.map((code, index) => {
            const tableId = `T${code.tableNumber}`;
            return (
              <div ref={qrCardRefs.current[index]} key={code.tableNumber}>
                <QRCodeCard
                  url={code.url}
                  tableId={tableId}
                  stallName={stall.name}
                  onDownload={() => handleDownload(index, tableId)}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
