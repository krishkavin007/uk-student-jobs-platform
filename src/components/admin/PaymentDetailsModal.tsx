// components/admin/PaymentDetailsModal.tsx
"use client"

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

import { DetailedPayment, Payment } from '@/types/admin-types';
import { fetchJobDetails } from '@/lib/data-utils';

interface PaymentDetailsModalProps {
  paymentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentUpdated?: () => void; // Callback to refresh parent table
}

export function PaymentDetailsModal({ paymentId, isOpen, onClose, onPaymentUpdated }: PaymentDetailsModalProps) {
  const [payment, setPayment] = useState<DetailedPayment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);

  useEffect(() => {
    const getPaymentDetails = async () => {
      if (isOpen && paymentId) {
        setLoading(true);
        setError(null);
        try {
          const detailedData = await fetchDetailedPayment(paymentId);
          setPayment(detailedData);
        } catch (err) {
          setError("Failed to fetch payment details.");
          setPayment(null);
        } finally {
          setLoading(false);
        }
      } else {
        setPayment(null); // Clear payment data when modal is closed or paymentId is null
      }
    };

    getPaymentDetails();
  }, [paymentId, isOpen]);

  const handleIssueRefund = async () => {
    if (!payment) return;

    if (window.confirm(`Are you sure you want to issue a refund of $${payment.amount.toFixed(2)} for this transaction?`)) {
      setIsRefunding(true);
      try {
        const success = await issueRefund(payment.id, payment.amount, "Admin initiated refund from dashboard.");
        if (success) {
          setPayment(prev => prev ? { ...prev, status: 'refunded', refundHistory: [...(prev.refundHistory || []), { amount: payment.amount, date: new Date().toISOString().split('T')[0], reason: "Admin initiated refund" }] } : null);
          if (onPaymentUpdated) onPaymentUpdated();
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

  const handleViewInvoice = () => {
    if (payment?.invoiceUrl) {
      window.open(payment.invoiceUrl, '_blank');
    } else {
      alert("No invoice URL available for this transaction.");
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 bg-gray-900 text-gray-100 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Payment Details: {payment?.transactionId || "Loading..."}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Comprehensive information for this payment transaction.
          </DialogDescription>
        </DialogHeader>

        {loading && <div className="text-center py-8 text-gray-400">Loading payment data...</div>}
        {error && <div className="text-red-500 text-center py-8">Error: {error}</div>}

        {payment && (
          <div className="space-y-6 mt-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-end">
              {payment.status === 'completed' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleIssueRefund}
                  disabled={isRefunding}
                >
                  {isRefunding ? 'Refunding...' : 'Issue Full Refund'}
                </Button>
              )}
              {payment.invoiceUrl && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleViewInvoice}
                  className="text-gray-200 border-gray-600 hover:bg-gray-700"
                >
                  View Invoice
                </Button>
              )}
              <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Download Receipt</Button>
            </div>

            {/* General Information Card */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader><CardTitle className="text-xl text-gray-200">Transaction Information</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div><strong>Transaction ID:</strong> {payment.transactionId}</div>
                <div><strong>User:</strong> {payment.userName} (<Link href={`/admin/users?id=${payment.userId}`} className="text-blue-400 hover:underline">View User</Link>)</div>
                <div><strong>Amount:</strong> ${payment.amount.toFixed(2)}</div>
                <div><strong>Date:</strong> {payment.date}</div>
                <div>
                  <strong>Status:</strong>{" "}
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
                </div>
                <div><strong>Type:</strong> <span className="capitalize">{payment.type.replace(/-/g, ' ')}</span></div>
                {payment.invoiceUrl && <div><strong>Invoice URL:</strong> <Link href={payment.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View</Link></div>}
              </CardContent>
            </Card>

            {/* Refund History */}
            {payment.refundHistory && payment.refundHistory.length > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader><CardTitle className="text-xl text-gray-200">Refund History</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-gray-300">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="py-2 px-1">Amount</th>
                          <th className="py-2 px-1">Date</th>
                          <th className="py-2 px-1">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payment.refundHistory.map((refund, index) => (
                          <tr key={index} className="border-b border-gray-700 last:border-b-0">
                            <td className="py-2 px-1 text-sm">${refund.amount.toFixed(2)}</td>
                            <td className="py-2 px-1 text-sm">{refund.date}</td>
                            <td className="py-2 px-1 text-sm">{refund.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Raw Gateway Response (for debugging/advanced admin) */}
            {payment.gatewayResponse && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader><CardTitle className="text-xl text-gray-200">Raw Gateway Response</CardTitle></CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm bg-gray-900 p-3 rounded-md border border-gray-700 text-gray-300">
                    {JSON.stringify(payment.gatewayResponse, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}