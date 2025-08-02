// src/components/admin/ReportManagementTable.tsx
"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Report } from '@/types/admin-types'; // Ensure you have this Report type defined

interface ReportManagementTableProps {
  reports: Report[];
  loading: boolean;
  error: string | null;
  onUpdateReportStatus: (reportId: string, newStatus: string) => void;
  onRefreshReports: () => void;
}

export function ReportManagementTable({ reports, loading, error, onUpdateReportStatus, onRefreshReports }: ReportManagementTableProps) {
  return (
    <Card className="bg-gray-800 text-gray-100 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Moderation & Reports</CardTitle>
        <CardDescription className="text-gray-400">Review user reports, manage content, and user accounts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Input placeholder="Search reports..." className="max-w-sm bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500" />
          <Button
            onClick={onRefreshReports}
            variant="ghost" // Changed variant to 'ghost'
            className="text-gray-200 border border-gray-700 hover:bg-gray-700 hover:text-white" // Explicitly added border and hover styles
          >
            Refresh Reports
          </Button>
        </div>

        {loading && <p>Loading reports...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <Table className="bg-gray-900 border border-gray-700 rounded-md">
            <TableHeader>
              <TableRow className="bg-gray-700 hover:bg-gray-700/80">
                <TableHead className="text-gray-300">Report ID</TableHead>
                <TableHead className="text-gray-300">Type</TableHead>
                <TableHead className="text-gray-300">Reported Entity</TableHead>
                <TableHead className="text-gray-300">Description</TableHead>
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length > 0 ? (
                reports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-gray-700">
                    <TableCell className="font-medium text-gray-200">{report.id}</TableCell>
                    <TableCell className="text-gray-300">{report.type.replace(/_/g, ' ')}</TableCell>
                    <TableCell className="text-gray-300">ID: {report.reportedId}</TableCell>
                    <TableCell className="text-gray-300">{report.description}</TableCell>
                    <TableCell className="text-gray-300">{new Date(report.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={report.status === 'pending' ? 'destructive' : 'default'} className={report.status === 'pending' ? 'bg-yellow-600 text-yellow-50' : 'bg-green-600 text-green-50'}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {report.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => onUpdateReportStatus(report.id, 'resolved')}
                            variant="ghost" // Changed variant to 'ghost'
                            className="bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:text-white" // Explicitly added border and hover styles
                          >
                            Resolve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onUpdateReportStatus(report.id, 'dismissed')}
                            variant="ghost" // Changed variant to 'ghost'
                            className="text-red-400 border border-red-400 hover:bg-red-700 hover:text-white" // Explicitly added border and hover styles, ensuring dark hover
                          >
                            Dismiss
                          </Button>
                        </div>
                      ) : (
                        <span className="text-gray-500">No actions</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-gray-400">
                    No reports found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}