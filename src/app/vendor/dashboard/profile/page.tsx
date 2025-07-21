
'use server';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Image as ImageIcon, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from '../../actions';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { updateStallDetails } from './actions';
import { SubmitButton } from './submit-button';

export default async function VendorProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/vendor/login');
  }

  const { data: stall, error } = await supabase
    .from('stalls')
    .select('id, name, tags, logo_url, banner_url')
    .eq('owner_id', user.id)
    .single();

  if (error || !stall) {
    console.error('Error fetching stall for user:', user.id, error);
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <h1 className="font-headline text-2xl">Error</h1>
            <p className="text-muted-foreground">Could not find a stall associated with your account.</p>
        </div>
    );
  }

  return (
    <form action={updateStallDetails}>
      <input type="hidden" name="stallId" value={stall.id} />
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">Profile</h1>
        <SubmitButton />
      </div>
      <div className="grid gap-6 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Stall Details</CardTitle>
            <CardDescription>Update your stall's public information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stall-name">Stall Name</Label>
              <Input id="stall-name" name="stallName" defaultValue={stall.name || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stall-tags">Tags</Label>
              <Input id="stall-tags" name="tags" defaultValue={stall.tags?.join(', ') || ''} placeholder="e.g. Pizza, Italian, Fast Food" />
               <p className="text-xs text-muted-foreground">Comma-separated tags for cuisine type.</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Update your stall's logo and banner.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Stall Logo (1:1 ratio)</Label>
                    <div className="flex items-center gap-4">
                        <Image src={stall.logo_url || "https://placehold.co/100x100.png"} alt="Stall Logo" width={64} height={64} className="rounded-full bg-muted" data-ai-hint="company logo" />
                        <Button variant="outline" disabled>
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Change Logo
                        </Button>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Stall Banner (2:1 ratio)</Label>
                    <div className="flex items-center gap-4">
                         <Image src={stall.banner_url || "https://placehold.co/600x300.png"} alt="Stall Banner" width={128} height={64} className="rounded-md bg-muted aspect-video object-cover" data-ai-hint="food stall" />
                        <Button variant="outline" disabled>
                             <ImageIcon className="mr-2 h-4 w-4" />
                            Change Banner
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>QR Code Management</CardTitle>
                <CardDescription>Generate and view QR codes for your tables.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
                 <Button asChild>
                    <Link href="/vendor/dashboard/qr">
                        <QrCode className="mr-2 h-4 w-4" />
                        View & Generate QR Codes
                    </Link>
                 </Button>
            </CardContent>
        </Card>
        
        <Card>
           <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Log out of your vendor account.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button type="submit" variant="outline" className="w-full md:w-auto" formAction={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </CardContent>
        </Card>
      </div>
    </form>
  )
}
