'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import deploymentService, { DeploymentStats } from '@/services/deploymentService';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DeploymentStats | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const statsData = await deploymentService.getStats();
        setStats(statsData);

        // Show onboarding for new users (no deployments)
        if (statsData.total_deployments === 0) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const onboardingSteps = [
    {
      title: 'Welcome to InfraVoice! 🎉',
      description: 'Transform your infrastructure management with voice-powered deployments.',
      icon: '👋',
    },
    {
      title: 'Step 1: Create Your First Deployment',
      description: 'Use voice or text to describe the infrastructure you want to build. Our AI will generate Terraform code for you.',
      icon: '🎤',
    },
    {
      title: 'Step 2: Review & Security Scan',
      description: 'Review the generated code, check security vulnerabilities, and estimate costs before deploying.',
      icon: '🔍',
    },
    {
      title: 'Step 3: Deploy with Confidence',
      description: 'Deploy your infrastructure to AWS, GCP, or Azure with a single click. Track all deployments in one place.',
      icon: '🚀',
    },
  ];

  const handleStartDeployment = () => {
    setShowOnboarding(false);
    router.push('/deploy');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Onboarding Tour Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">{onboardingSteps[onboardingStep].icon}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {onboardingSteps[onboardingStep].title}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {onboardingSteps[onboardingStep].description}
              </p>

              {/* Progress dots */}
              <div className="flex justify-center space-x-2 mb-8">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === onboardingStep ? 'bg-teal-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowOnboarding(false)}
                  className="text-gray-500 hover:text-gray-700 px-4 py-2"
                >
                  Skip Tour
                </button>

                <div className="flex gap-4">
                  {onboardingStep > 0 && (
                    <Button
                      onClick={() => setOnboardingStep(onboardingStep - 1)}
                      variant="outline"
                    >
                      Previous
                    </Button>
                  )}

                  {onboardingStep < onboardingSteps.length - 1 ? (
                    <Button
                      onClick={() => setOnboardingStep(onboardingStep + 1)}
                      variant="primary"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button onClick={handleStartDeployment} variant="primary">
                      Start First Deployment
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-500 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.username || 'User'}! 👋
            </h1>
            <p className="text-teal-100 text-lg">
              {stats?.total_deployments === 0
                ? "Ready to create your first deployment?"
                : `You have ${stats?.active_deployments || 0} active deployment${stats?.active_deployments !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link href="/deploy">
            <Button variant="primary" size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Deployment
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Deployments</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.total_deployments || 0}</p>
            </div>
            <div className="bg-teal-100 rounded-full p-3">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <p className="text-3xl font-bold text-green-600">{stats?.active_deployments || 0}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.success_rate.toFixed(1) || 0}%</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Cost</p>
              <p className="text-3xl font-bold text-purple-600">${stats?.total_cost.toFixed(2) || 0}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/deploy">
            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start space-x-4">
                <div className="bg-teal-600 rounded-lg p-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Voice Deployment</h3>
                  <p className="text-sm text-gray-700">Speak your infrastructure needs and deploy in minutes</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/deployments">
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start space-x-4">
                <div className="bg-indigo-600 rounded-lg p-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">View Deployments</h3>
                  <p className="text-sm text-gray-700">Manage and monitor all your infrastructure deployments</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/settings">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-600 rounded-lg p-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Settings</h3>
                  <p className="text-sm text-gray-700">Manage API keys, preferences, and account settings</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Getting Started (for new users) */}
      {stats && stats.total_deployments === 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-teal-100 rounded-full p-2 mt-1">
                <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">1. Create your first deployment</h3>
                <p className="text-gray-600">Use voice or text to describe the infrastructure you need. Our AI will generate production-ready Terraform code.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 rounded-full p-2 mt-1">
                <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">2. Review security and costs</h3>
                <p className="text-gray-600">Automatically scan for security vulnerabilities and get accurate cost estimates before deploying.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 rounded-full p-2 mt-1">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">3. Deploy to the cloud</h3>
                <p className="text-gray-600">Deploy your infrastructure to AWS, GCP, or Azure with a single click and track everything in your dashboard.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Button onClick={handleStartDeployment} variant="primary" size="lg">
              Create First Deployment
            </Button>
            <Button onClick={() => setShowOnboarding(true)} variant="outline" size="lg">
              Take Tour Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
