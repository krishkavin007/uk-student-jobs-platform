// src/components/admin/RefundManagementTable.tsx
"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Refund } from '@/types/admin-types'; // Ensure you have this Refund type defined

interface RefundManagementTableProps {
  refunds: Refund[];
  loading: boolean;
  error: string | null;
  onProcessRefund: (refundId: string, action: string) => void;
  onRefreshRefunds: () => void;
}

export function RefundManagementTable({ refunds, loading, error, onProcessRefund, onRefreshRefunds }: RefundManagementTableProps) {
  return (
    <Card className="bg-gray-800 text-gray-100 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Refund Management</CardTitle>
        <CardDescription className="text-gray-400">Manage pending and processed refunds.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Input placeholder="Search refunds..." className="max-w-sm bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500" />
          {/* Also applying the hover fix to the Refresh Refunds button for consistency */}
          <Button onClick={onRefreshRefunds} variant="ghost" className="text-gray-200 border border-gray-700 hover:bg-gray-700 hover:text-white">Refresh Refunds</Button>
        </div>

        {loading && <p>Loading refunds...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <Table className="bg-gray-900 border border-gray-700 rounded-md">
            <TableHeader>
              <TableRow className="bg-gray-700 hover:bg-gray-700/80">
                <TableHead className="text-gray-300">Refund ID</TableHead>
                <TableHead className="text-gray-300">Payment ID</TableHead>
                <TableHead className="text-gray-300">User ID</TableHead>
                <TableHead className="text-gray-300">Amount</TableHead>
                <TableHead className="text-gray-300">Date Requested</TableHead>
                <TableHead className="text-gray-300">Reason</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.length > 0 ? (
                refunds.map((refund) => (
                  <TableRow key={refund.id} className="hover:bg-gray-700">
                    <TableCell className="font-medium text-gray-200">{refund.id}</TableCell>
                    <TableCell className="text-gray-300">{refund.paymentId}</TableCell>
                    <TableCell className="text-gray-300">{refund.userId}</TableCell>
                    <TableCell className="text-gray-300">£{refund.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-gray-300">{new Date(refund.dateRequested).toLocaleDateString()}</TableCell>
                    <TableCell className="text-gray-300">{refund.reason}</TableCell>
                    <TableCell>
                      <Badge variant={refund.status === 'pending' ? 'destructive' : 'default'} className={refund.status === 'pending' ? 'bg-yellow-600 text-yellow-50' : 'bg-green-600 text-green-50'}>
                        {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {refund.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => onProcessRefund(refund.id, 'approve')}
                            variant="ghost" // Changed variant to 'ghost' for better control
                            className="bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:text-white" // Explicitly defined all styles
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onProcessRefund(refund.id, 'reject')}
                            variant="ghost" // Changed variant to 'ghost' for better control
                            className="text-red-400 border border-red-400 hover:bg-red-700 hover:text-white" // Explicitly defined all styles, ensuring dark hover
                          >
                            Reject
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
                  <TableCell colSpan={8} className="h-24 text-center text-gray-400">
                    No refunds found.
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