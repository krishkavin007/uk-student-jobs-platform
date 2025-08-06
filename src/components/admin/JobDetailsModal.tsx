// components/admin/JobDetailsModal.tsx
"use client"

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { DetailedJob, Job } from '@/types/admin-types';
import { fetchJobDetails, updateJobStatus, deleteJob } from '@/lib/data-utils';

interface JobDetailsModalProps {
  jobId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onJobUpdated?: () => void;
}

const getJobStatusBadgeClasses = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-600 hover:bg-green-700 text-white';
    case 'filled':
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    case 'removed':
      return 'bg-red-600 hover:bg-red-700 text-white';
    case 'expired':
      return 'bg-yellow-600 hover:bg-yellow-700 text-white';
    case 'archived':
      return 'bg-gray-600 hover:bg-gray-700 text-white';
    default:
      return 'bg-gray-600 hover:bg-gray-700 text-white';
  }
};

const getApplicantStatusBadgeClasses = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-600 hover:bg-yellow-700 text-white';
    case 'contacted':
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    case 'rejected':
      return 'bg-red-600 hover:bg-red-700 text-white';
    case 'cancelled':
      return 'bg-gray-600 hover:bg-gray-700 text-white';
    default:
      return 'bg-gray-600 hover:bg-gray-700 text-white';
  }
};

