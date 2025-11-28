import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
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
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            <strong>Last Updated:</strong> November 18, 2025
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">1. Introduction</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Welcome to Aura Inventory ("we," "our," or "us"). We are committed to protecting your personal information
            and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our inventory management service.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">2. Information We Collect</h2>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">2.1 Personal Information</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            When you register for an account, we collect:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Name and email address</li>
            <li>Company information</li>
            <li>Phone number</li>
            <li>Billing and payment information</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">2.2 Business Data</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            When you use our service, we collect and store:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Product information and inventory data</li>
            <li>Warehouse and stock movement records</li>
            <li>User activity and audit logs</li>
            <li>Transaction and report data</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">2.3 Technical Information</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We automatically collect:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>IP address and browser information</li>
            <li>Device information and operating system</li>
            <li>Usage data and analytics</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We use your information to:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Provide, operate, and maintain our service</li>
            <li>Process your transactions and manage your account</li>
            <li>Send you updates, notifications, and support messages</li>
            <li>Improve and personalize your experience</li>
            <li>Analyze usage patterns and optimize our service</li>
            <li>Detect and prevent fraud or security issues</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">4. Data Security</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We implement industry-standard security measures including:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication measures</li>
            <li>Secure data centers and backup systems</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">5. Data Sharing</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We do not sell your personal information. We may share your data with:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Service providers who assist in operating our platform</li>
            <li>Payment processors for billing purposes</li>
            <li>Law enforcement when required by law</li>
            <li>Business partners with your explicit consent</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">6. Your Rights</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            <li>Access and review your personal data</li>
            <li>Correct or update your information</li>
            <li>Delete your account and data</li>
            <li>Export your data in standard formats</li>
            <li>Opt-out of marketing communications</li>
            <li>Object to data processing</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">7. Data Retention</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We retain your data as long as your account is active or as needed to provide services. After account
            deletion, we may retain certain information for legal, tax, or regulatory purposes.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">8. Cookies</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized
            content. You can control cookie settings through your browser preferences.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">9. Children's Privacy</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our service is not intended for users under 18 years of age. We do not knowingly collect information from
            children.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">10. Changes to This Policy</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We may update this Privacy Policy from time to time. We will notify you of significant changes via email
            or through our service. Continued use of our service after changes constitutes acceptance.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">11. Contact Us</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>Email:</strong> privacy@aurainventory.com
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>Address:</strong> Aura Inventory, India
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
