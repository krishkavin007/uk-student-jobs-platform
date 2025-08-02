// src/components/admin/AddAdminUserModal.tsx
"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addAdminUser } from '@/lib/data-utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface AddAdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void; // Callback to refresh the admin user list
}

export function AddAdminUserModal({ isOpen, onClose, onUserAdded }: AddAdminUserModalProps) {
  const [username, setUsername] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [isActive, setIsActive] = useState(true);
  // Removed [adminRoles, setAdminRoles] = useState('');
  // Removed [accessLevel, setAccessLevel] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !adminEmail || !password || !confirmPassword || !role || !firstName || !lastName) {
      setError('Username, Email, First Name, Last Name, Password, Confirm Password, and Role are required.');
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Removed rolesArray conversion
      await addAdminUser({
        username,
        admin_email: adminEmail,
        first_name: firstName,
        last_name: lastName,
        password,
        role,
        is_active: isActive,
        // Removed admin_roles: rolesArray,
        // Removed access_level: accessLevel,
      });

      toast({
        title: "Admin User Added",
        description: `Admin user '${username}' has been successfully added.`,
        variant: "default",
      });
      onUserAdded();
      onClose();
      // Reset form fields
      setUsername('');
      setAdminEmail('');
      setFirstName('');
      setLastName('');
      setPassword('');
      setConfirmPassword('');
      setRole('admin');
      setIsActive(true);
      // Removed setAdminRoles('');
      // Removed setAccessLevel(1);
    } catch (err: any) {
      console.error('Failed to add admin user:', err);
      setError(err.message || 'Failed to add admin user. Please try again.');
      toast({
        title: "Failed to Add Admin User",
        description: err.message || 'An error occurred while adding the admin user.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state when modal is closed
    setUsername('');
    setAdminEmail('');
    setFirstName('');
    setLastName('');
    setPassword('');
    setConfirmPassword('');
    setRole('admin');
    setIsActive(true);
    // Removed setAdminRoles('');
    // Removed setAccessLevel(1);
    setLoading(false);
    setError(null);
    onClose();
  };

  // Helper function for consistent field rendering
  const renderField = (label: string | JSX.Element, content: JSX.Element) => {
    return (
      <div className="flex flex-col gap-2 sm:grid sm:grid-cols-4 sm:items-center sm:gap-4">
        <Label htmlFor={content.props.id} className="text-gray-300 sm:text-right">
          {label}
        </Label>
        {content}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl bg-gray-900 text-gray-100 border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Admin User</DialogTitle>
          <DialogDescription className="text-gray-400">
             Fill in the details for the new administrator account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 py-4">

          {renderField(
            "Username",
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full sm:col-span-3 bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500"
              required
            />
          )}

          {renderField(
            "Email",
            <Input
              id="admin_email"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full sm:col-span-3 bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500"
              required
            />
          )}

          {renderField(
            "First Name",
            <Input
              id="first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full sm:col-span-3 bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500"
              required
            />
          )}

          {renderField(
            "Last Name",
            <Input
              id="last_name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full sm:col-span-3 bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500"
              required
            />
          )}

          {renderField(
            "Password",
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full sm:col-span-3 bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500"
              required
            />
          )}

          {renderField(
            "Confirm Password",
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full sm:col-span-3 bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500"
              required
            />
          )}

          {renderField(
            "Role",
            <Select onValueChange={setRole} value={role}>
              <SelectTrigger id="role" className="w-full sm:col-span-3 bg-gray-800 border-gray-600 text-gray-100" required>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-gray-100 border-gray-600">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                {/* Add other roles if applicable based on your DB */}
              </SelectContent>
            </Select>
          )}

          {renderField(
            "Active",
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={setIsActive}
              className="col-span-3 justify-self-start data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
            />
          )}

          {/* Removed Admin Roles Field */}
          {/* Removed Access Level Field */}

          {error && <p className="text-red-500 text-sm text-center col-span-1 sm:col-span-2">{error}</p>}
          <DialogFooter className="mt-4 col-span-1 sm:col-span-2 flex justify-end">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="bg-gray-700 text-gray-300 border border-gray-600">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Adding...' : 'Add Admin User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}