import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft } from 'lucide-react';

const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-primary-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Aura Inventory</span>
            </Link>
            <Link to="/" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Refund Policy</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            <strong>Last Updated:</strong> November 18, 2025
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">1. 30-Day Money-Back Guarantee</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We offer a 30-day money-back guarantee for all paid subscriptions. If you're not satisfied with Aura
            Inventory within the first 30 days of your paid subscription, we will provide a full refund, no questions
            asked.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">2. Eligibility for Refund</h2>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">2.1 Eligible Refunds</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You are eligible for a refund if:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>You request a refund within 30 days of your initial paid subscription purchase</li>
            <li>You experience significant technical issues that we cannot resolve</li>
            <li>You were charged incorrectly due to a billing error</li>
            <li>You did not cancel before a trial period ended and were charged unintentionally</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">2.2 Non-Eligible Refunds</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Refunds are NOT available for:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Subscriptions active for more than 30 days</li>
            <li>Renewal charges if you did not cancel before the renewal date</li>
            <li>Partial month refunds (we do not offer pro-rated refunds)</li>
            <li>Account terminations due to Terms of Service violations</li>
            <li>Change of mind after 30 days</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">3. Free Trial</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our 14-day free trial does not require payment information. No charges will be applied unless you
            explicitly upgrade to a paid plan. If you start a trial and upgrade to a paid plan, the 30-day
            money-back guarantee begins from your upgrade date.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">4. How to Request a Refund</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To request a refund:
          </p>
          <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Contact our support team at <strong>support@aurainventory.com</strong></li>
            <li>Include your account email and reason for refund request</li>
            <li>Provide your transaction ID or payment receipt</li>
            <li>Allow 2-3 business days for review</li>
          </ol>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We aim to process all refund requests within 5-7 business days of approval.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">5. Refund Processing</h2>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">5.1 Processing Time</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Once approved, refunds are processed within 5-7 business days. The time for the refund to appear in your
            account depends on your payment method:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li><strong>Credit/Debit Cards:</strong> 5-10 business days</li>
            <li><strong>UPI/Wallets:</strong> 3-5 business days</li>
            <li><strong>Net Banking:</strong> 7-10 business days</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">5.2 Refund Method</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Refunds will be issued to the original payment method used for the purchase. We cannot issue refunds to a
            different payment method or account.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">6. Cancellation Policy</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You can cancel your subscription at any time from your account settings. Upon cancellation:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Your subscription remains active until the end of the current billing period</li>
            <li>You will not be charged for subsequent billing periods</li>
            <li>You can continue using the service until your paid period expires</li>
            <li>No refunds are provided for the remaining days in your billing cycle</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">7. Downgrades</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you downgrade to a lower-tier plan or the free plan, the change takes effect at the end of your
            current billing cycle. No partial refunds are provided for downgrades.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">8. Billing Errors</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you believe you were charged incorrectly, please contact us immediately at{' '}
            <strong>billing@aurainventory.com</strong>. We will investigate and correct any billing errors promptly.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">9. Failed Payments</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If a payment fails, we will:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Notify you via email</li>
            <li>Attempt to charge your payment method again after 3 days</li>
            <li>Suspend your account if payment fails after multiple attempts</li>
            <li>Delete your data after 30 days of non-payment (with prior notice)</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">10. Exceptional Circumstances</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We may offer refunds outside of our standard policy in exceptional circumstances, such as:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Extended service outages beyond our control</li>
            <li>Critical bugs that prevent normal use of the service</li>
            <li>Duplicate charges or billing system errors</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            These are handled on a case-by-case basis at our discretion.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">11. Data Retention After Refund</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            After a refund is processed:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Your account will be downgraded to the Free plan (if available)</li>
            <li>You can export your data within 30 days</li>
            <li>Data may be deleted after 30 days if you don't maintain an active account</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">12. Contact Us</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            For refund requests or questions about this policy:
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>Email:</strong> billing@aurainventory.com
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>Support:</strong> support@aurainventory.com
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>Response Time:</strong> Within 24-48 hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
