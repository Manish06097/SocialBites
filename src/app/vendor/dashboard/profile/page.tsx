
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
import { QrCode } from 'lucide-react'
import Link from 'next/link'

export default function VendorProfilePage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">Profile</h1>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stall Details</CardTitle>
            <CardDescription>Update your stall's information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stall-name">Stall Name</Label>
              <Input id="stall-name" defaultValue="Gopal Locho" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stall-description">Description</Label>
              <Input id="stall-description" defaultValue="Authentic Surti Locho and Khaman." />
            </div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>QR Code Management</CardTitle>
                <CardDescription>Generate and view QR codes for your tables.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
                <p>
                    Your customers scan these codes to order directly from your stall.
                </p>
                 <Button asChild>
                    <Link href="/vendor/dashboard/qr">
                        <QrCode className="mr-2 h-4 w-4" />
                        View & Generate QR Codes
                    </Link>
                 </Button>
            </CardContent>
        </Card>
      </div>
    </>
  )
}
