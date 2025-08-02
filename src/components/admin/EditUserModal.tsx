// components/admin/EditUserModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
// import { Switch } from '@/components/ui/switch'; // Switch is not used in the provided snippet
import { User } from '@/types/admin-types';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: (userId: string, data: Partial<User>) => Promise<void>;
}

export function EditUserModal({ isOpen, onClose, user, onUserUpdated }: EditUserModalProps) {
  const [editedFirstName, setEditedFirstName] = useState<string | undefined | null>(undefined);
  const [editedLastName, setEditedLastName] = useState<string | undefined | null>(undefined);
  const [editedOrganisationName, setEditedOrganisationName] = useState<string | undefined | null>(undefined);
  const [editedContactPhoneNumber, setEditedContactPhoneNumber] = useState<string | undefined | null>(undefined);
  const [editedUniversityCollege, setEditedUniversityCollege] = useState<string | undefined | null>(undefined);
  const [editedCity, setEditedCity] = useState<string | undefined | null>(undefined);
  const [editedUserImage, setEditedUserImage] = useState<string | undefined | null>(undefined);
  const [editedStatus, setEditedStatus] = useState<User['user_status'] | undefined>(undefined);
  const [editedType, setEditedType] = useState<User['user_type'] | undefined>(undefined);
  const [editedEmail, setEditedEmail] = useState<string | undefined | null>(undefined); // New state for email

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEditedFirstName(user.user_first_name);
      setEditedLastName(user.user_last_name);
      setEditedOrganisationName(user.organisation_name);
      setEditedContactPhoneNumber(user.contact_phone_number);
      setEditedUniversityCollege(user.university_college);
      setEditedCity(user.user_city);
      setEditedUserImage(user.user_image);
      setEditedStatus(user.user_status);
      setEditedType(user.user_type);
      setEditedEmail(user.user_email); // Initialize new email state
    } else {
      setEditedFirstName(undefined);
      setEditedLastName(undefined);
      setEditedOrganisationName(undefined);
      setEditedContactPhoneNumber(undefined);
      setEditedUniversityCollege(undefined);
      setEditedCity(undefined);
      setEditedUserImage(undefined);
      setEditedStatus(undefined);
      setEditedType(undefined);
      setEditedEmail(undefined); // Reset new email state
    }
  }, [user]);

  const handleSaveClick = async () => {
    if (!user) return;

    setIsSaving(true);
    const updateData: Partial<User> = {};

    if (editedFirstName !== user.user_first_name) {
      updateData.user_first_name = editedFirstName;
    }
    if (editedLastName !== user.user_last_name) {
      updateData.user_last_name = editedLastName;
    }
    if (editedOrganisationName !== user.organisation_name) {
      updateData.organisation_name = editedOrganisationName;
    }
    if (editedContactPhoneNumber !== user.contact_phone_number) {
      updateData.contact_phone_number = editedContactPhoneNumber;
    }
    if (editedUniversityCollege !== user.university_college) {
      updateData.university_college = editedUniversityCollege;
    }
    if (editedCity !== user.user_city) {
      updateData.user_city = editedCity;
    }
    if (editedUserImage !== user.user_image) {
      updateData.user_image = editedUserImage;
    }
    if (editedStatus !== undefined && editedStatus !== user.user_status) {
      updateData.user_status = editedStatus;
      updateData.is_active = editedStatus === 'active';
    }
    if (editedType !== undefined && editedType !== user.user_type) {
      updateData.user_type = editedType;
    }
    // Add email to updateData if it has changed
    if (editedEmail !== user.user_email) {
      updateData.user_email = editedEmail;
    }

    try {
      if (Object.keys(updateData).length > 0) {
        console.log("Sending update:", updateData);
        await onUserUpdated(user.user_id, updateData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save user updates:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function for field rendering
  const renderField = (label: string, content: JSX.Element, isConditional = false) => {
    // Increased grid columns for labels to prevent truncation on larger screens.
    return (
      <div className={`flex flex-col gap-2 sm:grid sm:grid-cols-6 sm:items-center sm:gap-4 ${isConditional ? '' : ''}`}>
        <Label htmlFor={content.props.id} className="text-gray-300 sm:text-right sm:col-span-2">
          {label}
        </Label>
        <div className="sm:col-span-4">
          {content}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-gray-900 text-gray-100 border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Edit User</DialogTitle>
          <DialogDescription className="text-gray-400">
            Make changes to {user?.user_email}'s profile. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        {user ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 py-4"
          >

            {/* Centered Profile Image - always spans full width */}
            <div className="col-span-1 sm:col-span-2 flex justify-center mb-4">
              {editedUserImage ? (
                <img
                  src={editedUserImage}
                  alt={`${user.user_username || 'User'}'s profile`}
                  className="w-24 h-24 rounded-full object-cover border border-gray-600 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-base text-gray-300 border border-gray-600 shadow-lg text-center">
                  No Image Set
                </div>
              )}
            </div>

            {/* Profile Image URL Input (Label and Input in one row) - always spans full width */}
            {renderField(
              "Image URL",
              <Input
                id="editedUserImageInput"
                value={editedUserImage || ''}
                onChange={(e) => setEditedUserImage(e.target.value || null)}
                className="w-full bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500"
                placeholder="Paste new image URL here"
              />
            )}


            {/* User ID (Read-Only) */}
            {renderField(
              "User ID",
              <Input
                id="user_id"
                value={user.user_id}
                readOnly
                className="w-full bg-gray-800 border-gray-600 text-gray-100 cursor-not-allowed"
              />
            )}

            {/* User Status */}
            {renderField(
              "Status",
              <select
                id="user_status"
                value={editedStatus || ''}
                onChange={(e) => setEditedStatus(e.target.value as User['user_status'])}
                className={`w-full justify-self-start rounded border px-3 py-2 bg-gray-800
                  ${editedStatus === 'active' ? 'text-green-400' : ''}
                  ${editedStatus === 'inactive' ? 'text-yellow-400' : ''}
                  ${editedStatus === 'suspended' ? 'text-red-400' : ''}
                `}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            )}

            {/* User Type */}
            {renderField(
              "User Type",
              <Select
                value={editedType || ''}
                onValueChange={(value: User['user_type']) => setEditedType(value)}
              >
                <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-100">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-gray-100">
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="employer">Employer</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* User Email (Now Editable) */}
            {renderField(
              "Email",
              <Input
                id="user_email"
                type="email"
                value={editedEmail || ''}
                onChange={(e) => setEditedEmail(e.target.value || null)}
                className="w-full bg-gray-800 border-gray-600 text-gray-100"
              />
            )}

            {/* User First Name */}
            {renderField(
              "First Name",
              <Input
                id="user_first_name"
                value={editedFirstName || ''}
                onChange={(e) => setEditedFirstName(e.target.value || null)}
                className="w-full bg-gray-800 border-gray-600 text-gray-100"
              />
            )}

            {/* User Last Name */}
            {renderField(
              "Last Name",
              <Input
                id="user_last_name"
                value={editedLastName || ''}
                onChange={(e) => setEditedLastName(e.target.value || null)}
                className="w-full bg-gray-800 border-gray-600 text-gray-100"
              />
            )}

            {/* Organisation Name (Employer specific) */}
            {editedType === 'employer' && renderField(
              "Organisation Name",
              <Input
                id="organisation_name"
                value={editedOrganisationName || ''}
                onChange={(e) => setEditedOrganisationName(e.target.value || null)}
                className="w-full bg-gray-800 border-gray-600 text-gray-100"
              />,
              true
            )}

            {/* University College (Student specific) */}
            {editedType === 'student' && renderField(
              "University/College",
              <Input
                id="university_college"
                value={editedUniversityCollege || ''}
                onChange={(e) => setEditedUniversityCollege(e.target.value || null)}
                className="w-full bg-gray-800 border-gray-600 text-gray-100"
              />,
              true
            )}

            {/* Contact Phone Number */}
            {renderField(
              "Phone Number",
              <Input
                id="contact_phone_number"
                value={editedContactPhoneNumber || ''}
                onChange={(e) => setEditedContactPhoneNumber(e.target.value || null)}
                className="w-full bg-gray-800 border-gray-600 text-gray-100"
              />
            )}

            {/* User City */}
            {renderField(
              "City",
              <Input
                id="user_city"
                value={editedCity || ''}
                onChange={(e) => setEditedCity(e.target.value || null)}
                className="w-full bg-gray-800 border-gray-600 text-gray-100"
              />
            )}

            {/* Created At (Read-Only) */}
            {renderField(
              "Created At",
              <Input
                id="created_at"
                value={user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                readOnly
                className="w-full bg-gray-800 border-gray-600 text-gray-100 cursor-not-allowed"
              />
            )}

            {/* Last Login (Read-Only) */}
            {renderField(
              "Last Login",
              <Input
                id="last_login"
                value={user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                readOnly
                className="w-full bg-gray-800 border-gray-600 text-gray-100 cursor-not-allowed"
              />
            )}

            {/* DialogFooter needs to span both columns */}
            <DialogFooter className="mt-4 col-span-1 sm:col-span-2 flex justify-end">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="bg-gray-700 text-gray-300 border border-gray-600">
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-8 text-center text-gray-400">No user data to display.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}