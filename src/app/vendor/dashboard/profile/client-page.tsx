
'use client';

import { useEffect, useRef, useActionState } from 'react';
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
import { QrCode, LogOut } from 'lucide-react';
import Link from 'next/link';
import { signOut } from '../../actions';
import { updateStallDetails } from './actions';
import { SubmitButton } from './submit-button';
import { useToast } from '@/hooks/use-toast';
import type { Stall } from '@/lib/types';
import { ImageUploader } from '@/components/ImageUploader';
import { LogoutButton } from '@/components/LogoutButton';


interface VendorProfileClientPageProps {
    stall: Stall;
}

export default function VendorProfileClientPage({ stall }: VendorProfileClientPageProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const initialState = { message: '', errors: {} };
  const [state, dispatch, isPending] = useActionState(updateStallDetails, initialState);

  useEffect(() => {
    if (state.message) {
      if (Object.keys(state.errors ?? {}).length > 0) {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: state.message,
        });
      } else {
        toast({
          title: 'Success!',
          description: state.message,
        });
      }
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={dispatch}>
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
              <Label htmlFor="stallName">Stall Name</Label>
              <Input id="stallName" name="stallName" defaultValue={stall.name || ''} disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" defaultValue={stall.tags?.join(', ') || ''} placeholder="e.g. Pizza, Italian, Fast Food" disabled={isPending} />
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
                    <Label>Stall Logo (1:1 ratio recommended)</Label>
                     <ImageUploader
                        currentImageUrl={stall.logo_url}
                        onUploadComplete={async (url) => { /* Logic is now handled inside ImageUploader */ }}
                        bucket="stall-branding"
                        folderPath={`${stall.id}/logos`}
                        disabled={isPending}
                        imageHint="company logo"
                        dbUpdateAction={(url) => updateStallDetails(state, stall.id, { logoUrl: url })}
                    />
                </div>
                 <div className="space-y-2">
                    <Label>Stall Banner (2:1 ratio recommended)</Label>
                    <ImageUploader
                        currentImageUrl={stall.banner_url}
                        onUploadComplete={async (url) => { /* Logic is now handled inside ImageUploader */ }}
                        bucket="stall-branding"
                        folderPath={`${stall.id}/banners`}
                        disabled={isPending}
                        imageHint="food stall"
                        className="aspect-video"
                        dbUpdateAction={(url) => updateStallDetails(state, stall.id, { bannerUrl: url })}
                    />
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
                <LogoutButton action={signOut} />
            </CardContent>
        </Card>
      </div>
    </form>
  )
}
