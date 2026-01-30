'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button, Input } from '@/components/ui/common';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { resetPasswordApi } from '../api/auth.api';

type SetPasswordModalProps = {
  open: boolean;
  email?: string; // Optional - just for display
  onSuccess?: () => void; // Optional callback
  onClose?: () => void;
};

export default function SetPasswordModal({
  open,
  email,
  onSuccess,
  onClose
}: SetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password validation rules
  const passwordRules = {
    minLength: newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(newPassword),
    hasLowerCase: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);
  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('Mật khẩu không đáp ứng yêu cầu bảo mật.');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordApi({
        newPassword,
        confirmPassword
      });

      if (res.success) {
        toast.success('Đặt lại mật khẩu thành công!');
        setNewPassword('');
        setConfirmPassword('');
        // Close modal and trigger success callback
        onSuccess?.();
      } else {
        toast.error(res.message || 'Đặt lại mật khẩu thất bại.');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold'>
            Đặt mật khẩu mới
          </DialogTitle>
          <DialogDescription className='text-muted-foreground text-sm'>
            Vui lòng đặt mật khẩu cho tài khoản của bạn để bảo mật hơn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-5 pt-2'>
          {/* Email Display (Optional) */}
          {email && (
            <div className='rounded-lg bg-slate-50 p-3'>
              <p className='text-muted-foreground text-xs'>Tài khoản</p>
              <p className='font-medium text-slate-800'>{email}</p>
            </div>
          )}

          {/* New Password */}
          <div className='space-y-2'>
            <label className='text-sm font-medium' htmlFor='new-password'>
              Mật khẩu mới
            </label>
            <div className='relative'>
              <Lock className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
              <Input
                id='new-password'
                type={showNewPassword ? 'text' : 'password'}
                placeholder='Nhập mật khẩu mới'
                className='pr-12 pl-9'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete='new-password'
              />
              <button
                type='button'
                onClick={() => setShowNewPassword((v) => !v)}
                className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2'
              >
                {showNewPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className='space-y-2'>
            <label className='text-sm font-medium' htmlFor='confirm-password'>
              Xác nhận mật khẩu
            </label>
            <div className='relative'>
              <Lock className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
              <Input
                id='confirm-password'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='Nhập lại mật khẩu'
                className='pr-12 pl-9'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete='new-password'
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword((v) => !v)}
                className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2'
              >
                {showConfirmPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          {newPassword && (
            <div className='space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3'>
              <p className='text-xs font-medium text-slate-700'>
                Yêu cầu mật khẩu:
              </p>
              <ul className='space-y-1.5'>
                <PasswordRule
                  met={passwordRules.minLength}
                  text='Ít nhất 8 ký tự'
                />
                <PasswordRule
                  met={passwordRules.hasUpperCase}
                  text='Có chữ hoa (A-Z)'
                />
                <PasswordRule
                  met={passwordRules.hasLowerCase}
                  text='Có chữ thường (a-z)'
                />
                <PasswordRule
                  met={passwordRules.hasNumber}
                  text='Có số (0-9)'
                />
                <PasswordRule
                  met={passwordRules.hasSpecial}
                  text='Có ký tự đặc biệt (!@#$...)'
                />
              </ul>
            </div>
          )}

          {/* Password Match Indicator */}
          {confirmPassword && (
            <div className='flex items-center gap-2 text-sm'>
              {passwordsMatch ? (
                <>
                  <CheckCircle2 className='h-4 w-4 text-green-600' />
                  <span className='text-green-600'>Mật khẩu khớp</span>
                </>
              ) : (
                <>
                  <div className='h-4 w-4 rounded-full border-2 border-red-500'></div>
                  <span className='text-red-600'>Mật khẩu không khớp</span>
                </>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type='submit'
            className='h-11 w-full'
            disabled={loading || !isPasswordValid || !passwordsMatch}
          >
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang xử lý...
              </>
            ) : (
              'Đặt mật khẩu'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PasswordRule({ met, text }: { met: boolean; text: string }) {
  return (
    <li className='flex items-center gap-2 text-xs'>
      {met ? (
        <CheckCircle2 className='h-3.5 w-3.5 text-green-600' />
      ) : (
        <div className='h-3.5 w-3.5 rounded-full border-2 border-slate-300'></div>
      )}
      <span className={met ? 'text-green-600' : 'text-slate-500'}>{text}</span>
    </li>
  );
}
