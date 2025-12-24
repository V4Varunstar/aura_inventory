import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Warehouse, TrendingUp, Users, BarChart3, 
  FileText, CheckCircle, Star, ArrowRight, Zap 
} from 'lucide-react';
import Button from '../components/ui/Button';

const Landing: React.FC = () => {
  const features = [
    {
      icon: <Package className="h-6 w-6" />,
      title: 'Product Management',
      description: 'Manage products with SKU, batch tracking, and pricing. Bulk import via Excel.',
    },
    {
      icon: <Warehouse className="h-6 w-6" />,
      title: 'Multi-Warehouse',
      description: 'Track inventory across multiple warehouse locations in real-time.',
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Stock Movements',
      description: 'Inward, outward, and adjustments with complete audit trail.',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Advanced Analytics',
      description: 'Real-time dashboards, trends, and insights for better decision making.',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Team Collaboration',
      description: 'Role-based access control with admin, manager, employee, and viewer roles.',
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Reports & Export',
      description: 'Generate and export detailed reports in CSV and Excel formats.',
    },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Operations Manager',
      company: 'BeautyHub India',
      content: 'Aura Inventory has transformed how we manage our multi-location stock. Real-time visibility is a game changer!',
      rating: 5,
    },
    {
      name: 'Raj Kumar',
      role: 'Founder',
      company: 'Organic Essentials',
      content: 'The bulk upload feature saved us hours of manual work. Highly recommend for growing businesses.',
      rating: 5,
    },
    {
      name: 'Anjali Patel',
      role: 'Warehouse Head',
      company: 'SkincareHub',
      content: 'Simple, intuitive, and powerful. Perfect for our cosmetics distribution business.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Version Marker for Debugging */}
      <div className="hidden" data-version="v1.0.1" data-build="2025-12-24-16:10"></div>
      
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Aura Inventory</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/demo">
              <Button variant="outline">View Demo</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary">Login</Button>
            </Link>
            <Link to="/pricing">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Content */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm font-medium mb-6">
            <Zap className="h-4 w-4 mr-2" />
            Trusted by 500+ Beauty & Personal Care Brands
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Inventory Management
            <br />
            <span className="text-primary-600">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Complete inventory management solution for beauty, cosmetics, and personal care businesses.
            Track stock, manage warehouses, and grow your business with confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/pricing">
              <Button size="lg" leftIcon={<ArrowRight />}>
                Start Free Trial
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="secondary">
                View Demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Powerful features to manage your inventory efficiently
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-100 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Businesses
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See what our customers say about us
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{testimonial.content}</p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-primary-600 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join hundreds of businesses managing their inventory smarter
          </p>
          <Link to="/pricing">
            <Button size="lg" variant="secondary">
              View Pricing Plans
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-6 w-6 text-primary-500" />
                <span className="text-xl font-bold text-white">Aura Inventory</span>
              </div>
              <p className="text-sm">
                Modern inventory management for beauty and personal care businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/features">Features</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
                <li><Link to="/login">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/careers">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
                <li><Link to="/refund">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© 2025 Aura Inventory. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
