import React from 'react';
import { DashboardMetrics } from '../components/DashboardMetrics';
import { RecentActivity } from '../components/RecentActivity';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <DashboardMetrics />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
      </div>
    </div>
  );
};

// Make sure we're exporting the component as default
export default Dashboard;
