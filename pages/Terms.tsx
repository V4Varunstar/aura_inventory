import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft } from 'lucide-react';

const Terms: React.FC = () => {
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
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            <strong>Last Updated:</strong> November 18, 2025
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            By accessing and using Aura Inventory ("Service"), you agree to be bound by these Terms of Service and all
            applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using
            this Service.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">2. Use License</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable license
            to access and use the Service for your internal business purposes.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">3. User Accounts</h2>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">3.1 Account Creation</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You must provide accurate and complete information when creating an account. You are responsible for
            maintaining the confidentiality of your account credentials.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">3.2 Account Security</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You are responsible for all activities that occur under your account. Notify us immediately of any
            unauthorized access or security breach.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">4. Subscription and Billing</h2>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">4.1 Paid Plans</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Paid subscriptions are billed in advance on a monthly or annual basis. All fees are in Indian Rupees (INR)
            and are non-refundable except as required by law or as specified in our Refund Policy.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">4.2 Free Trial</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            New users may be eligible for a 14-day free trial. At the end of the trial period, you will be automatically
            charged unless you cancel before the trial ends.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">4.3 Price Changes</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We reserve the right to change our pricing with 30 days' notice. Price changes will not affect your current
            billing cycle.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">5. Acceptable Use</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You agree NOT to:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Use the Service for any illegal or unauthorized purpose</li>
            <li>Violate any laws or regulations</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Attempt to gain unauthorized access to any systems</li>
            <li>Upload malicious code or viruses</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Scrape or copy content without permission</li>
            <li>Resell or redistribute the Service</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">6. Data and Privacy</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Your use of the Service is also governed by our Privacy Policy. You retain all rights to your data. We claim
            no intellectual property rights over the data you provide.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">7. Service Availability</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We strive to provide 99.9% uptime but do not guarantee uninterrupted access. We may perform maintenance
            that temporarily affects service availability, with advance notice when possible.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">8. Intellectual Property</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The Service and its original content, features, and functionality are owned by Aura Inventory and are
            protected by international copyright, trademark, and other intellectual property laws.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">9. Termination</h2>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">9.1 By You</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You may cancel your subscription at any time through your account settings. Cancellation takes effect at
            the end of your current billing period.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">9.2 By Us</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We reserve the right to suspend or terminate your account if you violate these Terms or for any other
            reason with or without notice.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">10. Disclaimers</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED,
            INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">11. Limitation of Liability</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, AURA INVENTORY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
            SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">12. Indemnification</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You agree to indemnify and hold harmless Aura Inventory from any claims, damages, or expenses arising from
            your use of the Service or violation of these Terms.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">13. Governing Law</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            These Terms shall be governed by and construed in accordance with the laws of India, without regard to its
            conflict of law provisions.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">14. Changes to Terms</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We reserve the right to modify these Terms at any time. We will provide notice of material changes. Your
            continued use of the Service after changes constitutes acceptance.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">15. Contact Information</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            For questions about these Terms, please contact us at:
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>Email:</strong> legal@aurainventory.com
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>Address:</strong> Aura Inventory, India
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
