
'use client';

import { useCart } from '@/context/CartProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import Confetti from 'react-dom-confetti';
import { useState, useEffect, useTransition } from 'react';
import { createOrder } from '../orders/actions';
import { Loader2, CreditCard, ShieldCheck, Phone, User as UserIcon } from 'lucide-react';
import type { PaymentMethod } from '@/lib/types';
import { auth } from '@/lib/firebase/client';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Skeleton } from '@/components/ui/skeleton';

type PhoneAuthState = 'idle' | 'otpSent' | 'verified' | 'verifying' | 'error';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showConfetti, setShowConfetti] = useState(false);
  
  // User Profile State
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; phone: string; } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneAuthState, setPhoneAuthState] = useState<PhoneAuthState>('idle');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setShowConfetti(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (cartItems.length === 0 && !isSuccess) {
      router.replace('/');
    }
  }, [cartItems, isSuccess, router]);
  
  // Fetch user profile
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user && !user.is_anonymous) {
        const { data: profileData, error } = await supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            toast({ variant: 'destructive', title: 'Could not load profile.'});
        } else {
            setProfile(profileData);
            setPhoneAuthState('verified'); // Logged-in users have verified numbers
        }
      }
      setLoadingProfile(false);
    };

    fetchUserAndProfile();
  }, [toast]);
  
  // Invisible reCAPTCHA setup
  const configureRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => console.log("reCAPTCHA verified"),
        'expired-callback': () => {
           toast({
            variant: "destructive",
            title: "reCAPTCHA Expired",
            description: "Please try sending the OTP again.",
           });
        }
      });
    }
  }
  
  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      toast({ variant: 'destructive', title: 'Invalid Phone Number', description: 'Please enter a valid 10-digit phone number.'});
      return;
    }
    
    configureRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    const formattedPhoneNumber = `+91${phoneNumber}`;

    try {
      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setPhoneAuthState('otpSent');
      toast({ title: "OTP Sent!", description: `An OTP has been sent to ${formattedPhoneNumber}`});
    } catch (error: any) {
        console.error("Error sending OTP:", error);
        toast({ variant: 'destructive', title: 'Failed to Send OTP', description: `Error: ${error.code}. Check the console for more details.` });
        if (window.grecaptcha && typeof window.grecaptcha.reset === 'function') {
           appVerifier.render().then((widgetId: any) => {
             if (widgetId) window.grecaptcha.reset(widgetId);
           });
        }
    }
  };

  const handleVerifyOtp = async () => {
     if (otp.length !== 6) {
      toast({ variant: 'destructive', title: 'Invalid OTP', description: 'Please enter the 6-digit OTP.'});
      return;
    }
    if (!confirmationResult) {
      toast({ variant: 'destructive', title: 'Verification Error', description: 'Please send an OTP first.'});
      return;
    }
    setPhoneAuthState('verifying');
    try {
        await confirmationResult.confirm(otp);
        setPhoneAuthState('verified');
        toast({ title: 'Phone Number Verified!', description: 'You can now proceed.'});
    } catch(error: any) {
        console.error("Error verifying OTP:", error);
        toast({ variant: 'destructive', title: 'OTP Verification Failed', description: error.message});
        setPhoneAuthState('otpSent');
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const paymentMethod = formData.get('payment') as PaymentMethod;
    
    let contactName: string | undefined;
    let contactPhone: string | undefined;

    if (user && !user.is_anonymous && profile) {
        contactName = profile.full_name;
        contactPhone = profile.phone;
    } else {
        contactName = formData.get('name') as string;
        contactPhone = `+91${phoneNumber}`;
    }
    
    if (phoneAuthState !== 'verified') {
        toast({ variant: "destructive", title: "Phone number not verified", description: "Please verify your phone number to place the order." });
        return;
    }
    
    if (!contactName || !contactPhone) {
        toast({ variant: "destructive", title: "Missing Information", description: "Contact details are required."});
        return;
    }

    startTransition(async () => {
        const tableInfoStr = localStorage.getItem('tableInfo');
        if (!tableInfoStr) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Table information is missing. Please scan a QR code again.",
            });
            setIsProcessingPayment(false);
            return;
        }
        const { tableId } = JSON.parse(tableInfoStr);

        const result = await createOrder({
            paymentMethod,
            cartItems,
            cartTotal,
            tableId,
            contactName,
            contactPhone,
        });
        
        setIsProcessingPayment(false);

        if (result.error) {
            toast({
                variant: "destructive",
                title: "Failed to place order",
                description: result.error,
            });
        } else if (result.orderId) {
            clearCart();
            setIsSuccess(true);
            setTimeout(() => router.push('/orders'), 4000);
        }
    });
  };
  
  const confettiConfig = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 100,
    dragFriction: 0.12,
    duration: 3000,
    stagger: 3,
    width: "10px",
    height: "10px",
    colors: ["#FF6B00", "#00A7E1", "#FFFFFF", "#FFC107"]
  };
  
  const isGuest = !user || user.is_anonymous;

  if (isSuccess) {
    return (
        <div className="container mx-auto flex h-[70vh] flex-col items-center justify-center text-center">
            <div className="absolute">
              <Confetti active={showConfetti} config={confettiConfig} />
            </div>
            <h1 className="font-headline text-5xl font-extrabold text-primary">Awesome!</h1>
            <p className="mt-4 text-xl text-foreground">Your order is in and the kitchens are cookin'!</p>
            <p className="mt-2 text-muted-foreground">You will be redirected to your order tracking page shortly.</p>
        </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
      <div id="recaptcha-container"></div>
      <h1 className="mb-8 font-headline text-4xl font-bold">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
        <fieldset disabled={isPending || isProcessingPayment} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingProfile ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : isGuest ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="phone">Contact Number</Label>
                       <div className="flex items-center gap-2">
                         <span className="flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">+91</span>
                         <Input 
                           id="phone" 
                           name="phone" 
                           type="tel" 
                           placeholder="9876543210" 
                           required 
                           value={phoneNumber}
                           onChange={(e) => setPhoneNumber(e.target.value)}
                           disabled={phoneAuthState !== 'idle'}
                           maxLength={10}
                         />
                         {phoneAuthState === 'idle' && (
                             <Button type="button" onClick={handleSendOtp} disabled={phoneNumber.length !== 10}>Send OTP</Button>
                          )}
                          {(phoneAuthState === 'otpSent' || phoneAuthState === 'verified') && (
                             <Button type="button" variant="outline" onClick={handleSendOtp} disabled={isPending || phoneAuthState === 'verifying'}>Resend</Button>
                          )}
                       </div>
                  </div>
                   {(phoneAuthState === 'otpSent' || phoneAuthState === 'verifying') && (
                    <div className="space-y-2">
                        <Label htmlFor="otp">Enter OTP</Label>
                        <div className="flex items-center gap-2">
                            <Input 
                                id="otp" 
                                name="otp" 
                                type="text" 
                                placeholder="6-digit code" 
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                disabled={phoneAuthState === 'verifying'}
                             />
                            <Button type="button" onClick={handleVerifyOtp} disabled={otp.length !== 6 || phoneAuthState === 'verifying'}>
                               {phoneAuthState === 'verifying' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : 'Verify'}
                            </Button>
                        </div>
                    </div>
                  )}
                  {phoneAuthState === 'verified' && (
                      <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-green-700">
                        <ShieldCheck className="h-5 w-5" />
                        <p className="font-medium text-sm">Phone number verified successfully!</p>
                      </div>
                  )}
                </>
              ) : profile ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 rounded-md border p-3">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Name</p>
                            <p className="font-semibold">{profile.full_name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-md border p-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p className="font-semibold">{profile.phone}</p>
                        </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Could not load your profile information.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup name="payment" defaultValue="cod" className="space-y-2">
                <Label
                  htmlFor="cod"
                  className="flex cursor-pointer items-center gap-4 rounded-md border p-4 hover:bg-accent/50 has-[input:checked]:border-primary"
                >
                  <RadioGroupItem value="cod" id="cod" />
                  <span className="font-semibold">Cash on Delivery</span>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>
        </fieldset>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="font-headline">Your Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 space-y-4 overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                     <Image src={item.menuItem.imageUrl} alt={item.menuItem.name} width={48} height={48} className="rounded-md" data-ai-hint="food item" />
                    <div>
                      <p className="font-semibold">{item.menuItem.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} • From: {item.stall.name}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">₹{item.totalPrice.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Charges</span>
                <span>Calculated at next step</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>To Pay</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" className="w-full font-bold" disabled={isPending || (isGuest && phoneAuthState !== 'verified')}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Placing Order...' : 'Place Order'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

// Add this to a global declaration file if it's not already there
// to avoid TypeScript errors on the window object.
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    grecaptcha: any;
    recaptchaWidgetId?: any;
  }
}

    