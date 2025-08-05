// components/admin/JobDetailsModal.tsx
"use client"

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link'; // Assuming you use Next.js Link for internal navigation

import { DetailedJob, Job } from '@/types/admin-types';
import { fetchJobDetails, updateJobStatus } from '@/lib/data-utils';

interface JobDetailsModalProps {
  jobId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onJobUpdated?: () => void; // Callback to refresh parent table
}

export function JobDetailsModal({ jobId, isOpen, onClose, onJobUpdated }: JobDetailsModalProps) {
  const [job, setJob] = useState<DetailedJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingApplicantStatus, setIsUpdatingApplicantStatus] = useState(false);
  const [statusUpdateModal, setStatusUpdateModal] = useState<{
    isOpen: boolean;
    applicantId: string;
    currentStatus: string;
    applicantName: string;
  }>({
    isOpen: false,
    applicantId: '',
    currentStatus: '',
    applicantName: ''
  });

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
        setJob(null); // Clear job data when modal is closed or jobId is null
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
        setJob(prev => prev ? { ...prev, status: newStatus } : null); // Update local state
        if (onJobUpdated) onJobUpdated(); // Notify parent to refresh
      } else {
        alert(`Failed to update job status to ${newStatus}.`);
      }
    } catch (err) {
      alert(`Error updating job status: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleArchiveJob = () => {
    if (job) {
      handleUpdateJobStatus('archived');
    }
  };

  const handleDeleteJob = () => {
    if (job) {
      console.log(`Deleting job: ${job.id}`);
      if (window.confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) {
        alert("Simulated: Job deleted. (Requires backend integration)");
        // In a real app, make an API call to delete and then onClose() and onJobUpdated()
        onClose();
        if (onJobUpdated) onJobUpdated();
      }
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
        body: JSON.stringify({ 
          applicantId: applicantId,
          status: newStatus 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update applicant status');
      }

      // Refresh job details to get updated data
      const detailedData = await fetchJobDetails(jobId);
      setJob(detailedData);
      if (onJobUpdated) onJobUpdated();
      
      // Close the modal
      setStatusUpdateModal({
        isOpen: false,
        applicantId: '',
        currentStatus: '',
        applicantName: ''
      });
    } catch (error) {
      console.error('Error updating applicant status:', error);
      alert('Failed to update applicant status');
    } finally {
      setIsUpdatingApplicantStatus(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 bg-gray-900 text-gray-100 border-gray-700">
                  <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Job Details: {job?.title || "Loading..."}</DialogTitle>
          </DialogHeader>
        {loading && <div className="text-center py-8 text-gray-400">Loading job data...</div>}
        {error && <div className="text-red-500 text-center py-8">Error: {error}</div>}
        {job && (
          <div className="space-y-6 mt-2">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-end transition-all duration-200">
              {job.status !== 'archived' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleArchiveJob}
                  disabled={isUpdatingStatus}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isUpdatingStatus ? 'Archiving...' : 'Archive Job'}
                </Button>
              )}
              {job.status === 'active' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleUpdateJobStatus('filled')}
                  disabled={isUpdatingStatus}
                  className="ml-2 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                >
                  {isUpdatingStatus ? 'Marking...' : 'Mark as Filled'}
                </Button>
              )}
              {job.status === 'archived' && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleUpdateJobStatus('active')}
                    disabled={isUpdatingStatus}
                    className="ml-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isUpdatingStatus ? 'Unarchiving...' : 'Unarchive Job'}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleUpdateJobStatus('filled')}
                    disabled={isUpdatingStatus}
                    className="ml-2 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                  >
                    {isUpdatingStatus ? 'Marking...' : 'Mark as Filled'}
                  </Button>
                </>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteJob}
                className="ml-2"
              >
                Delete Job
              </Button>
            </div>

            {/* General Information Card */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader><CardTitle className="text-xl text-gray-200">Job Information</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div><strong>ID:</strong> {job.id}</div>
                <div><strong>Title:</strong> {job.title}</div>
                <div><strong>Company:</strong> {job.companyName} (<Link href={`/admin/users?id=${job.employerId}`} className="text-blue-400 hover:underline">View Employer</Link>)</div>
                <div><strong>Location:</strong> {job.location}</div>
                <div><strong>Type:</strong> <span className="capitalize">{job.type.replace(/-/g, ' ')}</span></div>
                <div><strong>Salary:</strong> ${job.salary.toLocaleString()}</div>
                <div><strong>Posted On:</strong> {new Date(job.postedDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })} {new Date(job.postedDate).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}</div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-400">Status:</span>
                  <Badge className={`capitalize transition-colors duration-200 ${
                    job.status === 'active' ? 'bg-green-600 hover:bg-green-700 text-white' :
                    job.status === 'filled' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                    job.status === 'removed' ? 'bg-red-600 hover:bg-red-700 text-white' :
                    job.status === 'expired' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                    job.status === 'archived' ? 'bg-gray-600 hover:bg-gray-700 text-white' :
                    'bg-gray-600 hover:bg-gray-700 text-gray-200'
                  }`}>
                    {job.status}
                  </Badge>
                </div>
                <div><strong>Applicants Count:</strong> <Badge className="ml-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200">{job.applicantsCount}</Badge></div>
                <div className="md:col-span-2"><strong>Description:</strong> <p className="mt-1 text-sm">{job.description}</p></div>
              </CardContent>
            </Card>

            {/* Applicants List */}
            {job.applicants && job.applicants.length > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader><CardTitle className="text-xl text-gray-200">Applicants</CardTitle></CardHeader>
                <CardContent>
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
                              {(() => {
                                console.log('Applicant data:', applicant);
                                console.log('Applicant applied_at:', applicant.applied_at);
                                console.log('Applicant applied_at type:', typeof applicant.applied_at);
                                if (!applicant.applied_at) return 'N/A';
                                
                                try {
                                  const date = new Date(applicant.applied_at);
                                  if (isNaN(date.getTime())) return 'Invalid Date';
                                  
                                  const dateStr = date.toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  }).replace(/-/g, '/');
                                  
                                  const timeStr = date.toLocaleTimeString('en-GB', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                  });
                                  
                                  return `${dateStr} ${timeStr}`;
                                } catch (error) {
                                  console.error('Error formatting date:', error);
                                  return 'Error';
                                }
                              })()}
                            </td>
                            <td className="py-2 px-1">
                              <Badge className={`capitalize transition-colors duration-200 ${
                                applicant.application_status === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                                applicant.application_status === 'contacted' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                applicant.application_status === 'rejected' ? 'bg-red-600 hover:bg-red-700 text-white' :
                                applicant.application_status === 'cancelled' ? 'bg-gray-600 hover:bg-gray-700 text-white' :
                                'bg-gray-600 hover:bg-gray-700 text-gray-200'
                              }`}>
                                {applicant.application_status}
                              </Badge>
                            </td>
                            <td className="py-2 px-1 text-right">
                              <Button variant="link" size="sm" className="text-blue-400 hover:underline" onClick={() => { /* Implement view applicant profile */ }}>View Profile</Button>
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="ml-2 bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={() => {
                                  setStatusUpdateModal({
                                    isOpen: true,
                                    applicantId: applicant.user_id,
                                    currentStatus: applicant.application_status,
                                    applicantName: applicant.full_name
                                  });
                                }}
                                disabled={isUpdatingApplicantStatus}
                              >
                                {isUpdatingApplicantStatus ? 'Updating...' : 'Update Status'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Job Analytics */}
            {job.jobAnalytics && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader><CardTitle className="text-xl text-gray-200">Job Analytics</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
                  <div><strong>Views:</strong> {job.jobAnalytics.views.toLocaleString()}</div>
                  <div><strong>Clicks:</strong> {job.jobAnalytics.clicks.toLocaleString()}</div>
                  <div><strong>Applications:</strong> {job.jobAnalytics.applications.toLocaleString()}</div>
                </CardContent>
              </Card>
            )}

            {/* Moderation Notes */}
            {job.moderationNotes && job.moderationNotes.length > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader><CardTitle className="text-xl text-gray-200">Moderation Notes</CardTitle></CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    {job.moderationNotes.map((note, index) => (
                      <li key={`note-${index}`} className="text-sm">{note}</li>
                    ))}
                  </ul>
                  <Button variant="outline" size="sm" className="mt-4 text-gray-200 border-gray-600 hover:bg-gray-700">Add Note</Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Status Update Modal */}
    <Dialog open={statusUpdateModal.isOpen} onOpenChange={() => setStatusUpdateModal(prev => ({ ...prev, isOpen: false }))}>
      <DialogContent className="max-w-md bg-gray-900 text-gray-100 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Update Applicant Status</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update status for {statusUpdateModal.applicantName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-2">
            {['pending', 'contacted', 'rejected', 'cancelled'].map((status) => (
              <Button
                key={status}
                variant={statusUpdateModal.currentStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => handleUpdateApplicantStatus(statusUpdateModal.applicantId, status)}
                disabled={isUpdatingApplicantStatus}
                className={`capitalize ${
                  status === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                  status === 'contacted' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                  status === 'rejected' ? 'bg-red-600 hover:bg-red-700 text-white' :
                  status === 'cancelled' ? 'bg-gray-600 hover:bg-gray-700 text-white' :
                  'text-gray-200 border-gray-600 hover:bg-gray-700'
                }`}
              >
                {isUpdatingApplicantStatus ? 'Updating...' : status}
              </Button>
            ))}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusUpdateModal(prev => ({ ...prev, isOpen: false }))}
              className="text-gray-200 border-gray-600 hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </>
  );
}