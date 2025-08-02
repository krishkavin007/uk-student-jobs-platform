// src/components/admin/EditAdminUserModal.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AdminUser } from '@/types/admin-types';
import { fetchAdminUserDetails, updateAdminUser } from '@/lib/data-utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface EditAdminUserModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void; // Callback to refresh the admin user list
}

export function EditAdminUserModal({ userId, isOpen, onClose, onUserUpdated }: EditAdminUserModalProps) {
  const { toast } = useToast();

  const [originalUser, setOriginalUser] = useState<AdminUser | null>(null);
  const [editedAdminUser, setEditedAdminUser] = useState<Partial<AdminUser> | null>(null);

  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const getUserDetails = async () => {
      if (isOpen && userId) {
        setLoadingFetch(true);
        setFetchError(null);
        try {
          const fetchedUser: AdminUser = await fetchAdminUserDetails(userId);
          setOriginalUser(fetchedUser);
          // Initialize editedAdminUser with fetched data
          setEditedAdminUser({
            ...fetchedUser,
            // admin_roles and access_level are no longer needed here
          });
        } catch (err: any) {
          console.error('Failed to fetch admin user details:', err);
          setFetchError(err.message || 'Failed to fetch user details.');
          setOriginalUser(null);
          setEditedAdminUser(null);
        } finally {
          setLoadingFetch(false);
        }
      }
    };
    getUserDetails();
  }, [isOpen, userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditedAdminUser(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (field: keyof AdminUser, value: string) => {
    setEditedAdminUser(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSwitchChange = (field: keyof AdminUser, checked: boolean) => {
    setEditedAdminUser(prev => ({
      ...prev,
      [field]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFetchError(null); // Clear any previous errors

    if (!originalUser || !editedAdminUser) {
      setFetchError('No user data to save.');
      return;
    }

    // Prepare update data by checking for changes
    const updateData: Partial<AdminUser> = {};
    if (editedAdminUser.username !== originalUser.username) {
      updateData.username = editedAdminUser.username;
    }
    if (editedAdminUser.admin_email !== originalUser.admin_email) {
      updateData.admin_email = editedAdminUser.admin_email;
    }
    if (editedAdminUser.first_name !== originalUser.first_name) {
      updateData.first_name = editedAdminUser.first_name;
    }
    if (editedAdminUser.last_name !== originalUser.last_name) {
      updateData.last_name = editedAdminUser.last_name;
    }
    if (editedAdminUser.role !== originalUser.role) {
      updateData.role = editedAdminUser.role;
    }
    if (editedAdminUser.is_active !== originalUser.is_active) {
      updateData.is_active = editedAdminUser.is_active;
    }
    // Removed admin_roles and access_level from updateData
    // if (editedAdminUser.admin_roles !== (originalUser.admin_roles?.join(', ') || '')) {
    //   updateData.admin_roles = editedAdminUser.admin_roles
    //     ? (editedAdminUser.admin_roles as string).split(',').map(role => role.trim()).filter(role => role !== '')
    //     : [];
    // }
    // if (editedAdminUser.access_level !== originalUser.access_level) {
    //   updateData.access_level = editedAdminUser.access_level;
    // }

    // Check for required fields for validity
    if (!updateData.username && !originalUser.username) { // If username is being cleared and was originally empty
      toast({
        title: "Validation Error",
        description: "Username cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    if (!updateData.admin_email && !originalUser.admin_email) { // If email is being cleared and was originally empty
      toast({
        title: "Validation Error",
        description: "Email cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    if (!updateData.role && !originalUser.role) { // If role is being cleared and was originally empty
      toast({
        title: "Validation Error",
        description: "Role cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(updateData).length === 0) {
      toast({
        title: "No Changes Detected",
        description: "There are no changes to save for this admin user.",
        variant: "default",
      });
      onClose(); // Close the modal if no changes
      return;
    }

    setLoadingSave(true);
    try {
      await updateAdminUser(originalUser.admin_id, updateData);
      toast({
        title: "Admin User Updated",
        description: `Admin user '${editedAdminUser.username || originalUser.username}' has been successfully updated.`,
        variant: "default",
      });
      onUserUpdated();
      onClose();
    } catch (err: any) {
      console.error('Failed to update admin user:', err);
      setFetchError(err.message || 'Failed to update admin user. Please try again.');
      toast({
        title: "Failed to Update Admin User",
        description: err.message || 'An error occurred while updating the admin user.',
        variant: "destructive",
      });
    } finally {
      setLoadingSave(false);
    }
  };

  const handleCloseModal = () => {
    // Reset all states when modal is closed
    setOriginalUser(null);
    setEditedAdminUser(null);
    setLoadingFetch(false);
    setLoadingSave(false);
    setFetchError(null);
    onClose();
  };

  // Helper function for field rendering, adjusted for admin fields
  const renderField = (label: string, content: JSX.Element, isConditional = false) => {
    return (
      <div className={`flex flex-col gap-2 sm:grid sm:grid-cols-4 sm:items-center sm:gap-4 ${isConditional ? '' : ''}`}>
        <Label htmlFor={content.props.id} className="text-gray-300 sm:text-right">
          {label}
        </Label>
        {content}
      </div>
    );
  };

  const formattedCreatedAt = useMemo(() => {
    return originalUser?.created_at ? new Date(originalUser.created_at).toLocaleString() : 'N/A';
  }, [originalUser]);

  const formattedUpdatedAt = useMemo(() => {
    return originalUser?.updated_at ? new Date(originalUser.updated_at).toLocaleString() : 'N/A';
  }, [originalUser]);

  const formattedLastLoginAt = useMemo(() => {
    return originalUser?.last_login_at ? new Date(originalUser.last_login_at).toLocaleString() : 'Never';
  }, [originalUser]);


  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-3xl bg-gray-900 text-gray-100 border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Admin User</DialogTitle>
          <DialogDescription className="text-gray-400">
            Make changes to {originalUser?.admin_email}'s profile. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        {loadingFetch ? (
          <div className="py-8 text-center text-gray-400">Loading user details...</div>
        ) : fetchError && !originalUser ? (
          <div className="py-8 text-center text-red-500">{fetchError}</div>
        ) : originalUser && editedAdminUser ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 py-4">

            {/* Admin ID (Read-Only) */}
            {renderField(
              "Admin ID",
              <Input
                id="admin_id"
                value={originalUser.admin_id}
                readOnly
                className="w-full sm:col-span-3 bg-gray-800 border-gray-600 text-gray-100 cursor-not-allowed"
              />
            )}

            {/* Username */}
            {renderField(
              "Username",
              <Input
                id="username"
                value={editedAdminUser.username || ''}
                onChange={handleInputChange}
                className="w-full sm:col-span-3 bg-gray-800 border-gray-600 text-gray-100"
                required
              />
            )}

            {/* First Name Input */}
            {renderField(
              "First Name",
              <Input
                id="first_name"
                value={editedAdminUser.first_name || ''}
                onChange={handleInputChange}
                className="w-full sm:col-span-3 bg-gray-800 border-gray-600 text-gray-100"
              />
            )}

            {/* Last Name Input */}
            {renderField(
              "Last Name",
              <Input
                id="last_name"
                value={editedAdminUser.last_name || ''}
                onChange={handleInputChange}
                className="w-full sm:col-span-3 bg-gray-800 border-gray-600 text-gray-100"
              />
            )}

            {/* Email */}
            {renderField(
              "Email",
              <Input
                id="admin_email"
                type="email"
                value={editedAdminUser.admin_email || ''}
                onChange={handleInputChange}
                className="w-full sm:col-span-3 bg-gray-800 border-gray-600 text-gray-100"
                required
              />
            )}

            {/* Role Select */}
            {renderField(
              "Role",
              <Select
                value={editedAdminUser.role || ''}
                onValueChange={(value: string) => handleSelectChange('role', value)}
              >
                <SelectTrigger id="role" className="w-full sm:col-span-3 bg-gray-800 border-gray-600 text-gray-100">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-gray-100 border-gray-600">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  {/* Add other roles if applicable based on your DB */}
                </SelectContent>
              </Select>
            )}

            {/* Is Active Switch */}
            {renderField(
              "Active",
              <Switch
                id="is_active"
                checked={editedAdminUser.is_active ?? true} // Default to true if undefined
                onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                className="col-span-3 justify-self-start data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
              />
            )}

            {/* Removed: Admin Roles (comma-separated string input for array) */}
            {/* Removed: Access Level */}

            {/* Created At (Read-Only) */}
            {renderField(
              "Created At",
              <Input
                id="created_at"
                value={formattedCreatedAt}
                readOnly
                className="w-full sm:col-span-3 bg-gray-800 border-gray-600 text-gray-100 cursor-not-allowed"
              />
            )}

            {/* Updated At (Read-Only) */}
            {renderField(
              "Updated At",
              <Input
                id="updated_at"
                value={formattedUpdatedAt}
                readOnly
                className="w-full sm:col-span-3 bg-gray-800 border-gray-600 text-gray-100 cursor-not-allowed"
              />
            )}

            {/* Last Login At (Read-Only) */}
            {renderField(
              "Last Login",
              <Input
                id="last_login_at"
                value={formattedLastLoginAt}
                readOnly
                className="w-full sm:col-span-3 bg-gray-800 border-gray-600 text-gray-100 cursor-not-allowed"
              />
            )}

            {fetchError && <p className="text-red-500 text-sm text-center col-span-1 sm:col-span-2">{fetchError}</p>}
            <DialogFooter className="mt-4 col-span-1 sm:col-span-2 flex justify-end">
              <Button type="button" variant="outline" onClick={handleCloseModal} disabled={loadingSave} className="bg-gray-700 text-gray-300 border border-gray-600">
                Cancel
              </Button>
              <Button type="submit" disabled={loadingSave} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loadingSave ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-8 text-center text-gray-400">No admin user selected or data not found.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}