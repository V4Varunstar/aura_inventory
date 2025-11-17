
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-6xl font-bold text-primary-600">404</h1>
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mt-4">Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link to="/dashboard">
        <Button className="mt-6">Go to Dashboard</Button>
      </Link>
    </div>
  );
};

export default NotFound;
