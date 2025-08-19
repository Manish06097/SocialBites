
'use client';

import { useState, Suspense, useEffect } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { auth } from '@/lib/firebase/client';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { Loader2, ShieldCheck } from 'lucide-react';

type PhoneAuthState = 'idle' | 'otpSent' | 'verified' | 'verifying' | 'error';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneAuthState, setPhoneAuthState] = useState<PhoneAuthState>('idle');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const loginPath = `/login?${searchParams.toString()}`;

  // Invisible reCAPTCHA setup
  const configureRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          console.log("reCAPTCHA verified");
        },
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
        
        // This is a potential workaround for reCAPTCHA issues.
        // It tries to reset the reCAPTCHA widget if it exists.
        if (window.grecaptcha && typeof window.grecaptcha.reset === 'function') {
           appVerifier.render().then((widgetId: any) => {
             if (widgetId) {
                window.grecaptcha.reset(widgetId);
             }
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
        toast({ title: 'Phone Number Verified!', description: 'You can now create your account.'});
    } catch(error: any) {
        console.error("Error verifying OTP:", error);
        toast({ variant: 'destructive', title: 'OTP Verification Failed', description: error.message});
        setPhoneAuthState('otpSent'); // Go back to OTP entry
    }
  };
  
  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please re-enter your passwords.',
      });
      return;
    }
    if (phoneAuthState !== 'verified') {
      toast({
        variant: 'destructive',
        title: 'Phone number not verified',
        description: 'Please verify your phone number before creating an account.',
      });
      return;
    }
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: `+91${phoneNumber}`,
        },
      },
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: error.message,
      });
    } else {
      toast({
        title: 'Sign Up Successful!',
        description: 'Please check your email to verify your account.',
      });
      router.push(loginPath);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div id="recaptcha-container"></div>
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <Logo className="mb-4" />
          <CardTitle className="font-headline text-2xl">Sign Up</CardTitle>
          <CardDescription>Enter your information to create an account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <fieldset disabled={loading} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  placeholder="John Doe"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              {/* Phone Number Verification */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
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
                     <Button type="button" variant="outline" onClick={handleSendOtp} disabled={loading}>Resend</Button>
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
                         />
                        <Button type="button" onClick={handleVerifyOtp} disabled={otp.length !== 6 || phoneAuthState === 'verifying'}>
                           {phoneAuthState === 'verifying' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
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

              {/* Password Fields */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </fieldset>

            <Button type="submit" className="w-full font-bold" disabled={loading || phoneAuthState !== 'verified'}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href={loginPath} className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
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

export default function UserSignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}

    