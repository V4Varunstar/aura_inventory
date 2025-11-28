import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Check, X, ArrowRight, HelpCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { SubscriptionPlan, PLAN_LIMITS } from '../types';
import { getPlanPrice, getPlanDisplayName } from '../utils/subscription';

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      plan: SubscriptionPlan.Free,
      name: 'Free',
      price: 0,
      description: 'Perfect for trying out',
      cta: 'Start Free',
      popular: false,
      features: [
        '1 User',
        '1 Warehouse',
        'Up to 50 Products',
        'Basic Inventory Tracking',
        'Standard Reports',
        'Email Support',
      ],
      notIncluded: [
        'Bulk Upload',
        'Advanced Analytics',
        'WhatsApp Alerts',
        'API Access',
      ],
    },
    {
      plan: SubscriptionPlan.Starter,
      name: 'Starter',
      price: 499,
      description: 'For small businesses',
      cta: 'Start 14-Day Trial',
      popular: true,
      features: [
        'Up to 3 Users',
        '1 Warehouse',
        'Up to 500 Products',
        'All Free Features',
        'Bulk Upload (Excel)',
        'Email Alerts',
        'Priority Email Support',
        'Advanced Reports',
      ],
      notIncluded: [
        'WhatsApp Alerts',
        'API Access',
        'Dedicated Support',
      ],
    },
    {
      plan: SubscriptionPlan.Pro,
      name: 'Pro',
      price: 999,
      description: 'For growing businesses',
      cta: 'Start 14-Day Trial',
      popular: false,
      features: [
        'Up to 10 Users',
        'Up to 3 Warehouses',
        'Up to 5,000 Products',
        'All Starter Features',
        'WhatsApp Alerts',
        'Advanced Analytics',
        'Stock Ageing Reports',
        'API Access',
        'Phone Support',
      ],
      notIncluded: [
        'Dedicated Account Manager',
      ],
    },
    {
      plan: SubscriptionPlan.Business,
      name: 'Business',
      price: 1999,
      description: 'For enterprises',
      cta: 'Contact Sales',
      popular: false,
      features: [
        'Unlimited Users',
        'Unlimited Warehouses',
        'Unlimited Products',
        'All Pro Features',
        'Custom Integrations',
        'Dedicated Account Manager',
        'Priority Support 24/7',
        'Custom Training',
        'SLA Guarantee',
        'White-label Option',
      ],
      notIncluded: [],
    },
  ];

  const faqs = [
    {
      question: 'Can I switch plans anytime?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
    },
    {
      question: 'What happens after the free trial?',
      answer: 'After your 14-day trial ends, you can choose to subscribe to a paid plan or continue with the Free plan.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, UPI, net banking, and wallets via Razorpay.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely! We use bank-grade encryption and follow industry best practices for data security.',
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes, you can export all your data in CSV or Excel format at any time.',
    },
  ];

  const calculatePrice = (basePrice: number) => {
    if (billingCycle === 'yearly') {
      return Math.round(basePrice * 12 * 0.8); // 20% discount
    }
    return basePrice;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Aura Inventory</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="secondary">Login</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Choose the perfect plan for your business. All plans include 14-day free trial.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
          <button
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              billingCycle === 'yearly'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly
            <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((planData, index) => {
            const price = calculatePrice(planData.price);
            const monthlyPrice = planData.price;
            
            return (
              <div
                key={index}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${
                  planData.popular ? 'ring-2 ring-primary-500 scale-105' : ''
                }`}
              >
                {planData.popular && (
                  <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {planData.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{planData.description}</p>
                  
                  <div className="mb-6">
                    {planData.price === 0 ? (
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">Free</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">₹{price}</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          /{billingCycle === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>
                    )}
                    {billingCycle === 'yearly' && planData.price > 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        ₹{monthlyPrice}/month billed yearly
                      </p>
                    )}
                  </div>

                  <Link to={planData.plan === SubscriptionPlan.Business ? '/contact' : '/signup'}>
                    <Button
                      className="w-full mb-6"
                      variant={planData.popular ? 'primary' : 'secondary'}
                      rightIcon={<ArrowRight />}
                    >
                      {planData.cta}
                    </Button>
                  </Link>

                  <div className="space-y-3">
                    {planData.features.map((feature, i) => (
                      <div key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                    {planData.notIncluded.map((feature, i) => (
                      <div key={i} className="flex items-start opacity-40">
                        <X className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-500 dark:text-gray-500 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Compare All Features
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Feature
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  Free
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  Starter
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  Pro
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  Business
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Users</td>
                <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">1</td>
                <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">3</td>
                <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">10</td>
                <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Unlimited</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Warehouses</td>
                <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">1</td>
                <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">1</td>
                <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">3</td>
                <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Unlimited</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Products</td>
                <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">50</td>
                <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">500</td>
                <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">5,000</td>
                <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Unlimited</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Bulk Upload</td>
                <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Advanced Analytics</td>
                <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">WhatsApp Alerts</td>
                <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">API Access</td>
                <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Priority Support</td>
                <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
            >
              <div className="flex items-start">
                <HelpCircle className="h-6 w-6 text-primary-600 mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-primary-600 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Still Have Questions?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Our team is here to help you choose the right plan
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact">
              <Button size="lg" variant="secondary">
                Contact Sales
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary">
                Try Free Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm">
            <p>© 2025 Aura Inventory. All rights reserved.</p>
            <div className="mt-4 space-x-4">
              <Link to="/privacy" className="hover:text-white">Privacy</Link>
              <Link to="/terms" className="hover:text-white">Terms</Link>
              <Link to="/refund" className="hover:text-white">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
