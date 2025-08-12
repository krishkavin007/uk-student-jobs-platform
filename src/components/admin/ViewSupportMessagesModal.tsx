"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, Clock, Play } from "lucide-react"

interface SupportMessage {
  id: string
  name: string
  email: string
  profile: 'student' | 'employer'
  subject: string
  message: string
  status: 'to-do' | 'in-progress' | 'resolved'
  createdAt: string
  user_id?: string
}

interface ViewSupportMessagesModalProps {
  isOpen: boolean
  onClose: () => void
  onReply: (recipientName: string, subject: string) => void
  messageId?: string
}

export function ViewSupportMessagesModal({ isOpen, onClose, onReply, messageId }: ViewSupportMessagesModalProps) {
  const [message, setMessage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch message data when modal opens
  useEffect(() => {
    if (isOpen && messageId) {
      fetchMessage()
    }
  }, [isOpen, messageId])

  const fetchMessage = async () => {
    if (!messageId) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/support/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('API response data:', data)
        // Transform the API data to match our interface
        const transformedMessage = {
          id: data.message_id?.toString() || data.id,
          name: data.name,
          email: data.email,
          profile: data.profile || 'student',
          subject: data.subject,
          message: data.message_content || data.message || '',
          status: data.status,
          createdAt: data.created_at || data.createdAt,
          user_id: data.user_id
        }
        console.log('Transformed message:', transformedMessage)
        setMessage(transformedMessage)
      } else {
        throw new Error('Failed to fetch message')
      }
    } catch (error) {
      console.error('Error fetching message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!messageId) return
    
    try {
      const response = await fetch(`/api/support/${messageId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (response.ok) {
        // Update the local message state
        setMessage((prev: SupportMessage | null) => prev ? { ...prev, status: newStatus as 'to-do' | 'in-progress' | 'resolved' } : null)
        // You could also add a toast notification here
        console.log('Status updated successfully')
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  // Use fetched message or fallback to mock data
  const displayMessage = message || {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@email.com',
    profile: 'student' as const,
    subject: 'Payment Issue - Job Posting',
    message: 'I\'m unable to complete payment for my job posting. Getting an error message when I try to proceed with the payment. The error says "Payment gateway connection failed" and I\'ve tried multiple times. This is urgent as I need to post this job today.',
    status: 'to-do' as const,
    createdAt: '2025-01-20T10-20T10:30:00Z'
  }

  if (!isOpen) return null

  const formatDate = (dateInput: string | Date) => {
    if (!dateInput) return 'Date not available'
    
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
      if (isNaN(date.getTime())) return 'Date not available'
      
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Date not available'
    }
  }

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'to-do':
        return 'bg-amber-700/30 text-amber-300 border border-amber-700 hover:bg-amber-700/50';
      case 'in-progress':
        return 'bg-blue-700/30 text-blue-300 border border-blue-700 hover:bg-blue-700/50';
      case 'resolved':
        return 'bg-green-700/30 text-green-300 border border-green-700 hover:bg-green-700/50';
      default:
        return 'bg-gray-700/30 text-gray-300 border border-gray-700 hover:bg-gray-700/50';
    }
  }

  const getProfileBadgeClasses = (profile: string) => {
    switch (profile) {
      case 'student':
        return 'bg-purple-700/30 text-purple-300 border border-purple-700 hover:bg-purple-700/50';
      case 'employer':
        return 'bg-blue-700/30 text-blue-300 border border-blue-700 hover:bg-blue-700/50';
      case 'not_known':
        return 'bg-gray-700/30 text-gray-300 border border-gray-700 hover:bg-gray-700/50';
      default:
        return 'bg-gray-700/30 text-gray-300 border border-gray-700 hover:bg-gray-700/50';
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'to-do':
        return <Clock className="h-4 w-4" />;
      case 'in-progress':
        return <Play className="h-4 w-4" />;
      case 'resolved':
        return <Check className="h-4 w-4" />;
      default:
        return null;
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 bg-gray-900 text-[#e8eaed] border border-[#3c4043] rounded-2xl">
        <DialogHeader className="flex flex-row items-start justify-between pb-4 border-b border-[#3c4043]">
          <div className="flex flex-col">
            <DialogTitle className="text-xl font-normal text-[#e8eaed] leading-tight">
              {displayMessage.subject}
            </DialogTitle>
          </div>
          <div className="flex gap-1 mt-2">
            <Button
              variant="default"
              onClick={() => onReply(displayMessage.name, displayMessage.subject)}
              className="bg-[#8ab4f8] hover:bg-[#a3c3f9] text-black font-semibold rounded-full px-5 h-10 transition-colors duration-200 mr-6"
            >
              <Mail className="h-4 w-4 mr-2" />
              Reply
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <Card className="bg-gray-800 border border-[#3c4043] rounded-lg shadow-lg">
            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-[#bdc1c6] text-sm">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#99a0a5] uppercase mb-1">Name</span>
                <span className="text-base">{displayMessage.name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#99a0a5] uppercase mb-1">Email</span>
                <span className="text-base text-[#8ab4f8] hover:underline cursor-pointer">{displayMessage.email}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#99a0a5] uppercase mb-1">Status</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge className={`cursor-pointer transition-colors duration-200 font-medium px-3 py-1.5 rounded-full w-fit ${getStatusBadgeClasses(displayMessage.status)}`}>
                      {displayMessage.status === 'to-do' ? 'To Do' : displayMessage.status === 'in-progress' ? 'In Progress' : 'Resolved'}
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-[#3c4043] text-[#e8eaed] rounded-lg p-1">
                    <DropdownMenuItem onClick={() => handleStatusUpdate('to-do')} className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer rounded-md">
                      To Do
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusUpdate('in-progress')} className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer rounded-md">
                      In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusUpdate('resolved')} className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer rounded-md">
                      Resolved
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#99a0a5] uppercase mb-1">Profile</span>
                <div className="flex items-center gap-2 mt-1">
                                     <Badge className={`font-medium px-3 py-1 rounded-full ${getProfileBadgeClasses(displayMessage.profile)}`}>
                     {displayMessage.profile === 'student' ? 'Student' : displayMessage.profile === 'employer' ? 'Employer' : 'Not Known'}
                   </Badge>
                  {message && message.user_id ? (
                    <Link href={`/admin-dashboard?viewUser=${message.user_id}`} target="_blank" className="text-xs text-[#8ab4f8] hover:underline transition-colors duration-200">
                      View Profile
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-500">No Profile</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#99a0a5] uppercase mb-1">Received</span>
                <span className="text-base">
                  {formatDate(displayMessage.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border border-[#3c4043] rounded-lg shadow-lg">
            <CardContent className="p-6">
              <span className="text-xs font-semibold text-[#99a0a5] uppercase mb-1">Message Content</span>
              <div className="mt-3 text-[#e8eaed] text-base leading-relaxed whitespace-pre-wrap">
                {displayMessage.message}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}