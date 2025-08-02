// components/admin/JobManagementTable.tsx
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/types/admin-types';
import { updateJobStatus } from '@/lib/data-utils'; // Assuming this function exists for actions

interface JobManagementTableProps {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  onViewDetails: (jobId: string) => void;
  onRefreshJobs: () => void; // For refreshing data after actions
}

export function JobManagementTable({ jobs, loading, error, onViewDetails, onRefreshJobs }: JobManagementTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || job.type === filterType;
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleJobStatusUpdate = async (jobId: string, newStatus: Job['status']) => {
    setIsUpdatingStatus(true);
    try {
      const success = await updateJobStatus(jobId, newStatus);
      if (success) {
        alert(`Job ${jobId} status updated to ${newStatus}.`);
        onRefreshJobs(); // Refresh data in parent component
      } else {
        alert(`Failed to update job status for ${jobId}.`);
      }
    } catch (err) {
      alert(`Error updating job status: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleJobAction = (jobId: string, action: string) => {
    console.log(`Performing '${action}' for job: ${jobId}`);
    // In a real app, this would trigger an API call based on the action
    alert(`Simulated action: ${action} for job ${jobId}. (Requires backend integration)`);
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-200">Job Postings Management</CardTitle>
        <CardDescription className="text-gray-400">View and manage all job listings.</CardDescription>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <Input
            placeholder="Search by title, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow bg-gray-900 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-blue-500"
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700 text-gray-200 focus:ring-blue-500">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700 text-gray-200 focus:ring-blue-500">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="pending-approval">Pending Approval</SelectItem>
              <SelectItem value="filled">Filled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onRefreshJobs} className="bg-gray-700 hover:bg-gray-600 text-white">Refresh Data</Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-center py-4 text-gray-400">Loading jobs...</div>}
        {error && <div className="text-red-500 text-center py-4">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-gray-300">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-2">Job Title</th>
                  <th className="px-4 py-2">Company</th>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Applicants</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700">
                      <td className="px-4 py-3">{job.title}</td>
                      <td className="px-4 py-3">{job.companyName}</td>
                      <td className="px-4 py-3">{job.location}</td>
                      <td className="px-4 py-3">
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
                      </td>
                      <td className="px-4 py-3">{job.applicantsCount}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onViewDetails(job.id)}
                          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          View Details
                        </Button>
                        <Button
                          variant="ghost" // Changed variant to 'ghost'
                          size="sm"
                          onClick={() => handleJobAction(job.id, 'Edit')}
                          className="ml-2 text-gray-200 border border-gray-600 hover:bg-gray-700 hover:text-white" // Added border explicitly
                        >
                          Edit
                        </Button>
                        {job.status === 'pending-approval' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleJobStatusUpdate(job.id, 'live')}
                            disabled={isUpdatingStatus}
                            className="ml-2 bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isUpdatingStatus ? 'Approving...' : 'Approve'}
                          </Button>
                        )}
                        {job.status === 'live' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleJobStatusUpdate(job.id, 'filled')} // Or 'archive'
                            disabled={isUpdatingStatus}
                            className="ml-2 bg-purple-600 hover:bg-purple-700 text-white" // Custom color for 'Mark Filled'
                          >
                            {isUpdatingStatus ? 'Marking...' : 'Mark Filled'}
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleJobAction(job.id, 'Delete')}
                          className="ml-2"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-center text-gray-400">No jobs found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && filteredJobs.length === 0 && jobs.length > 0 && (
            <div className="text-center py-4 text-gray-400">No jobs found matching your filters.</div>
        )}
      </CardContent>
    </Card>
  );
}