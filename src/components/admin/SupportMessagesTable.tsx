"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ViewSupportMessagesModal } from "./ViewSupportMessagesModal"
import { ReplySupportMessagesModal } from "./ReplySupportMessagesModal"
import { MessageSquare, Trash2, RefreshCw, ArrowUpDown } from "lucide-react"
import { useToast } from '@/hooks/use-toast'

// Types for support messages (contact form submissions)
interface SupportMessage {
  id: string
  name: string
  email: string
  profile: 'student' | 'employer'
  subject: string
  message: string
  status: 'to-do' | 'in-progress' | 'resolved'
  createdAt: string
}

interface SupportMessagesTableProps {
  loading?: boolean
  error?: string | null
}

export function SupportMessagesTable({ loading, error }: SupportMessagesTableProps) {
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [filteredMessages, setFilteredMessages] = useState<SupportMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortColumn, setSortColumn] = useState<'id' | 'name' | 'email' | 'profile' | 'status'>('status')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  
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

  // Fetch real support messages from API
  useEffect(() => {
    fetchSupportMessages()
  }, [])

  const handleSort = (column: 'id' | 'name' | 'email' | 'profile' | 'status') => {
    if (sortColumn === column) {
      setSortDirection(prevDirection => (prevDirection === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const fetchSupportMessages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/support/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        // Transform API data to match our interface
        const transformedMessages: SupportMessage[] = data.map((msg: any) => {
          return {
            id: msg.message_id.toString(),
            name: msg.name,
            email: msg.email,
            profile: msg.profile || 'not_known',
            subject: msg.subject,
            message: '', // Not shown in table
            status: msg.status,
            createdAt: msg.created_at
          }
        })
        setMessages(transformedMessages)
        setFilteredMessages(transformedMessages)
      } else {
        throw new Error('Failed to fetch support messages')
      }
    } catch (error) {
      console.error('Error fetching support messages:', error)
      toast({
        title: "Error",
        description: "Failed to fetch support messages",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and sort messages
  useEffect(() => {
    let filtered = messages

    if (searchTerm) {
      filtered = filtered.filter(msg => 
        (msg.name && msg.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (msg.email && msg.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (msg.profile && msg.profile.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (msg.status && msg.status.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(msg => msg.status === statusFilter)
    }

    // Sort messages
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortColumn) {
        case 'id':
          aValue = parseInt(a.id)
          bValue = parseInt(b.id)
          break
        case 'name':
          aValue = a.name?.toLowerCase() || ''
          bValue = b.name?.toLowerCase() || ''
          break
        case 'email':
          aValue = a.email?.toLowerCase() || ''
          bValue = b.email?.toLowerCase() || ''
          break
        case 'profile':
          aValue = a.profile?.toLowerCase() || ''
          bValue = b.profile?.toLowerCase() || ''
          break
        case 'status':
          // Custom status priority: to-do -> in-progress -> resolved
          const statusPriority = { 'to-do': 1, 'in-progress': 2, 'resolved': 3 }
          aValue = statusPriority[a.status as keyof typeof statusPriority] || 0
          bValue = statusPriority[b.status as keyof typeof statusPriority] || 0
          break
        default:
          return 0
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredMessages(filtered)
  }, [messages, searchTerm, statusFilter, sortColumn, sortDirection])

  const handleViewMessage = (message: SupportMessage) => {
    setSelectedMessage(message)
    setIsViewModalOpen(true)
  }

  const handleReply = (recipientName: string, subject: string) => {
    // Store the recipient info for the reply modal
    setSelectedMessage({
      id: 'temp',
      name: recipientName,
      email: 'temp@email.com', // This won't be used in reply modal
      profile: 'student' as const,
      subject: subject,
      message: '',
      status: 'to-do' as const,
      createdAt: new Date().toISOString()
    })
    
    // Here you would typically send the reply via API
    console.log('Sending reply to:', recipientName, 'regarding:', subject)
    
    setIsReplyModalOpen(true)
  }

  const handleSendReply = () => {
    // Here you would typically send the reply via API
    console.log('Sending reply to:', selectedMessage?.email)
    
    setIsReplyModalOpen(false)
    setSelectedMessage(null)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setSortColumn('status')
    setSortDirection('asc')
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    
    try {
      const response = await fetch(`/api/support/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Message deleted successfully",
        })
        fetchSupportMessages() // Refresh the list
      } else {
        throw new Error('Failed to delete message')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      })
    }
  }



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

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'to-do':
        return 'bg-amber-600 text-white hover:bg-amber-600';
      case 'in-progress':
        return 'bg-blue-600 text-white hover:bg-blue-600';
      case 'resolved':
        return 'bg-green-600 text-white hover:bg-green-600';
      default:
        return 'bg-gray-600 text-white hover:bg-gray-600';
    }
  };

  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case 'to-do':
        return 'To Do';
      case 'in-progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-gray-400">Loading support messages...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-red-400">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search by name, email, profile, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <Button
          onClick={handleClearFilters}
          disabled={isLoading}
          variant="outline"
          className="bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
        >
          Clear Filters
        </Button>
        <Button
          onClick={fetchSupportMessages}
          disabled={isLoading}
          variant="outline"
          className="bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700 text-gray-200 focus:ring-blue-500">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="to-do">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

            {/* Messages Table */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">
          <p>Loading support messages...</p>
        </div>
      ) : filteredMessages.length > 0 ? (
        <div ref={scrollContainerRef} className="overflow-auto max-h-[500px] rounded-md overscroll-none border border-gray-700">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="w-16 px-4 py-2 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('id')}
                      className="flex items-center gap-1 p-0 h-auto font-medium text-sm text-gray-300 uppercase tracking-wider hover:bg-transparent hover:text-white"
                    >
                      ID
                      <ArrowUpDown className={`ml-1 h-3 w-3 ${sortColumn === 'id' ? 'text-blue-400' : 'text-gray-400'}`} />
                    </Button>
                  </th>
                  <th className="w-36 px-4 py-2 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 p-0 h-auto font-medium text-sm text-gray-300 uppercase tracking-wider hover:bg-transparent hover:text-white"
                    >
                      Name
                      <ArrowUpDown className={`ml-1 h-3 w-3 ${sortColumn === 'name' ? 'text-blue-400' : 'text-gray-400'}`} />
                    </Button>
                  </th>
                  <th className="w-52 px-4 py-2 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('email')}
                      className="flex items-center gap-1 p-0 h-auto font-medium text-sm text-gray-300 uppercase tracking-wider hover:bg-transparent hover:text-white"
                    >
                      Email
                      <ArrowUpDown className={`ml-1 h-3 w-3 ${sortColumn === 'email' ? 'text-blue-400' : 'text-gray-400'}`} />
                    </Button>
                  </th>
                  <th className="w-28 px-4 py-2 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('profile')}
                      className="flex items-center gap-1 p-0 h-auto font-medium text-sm text-gray-300 uppercase tracking-wider hover:bg-transparent hover:text-white"
                    >
                      Type
                      <ArrowUpDown className={`ml-1 h-3 w-3 ${sortColumn === 'profile' ? 'text-blue-400' : 'text-gray-400'}`} />
                    </Button>
                  </th>
                  <th className="w-20 px-4 py-2 text-center text-sm font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="w-24 px-4 py-2 text-center text-sm font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {filteredMessages.map((message, index) => (
                <tr
                  key={message.id}
                  className="border-b border-gray-700 last:border-b-0 hover:bg-gray-800"
                >
                  <td className="px-4 py-3 text-gray-400 font-mono">{message.id}</td>
                  <td className="px-4 py-3 text-gray-300">{message.name}</td>
                  <td className="px-4 py-3 text-gray-300">{message.email}</td>
                  <td className="px-4 py-3">
                    <Badge className={`${message.profile === 'student' ? 'bg-purple-600 text-white' : message.profile === 'employer' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'}`}>
                      {message.profile === 'student' ? 'Student' : message.profile === 'employer' ? 'Employer' : 'Not Known'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={`${getStatusBadgeColor(message.status)}`}>
                      {message.status === 'to-do' ? 'To Do' : message.status === 'in-progress' ? 'In Progress' : 'Resolved'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center flex gap-2 justify-center">
                    <Button
                      size="sm"
                      onClick={() => handleViewMessage(message)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDeleteMessage(message.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-500" />
          <p>No messages found matching your criteria.</p>
        </div>
      )}

      {/* View Message Modal */}
      <ViewSupportMessagesModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onReply={handleReply}
        messageId={selectedMessage?.id}
      />

      {/* Reply Modal */}
      <ReplySupportMessagesModal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        onSendReply={handleSendReply}
        recipientName={selectedMessage?.name}
        subject={selectedMessage?.subject}
      />
    </div>
  )
}
