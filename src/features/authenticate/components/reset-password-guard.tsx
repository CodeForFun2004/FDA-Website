'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import SetPasswordModal from './set-password-modal';

/**
 * Component to check if user needs to reset password after OTP login
 * Place this in admin layout or any protected route
 */
export default function ResetPasswordGuard() {
  const needsPasswordReset = useAuthStore((s) => s.needsPasswordReset);
  const setNeedsPasswordReset = useAuthStore((s) => s.setNeedsPasswordReset);
  const user = useAuthStore((s) => s.user);

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (needsPasswordReset) {
      // Small delay to ensure page is loaded
      setTimeout(() => {
        setShowModal(true);
      }, 300);
    } else {
      // If flag is cleared, close modal
      setShowModal(false);
    }
  }, [needsPasswordReset]);

  const handleSuccess = () => {
    setShowModal(false);
    setNeedsPasswordReset(false);
  };

  const handleClose = () => {
    setShowModal(false);
    setNeedsPasswordReset(false);
  };

  // Only render modal if we have showModal state and user email
  if (!user?.email) {
    return null;
  }

  return (
    <SetPasswordModal
      open={showModal}
      email={user.email}
      onSuccess={handleSuccess}
      onClose={handleClose}
    />
  );
}
