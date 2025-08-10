'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Textarea } from './textarea'

interface ContactModalProps {
  isLoggedIn?: boolean
  children: React.ReactNode
}

export function ContactModal({ isLoggedIn = false, children }: ContactModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    alert('Thank you for your message! We\'ll get back to you within 24 hours.')
    setOpen(false)
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      {/* MODIFIED: DialogContent to match the Card styling from the login page */}
      <DialogContent className="sm:max-w-md bg-white border border-zinc-200 text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100">
        <DialogHeader>
          {/* MODIFIED: DialogTitle to match CardTitle */}
          <DialogTitle className="text-gray-900 dark:text-gray-100">Contact Us</DialogTitle>
          {/* MODIFIED: DialogDescription to match CardDescription */}
          <DialogDescription className="text-zinc-600 dark:text-gray-300">
            {isLoggedIn
              ? "Send us your question or feedback"
              : "Get in touch with our support team"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoggedIn && (
            <>
              <div>
                {/* MODIFIED: Label to match login page labels */}
                <Label htmlFor="name" className="text-zinc-800 dark:text-gray-200">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  // MODIFIED: Input to match login page inputs
                  className="bg-white text-gray-900 border-zinc-300 placeholder:text-zinc-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                />
              </div>
              <div>
                {/* MODIFIED: Label to match login page labels */}
                <Label htmlFor="email" className="text-zinc-800 dark:text-gray-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  // MODIFIED: Input to match login page inputs
                  className="bg-white text-gray-900 border-zinc-300 placeholder:text-zinc-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
                />
              </div>
            </>
          )}

          <div>
            {/* MODIFIED: Label to match login page labels */}
            <Label htmlFor="subject" className="text-zinc-800 dark:text-gray-200">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              required
              // MODIFIED: Input to match login page inputs
              className="bg-white text-gray-900 border-zinc-300 placeholder:text-zinc-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
            />
          </div>

          <div>
            {/* MODIFIED: Label to match login page labels */}
            <Label htmlFor="message" className="text-zinc-800 dark:text-gray-200">Message</Label>
            <Textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              required
              // MODIFIED: Textarea to match login page inputs
              className="bg-white text-gray-900 border-zinc-300 placeholder:text-zinc-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:placeholder:text-gray-500"
            />
          </div>

          <DialogFooter>
            {/* MODIFIED: Cancel Button to match secondary button style */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-white border-zinc-300 text-gray-700 hover:bg-zinc-50 hover:text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-50"
            >
              Cancel
            </Button>
            {/* MODIFIED: Send Message Button to match primary button style */}
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Send Message</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}