// components/admin/JobDetailsModal.tsx
"use client"

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link'; // Assuming you use Next.js Link for internal navigation

import { DetailedJob, Job } from '@/types/admin-types';
import { fetchJobDetails } from '@/lib/data-utils';

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

  useEffect(() => {
    const getJobDetails = async () => {
      if (isOpen && jobId) {
        setLoading(true);
        setError(null);
        try {
          const detailedData = await fetchDetailedJob(jobId);
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

  const handleEditJob = () => {
    if (job) {
      console.log(`Editing job: ${job.id}`);
      alert("Simulated: Open job edit form. (Requires backend integration)");
      // In a real app, this would open another modal or navigate to an edit page.
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

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 bg-gray-900 text-gray-100 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Job Details: {job?.title || "Loading..."}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Comprehensive information and administrative actions for this job posting.
          </DialogDescription>
        </DialogHeader>

        {loading && <div className="text-center py-8 text-gray-400">Loading job data...</div>}
        {error && <div className="text-red-500 text-center py-8">Error: {error}</div>}

        {job && (
          <div className="space-y-6 mt-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-end">
              {job.status === 'pending-approval' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleUpdateJobStatus('live')}
                  disabled={isUpdatingStatus}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isUpdatingStatus ? 'Approving...' : 'Approve Job'}
                </Button>
              )}
              {job.status === 'live' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleUpdateJobStatus('filled')}
                  disabled={isUpdatingStatus}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isUpdatingStatus ? 'Marking...' : 'Mark as Filled'}
                </Button>
              )}
              {job.status !== 'archived' && (
                 <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateJobStatus('archived')}
                    disabled={isUpdatingStatus}
                    className="text-gray-200 border-gray-600 hover:bg-gray-700"
                  >
                    {isUpdatingStatus ? 'Archiving...' : 'Archive Job'}
                  </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleEditJob}
                className="text-gray-200 border-gray-600 hover:bg-gray-700"
              >
                Edit Job
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteJob}
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
                <div><strong>Posted On:</strong> {job.postedDate}</div>
                <div>
                  <strong>Status:</strong>{" "}
                  <Badge
                    className={`capitalize ${
                      job.status === 'live' ? 'bg-green-600 text-white' :
                      job.status === 'pending-approval' ? 'bg-yellow-600 text-white' :
                      job.status === 'filled' ? 'bg-blue-600 text-white' :
                      'bg-gray-600 text-gray-200'
                    }`}
                  >
                    {job.status.replace(/-/g, ' ')}
                  </Badge>
                </div>
                <div><strong>Applicants Count:</strong> {job.applicantsCount}</div>
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
                          <th className="py-2 px-1">Status</th>
                          <th className="py-2 px-1 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {job.applicants.map(applicant => (
                          <tr key={applicant.id} className="border-b border-gray-700 last:border-b-0">
                            <td className="py-2 px-1">{applicant.name}</td>
                            <td className="py-2 px-1">{applicant.email}</td>
                            <td className="py-2 px-1 capitalize">{applicant.status}</td>
                            <td className="py-2 px-1 text-right">
                              <Button variant="link" size="sm" className="text-blue-400 hover:underline" onClick={() => { /* Implement view applicant profile */ }}>View Profile</Button>
                              <Button variant="secondary" size="sm" className="ml-2 text-gray-200 border-gray-600 hover:bg-gray-700">Update Status</Button>
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
                      <li key={index} className="text-sm">{note}</li>
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
  );
}