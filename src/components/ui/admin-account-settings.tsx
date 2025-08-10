"use client";

import React, { useState, useEffect } from "react";
import { X, User, Mail, Lock } from "lucide-react";
import { Button } from "./button";
import { useAdminAuth } from "@/app/admin-auth/AdminAuthContext";

interface AdminAccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: {
    first_name?: string;
    last_name?: string;
    admin_email: string;
    username: string;
  } | null;
}

export function AdminAccountSettingsModal({ isOpen, onClose, adminUser }: AdminAccountSettingsModalProps) {
  const { refreshAdminUser } = useAdminAuth();
  
  const [formData, setFormData] = useState({
    firstName: adminUser?.first_name || "",
    lastName: adminUser?.last_name || "",
    email: adminUser?.admin_email || "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Validate passwords match if new password is provided
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }

    // Check if user is trying to change password
    const isChangingPassword = formData.newPassword && formData.newPassword.trim() !== "";

    if (isChangingPassword) {
      // Show password confirmation modal for password changes
      setPasswordError("");
      setCurrentPassword("");
      setShowPasswordModal(true);
    } else {
      // Directly update profile for non-password changes
      handleProfileUpdate();
    }
  };

  const handleProfileUpdate = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          admin_email: formData.email,
          // Only include password fields if we're changing password
          ...(formData.newPassword && formData.newPassword.trim() !== "" && {
            current_password: currentPassword,
            new_password: formData.newPassword,
          }),
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Received non-JSON response:', textResponse);
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      alert("Account settings updated successfully!");
      
      // Refresh admin user data in context
      await refreshAdminUser();
      
      // Reset forms
      setFormData({
        firstName: data.admin.first_name || "",
        lastName: data.admin.last_name || "",
        email: data.admin.admin_email || "",
        newPassword: "",
        confirmPassword: "",
      });
      
      setCurrentPassword("");
      setShowPasswordModal(false);
      onClose();
      
    } catch (error) {
      console.error('Error updating admin profile:', error);
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordConfirm = async () => {
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    setPasswordError("");
    // Call the unified profile update function
    await handleProfileUpdate();
  };

  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setCurrentPassword("");
    setPasswordError("");
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      firstName: adminUser?.first_name || "",
      lastName: adminUser?.last_name || "",
      email: adminUser?.admin_email || "",
      newPassword: "",
      confirmPassword: "",
    });
    onClose();
  };

  // Update form data when adminUser prop changes (after refresh)
  useEffect(() => {
    if (adminUser) {
      setFormData({
        firstName: adminUser.first_name || "",
        lastName: adminUser.last_name || "",
        email: adminUser.admin_email || "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [adminUser]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            Account Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <X className="h-4 w-4 text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Personal Information */}
          <div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  placeholder="First name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Last name"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email address"
            />
          </div>

          {/* Password Change */}
          <div>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-700">
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4"
          onClick={handlePasswordCancel}
        >
          <div 
            className="bg-gray-900 rounded-lg shadow-xl w-full max-w-sm border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                Confirm Password
              </h3>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-sm text-gray-300 mb-3">
                Please enter your current password to save changes.
              </p>
              
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordConfirm()}
                />
                {passwordError && (
                  <p className="text-red-400 text-xs mt-1">{passwordError}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-700">
              <Button
                onClick={handlePasswordCancel}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-gray-800"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordConfirm}
                disabled={isLoading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
