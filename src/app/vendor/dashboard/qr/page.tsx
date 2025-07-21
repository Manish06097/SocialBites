
'use client';

import { useState, useRef, createRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode as QrCodeIcon, Download, Loader2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface StallData {
  id: string;
  name: string;
  foodCourtId: string;
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
  };

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
  );
};

export default function QrCodePage() {
  const [stall, setStall] = useState<StallData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [numTables, setNumTables] = useState(10);
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([]);
  const qrCardRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);

  useEffect(() => {
    async function fetchStallData() {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // This should be handled by layout/middleware, but as a fallback:
        setError("You must be logged in to view this page.");
        setLoading(false);
        return;
      }

      const { data: stallData, error: stallError } = await supabase
        .from('stalls')
        .select('id, name, food_court_id')
        .eq('owner_id', user.id)
        .single();
      
      if (stallError) {
        console.error('Error fetching stall for QR page:', stallError);
        setError('Could not find a stall associated with your account.');
      } else if (stallData) {
        setStall({
          id: stallData.id,
          name: stallData.name,
          foodCourtId: stallData.food_court_id,
        });
      }
      setLoading(false);
    }
    fetchStallData();
  }, []);

  const handleGenerate = () => {
    if (stall && numTables > 0 && numTables <= 100) {
      const baseUrl = window.location.origin;
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
  };

  const handleDownload = async (index: number, tableId: string) => {
    const element = qrCardRefs.current[index]?.current;
    if (!element) return;
    
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
  };

  if (loading) {
     return (
        <>
            <h1 className="font-headline text-lg font-semibold md:text-2xl">Generate QR Codes</h1>
            <Card className="mt-4">
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-48" />
                </CardContent>
            </Card>
        </>
     )
  }

  if (error || !stall) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <h1 className="font-headline text-2xl">Error</h1>
        <p className="text-muted-foreground">{error || 'Stall not found.'}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">Generate QR Codes</h1>
      </div>
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
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
