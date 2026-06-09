import MaintenancePage from '@/components/MaintenancePage';

export const metadata = {
  title: 'Maintenance — site99',
  robots: { index: false, follow: false },
};

export default function MaintenanceRoute() {
  return <MaintenancePage />;
}
