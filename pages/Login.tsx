
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { APP_NAME } from '../constants';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(email, password);
      addToast('Login successful!', 'success');
      
      // Navigate based on user role
      if (user.role === 'SuperAdmin') {
        navigate('/super-admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      addToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400">{APP_NAME}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Inventory Management System</p>
        </div>
        <Card title="Sign in to your account">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@company.com"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <Button type="submit" isLoading={isLoading} className="w-full">
              Login
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
