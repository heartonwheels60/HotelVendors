import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Calendar,
  Mail,
  Phone,
  Clock,
  FileText,
  UserCheck,
  UserX
} from 'lucide-react';
import { staffService } from '../services/staffService';
import type { Staff, StaffRole } from '../types/staff';
import { format } from 'date-fns';

// Role badge component
const RoleBadge: React.FC<{ role: StaffRole }> = ({ role }) => {
  const colors: Record<StaffRole, { bg: string; text: string }> = {
    manager: { bg: 'bg-purple-100', text: 'text-purple-800' },
    receptionist: { bg: 'bg-blue-100', text: 'text-blue-800' },
    housekeeper: { bg: 'bg-green-100', text: 'text-green-800' },
    maintenance: { bg: 'bg-orange-100', text: 'text-orange-800' },
    security: { bg: 'bg-red-100', text: 'text-red-800' },
    chef: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    waiter: { bg: 'bg-pink-100', text: 'text-pink-800' }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role].bg} ${colors[role].text}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};

// Staff card component
const StaffCard: React.FC<{
  staff: Staff;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ staff, onEdit, onDelete }) => {
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {staff.firstName} {staff.lastName}
          </h3>
          <div className="mt-1 space-x-2">
            <RoleBadge role={staff.role} />
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              staff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {staff.status === 'active' ? <UserCheck className="w-3 h-3 mr-1" /> : <UserX className="w-3 h-3 mr-1" />}
              {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="h-4 w-4 mr-2" />
          <a href={`mailto:${staff.email}`} className="hover:text-blue-600">
            {staff.email}
          </a>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="h-4 w-4 mr-2" />
          <a href={`tel:${staff.phone}`} className="hover:text-blue-600">
            {staff.phone}
          </a>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          Started {format(staff.startDate, 'MMM d, yyyy')}
        </div>
      </div>

      {staff.schedule && (
        <div className="mt-4">
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="flex items-center text-sm text-gray-600 hover:text-blue-600"
          >
            <Clock className="h-4 w-4 mr-2" />
            {showSchedule ? 'Hide Schedule' : 'View Schedule'}
          </button>
          
          {showSchedule && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {Object.entries(staff.schedule).map(([day, hours]) => (
                hours?.start && hours?.end && (
                  <div key={day} className="text-sm">
                    <span className="font-medium">{day.charAt(0).toUpperCase() + day.slice(1)}: </span>
                    <span className="text-gray-600">
                      {hours.start} - {hours.end}
                    </span>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}

      {staff.documents && staff.documents.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center text-sm text-gray-600">
            <FileText className="h-4 w-4 mr-2" />
            {staff.documents.length} Document{staff.documents.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export const StaffPage: React.FC = () => {
  const navigate = useNavigate();
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<StaffRole | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const loadStaffMembers = async () => {
      try {
        setIsLoading(true);
        const data = await staffService.getStaffMembers();
        setStaffMembers(data);
        setError(null);
      } catch (err) {
        console.error('Error loading staff members:', err);
        setError('Failed to load staff members');
      } finally {
        setIsLoading(false);
      }
    };

    loadStaffMembers();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await staffService.deleteStaffMember(id);
        setStaffMembers(prev => prev.filter(staff => staff.id !== id));
      } catch (err) {
        console.error('Error deleting staff member:', err);
        setError('Failed to delete staff member');
      }
    }
  };

  const filteredStaff = staffMembers.filter(staff => {
    const roleMatch = selectedRole === 'all' || staff.role === selectedRole;
    const statusMatch = selectedStatus === 'all' || staff.status === selectedStatus;
    return roleMatch && statusMatch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Staff Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your property staff members and their schedules
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/staff/schedule')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Calendar className="h-4 w-4 mr-2" />
            View Schedule
          </button>
          <button
            onClick={() => navigate('/staff/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Staff Member
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-800 p-4 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as StaffRole | 'all')}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="manager">Manager</option>
          <option value="receptionist">Receptionist</option>
          <option value="housekeeper">Housekeeper</option>
          <option value="maintenance">Maintenance</option>
          <option value="security">Security</option>
          <option value="chef">Chef</option>
          <option value="waiter">Waiter</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'inactive')}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Staff list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map(staff => (
          <StaffCard
            key={staff.id}
            staff={staff}
            onEdit={() => navigate(`/staff/edit/${staff.id}`)}
            onDelete={() => handleDelete(staff.id)}
          />
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No staff members found matching the selected filters.</p>
        </div>
      )}
    </div>
  );
};
