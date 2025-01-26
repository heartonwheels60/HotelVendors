import React from 'react';
import { Calendar, Star, XCircle } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'booking',
    title: 'New Booking',
    description: 'John Doe booked Deluxe Room for Mar 15-18',
    time: '2 hours ago',
    icon: <Calendar className="text-green-500" size={20} />,
  },
  {
    id: 2,
    type: 'review',
    title: 'New Review',
    description: 'Sarah Smith left a 5-star review',
    time: '4 hours ago',
    icon: <Star className="text-yellow-500" size={20} />,
  },
  {
    id: 3,
    type: 'cancellation',
    title: 'Booking Cancelled',
    description: 'Mike Johnson cancelled reservation #1234',
    time: '6 hours ago',
    icon: <XCircle className="text-red-500" size={20} />,
  },
];

export const RecentActivity: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4">
            <div className="p-2 bg-gray-50 rounded-lg">
              {activity.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{activity.title}</h3>
              <p className="text-sm text-gray-500">{activity.description}</p>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};