'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import deploymentService, { DeploymentStats } from '@/services/deploymentService';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DeploymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await deploymentService.getStats();
        setStats(s);
        if (s.total_deployments === 0) setShowTour(true);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const tour = [
    {
      title: 'InfraVoice Overview',
      body: 'Describe infrastructure, get Terraform, validate, and deploy confidently.'
    },
    {
      title: 'Create Deployment',
      body: 'Start from voice or text. We synthesize declarative Terraform modules.'
    },
    {
      title: 'Review & Scan',
      body: 'Automatic policy, security, and cost checks before apply.'
    },
    {
      title: 'Deploy & Track',
      body: 'Apply to AWS, GCP, or Azure and observe status centrally.'
    }
  ];

  const handleStart = () => {
    setShowTour(false);
    router.push('/deploy');
  };

  const metricValue = (v: number | undefined, formatter?: (n: number) => string) =>
    v === undefined ? '—' : formatter ? formatter(v) : String(v);

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-8">
        <div className="h-24 bg-white/60 border border-gray-200 rounded-xl shadow-sm backdrop-blur-sm flex items-center px-6">
          <div className="h-10 w-48 rounded bg-gray-100 animate-pulse" />
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
              </Card>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Compact Tour Overlay */}
      {showTour && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-200 shadow-xl p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight text-gray-900">{tour[tourStep].title}</h2>
              <p className="text-sm leading-relaxed text-gray-600">{tour[tourStep].body}</p>
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowTour(false)}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip
              </button>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {tour.map((_, i) => (
                    <span
                      key={i}
                      className={`h-2 w-2 rounded-full ${
                        i === tourStep ? 'bg-gray-800' : 'bg-gray-300'
                      } transition-colors`}
                    />
                  ))}
                </div>
                {tourStep < tour.length - 1 && (
                  <Button variant="outline" onClick={() => setTourStep(tourStep + 1)}>
                    Next
                  </Button>
                )}
                {tourStep === tour.length - 1 && (
                  <Button variant="default" onClick={handleStart}>
                    Start
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <Card className="border border-gray-200 rounded-xl shadow-sm bg-white p-7">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gray-900 text-white flex items-center justify-center text-sm font-semibold">
              {user?.username?.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                {user?.username ? `Welcome back, ${user.username}` : 'Welcome'}
              </h1>
              <p className="text-sm text-gray-600">
                {stats?.total_deployments === 0
                  ? 'You have no deployments yet. Start your first.'
                  : `Active deployments: ${stats?.active_deployments || 0}`}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/deploy">
              <Button variant="default" className="font-medium">
                New Deployment
              </Button>
            </Link>
            <Link href="/deployments">
              <Button variant="outline" className="font-medium">
                View All
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Metrics */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Total Deployments"
          value={metricValue(stats?.total_deployments)}
          icon={
            <IconCircle>
              <span className="text-xs font-medium">TD</span>
            </IconCircle>
          }
        />
        <Metric
          label="Active"
          value={metricValue(stats?.active_deployments)}
          icon={
            <IconCircle>
              <span className="text-xs font-medium">A</span>
            </IconCircle>
          }
        />
        <Metric
          label="Success Rate"
          value={`${metricValue(stats?.success_rate, n => n.toFixed(1))}%`}
          icon={
            <IconCircle>
              <span className="text-xs font-medium">SR</span>
            </IconCircle>
          }
        />
        <Metric
          label="Total Cost"
          value={`$${metricValue(stats?.total_cost, n => n.toFixed(2))}`}
          icon={
            <IconCircle>
              <span className="text-xs font-medium">$</span>
            </IconCircle>
          }
        />
      </div>

      {/* Layout Split */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Recent / Empty State */}
        <div className="space-y-8 lg:col-span-2">
          {stats && stats.total_deployments === 0 && (
            <Card className="border border-gray-200 rounded-xl p-7 shadow-sm bg-white">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                  Getting Started
                </h2>
                <ul className="space-y-3">
                  <Step index={1} text="Describe desired infrastructure with voice or text." />
                  <Step index={2} text="Review generated Terraform, policy, security, and cost." />
                  <Step index={3} text="Deploy to selected cloud and track lifecycle." />
                </ul>
                <div className="flex gap-3 pt-2">
                  <Button variant="default" onClick={handleStart}>
                    Create Deployment
                  </Button>
                  <Button variant="outline" onClick={() => setShowTour(true)}>
                    Product Tour
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {stats && stats.total_deployments > 0 && (
            <Card className="border border-gray-200 rounded-xl p-7 shadow-sm bg-white">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
                Overview
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed">
                Infrastructure deployment activity summary and status monitoring will appear here. Extend this section with charts, timelines, and policy insights.
              </div>
            </Card>
          )}
        </div>

        {/* Right: Actions */}
        <div className="space-y-8">
          <Card className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 tracking-wide">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <QuickLink href="/deploy" label="New Deployment" description="Voice or text initiated provisioning" />
              <QuickLink href="/deployments" label="Deployments" description="Track states and revisions" />
              <QuickLink href="/settings" label="Settings" description="Manage keys, policies, preferences" />
            </div>
          </Card>
          <Card className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 tracking-wide">
              Environment Health
            </h3>
            <div className="space-y-3 text-sm">
              <HealthRow label="Drift Detection" value="Enabled" />
              <HealthRow label="Policy Checks" value="Configured" />
              <HealthRow label="Cost Guardrails" value="Active" />
              <HealthRow label="Security Scans" value="Scheduled" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* Reusable components */

function Metric({
  label,
  value,
  icon
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="group border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 tabular-nums">{value}</p>
        </div>
        {icon}
      </div>
    </Card>
  );
}

function IconCircle({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 shadow-inner">
      {children}
    </div>
  );
}

function Step({ index, text }: { index: number; text: string }) {
  return (
    <li className="flex gap-4">
      <div className="h-7 w-7 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
        {index}
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
    </li>
  );
}

function QuickLink({
  href,
  label,
  description
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-transparent px-3 py-3 hover:border-gray-300 hover:bg-gray-50 transition-colors"
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <span className="text-xs text-gray-600">{description}</span>
      </div>
    </Link>
  );
}

function HealthRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600">{label}</span>
      <span className="text-xs font-medium text-gray-800">{value}</span>
    </div>
  );
}
