'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import deploymentService, { Deployment } from '@/services/deploymentService';
import securityService, { SecurityScanResponse } from '@/services/securityService';
import costService, { CostEstimateResponse } from '@/services/costService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import CodeEditor from '@/components/ui/CodeEditor';
import SecurityReport from '@/components/ui/SecurityReport';
import CostEstimate from '@/components/ui/CostEstimate';

export default function DeploymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const deploymentId = params?.id as string;

  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [securityScan, setSecurityScan] = useState<SecurityScanResponse | null>(null);
  const [costEstimate, setCostEstimate] = useState<CostEstimateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (deploymentId) {
      loadDeployment();
    }
  }, [deploymentId]);

  const loadDeployment = async () => {
    try {
      const data = await deploymentService.get(deploymentId);
      setDeployment(data);

      // Load security scan and cost estimate
      // These might fail if not available, which is fine
      try {
        const cost = await costService.getDeploymentCost(deploymentId);
        setCostEstimate(cost);
      } catch (error) {
        console.log('No cost estimate available');
      }
    } catch (error) {
      console.error('Failed to load deployment:', error);
      alert('Failed to load deployment');
      router.push('/deployments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDestroy = async () => {
    if (!confirm('Are you sure you want to destroy this deployment?')) return;

    try {
      await deploymentService.destroy(deploymentId);
      router.push('/deployments');
    } catch (error) {
      console.error('Failed to destroy deployment:', error);
      alert('Failed to destroy deployment');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      deployed: 'default',
      deploying: 'secondary',
      failed: 'destructive',
      pending: 'secondary',
      destroyed: 'outline',
    };

    return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'code', label: 'Code', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> },
    { id: 'security', label: 'Security', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
    { id: 'cost', label: 'Cost', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deployment...</p>
        </div>
      </div>
    );
  }

  if (!deployment) {
    return null;
  }

  const codeFiles = [
    { name: 'main.tf', content: deployment.terraform_code || '// No code available', language: 'terraform' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-2">
            <Link href="/deployments">
              <Button variant="outline" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Button>
            </Link>
            {getStatusBadge(deployment.status)}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{deployment.name}</h1>
          {deployment.description && (
            <p className="text-lg text-gray-600">{deployment.description}</p>
          )}
        </div>

        <div className="flex gap-3">
          {deployment.status === 'deployed' && (
            <Button onClick={handleDestroy} variant="destructive">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Destroy
            </Button>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Cloud Provider</div>
            <div className="font-semibold text-gray-900 flex items-center">
              {deployment.cloud_provider === 'aws' && '🟠'}
              {deployment.cloud_provider === 'gcp' && '🔵'}
              {deployment.cloud_provider === 'azure' && '🔷'}
              <span className="ml-2">{deployment.cloud_provider.toUpperCase()}</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Region</div>
            <div className="font-semibold text-gray-900">{deployment.region}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Created</div>
            <div className="font-semibold text-gray-900">
              {new Date(deployment.created_at).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Last Updated</div>
            <div className="font-semibold text-gray-900">
              {new Date(deployment.updated_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {deployment.error_message && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-bold text-red-900 mb-1">Deployment Error</h3>
              <p className="text-red-700">{deployment.error_message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Resources */}
      {deployment.resources && deployment.resources.length > 0 && (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">Resources ({deployment.resources.length})</h3>
          <div className="flex flex-wrap gap-2">
            {deployment.resources.map((resource, idx) => (
              <Badge key={idx} variant="secondary">
                {resource}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 border-b">
            <TabsList className="w-full justify-start">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-0">
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Deployment Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-full p-2 mr-4">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Created</div>
                      <div className="text-sm text-gray-600">
                        {new Date(deployment.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {deployment.deployed_at && (
                    <div className="flex items-start">
                      <div className="bg-blue-100 rounded-full p-2 mr-4">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                          <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                          <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Deployed</div>
                        <div className="text-sm text-gray-600">
                          {new Date(deployment.deployed_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {deployment.destroyed_at && (
                    <div className="flex items-start">
                      <div className="bg-red-100 rounded-full p-2 mr-4">
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Destroyed</div>
                        <div className="text-sm text-gray-600">
                          {new Date(deployment.destroyed_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Code Tab */}
            <TabsContent value="code" className="mt-0">
              <CodeEditor files={codeFiles} readonly />
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-0">
              {securityScan ? (
                <SecurityReport scanResult={securityScan} />
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Security Scan Available</h3>
                  <p className="text-gray-600">Security scan data not found for this deployment.</p>
                </div>
              )}
            </TabsContent>

            {/* Cost Tab */}
            <TabsContent value="cost" className="mt-0">
              {costEstimate ? (
                <CostEstimate estimate={costEstimate} />
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Cost Estimate Available</h3>
                  <p className="text-gray-600">Cost estimation data not found for this deployment.</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
