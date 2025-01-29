import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { staffService } from '../services/staffService';
import type { Staff } from '../types/staff';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  parseISO,
  isSameDay
} from 'date-fns';

// Helper to convert time string to minutes since midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper to convert minutes to time string
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Color mapping for roles
const roleColors: Record<string, string> = {
  manager: 'bg-purple-100 border-purple-200',
  receptionist: 'bg-blue-100 border-blue-200',
  housekeeper: 'bg-green-100 border-green-200',
  maintenance: 'bg-orange-100 border-orange-200',
  security: 'bg-red-100 border-red-200',
  chef: 'bg-yellow-100 border-yellow-200',
  waiter: 'bg-pink-100 border-pink-200'
};

interface ShiftBlock {
  staff: Staff;
  startMinutes: number;
  endMinutes: number;
}

export const StaffSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Calculate week dates
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  useEffect(() => {
    const loadStaffMembers = async () => {
      try {
        setIsLoading(true);
        const data = await staffService.getStaffMembers();
        setStaffMembers(data.filter(staff => staff.status === 'active'));
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

  const getShiftsForDay = (date: Date): ShiftBlock[] => {
    const shifts: ShiftBlock[] = [];
    const dayName = format(date, 'EEEE').toLowerCase();

    staffMembers.forEach(staff => {
      if (selectedRole !== 'all' && staff.role !== selectedRole) return;
      
      const daySchedule = staff.schedule?.[dayName];
      if (daySchedule?.start && daySchedule?.end) {
        shifts.push({
          staff,
          startMinutes: timeToMinutes(daySchedule.start),
          endMinutes: timeToMinutes(daySchedule.end)
        });
      }
    });

    return shifts.sort((a, b) => a.startMinutes - b.startMinutes);
  };

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
          <h1 className="text-2xl font-semibold text-gray-900">Staff Schedule</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage staff shifts for the week
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
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
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </span>
            <button
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-800 p-4 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weekDays.map((day) => (
            <div key={day.toString()} className="bg-white p-4">
              <div className="text-sm font-medium text-gray-900">
                {format(day, 'EEEE')}
              </div>
              <div className="text-sm text-gray-500">
                {format(day, 'MMM d')}
              </div>
              <div className="mt-2 space-y-1 min-h-[600px]">
                {getShiftsForDay(day).map((shift, index) => (
                  <div
                    key={`${shift.staff.id}-${index}`}
                    className={`p-2 rounded-md border text-sm ${roleColors[shift.staff.role]} relative`}
                    style={{
                      position: 'absolute',
                      top: `${(shift.startMinutes / 1440) * 600}px`,
                      height: `${((shift.endMinutes - shift.startMinutes) / 1440) * 600}px`,
                      width: 'calc(100% - 1rem)',
                      marginLeft: '0.5rem'
                    }}
                  >
                    <div className="font-medium">{shift.staff.firstName} {shift.staff.lastName}</div>
                    <div className="text-xs">
                      {minutesToTime(shift.startMinutes)} - {minutesToTime(shift.endMinutes)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
