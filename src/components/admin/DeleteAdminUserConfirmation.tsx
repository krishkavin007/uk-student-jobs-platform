// src/components/admin/DeleteAdminUserConfirmation.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast'; // <--- THIS IS THE CORRECTED LINE
import { deleteAdminUser } from '@/lib/data-utils'; // You'll need to implement this API call

interface DeleteAdminUserConfirmationProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => Promise<void>; // Callback to handle the actual deletion in parent
}

export function DeleteAdminUserConfirmation({ userId, isOpen, onClose, onConfirm }: DeleteAdminUserConfirmationProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "No user selected for deletion.",
        variant: "destructive",
      });
      onClose();
      return;
    }

    setLoading(true);
    try {
      await onConfirm(userId); // Calls the parent's confirm function (which likely makes the API call)
      toast({
        title: "Admin User Deleted",
        description: "The admin user has been successfully deleted.",
        variant: "default",
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to delete admin user:', err);
      toast({
        title: "Failed to Delete Admin User",
        description: err.message || 'An error occurred while deleting the admin user.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLoading(false); // Ensure loading state is reset on close
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="bg-gray-900 text-gray-400 border border-gray-700 hover:text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            This action cannot be undone. This will permanently delete the administrator account
            and remove their data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading} className="bg-gray-900 text-gray-300 border border-gray-600 hover:bg-white hover:text-gray-900 transition-colors">
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-700 hover:bg-red-800 text-white border-red-600 hover:border-red-700"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}