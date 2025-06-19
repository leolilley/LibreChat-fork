import { useGetStartupConfig } from '~/data-provider';
import DemoChatView from './DemoChatView';

export default function DemoWrapper() {
  const { data: config, isLoading } = useGetStartupConfig();

  // Show loading while config is being fetched
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // If demo mode is disabled, show a message
  if (config && !config.interface?.demoMode) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">Demo mode is not enabled</div>
        </div>
      </div>
    );
  }

  // Only render demo view if demo mode is enabled
  return <DemoChatView />;
}
