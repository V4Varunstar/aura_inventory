
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import { User, Role } from '../types';
import { getUsers, addUser, updateUser } from '../services/firebaseService';
import { useToast } from '../context/ToastContext';
import { PlusCircle, Edit, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

const UserForm: React.FC<{
  user: Partial<User> | null;
  onSave: (user: Partial<User>) => void;
  onCancel: () => void;
}> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState(user || {});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="name" label="Full Name" value={formData.name || ''} onChange={handleChange} required />
      <Input name="email" label="Email" type="email" value={formData.email || ''} onChange={handleChange} required />
      <Select name="role" label="Role" value={formData.role || ''} onChange={handleChange} required>
          {Object.values(Role).map(role => <option key={role} value={role}>{role}</option>)}
      </Select>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{user?.id ? 'Update User' : 'Add User'}</Button>
      </div>
    </form>
  );
};


const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                setUsers(await getUsers());
            } catch(e) {
                addToast('Failed to fetch users', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [addToast]);

    const handleOpenModal = (user?: User) => {
        setEditingUser(user || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingUser(null);
        setIsModalOpen(false);
    };
    
    const handleSaveUser = async (data: Partial<User>) => {
        try {
            if (data.id) {
                const updated = await updateUser(data.id, data);
                setUsers(users.map(u => u.id === updated.id ? updated : u));
                addToast('User updated', 'success');
            } else {
                const created = await addUser(data);
                setUsers([...users, created]);
                addToast('User added and invite sent', 'success');
            }
            handleCloseModal();
        } catch (e) {
            addToast('Failed to save user', 'error');
        }
    };
    
    const handleToggleStatus = async (user: User) => {
        try {
            const updated = await updateUser(user.id, { isEnabled: !user.isEnabled });
            setUsers(users.map(u => u.id === updated.id ? updated : u));
            addToast(`User ${updated.isEnabled ? 'enabled' : 'disabled'}`, 'success');
        } catch (e) {
            addToast('Failed to update user status', 'error');
        }
    }
    
    const columns = [
        { header: 'Name', accessor: 'name' as keyof User },
        { header: 'Email', accessor: 'email' as keyof User },
        { header: 'Role', accessor: 'role' as keyof User },
        { header: 'Status', accessor: 'isEnabled' as keyof User, render: (item: User) => (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {item.isEnabled ? 'Active' : 'Disabled'}
            </span>
        )},
        { header: 'Actions', accessor: 'id' as keyof User, render: (item: User) => (
            <div className="flex space-x-2">
                <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(item)}>
                    {item.isEnabled ? <ToggleRight size={16} className="text-green-500" /> : <ToggleLeft size={16} className="text-gray-400" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleOpenModal(item)}><Edit size={16} /></Button>
            </div>
        )}
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">User Management</h1>
                <Button onClick={() => handleOpenModal()} leftIcon={<PlusCircle />}>Add User</Button>
            </div>
            <Card>
                {loading ? <p>Loading users...</p> : <Table columns={columns} data={users} />}
            </Card>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser?.id ? 'Edit User' : 'Add New User'}>
                <UserForm user={editingUser} onSave={handleSaveUser} onCancel={handleCloseModal} />
            </Modal>
        </div>
    );
};

export default Users;
