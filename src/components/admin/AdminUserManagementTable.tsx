// src/components/admin/AdminUserManagementTable.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Filter, XCircle } from "lucide-react";

import { AdminUser } from "@/types/admin-types";
import { useToast } from "@/hooks/use-toast";

interface AdminUserManagementTableProps {
  adminUsers: AdminUser[];
  loading: boolean;
  error: string | null;
  onEditAdminUser?: (adminId: string) => void;
  onDeleteAdminUser?: (adminId: string) => void;
  onViewAdminUser?: (adminId: string) => void;
  onRefreshData?: () => void;
  onAddAdminUser?: () => void;
  onToggleAdminUserStatus?: (adminId: string, isActive: boolean) => Promise<void>;
}

export function AdminUserManagementTable({
  adminUsers,
  loading,
  error,
  onEditAdminUser,
  onDeleteAdminUser,
  onViewAdminUser,
  onRefreshData,
  onAddAdminUser,
  onToggleAdminUserStatus,
}: AdminUserManagementTableProps) {
  const { toast } = useToast();
  
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Prevent page scroll when scrolling within the table
  useEffect(() => {
    const handleTableScroll = (e: WheelEvent | TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      if (e instanceof WheelEvent) {
        const container = scrollContainerRef.current
        if (container) {
          container.scrollTop += e.deltaY
        }
      }
    }

    const currentRef = scrollContainerRef.current
    if (currentRef) {
      currentRef.addEventListener('wheel', handleTableScroll, { passive: false })
      currentRef.addEventListener('touchmove', handleTableScroll, { passive: false })
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('wheel', handleTableScroll)
        currentRef.removeEventListener('touchmove', handleTableScroll)
      }
    }
  }, [])

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [sortColumn, setSortColumn] = useState<keyof AdminUser | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: keyof AdminUser) => {
    if (sortColumn === column) {
      setSortDirection(prevDirection => (prevDirection === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRoleFilter("all");
    setSortColumn(null);
    setSortDirection("asc");
    toast({
      title: "Filters Cleared",
      description: "All search terms and filters have been reset.",
      variant: "default",
    });
  };

  const sortedAndFilteredAdminUsers = useMemo(() => {
    let tempUsers = adminUsers.filter((admin) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();

      const matchesSearch =
        String(admin.admin_id).toLowerCase().includes(lowerCaseSearchTerm) ||
        admin.admin_email.toLowerCase().includes(lowerCaseSearchTerm) ||
        (admin.first_name && admin.first_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (admin.last_name && admin.last_name.toLowerCase().includes(lowerCaseSearchTerm));


      const matchesStatus = statusFilter === "all" ||
                           (statusFilter === "active" && admin.is_active) ||
                           (statusFilter === "inactive" && !admin.is_active);

      const matchesRole = roleFilter === "all" || admin.role.toLowerCase() === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });

    if (sortColumn) {
      tempUsers.sort((a, b) => {
        const aValue = (a[sortColumn] || '').toString();
        const bValue = (b[sortColumn] || '').toString();

        const comparison = aValue.localeCompare(bValue);

        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return tempUsers;
  }, [adminUsers, searchTerm, statusFilter, roleFilter, sortColumn, sortDirection]);

  const areFiltersActive = searchTerm !== "" || statusFilter !== "all" || roleFilter !== "all";

  const getRoleBadgeClasses = (role: string) => {
    switch (role.toLowerCase()) {
      case "super_admin":
        return "bg-red-600 text-white border-red-700 hover:bg-red-700";
      case "admin":
        return "bg-purple-600 text-white border-purple-700 hover:bg-purple-700";
      default:
        return "bg-gray-500 text-gray-100 border-gray-600";
    }
  };

  const getStatusBadgeClasses = (isActive: boolean) => {
    return isActive
      ? "bg-green-600 text-white border-green-700 hover:bg-green-700"
      : "bg-orange-500 text-white border-orange-600 hover:bg-orange-600";
  };

  // Helper function to format role for display
  const formatRoleForDisplay = (role: string) => {
    if (role === 'super_admin') {
      return 'Super Admin';
    }
    // Capitalize the first letter and return for other roles (e.g., 'admin' -> 'Admin')
    return role.charAt(0).toUpperCase() + role.slice(1);
  };


  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search admin users by ID, email, first name, or last name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500"
          />
        </div>

        <Button
          variant="outline"
          size="default"
          onClick={handleClearFilters}
          disabled={!areFiltersActive}
          className="bg-gray-700 text-gray-100 hover:bg-gray-600 whitespace-nowrap flex-shrink-0"
        >
          <XCircle className="mr-2 h-4 w-4" /> Clear Filters
        </Button>
        {onRefreshData && (
          <Button
            onClick={onRefreshData}
            className="bg-gray-700 hover:bg-gray-600 text-white whitespace-nowrap flex-shrink-0"
          >
            Refresh Data
          </Button>
        )}
        {onAddAdminUser && (
          <Button
            onClick={onAddAdminUser}
            className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap flex-shrink-0"
          >
            Add New Admin
          </Button>
        )}
      </div>

      {/* Admin Users Table */}
      {loading ? (
        <p className="text-gray-400 text-center py-8">
          Loading admin users...
        </p>
      ) : error ? (
        <p className="text-red-400 text-center py-8">Error: {error}</p>
      ) : sortedAndFilteredAdminUsers.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          No admin users found matching your criteria.
        </p>
      ) : (
        <div ref={scrollContainerRef} className="overflow-auto max-h-[500px] rounded-md overscroll-none border border-gray-700">
          <table className="min-w-full divide-y divide-gray-700 border-collapse">
            <thead className="bg-gray-700 sticky top-0 z-10">
              <tr>
                <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Admin ID
                </th>
                <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('first_name')}
                    className="flex items-center gap-1 p-0 h-auto font-medium text-xs text-gray-300 uppercase tracking-wider hover:bg-transparent hover:text-white"
                  >
                    First Name
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortColumn === 'first_name' ? 'text-blue-400' : 'text-gray-400'}`} />
                  </Button>
                </th>
                <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('last_name')}
                    className="flex items-center gap-1 p-0 h-auto font-medium text-xs text-gray-300 uppercase tracking-wider hover:bg-transparent hover:text-white"
                  >
                    Last Name
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortColumn === 'last_name' ? 'text-blue-400' : 'text-gray-400'}`} />
                  </Button>
                </th>
                <th className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('admin_email')}
                    className="flex items-center gap-1 p-0 h-auto font-medium text-xs text-gray-300 uppercase tracking-wider hover:bg-transparent hover:text-white"
                  >
                    Email
                    <ArrowUpDown className={`ml-1 h-3 w-3 ${sortColumn === 'admin_email' ? 'text-blue-400' : 'text-gray-400'}`} />
                  </Button>
                </th>
                <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Role
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-my-1 h-8 w-8 p-0 hover:bg-gray-600"
                          aria-expanded={roleFilter !== "all"}
                          aria-label="Filter admin role"
                        >
                          <Filter className={`h-4 w-4 ${roleFilter !== "all" ? 'text-blue-400' : 'text-gray-300'}`} />
                          <span className="sr-only">Filter role</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px] bg-gray-800 border-gray-700 text-gray-100">
                        <DropdownMenuLabel>Filter Role</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem
                          onClick={() => setRoleFilter("all")}
                          className="cursor-pointer hover:bg-gray-700"
                        >
                          All
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setRoleFilter("admin")}
                          className="cursor-pointer hover:bg-gray-700"
                        >
                          Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setRoleFilter("super_admin")}
                          className="cursor-pointer hover:bg-gray-700"
                        >
                          Super Admin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </th>
                <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Status
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-my-1 h-8 w-8 p-0 hover:bg-gray-600"
                          aria-expanded={statusFilter !== "all"}
                          aria-label="Filter admin status"
                        >
                          <Filter className={`h-4 w-4 ${statusFilter !== "all" ? 'text-blue-400' : 'text-gray-300'}`} />
                          <span className="sr-only">Filter status</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px] bg-gray-800 border-gray-700 text-gray-100">
                        <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem
                          onClick={() => setStatusFilter("all")}
                          className="cursor-pointer hover:bg-gray-700"
                        >
                          All
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setStatusFilter("active")}
                          className="cursor-pointer hover:bg-gray-700"
                        >
                          Active
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setStatusFilter("inactive")}
                          className="cursor-pointer hover:bg-gray-700"
                        >
                          Inactive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </th>
                <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {sortedAndFilteredAdminUsers.map((adminUser) => (
                <tr
                  key={adminUser.admin_id}
                  className="hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {adminUser.admin_id}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {adminUser.first_name || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {adminUser.last_name || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {adminUser.admin_email}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className={getRoleBadgeClasses(adminUser.role)}
                    >
                      {formatRoleForDisplay(adminUser.role)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <Badge
                      variant="outline"
                      className={getStatusBadgeClasses(adminUser.is_active)}
                    >
                      {adminUser.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => onViewAdminUser?.(adminUser.admin_id)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-gray-700 text-gray-100 hover:bg-gray-600"
                      onClick={() => onEditAdminUser?.(adminUser.admin_id)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteAdminUser?.(adminUser.admin_id)}
                      className="bg-red-700 hover:bg-red-800 text-white border-red-600 hover:border-red-700"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}