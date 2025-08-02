// components/admin/PaymentManagementTable.tsx
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Payment } from '@/types/admin-types';
import { issueRefund } from '@/lib/data-utils'; // Assuming this function exists for actions

interface PaymentManagementTableProps {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  onViewDetails: (paymentId: string) => void;
  onRefreshPayments: () => void; // For refreshing data after actions
}

export function PaymentManagementTable({ payments, loading, error, onViewDetails, onRefreshPayments }: PaymentManagementTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRefunding, setIsRefunding] = useState(false);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || payment.type === filterType;
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleIssueRefund = async (payment: Payment) => {
    if (window.confirm(`Are you sure you want to issue a refund of $${payment.amount.toFixed(2)} for transaction ID: ${payment.transactionId}?`)) {
      setIsRefunding(true);
      try {
        const success = await issueRefund(payment.id, payment.amount, "Customer requested refund");
        if (success) {
          alert(`Refund processed for transaction ${payment.transactionId}.`);
          onRefreshPayments(); // Refresh data in parent component
        } else {
          alert(`Failed to issue refund for transaction ${payment.transactionId}.`);
        }
      } catch (err) {
        alert(`Error issuing refund: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsRefunding(false);
      }
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-200">Payment Transactions</CardTitle>
        <CardDescription className="text-gray-400">View and manage all payment records.</CardDescription>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <Input
            placeholder="Search by user name or transaction ID..."
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
              <SelectItem value="job-post">Job Post</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700 text-gray-200 focus:ring-blue-500">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="partially-refunded">Partially Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onRefreshPayments} className="bg-gray-700 hover:bg-gray-600 text-white">Refresh Data</Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-center py-4 text-gray-400">Loading payments...</div>}
        {error && <div className="text-red-500 text-center py-4">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-gray-300">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-2">Transaction ID</th>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700">
                      <td className="px-4 py-3">{payment.transactionId}</td>
                      <td className="px-4 py-3">{payment.userName}</td>
                      <td className="px-4 py-3">${payment.amount.toFixed(2)}</td>
                      <td className="px-4 py-3">{payment.date}</td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`capitalize ${
                            payment.status === 'completed' ? 'bg-green-600 text-white' :
                            payment.status === 'pending' ? 'bg-yellow-600 text-white' :
                            payment.status === 'refunded' || payment.status === 'partially-refunded' ? 'bg-blue-600 text-white' :
                            'bg-red-600 text-white'
                          }`}
                        >
                          {payment.status.replace(/-/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 capitalize">{payment.type.replace(/-/g, ' ')}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onViewDetails(payment.id)}
                          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          View Details
                        </Button>
                        {payment.status === 'completed' && (
                          <Button
                            variant="ghost" // Changed variant to 'ghost'
                            size="sm"
                            onClick={() => handleIssueRefund(payment)}
                            disabled={isRefunding}
                            className="ml-2 text-gray-200 border border-gray-600 hover:bg-gray-700 hover:text-white" // Added border explicitly
                          >
                            {isRefunding ? 'Refunding...' : 'Issue Refund'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-4 text-center text-gray-400">No payments found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && filteredPayments.length === 0 && payments.length > 0 && (
            <div className="text-center py-4 text-gray-400">No payments found matching your filters.</div>
        )}
      </CardContent>
    </Card>
  );
}