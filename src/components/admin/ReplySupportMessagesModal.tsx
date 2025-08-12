"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail } from "lucide-react"

interface ReplySupportMessagesModalProps {
  isOpen: boolean
  onClose: () => void
  onSendReply: (replyMessage: string) => void
  recipientName?: string
  subject?: string
}

export function ReplySupportMessagesModal({ isOpen, onClose, onSendReply, recipientName, subject }: ReplySupportMessagesModalProps) {
  const [replyMessage, setReplyMessage] = useState('')

  const handleSendReply = () => {
    if (replyMessage.trim()) {
      onSendReply(replyMessage)
      setReplyMessage('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gray-900 border border-[#3c4043] text-[#e8eaed] rounded-2xl">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-xl font-medium text-white mb-4">
            Replying to: <span className="text-[#8ab4f8]">{subject}</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-white">
            Recipient: <span className="font-medium text-[#8ab4f8]">{recipientName || 'the user'}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="replyMessage" className="text-sm font-medium text-white">Your Response</Label>
            <Textarea
              id="replyMessage"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your response here..."
              rows={20}
              className="bg-gray-800 border-[#3c4043] text-[#e8eaed] placeholder-[#99a0a5] rounded-lg transition-colors duration-200
                       focus:border-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row sm:justify-end gap-2 pt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto bg-transparent border border-[#5f6368] text-[#8ab4f8] hover:bg-[#3c4043] hover:text-[#a3c3f9] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendReply}
            disabled={!replyMessage.trim()}
            className="w-full sm:w-auto bg-[#8ab4f8] hover:bg-[#a3c3f9] text-black font-semibold rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Reply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}