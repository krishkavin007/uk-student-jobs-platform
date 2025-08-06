// components/admin/JobManagementTable.tsx
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/types/admin-types';
import { updateJobStatus, deleteJob } from '@/lib/data-utils';

interface JobManagementTableProps {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  onViewDetails: (jobId: string) => void;
  onJobUpdated: () => void;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
}

export function JobManagementTable({ 
  jobs, 
  loading, 
  error, 
  onViewDetails, 
  onJobUpdated,
  onPageChange,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0
}: JobManagementTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Categories from browse-jobs page
  const categories = [
    'Hospitality',
    'Retail', 
    'Tutoring',
    'Admin Support',
    'Tech Support',
    'Marketing',
    'Customer Service',
    'Warehouse & Logistics',
    'Other'
  ];

  // Real statuses from database
  const statuses = [
    'active',
    'filled',
    'removed', 
    'expired',
    'archived'
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || job.type === filterCategory;
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleJobStatusUpdate = async (jobId: string, newStatus: Job['status']) => {
    setIsUpdatingStatus(true);
    try {
      const success = await updateJobStatus(jobId, newStatus);
      if (success) {
        alert(`Job ${jobId} status updated to ${newStatus}.`);
        onJobUpdated();
      } else {
        alert(`Failed to update job status for ${jobId}.`);
      }
    } catch (err) {
      alert(`Error updating job status: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleJobAction = async (jobId: string, action: string) => {
    if (action === 'Delete') {
      if (window.confirm(`Are you sure you want to delete job "${jobId}"? This action cannot be undone.`)) {
        try {
          await deleteJob(jobId);
          alert(`Job ${jobId} has been deleted successfully.`);
          onJobUpdated(); // Refresh the job list
        } catch (error) {
          alert(`Failed to delete job: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    } else {
      console.log(`Performing '${action}' for job: ${jobId}`);
      alert(`Simulated action: ${action} for job ${jobId}. (Requires backend integration)`);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
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
        return 'bg-gray-600 hover:bg-gray-700 text-gray-200';
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-200">Job Postings Management</CardTitle>
        <CardDescription className="text-gray-400">View and manage all job listings.</CardDescription>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <Input
            placeholder="Search by title, company, location, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow bg-gray-900 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-blue-500"
          />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700 text-gray-200 focus:ring-blue-500">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700 text-gray-200 focus:ring-blue-500">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={onJobUpdated} className="bg-gray-700 hover:bg-gray-600 text-white">Refresh Data</Button>
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
                  <th className="px-4 py-2">Category</th>
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
                      <td className="px-4 py-3">{job.type}</td>
                      <td className="px-4 py-3">
                        <Badge className={`capitalize transition-colors duration-200 ${getStatusBadgeColor(job.status)}`}>
                          {job.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200">
                          {job.applicantsCount}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onViewDetails(job.id)}
                          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          View Details
                        </Button>
                        {job.status === 'active' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleJobStatusUpdate(job.id, 'archived')}
                            disabled={isUpdatingStatus}
                            className="ml-2 bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            {isUpdatingStatus ? 'Archiving...' : 'Archive'}
                          </Button>
                        )}
                        {job.status === 'filled' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleJobStatusUpdate(job.id, 'archived')}
                            disabled={isUpdatingStatus}
                            className="ml-2 bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            {isUpdatingStatus ? 'Archiving...' : 'Archive'}
                          </Button>
                        )}
                        {job.status === 'archived' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleJobStatusUpdate(job.id, 'active')}
                            disabled={isUpdatingStatus}
                            className="ml-2 bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isUpdatingStatus ? 'Unarchiving...' : 'Unarchive'}
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
                    <td colSpan={7} className="px-4 py-4 text-center text-gray-400">No jobs found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && filteredJobs.length === 0 && jobs.length > 0 && (
            <div className="text-center py-4 text-gray-400">No jobs found matching your filters.</div>
        )}
        
        {/* Pagination Controls */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalCount)} of {totalCount} jobs
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage <= 1}
                className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange?.(pageNum)}
                      className={
                        currentPage === pageNum 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : "bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}