// src/components/admin/DeleteUserConfirmationModal.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface DeleteUserConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username: string; // The username of the user to be deleted
}

export const DeleteUserConfirmationModal: React.FC<DeleteUserConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  username,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gray-900 text-gray-400 border border-gray-700"> {/* Added dark mode styling to content */}
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle> {/* Ensured title is white */}
          <AlertDialogDescription className="text-gray-400"> {/* Ensured description is grey */}
            This action cannot be undone. This will permanently delete user &quot;{username}&quot;
            and remove their data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onClose}
            className="bg-gray-900 text-gray-300 border border-gray-600 hover:bg-white hover:text-gray-900 transition-colors"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}