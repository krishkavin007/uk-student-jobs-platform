// src/components/admin/AddUserModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserPayload {
  user_username: string;
  user_email: string;
  password: string;
  user_type: "student" | "employer";
  user_first_name: string;
  user_last_name: string;
  contact_phone_number: string;
  university_college?: string;
  organisation_name?: string;
  user_city?: string;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

const UK_PHONE_REGEX = /^(?:\+44\s?7|0044\s?7|44\s?7|07|7)\d{3}[\s-]?\d{3}[\s-]?\d{3}$/;

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onUserAdded,
}) => {
  const [userType, setUserType] = useState<"student" | "employer">("student");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    university: "",
    businessName: "",
    city: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      university: "",
      businessName: "",
      city: "",
    });
    setUserType("student");
    setIsLoading(false);
    setMessage("");
    setError("");
  };

  useEffect(() => {
    if (!isOpen) {
      handleResetForm(); // Reset form when modal closes
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    const cleanedPhoneNumber = formData.phone.replace(/[\s()-]/g, "");

    if (!UK_PHONE_REGEX.test(cleanedPhoneNumber)) {
      setError(
        "Please enter a valid UK phone number format (e.g., 07123456789 or +447123456789)."
      );
      setIsLoading(false);
      return;
    }

    const user_username = formData.email;

    const payload: UserPayload = {
      user_username: user_username,
      user_email: formData.email,
      password: formData.password,
      user_type: userType,
      user_first_name: formData.firstName,
      user_last_name: formData.lastName,
      contact_phone_number: cleanedPhoneNumber,
      user_city: formData.city,
    };

    if (userType === "student") {
      payload.university_college = formData.university;
      delete payload.organisation_name;
    } else if (userType === "employer") {
      payload.organisation_name = formData.businessName;
      delete payload.university_college;
    }

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Account created successfully!");
        onUserAdded();
        setTimeout(() => {
          onClose();
          handleResetForm();
        }, 1500);
      } else {
        setError(data.error?.message || data.error || "Failed to create account. Please try again.");
      }
    } catch (err) {
      console.error("Frontend add user error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for field rendering with consistent left alignment and stacking
  const renderField = (
    label: string,
    content: JSX.Element,
    outerColSpan: string = "", // e.g., "sm:col-span-2" for full width field in parent grid
    showInfoText: boolean = false,
    infoText?: string
  ) => {
    // All fields will now behave similarly: label stacked above input, left-aligned.
    // The outerColSpan dictates if it takes 1 or 2 columns in the parent grid.
    const fieldContainerClasses = `flex flex-col gap-2 ${outerColSpan}`;
    const labelDisplayClasses = "text-gray-300 text-left"; // Consistent left alignment
    const contentWrapperClasses = "w-full"; // Content takes full width of its container

    return (
      <div className={fieldContainerClasses}>
        <Label htmlFor={content.props.id} className={labelDisplayClasses}>
          {label}
        </Label>
        <div className={contentWrapperClasses}>
          {content}
          {showInfoText && infoText && <p className="text-xs text-gray-400 mt-1">{infoText}</p>}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-4xl bg-gray-900 border border-gray-700 text-gray-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-100">Add New User</DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Create a new student or employer account.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Tabs value={userType} onValueChange={(value) => setUserType(value as "student" | "employer")}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
              <TabsTrigger
                value="student"
                className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-50 text-gray-300 hover:text-gray-50"
              >
                Student
              </TabsTrigger>
              <TabsTrigger
                value="employer"
                className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-50 text-gray-300 hover:text-gray-50"
              >
                Employer
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {(message || error) && (
                <div className="col-span-1 sm:col-span-2 text-center mb-4">
                  {message && <p className="text-green-400">{message}</p>}
                  {error && <p className="text-red-400">{error}</p>}
                </div>
              )}

              <TabsContent value="student" className="mt-0">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 py-4">
                  {renderField(
                    "First Name",
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                      className="w-full max-w-sm bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  )}
                  {renderField(
                    "Last Name",
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                      className="w-full max-w-sm bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  )}
                  {renderField(
                    "University/College",
                    <Input
                      id="university"
                      placeholder="e.g., University of Manchester"
                      value={formData.university}
                      onChange={(e) => handleInputChange("university", e.target.value)}
                      required
                      className="w-full max-w-sm bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  )}
                  {renderField(
                    "City",
                    <Input
                      id="city"
                      placeholder="e.g., Manchester"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                      className="w-full max-w-sm bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  )}
                  {renderField(
                    "Student Email",
                    <Input
                      id="email"
                      type="email"
                      placeholder="yourname@university.ac.uk"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="w-full max-w-sm bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                      disabled={isLoading}
                    />,
                    "sm:col-span-2", // This field now spans both columns in the parent grid
                    true,
                    "Use university email for verification (user side)"
                  )}
                  {renderField(
                    "Phone Number",
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="+44 7XXX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                      className="w-full max-w-sm bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                      disabled={isLoading}
                    />,
                    "sm:col-span-2", // This field now spans both columns in the parent grid
                    true,
                    "Required for verification (user side)"
                  )}
                  {renderField(
                    "Password",
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      className="w-full max-w-sm bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  )}
                  {renderField(
                    "Confirm Password",
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                      className="w-full max-w-sm bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  )}
                  <DialogFooter className="mt-4 col-span-1 sm:col-span-2 flex justify-end">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="bg-gray-700 text-gray-300 border border-gray-600">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Create Student Account"}
                    </Button>
                  </DialogFooter>
                </form>
              </TabsContent>

              <TabsContent value="employer" className="mt-0">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 py-4">
                  {renderField(
                    "First Name",
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                      className="w-full max-w-sm bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  )}
                  {renderField(
                    "Last Name",
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                      className="w-full max-w-sm bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  )}
                  {renderField(
                    "Business/Organisation Name",
                    <Input
                      id="businessName"
                      placeholder="e.g., Local Coffee Shop Ltd"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      required
                      className="w-full max-w-sm bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  )}
                  {renderField(
                    "City",
                    <Input
                      id="city"
                      placeholder="e.g., London"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                      className="w-full max-w-sm bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  )}
                  {renderField(
                    "Business Email",
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@business.co.uk"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="w-full max-w-sm bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                      disabled={isLoading}
                    />,
                    "sm:col-span-2" // This field now spans both columns in the parent grid
                  )}
                  {renderField(
                    "Phone Number",
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="+44 7XXX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                      className="w-full max-w-sm bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                      disabled={isLoading}
                    />,
                    "sm:col-span-2", // This field now spans both columns in the parent grid
                    true,
                    "Required for verification (user side)"
                  )}
                  {renderField(
                    "Password",
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      className="w-full max-w-sm bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  )}
                  {renderField(
                    "Confirm Password",
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                      className="w-full max-w-sm bg-gray-800 text-gray-100 border-gray-700 placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  )}
                  <DialogFooter className="mt-4 col-span-1 sm:col-span-2 flex justify-end">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="bg-gray-700 text-gray-300 border border-gray-600">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Create Employer Account"}
                    </Button>
                  </DialogFooter>
                </form>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};