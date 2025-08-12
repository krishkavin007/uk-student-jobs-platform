// src/components/admin/UserManagementTable.tsx
"use client"

import * as React from "react"
import { MoreHorizontal, Filter, ArrowUpDown, RefreshCw, XCircle, UserPlus } from "lucide-react" // Import UserPlus icon

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { User } from "@/types/admin-types"
import { useToast } from "@/hooks/use-toast"
import { updateUserByAdmin, deleteUser, fetchUsersPaginated } from "@/lib/data-utils"

import { EditUserModal } from "./EditUserModal"
import { DeleteUserConfirmationModal } from "./DeleteUserConfirmationModal"
// Import the new AddUserModal (will need to be created if not exists)
import { AddUserModal } from "./AddUserModal" // Assuming this modal will be created

interface UserManagementTableProps {
  onUserUpdated: () => void;
  // New prop to handle opening the AddUserModal
  onAddUser: () => void;
  onViewUser?: (userId: string) => void;
  onUsersLoaded?: (users: User[]) => void;
}

const USERS_PER_PAGE = 20;

export const UserManagementTable: React.FC<UserManagementTableProps> = ({ onUserUpdated, onAddUser, onViewUser, onUsersLoaded }) => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = React.useState(false);
  // State for the Add User Modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = React.useState(false); // NEW STATE
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

  const [sortColumn, setSortColumn] = React.useState<keyof User | null>("user_id");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

  const { toast } = useToast();

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Prevent page scroll when scrolling within the table
  React.useEffect(() => {
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

  const fetchUsers = async (page: number) => {
    setIsLoadingMore(true);
    setError(null);
    try {
      const response = await fetchUsersPaginated(page, USERS_PER_PAGE);

      setUsers((prevUsers) => {
        const nonAdminNewUsers = response.users.filter(
          (newUser: User) =>
            !prevUsers.some((prevUser) => prevUser.user_id === newUser.user_id) &&
            newUser.user_type !== 'admin' && newUser.user_type !== 'super_admin'
        );
        return [...prevUsers, ...nonAdminNewUsers];
      });
      setHasMore(response.users.length === USERS_PER_PAGE);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      setError(err.message || "An error occurred while fetching users.");
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
      setInitialLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers(1);
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 50 && hasMore && !isLoadingMore) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      }
    };

    const currentRef = scrollContainerRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", handleScroll);
      }
    };
  }, [hasMore, isLoadingMore]);

  React.useEffect(() => {
    if (currentPage > 1) {
      fetchUsers(currentPage);
    }
  }, [currentPage]);

  // Notify parent component when users are loaded
  React.useEffect(() => {
    if (users.length > 0 && onUsersLoaded) {
      onUsersLoaded(users);
    }
  }, [users, onUsersLoaded]);

  const handleSort = (column: keyof User) => {
    if (sortColumn === column) {
      setSortDirection(prevDirection => (prevDirection === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Function to clear all filters and search
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSortColumn("user_id"); // Reset sort column
    setSortDirection("asc"); // Reset sort direction
    toast({
      title: "Filters Cleared",
      description: "All search terms and filters have been reset.",
      variant: "default",
    });
  };

  // Function to refresh data
  const handleRefreshData = async () => {
    setUsers([]); // Clear current users
    setCurrentPage(1); // Reset to first page
    setHasMore(true); // Assume more data exists
    setInitialLoading(true); // Show loading state
    await fetchUsers(1); // Re-fetch data from the beginning
    toast({
      title: "Data Refreshed",
      description: "The user list has been reloaded.",
      variant: "default",
    });
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteConfirmationOpen(true);
  };

  // NEW: Handler to open the Add User Modal
  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  // NEW: Handler for when a user is added
  const handleUserAdded = () => {
    setIsAddUserModalOpen(false);
    setUsers([]); // Clear current users to force a full re-fetch
    setCurrentPage(1);
    setHasMore(true);
    fetchUsers(1); // Re-fetch users to include the new one
    onUserUpdated(); // Notify parent component (e.g., dashboard)
  };


  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.user_id);
        toast({
          title: "User Deleted",
          description: `User ${selectedUser.user_username || selectedUser.user_email} has been successfully deleted.`,
          variant: "default",
        });
        setUsers([]);
        setCurrentPage(1);
        setHasMore(true);
        fetchUsers(1);
        onUserUpdated();
      } catch (error: any) {
        console.error("Failed to delete user:", error);
        toast({
          title: "Error Deleting User",
          description: error.message || "An unexpected error occurred while deleting the user.",
          variant: "destructive",
        });
      } finally {
        setIsDeleteConfirmationOpen(false);
        setSelectedUser(null);
      }
    }
  };

  const handleUserUpdate = async (userId: string, updatedFields: Partial<User>) => {
    if (selectedUser) {
      try {
        const result = await updateUserByAdmin(userId, updatedFields);
        const displayName =
          result.user_username ||
          result.user_email ||
          selectedUser?.user_username ||
          selectedUser?.user_email ||
          `ID: ${userId}`;

        toast({
          title: "User Updated",
          description: `User ID ${userId} has been successfully updated.`,
          variant: "default",
        });

        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.user_id === userId ? { ...user, ...updatedFields } : user))
        );
        onUserUpdated();
      } catch (error: any) {
        console.error("Failed to update user:", error);
        toast({
          title: "Error Updating User",
          description: error.message || "An unexpected error occurred while updating the user.",
          variant: "destructive",
        });
      } finally {
        setIsEditModalOpen(false);
        setSelectedUser(null);
      }
    }
  };

  const getTypeBadgeClasses = (role: string | undefined | null) => {
    let classes = "";
    if (!role) {
      classes = "bg-gray-500 text-gray-100 border-gray-600";
    } else {
      switch (role.toLowerCase()) {
        case "employer":
          classes = "bg-blue-600 text-white border-blue-700 hover:bg-blue-700";
          break;
        case "student":
          classes = "bg-purple-600 text-white border-purple-700 hover:bg-purple-700";
          break;
        case "admin":
        case "super_admin":
          classes = "bg-purple-600 text-white border-purple-700 hover:bg-purple-600";
          break;
        default:
          classes = "bg-gray-500 text-gray-100 border-gray-600";
      }
    }
    return classes;
  };

  const sortedAndFilteredUsers = React.useMemo(() => {
    let tempUsers = users.filter((user) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();

      const matchesSearch =
        user.user_email.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.user_username?.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.user_first_name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.user_last_name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        String(user.user_id).toLowerCase().includes(lowerCaseSearchTerm);

      const matchesStatus = statusFilter === "all" || user.user_status === statusFilter;
      const matchesType = typeFilter === "all" || user.user_type === typeFilter;

      const isAllowedType = (user.user_type === 'student' || user.user_type === 'employer');

      return matchesSearch && matchesStatus && matchesType && isAllowedType;
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
  }, [users, searchTerm, statusFilter, typeFilter, sortColumn, sortDirection]);


  // Determine if any filters are active to enable/disable "Clear Filters" button
  const areFiltersActive = searchTerm !== "" || statusFilter !== "all" || typeFilter !== "all";

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        {/* Search Input */}
        <Input
          placeholder="Search users by ID, email, username, first name, or last name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500 flex-grow"
        />

        {/* Clear Filters & Search Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearFilters}
          disabled={!areFiltersActive} // Disable if no filters are active
          className="bg-gray-700 text-gray-100 hover:bg-gray-600 whitespace-nowrap"
        >
          <XCircle className="mr-2 h-4 w-4" /> Clear Filters
        </Button>

        {/* Refresh Data Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshData}
          className="bg-gray-700 text-gray-100 hover:bg-gray-600"
          disabled={isLoadingMore} // Disable while already loading more data
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingMore ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh Data</span>
        </Button>

        {/* NEW: Add User Button */}
        <Button
          size="sm"
          onClick={onAddUser} // Use the prop to open the modal
          className="bg-blue-600 hover:bg-blue-700 text-white ml-auto" // ml-auto pushes it to the right
        >
          <UserPlus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      {initialLoading ? (
        <p className="text-gray-400 text-center py-8">
          Loading users...
        </p>
      ) : error ? (
        <p className="text-red-400 text-center py-8">Error: {error}</p>
      ) : (
        <div ref={scrollContainerRef} className="overflow-auto max-h-[500px] rounded-md overscroll-none border border-gray-700">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700 sticky top-0 z-10"><tr>
              {/* USER ID COLUMN HEADER WITH SORT ICON */}
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('user_id')}
                  className="flex items-center gap-1 p-0 h-auto font-medium text-xs text-gray-300 uppercase tracking-wider hover:bg-transparent hover:text-white"
                >
                  User ID
                  <ArrowUpDown className={`ml-1 h-3 w-3 ${sortColumn === 'user_id' ? 'text-blue-400' : 'text-gray-400'}`} />
                </Button>
              </th>
              {/* FIRST NAME COLUMN HEADER WITH SORT ICON */}
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('user_first_name')}
                  className="flex items-center gap-1 p-0 h-auto font-medium text-xs text-gray-300 uppercase tracking-wider hover:bg-transparent hover:text-white"
                >
                  First Name
                  <ArrowUpDown className={`ml-1 h-3 w-3 ${sortColumn === 'user_first_name' ? 'text-blue-400' : 'text-gray-400'}`} />
                </Button>
              </th>
              {/* LAST NAME COLUMN HEADER WITH SORT ICON */}
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('user_last_name')}
                  className="flex items-center gap-1 p-0 h-auto font-medium text-xs text-gray-300 uppercase tracking-wider hover:bg-transparent hover:text-white"
                >
                  Last Name
                  <ArrowUpDown className={`ml-1 h-3 w-3 ${sortColumn === 'user_last_name' ? 'text-blue-400' : 'text-gray-400'}`} />
                </Button>
              </th>
              {/* EMAIL COLUMN HEADER WITH SORT ICON */}
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('user_email')}
                  className="flex items-center gap-1 p-0 h-auto font-medium text-xs text-gray-300 uppercase tracking-wider hover:bg-transparent hover:text-white"
                >
                  Email
                  <ArrowUpDown className={`ml-1 h-3 w-3 ${sortColumn === 'user_email' ? 'text-blue-400' : 'text-gray-400'}`} />
                </Button>
              </th>
              {/* TYPE COLUMN HEADER WITH FILTER ICON */}
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Type
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-my-1 h-8 w-8 p-0 hover:bg-gray-600"
                        aria-expanded={typeFilter !== "all"}
                        aria-label="Filter user type"
                      >
                        <Filter className={`h-4 w-4 ${typeFilter !== "all" ? 'text-blue-400' : 'text-gray-300'}`} />
                        <span className="sr-only">Filter type</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px] bg-gray-800 border-gray-700 text-gray-100">
                      <DropdownMenuLabel>Filter Type</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem
                        onClick={() => setTypeFilter("all")}
                        className="cursor-pointer hover:bg-gray-700"
                      >
                        All
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTypeFilter("employer")}
                        className="cursor-pointer hover:bg-gray-700"
                      >
                        Employer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTypeFilter("student")}
                        className="cursor-pointer hover:bg-gray-700"
                      >
                        Student
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </th>
              {/* STATUS COLUMN HEADER WITH FILTER ICON */}
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Status
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-my-1 h-8 w-8 p-0 hover:bg-gray-600"
                        aria-expanded={statusFilter !== "all"}
                        aria-label="Filter user status"
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
                      <DropdownMenuItem
                        onClick={() => setStatusFilter("suspended")}
                        className="cursor-pointer hover:bg-gray-700"
                      >
                        Suspended
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr></thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {sortedAndFilteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-400">
                    No users match your current filters.
                  </td>
                </tr>
              ) : (
                sortedAndFilteredUsers.map((user) => (
                  <tr
                    key={user.user_id}
                    className="hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-3 py-4 text-sm text-gray-300 max-w-[80px] overflow-hidden text-ellipsis">
                      {user.user_id}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-300">
                      {user.user_first_name || 'N/A'}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-300">
                      {user.user_last_name || 'N/A'}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-300">
                      {user.user_email}
                    </td>
                    <td className="px-3 py-4">
                      <Badge
                        className={getTypeBadgeClasses(user.user_type)}
                      >
                        {user.user_type || 'N/A'}
                      </Badge>
                    </td>
                    <td className="px-3 py-4 text-sm w-[100px]">
                      <div className="flex items-center justify-center">
                        <Badge
                          className={`
                            ${user.user_status === "active" ? "bg-green-600 border-green-700 text-white hover:bg-green-700" : ""}
                            ${user.user_status === "inactive" ? "bg-yellow-500 border-yellow-600 text-white hover:bg-yellow-700" : ""}
                            ${user.user_status === "suspended" ? "bg-red-600 border-red-700 text-white hover:bg-red-700" : ""}
                          `}
                        >
                          {user.user_status.charAt(0).toUpperCase() + user.user_status.slice(1)}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm flex gap-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => {
                          onViewUser?.(user.user_id);
                        }}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-gray-700 text-gray-100 hover:bg-gray-600"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(user)}
                        className="bg-red-700 hover:bg-red-800 text-white border-red-600 hover:border-red-700"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
              {isLoadingMore && (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-400">
                    Loading more users...
                  </td>
                </tr>
              )}
              {!hasMore && !isLoadingMore && users.length > 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    You've reached the end of the user list.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && (
        <>
          <EditUserModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            user={selectedUser}
            onUserUpdated={handleUserUpdate}
          />
          <DeleteUserConfirmationModal
            isOpen={isDeleteConfirmationOpen}
            onClose={() => setIsDeleteConfirmationOpen(false)}
            onConfirm={confirmDelete}
            username={selectedUser.user_username || selectedUser.user_email || 'User'}
          />
        </>
      )}

      {/* NEW: Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
};