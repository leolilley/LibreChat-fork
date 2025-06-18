import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetStartupConfig } from '~/data-provider';
import DemoChatView from './DemoChatView';

export default function DemoWrapper() {
  const navigate = useNavigate();
  const { data: config, isLoading } = useGetStartupConfig();

  useEffect(() => {
    // If config is loaded and demo mode is disabled, redirect to home
    if (config && !config.interface?.demoMode) {
      navigate('/', { replace: true });
    }
  }, [config, navigate]);

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

  // If demo mode is disabled, don't render anything (redirect will happen)
  if (config && !config.interface?.demoMode) {
    return null;
  }

  // Only render demo view if demo mode is enabled
  return <DemoChatView />;
}
