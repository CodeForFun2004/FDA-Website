// src/features/authenticate/LoginFlow.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input } from '../../../components/ui/common';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import {
  checkIdentifierApi,
  sendOtpApi
} from '@/features/authenticate/api/auth.api';

type Step = 'IDENTIFIER' | 'OTP' | 'PASSWORD';
type FlowMode = 'NORMAL' | 'FORGOT_PASSWORD';

function normalizeIdentifier(v: string) {
  return v.trim();
}

function isPasswordCase(res: any) {
  const required = String(res?.requiredMethod ?? '').toUpperCase();
  if (required === 'PASSWORD') return true;
  if (required === 'OTP') return false;
  return !!res?.hasPassword; // fallback
}

export default function LoginFlow(props: { onLoggedIn?: () => void }) {
  const loginWithPassword = useAuthStore((s) => s.loginWithPassword);
  const loginWithOtp = useAuthStore((s) => s.loginWithOtp);
  const authStatus = useAuthStore((s) => s.status);
  const clearError = useAuthStore((s) => s.clearError);
  const user = useAuthStore((s) => s.user);
  const setNeedsPasswordReset = useAuthStore((s) => s.setNeedsPasswordReset);

  const [step, setStep] = useState<Step>('IDENTIFIER');
  const [flowMode, setFlowMode] = useState<FlowMode>('NORMAL');

  const [identifier, setIdentifier] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(Date.now());
  const [localLoading, setLocalLoading] = useState(false);

  const disabled = localLoading || authStatus === 'loading';

  useEffect(() => {
    if (!expiresAt) return;
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  const secondsLeft = useMemo(() => {
    if (!expiresAt) return null;
    const ms = new Date(expiresAt).getTime() - nowTick;
    return Math.max(0, Math.floor(ms / 1000));
  }, [expiresAt, nowTick]);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const id = normalizeIdentifier(identifier);
    if (!id) {
      toast.warning('Please enter email or phone number.');
      return;
    }

    setLocalLoading(true);
    try {
      const res = await checkIdentifierApi({ identifier: id });

      // nếu BE có accountExists
      if (res?.accountExists === false) {
        toast.error(res?.message || 'Account does not exist.');
        return;
      }

      if (isPasswordCase(res)) {
        setStep('PASSWORD');
        return;
      }

      // OTP case
      setStep('OTP');
      const otpRes = await sendOtpApi({ identifier: id });

      setExpiresAt(otpRes?.expiresAt ?? null);
      setOtp('');
      toast.success(otpRes?.message || 'OTP has been sent.');
    } catch (err: any) {
      toast.error(err?.message || 'Unable to check account.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResendOtp = async () => {
    clearError();
    const id = normalizeIdentifier(identifier);

    if (!id) return;

    setLocalLoading(true);
    try {
      const otpRes = await sendOtpApi({ identifier: id });
      setExpiresAt(otpRes?.expiresAt ?? null);
      setOtp('');
      toast.success(otpRes?.message || 'OTP has been resent.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send OTP.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    clearError();
    const id = normalizeIdentifier(identifier);

    if (!id) {
      toast.warning('Please enter email or phone number.');
      return;
    }

    setLocalLoading(true);
    try {
      // Send OTP for forgot password
      const otpRes = await sendOtpApi({ identifier: id });

      setFlowMode('FORGOT_PASSWORD');
      setStep('OTP');
      setExpiresAt(otpRes?.expiresAt ?? null);
      setOtp('');
      toast.success('Password reset OTP has been sent!');
    } catch (err: any) {
      toast.error(err?.message || 'Unable to send OTP.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const id = normalizeIdentifier(identifier);
    if (otp.length !== 6) {
      toast.warning('OTP must be 6 digits.');
      return;
    }

    try {
      await loginWithOtp(id, otp);
      toast.success('Signed in successfully!');

      // If this was a forgot password flow, set flag and redirect to /admin
      if (flowMode === 'FORGOT_PASSWORD') {
        // Set flag so /admin page will show reset password modal
        setNeedsPasswordReset(true);
      }

      // Always call onLoggedIn to redirect
      props.onLoggedIn?.();
    } catch (err: any) {
      toast.error(err?.message || 'Sign-in failed.');
    }
  };

  const handleLoginPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const id = normalizeIdentifier(identifier);
    if (!password) {
      toast.warning('Please enter your password.');
      return;
    }

    try {
      await loginWithPassword(id, password);
      toast.success('Signed in successfully!');
      props.onLoggedIn?.();
    } catch (err: any) {
      toast.error(err?.message || 'Sign-in failed.');
    }
  };

  // Render forms
  const renderForm = () => {
    if (step === 'IDENTIFIER') {
      return (
        <form onSubmit={handleContinue} className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium' htmlFor='identifier'>
              Email / Phone number
            </label>
            <div className='relative'>
              <Mail className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
              <Input
                id='identifier'
                placeholder='you@gmail.com or +84...'
                className='pl-9'
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete='username'
              />
            </div>
          </div>

          <Button type='submit' className='h-11 w-full' disabled={disabled}>
            {disabled ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Processing...
              </>
            ) : (
              <span className='flex items-center'>
                Continue <ArrowRight className='ml-2 h-4 w-4' />
              </span>
            )}
          </Button>

          <div className='text-center'>
            <button
              type='button'
              onClick={handleForgotPassword}
              disabled={disabled}
              className='text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50'
            >
              Forgot password?
            </button>
          </div>
        </form>
      );
    }

    if (step === 'OTP') {
      return (
        <form onSubmit={handleLoginOtp} className='space-y-4'>
          <div className='space-y-1'>
            <div className='text-muted-foreground text-sm'>
              {flowMode === 'FORGOT_PASSWORD' ? (
                <>
                  Password reset OTP sent to:{' '}
                  <span className='font-medium'>{identifier}</span>
                </>
              ) : (
                <>
                  OTP sent to: <span className='font-medium'>{identifier}</span>
                </>
              )}
            </div>
            {flowMode === 'FORGOT_PASSWORD' && (
              <div className='rounded-lg border border-blue-100 bg-blue-50 p-2 text-xs text-blue-700'>
                After verification, you'll be asked to set a new password.
              </div>
            )}
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium' htmlFor='otp'>
              Enter OTP (6 digits)
            </label>
            <Input
              id='otp'
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              inputMode='numeric'
              autoComplete='one-time-code'
              placeholder='••••••'
            />
            {secondsLeft !== null ? (
              <div className='text-muted-foreground text-xs'>
                Expires in: {Math.floor(secondsLeft / 60)}:
                {String(secondsLeft % 60).padStart(2, '0')}
              </div>
            ) : null}
          </div>

          <Button type='submit' className='h-11 w-full' disabled={disabled}>
            {disabled ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {flowMode === 'FORGOT_PASSWORD'
                  ? 'Verifying...'
                  : 'Signing in...'}
              </>
            ) : flowMode === 'FORGOT_PASSWORD' ? (
              'Verify OTP'
            ) : (
              'Sign In'
            )}
          </Button>

          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outline'
              className='h-11 flex-1'
              onClick={() => {
                setOtp('');
                setExpiresAt(null);
                setStep('IDENTIFIER');
                setFlowMode('NORMAL');
              }}
              disabled={disabled}
            >
              Change email/phone
            </Button>

            <Button
              type='button'
              variant='outline'
              className='h-11 flex-1'
              onClick={handleResendOtp}
              disabled={disabled || (secondsLeft !== null && secondsLeft > 0)}
              title='Resend allowed only after OTP expires (rule can be changed)'
            >
              Resend OTP
            </Button>
          </div>
        </form>
      );
    }

    // PASSWORD
    return (
      <form onSubmit={handleLoginPassword} className='space-y-4'>
        <div className='text-muted-foreground text-sm'>
          Account: <span className='font-medium'>{identifier}</span>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <label className='text-sm font-medium' htmlFor='password'>
              Password
            </label>
            <button
              type='button'
              onClick={handleForgotPassword}
              disabled={disabled}
              className='text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50'
            >
              Forgot password?
            </button>
          </div>
          <div className='relative'>
            <Lock className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              placeholder='••••••••'
              className='pr-12 pl-9'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete='current-password'
              data-lpignore='true'
              data-1p-ignore='true'
              data-bwignore='true'
            />

            <button
              type='button'
              onClick={() => setShowPassword((v) => !v)}
              className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2'
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>
        </div>

        <Button type='submit' className='h-11 w-full' disabled={disabled}>
          {disabled ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Signing in...
            </>
          ) : (
            <span className='flex items-center'>
              Sign In <ArrowRight className='ml-2 h-4 w-4' />
            </span>
          )}
        </Button>

        <Button
          type='button'
          variant='outline'
          className='h-11 w-full'
          onClick={() => {
            setPassword('');
            setStep('IDENTIFIER');
          }}
          disabled={disabled}
        >
          Back
        </Button>
      </form>
    );
  };

  return renderForm();
}