export function JobDetailsModal({ jobId, isOpen, onClose, onJobUpdated }: JobDetailsModalProps) {
  const [job, setJob] = useState<DetailedJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingApplicantStatus, setIsUpdatingApplicantStatus] = useState(false);

  useEffect(() => {
    const getJobDetails = async () => {
      if (isOpen && jobId) {
        setLoading(true);
        setError(null);
        try {
          const detailedData = await fetchJobDetails(jobId);
          setJob(detailedData);
        } catch (err) {
          setError("Failed to fetch job details.");
          setJob(null);
        } finally {
          setLoading(false);
        }
      } else {
        setJob(null);
      }
    };
    getJobDetails();
  }, [jobId, isOpen]);

  const handleUpdateJobStatus = async (newStatus: Job['status']) => {
    if (!job) return;
    setIsUpdatingStatus(true);
    try {
      const success = await updateJobStatus(job.id, newStatus);
      if (success) {
        setJob(prev => prev ? { ...prev, status: newStatus } : null);
        if (onJobUpdated) onJobUpdated();
      } else {
        alert(`Failed to update job status to ${newStatus}.`);
      }
    } catch (err) {
      alert(`Error updating job status: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdateApplicantStatus = async (applicantId: string, newStatus: string) => {
    if (!jobId) return;
    setIsUpdatingApplicantStatus(true);
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}/applicant-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicantId: applicantId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update applicant status');
      }
      const detailedData = await fetchJobDetails(jobId);
      setJob(detailedData);
      if (onJobUpdated) onJobUpdated();
    } catch (error) {
      console.error('Error updating applicant status:', error);
      alert('Failed to update applicant status');
    } finally {
      setIsUpdatingApplicantStatus(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!job) return;
    
    if (window.confirm(`Are you sure you want to delete job "${job.title}"? This action cannot be undone.`)) {
      try {
        await deleteJob(job.id);
        alert(`Job "${job.title}" has been deleted successfully.`);
        onClose(); // Close the modal
        if (onJobUpdated) onJobUpdated(); // Refresh the job list
      } catch (error) {
        alert(`Failed to delete job: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  const jobStatusActions = [
    { label: 'Mark as Filled', status: 'filled', hidden: job?.status === 'filled' },
    { label: 'Archive Job', status: 'archived', hidden: job?.status === 'archived' },
    { label: 'Unarchive Job', status: 'active', hidden: job?.status !== 'archived' },
  ];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 bg-gray-900 text-gray-100 border-gray-700">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-700">
          <div className="flex flex-col">
            <DialogTitle className="text-2xl font-bold">Job Details: {job?.title || "Loading..."}</DialogTitle>
            {job && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-400">Status:</span>
                <Badge className={`capitalize transition-colors duration-200 ${getJobStatusBadgeClasses(job.status)}`}>
                  {job.status}
                </Badge>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={isUpdatingStatus}>
                  {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700 text-gray-200">
                {jobStatusActions
                  .filter(action => !action.hidden)
                  .map(action => (
                    <DropdownMenuItem
                      key={action.status}
                      onClick={() => handleUpdateJobStatus(action.status as Job['status'])}
                      disabled={isUpdatingStatus}
                      className="cursor-pointer hover:bg-gray-700"
                    >
                      {action.label}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="destructive"
              onClick={handleDeleteJob}
            >
              Delete Job
            </Button>
          </div>
        </DialogHeader>

        {loading && <div className="flex flex-col items-center justify-center py-12 text-gray-400"><Loader2 className="h-8 w-8 animate-spin mb-4" /> Loading job data...</div>}
        {error && <div className="flex flex-col items-center justify-center py-12 text-red-500"><AlertCircle className="h-8 w-8 mb-4" /> Error: {error}</div>}

        {job && (
          <div className="space-y-6 mt-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader><CardTitle className="text-xl text-gray-200">Job Information</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-300">
                <div><strong>ID:</strong> {job.id}</div>
                <div><strong>Title:</strong> {job.title}</div>
                <div>
                  <strong>Company:</strong> {job.companyName}
                  <Link href={`/admin-dashboard?viewUser=${job.employer_id}`} target="_blank" className="ml-1 text-blue-400 hover:underline">
                    (View Employer)
                  </Link>
                </div>
                <div><strong>Location:</strong> {job.location}</div>
                <div><strong>Type:</strong> <span className="capitalize">{job.type.replace(/-/g, ' ')}</span></div>
                <div><strong>Salary:</strong> ${job.salary.toLocaleString()}</div>
                <div><strong>Posted On:</strong> {new Date(job.postedDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                <div><strong>Applicants Count:</strong> <Badge className={`ml-2 ${getJobStatusBadgeClasses('filled')}`}>{job.applicantsCount}</Badge></div>
                <div><strong>Clicks:</strong> <Badge className={`ml-2 ${getJobStatusBadgeClasses('filled')}`}>{job.jobAnalytics?.clicks?.toLocaleString() || '0'}</Badge></div>
              </CardContent>
              <CardContent className="pt-0">
                <div>
                  <strong className="text-white">Description:</strong> 
                  <div className="mt-1 text-sm text-white whitespace-pre-wrap">{job.description}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader><CardTitle className="text-xl text-gray-200">Applicants ({job.applicants?.length ?? 0})</CardTitle></CardHeader>
              <CardContent>
                {job.applicants && job.applicants.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-gray-300">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="py-2 px-1">Name</th>
                          <th className="py-2 px-1">Email</th>
                          <th className="py-2 px-1">Date Applied</th>
                          <th className="py-2 px-1">Status</th>
                          <th className="py-2 px-1 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {job.applicants.map((applicant, index) => (
                          <tr key={`applicant-${applicant.user_id || index}`} className="border-b border-gray-700 last:border-b-0">
                            <td className="py-2 px-1">{applicant.full_name}</td>
                            <td className="py-2 px-1">{applicant.user_email}</td>
                            <td className="py-2 px-1">
                              {applicant.applied_at ? new Date(applicant.applied_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                            </td>
                            <td className="py-2 px-1">
                              <Badge className={`capitalize transition-colors duration-200 ${getApplicantStatusBadgeClasses(applicant.application_status)}`}>
                                {applicant.application_status}
                              </Badge>
                            </td>
                            <td className="py-2 px-1 text-right flex items-center justify-end gap-2">
                              <Link href={`/admin-dashboard?viewUser=${applicant.user_id}`} target="_blank">
                                <Button variant="link" size="sm" className="text-blue-400 hover:underline">View Profile</Button>
                              </Link>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="default" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={isUpdatingApplicantStatus}>
                                    Update Status
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-gray-200">
                                  {['pending', 'contacted', 'rejected', 'cancelled'].map(status => (
                                    <DropdownMenuItem
                                      key={status}
                                      onClick={() => handleUpdateApplicantStatus(applicant.user_id, status)}
                                      disabled={isUpdatingApplicantStatus || applicant.application_status === status}
                                      className="cursor-pointer capitalize hover:bg-gray-700"
                                    >
                                      {status}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">No applicants for this job yet.</div>
                )}
              </CardContent>
            </Card>

            

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader><CardTitle className="text-xl text-gray-200">Moderation Notes</CardTitle></CardHeader>
              <CardContent>
                {job.moderationNotes && job.moderationNotes.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    {job.moderationNotes.map((note, index) => (
                      <li key={`note-${index}`} className="text-sm">{note}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500">No moderation notes.</div>
                )}
                                 <Button 
                   variant="default" 
                   size="sm" 
                   className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                 >
                   Add Note
                 </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}