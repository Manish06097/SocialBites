
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { QrCodeGeneratorClient } from './client-page';

export default async function QrCodePage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/vendor/login');
  }

  const { data: stall, error } = await supabase
    .from('stalls')
    .select('id, name, "foodCourtId"')
    .eq('owner_id', user.id)
    .single();

  if (error || !stall) {
    console.error('Error fetching stall for QR page:', error);
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <h1 className="font-headline text-2xl">Stall Not Found</h1>
        <p className="text-muted-foreground">
          Could not find a stall associated with your account to generate QR codes.
        </p>
      </div>
    );
  }

  const clientStall = {
    id: stall.id,
    name: stall.name,
    foodCourtId: stall.foodCourtId,
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">Generate QR Codes</h1>
      </div>
      <QrCodeGeneratorClient stall={clientStall} />
    </>
  );
}
