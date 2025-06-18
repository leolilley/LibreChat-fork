import React, { useState } from 'react';
import {
  Settings,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Trash2,
  TestTube,
  Plug,
} from 'lucide-react';
import { Button } from '~/components';
import { useLocalize } from '~/hooks';

interface Integration {
  id: string;
  service: string;
  name: string;
  description?: string;
  status: 'connected' | 'disconnected' | 'error' | 'expired';
  lastUsed?: string;
}

export default function IntegrationsPanel() {
  const localize = useLocalize();
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Mock data for now - will be replaced with real API calls
  const integrations: Integration[] = [
    {
      id: '1',
      service: 'google',
      name: 'Google Workspace',
      description: 'Gmail, Sheets, Drive access',
      status: 'connected',
      lastUsed: '2024-01-15',
    },
    {
      id: '2',
      service: 'slack',
      name: 'Slack',
      description: 'Team communication',
      status: 'error',
      lastUsed: '2024-01-10',
    },
  ];

  const handleDeleteIntegration = (service: string) => {
    if (confirm(`Are you sure you want to disconnect the ${service} integration?`)) {
      // TODO: Implement actual deletion
      console.log('Delete integration:', service);
    }
  };

  const handleTestIntegration = (service: string) => {
    // TODO: Implement actual testing
    console.log('Test integration:', service);
  };

  const handleAddIntegration = () => {
    // TODO: Implement OAuth flow
    console.log('Add integration');
    setShowAddDialog(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'expired':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const connectedIntegrations = integrations.filter((int) => int.status === 'connected');
  const problemIntegrations = integrations.filter(
    (int) => int.status === 'error' || int.status === 'expired',
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-light p-4">
        <div className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-text-primary" />
          <h2 className="font-semibold text-text-primary">Integrations</h2>
        </div>
        <Button size="sm" onClick={handleAddIntegration} className="gap-1">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border-light bg-surface-secondary p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Connected</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xl font-semibold text-text-primary">
              {connectedIntegrations.length}
            </p>
          </div>
          <div className="rounded-lg border border-border-light bg-surface-secondary p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Issues</span>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-xl font-semibold text-text-primary">{problemIntegrations.length}</p>
          </div>
        </div>

        {/* Connected Integrations */}
        {connectedIntegrations.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-text-primary">Connected Services</h3>
            <div className="space-y-2">
              {connectedIntegrations.map((integration: Integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between rounded-lg border border-border-light bg-surface-secondary p-3"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(integration.status)}
                    <div>
                      <p className="font-medium text-text-primary">{integration.name}</p>
                      <p className="text-xs text-text-secondary">
                        Last used:{' '}
                        {integration.lastUsed
                          ? new Date(integration.lastUsed).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTestIntegration(integration.service)}
                      className="h-8 w-8 p-0"
                      title="Test connection"
                    >
                      <TestTube className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteIntegration(integration.service)}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      title="Disconnect"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Problem Integrations */}
        {problemIntegrations.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-text-primary">Needs Attention</h3>
            <div className="space-y-2">
              {problemIntegrations.map((integration: Integration) => (
                <div
                  key={integration.id}
                  className={`flex items-center justify-between rounded-lg border p-3 ${getStatusColor(integration.status)}`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(integration.status)}
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-xs">
                        {integration.status === 'expired' ? 'Token expired' : 'Connection error'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTestIntegration(integration.service)}
                      className="h-8 w-8 p-0"
                      title="Retry connection"
                    >
                      <TestTube className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteIntegration(integration.service)}
                      className="h-8 w-8 p-0"
                      title="Remove"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Services */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-text-primary">Available Services</h3>
          <div className="grid grid-cols-2 gap-2">
            {['Google', 'Slack', 'GitHub', 'Notion', 'Airtable', 'Trello'].map((service) => (
              <Button
                key={service}
                variant="outline"
                size="sm"
                onClick={handleAddIntegration}
                className="h-auto flex-col gap-1 p-3"
              >
                <div className="text-lg">🔗</div>
                <span className="text-xs">{service}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className="rounded-lg border border-border-light bg-surface-secondary p-4">
          <h4 className="mb-2 font-medium text-text-primary">About Integrations</h4>
          <p className="text-sm text-text-secondary">
            Connect your favorite services to enable powerful automations. Your credentials are
            encrypted and secure.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-auto p-0 text-xs"
            onClick={() => window.open('https://docs.librechat.ai/integrations', '_blank')}
          >
            Learn more <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Add Integration Dialog Placeholder */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">Add Integration</h3>
            <p className="mb-4 text-sm text-text-secondary">
              This feature is coming soon! You'll be able to connect your accounts via OAuth.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
