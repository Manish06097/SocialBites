
'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { QrCode, Image as ImageIcon, Save, LogOut } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { signOut } from '../../actions'

export default function VendorProfilePage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">Profile</h1>
        <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
        </Button>
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
              <Input id="stall-name" defaultValue="Gopal Locho" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stall-tags">Tags</Label>
              <Input id="stall-tags" defaultValue="Gujarati, Snacks, Street Food" placeholder="e.g. Pizza, Italian, Fast Food" />
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
                        <Image src="https://images.unsplash.com/photo-1707330069618-0dff8e80a6e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8Y29tcGFueSUyMGxvZ298ZW58MHx8fHwxNzUyODk2OTI2fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Stall Logo" width={64} height={64} className="rounded-full bg-muted" />
                        <Button variant="outline">
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Change Logo
                        </Button>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Stall Banner (2:1 ratio)</Label>
                    <div className="flex items-center gap-4">
                         <Image src="https://images.unsplash.com/photo-1713699860139-1fa847f155b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxmb29kJTIwc3RhbGx8ZW58MHx8fHwxNzUyODk2OTI2fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Stall Banner" width={128} height={64} className="rounded-md bg-muted aspect-video object-cover" />
                        <Button variant="outline">
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
                <form action={signOut}>
                    <Button variant="outline" className="w-full md:w-auto">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </form>
            </CardContent>
        </Card>
      </div>
    </>
  )
}
