import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Trash2, Settings as SettingsIcon, Lock } from 'lucide-react';
import { 
  getInwardSources, 
  addInwardSource, 
  removeInwardSource,
  getOutwardDestinations,
  addOutwardDestination,
  removeOutwardDestination,
  updatePassword
} from '../services/firebaseService';
import { PermissionGate } from '../components/auth/PermissionGate';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [inwardSources, setInwardSources] = useState<string[]>([]);
  const [outwardDestinations, setOutwardDestinations] = useState<string[]>([]);
  const [newSource, setNewSource] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sources, destinations] = await Promise.all([
        getInwardSources(),
        getOutwardDestinations()
      ]);
      setInwardSources(sources);
      setOutwardDestinations(destinations);
    } catch (error) {
      addToast('Failed to fetch settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSource = async () => {
    if (!newSource.trim()) {
      addToast('Please enter a source name.', 'error');
      return;
    }
    if (inwardSources.includes(newSource.trim())) {
      addToast('This source already exists.', 'error');
      return;
    }
    try {
      const updated = await addInwardSource(newSource.trim());
      setInwardSources(updated);
      setNewSource('');
      addToast('Inward source added successfully!', 'success');
    } catch (error) {
      addToast('Failed to add source.', 'error');
    }
  };

  const handleRemoveSource = async (source: string) => {
    try {
      const updated = await removeInwardSource(source);
      setInwardSources(updated);
      addToast('Inward source removed successfully!', 'success');
    } catch (error) {
      addToast('Failed to remove source.', 'error');
    }
  };

  const handleAddDestination = async () => {
    if (!newDestination.trim()) {
      addToast('Please enter a destination name.', 'error');
      return;
    }
    if (outwardDestinations.includes(newDestination.trim())) {
      addToast('This destination already exists.', 'error');
      return;
    }
    try {
      const updated = await addOutwardDestination(newDestination.trim());
      setOutwardDestinations(updated);
      setNewDestination('');
      addToast('Outward destination added successfully!', 'success');
    } catch (error) {
      addToast('Failed to add destination.', 'error');
    }
  };

  const handleRemoveDestination = async (destination: string) => {
    try {
      const updated = await removeOutwardDestination(destination);
      setOutwardDestinations(updated);
      addToast('Outward destination removed successfully!', 'success');
    } catch (error) {
      addToast('Failed to remove destination.', 'error');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('Please fill all password fields.', 'error');
      return;
    }
    
    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      addToast('New password and confirm password do not match.', 'error');
      return;
    }
    
    if (!user) {
      addToast('User not found.', 'error');
      return;
    }
    
    try {
      await updatePassword(user.id, currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast('Password changed successfully!', 'success');
    } catch (error: any) {
      addToast(error.message || 'Failed to change password.', 'error');
    }
  };

  return (
    <PermissionGate permission="settings:update">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="h-8 w-8 text-gray-800 dark:text-gray-200" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Settings</h1>
        </div>

        {loading ? (
          <p>Loading settings...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Change Password */}
            <Card title="Change Password">
              <div className="space-y-4">
                <Input
                  label="Current Password *"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <Input
                  label="New Password *"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                />
                <Input
                  label="Confirm New Password *"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
                <Button 
                  onClick={handleChangePassword} 
                  leftIcon={<Lock size={16} />}
                  className="w-full"
                >
                  Change Password
                </Button>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Your password will be changed immediately and synced with Super Admin panel
                </div>
              </div>
            </Card>

            {/* Inward Sources */}
            <Card title="Inward Sources">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    placeholder="Enter new source (e.g., Supplier Name)"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSource()}
                  />
                  <Button onClick={handleAddSource} leftIcon={<PlusCircle size={16} />}>
                    Add
                  </Button>
                </div>

                <div className="border dark:border-gray-700 rounded-lg divide-y dark:divide-gray-700">
                  {inwardSources.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No sources configured</div>
                  ) : (
                    inwardSources.map((source) => (
                      <div key={source} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <span className="text-gray-800 dark:text-gray-200">{source}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveSource(source)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  💡 These sources will appear in the Inward Stock form
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Outward Destinations - Full Width Row */}
        {!loading && (
          <Card title="Outward Destinations / Channels">
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  placeholder="Enter new destination (e.g., Shopify)"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDestination()}
                />
                <Button onClick={handleAddDestination} leftIcon={<PlusCircle size={16} />}>
                  Add
                </Button>
              </div>

              <div className="border dark:border-gray-700 rounded-lg divide-y dark:divide-gray-700">
                {outwardDestinations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No destinations configured</div>
                ) : (
                  outwardDestinations.map((destination) => (
                    <div key={destination} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <span className="text-gray-800 dark:text-gray-200">{destination}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveDestination(destination)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                💡 These destinations will appear in the Outward Stock form
              </div>
            </div>
          </Card>
        )}

        {/* Info Box */}
        <Card>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              ℹ️ How to use custom sources and destinations
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>Add custom inward sources like supplier names, return channels, etc.</li>
              <li>Add custom outward destinations like sales channels, marketplaces, stores, etc.</li>
              <li>Once added, they will immediately appear in the Inward and Outward forms</li>
              <li>You can remove any custom entry by clicking the trash icon</li>
              <li>Default options (Factory, Amazon FBA, etc.) are always available</li>
            </ul>
          </div>
        </Card>
      </div>
    </PermissionGate>
  );
};

export default Settings;
