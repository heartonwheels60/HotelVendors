import React from 'react';
import { DashboardMetrics } from '../components/DashboardMetrics';
import { RecentActivity } from '../components/RecentActivity';
import { Layout } from '../components/layout/Layout';

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <DashboardMetrics />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
        </div>
      </div>
    </Layout>
  );
};

// Make sure we're exporting the component as default
export default Dashboard;
