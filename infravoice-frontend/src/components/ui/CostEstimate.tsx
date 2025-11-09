'use client';

import { CostEstimateResponse } from '@/services/costService';
import { Badge } from './Badge';
import { clsx } from 'clsx';

interface CostEstimateProps {
  estimate: CostEstimateResponse;
  className?: string;
}

export default function CostEstimate({ estimate, className }: CostEstimateProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getCostColor = (cost: number): string => {
    if (cost < 100) return 'text-green-600';
    if (cost < 500) return 'text-yellow-600';
    if (cost < 1000) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className={clsx('bg-white rounded-xl border-2 border-gray-200 p-6 space-y-6', className)}>
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">Cost Estimate</h3>
        <p className="text-sm text-gray-500 mt-1">
          Generated on {new Date(estimate.created_at).toLocaleString()}
        </p>
      </div>

      {/* Cost overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200">
          <div className="text-sm text-teal-700 mb-2">Monthly Cost</div>
          <div className={clsx('text-4xl font-bold', getCostColor(estimate.monthly_cost))}>
            {formatCurrency(estimate.monthly_cost)}
          </div>
          <div className="text-xs text-teal-600 mt-2">~${(estimate.monthly_cost / 30).toFixed(2)}/day</div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
          <div className="text-sm text-indigo-700 mb-2">Annual Cost</div>
          <div className={clsx('text-4xl font-bold', getCostColor(estimate.annual_cost))}>
            {formatCurrency(estimate.annual_cost)}
          </div>
          <div className="text-xs text-indigo-600 mt-2">
            Save {formatCurrency(estimate.monthly_cost * 12 - estimate.annual_cost)} vs. monthly billing
          </div>
        </div>
      </div>

      {/* Warning */}
      {estimate.warning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-yellow-800">{estimate.warning}</p>
          </div>
        </div>
      )}

      {/* Resource costs */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Resource Breakdown</h4>
        <div className="space-y-3">
          {estimate.resource_costs.map((resource, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div className="font-medium text-gray-900">{resource.name}</div>
                  <Badge variant="default">
                    {resource.type}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {resource.percentage.toFixed(1)}% of total cost
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{formatCurrency(resource.monthly_cost)}</div>
                <div className="text-xs text-gray-500">/month</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost optimization recommendations */}
      {estimate.recommendations && estimate.recommendations.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Cost Optimization Recommendations</h4>
          <div className="space-y-3">
            {estimate.recommendations.map((rec, index) => (
              <div
                key={index}
                className="border border-green-200 bg-green-50 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="font-medium text-green-900">{rec.title}</div>
                      <Badge
                        variant={rec.priority === 'high' ? 'secondary' : 'secondary'}
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-green-700">{rec.description}</p>
                  </div>
                  <div className="ml-4 text-right flex-shrink-0">
                    <div className="text-green-900 font-bold">
                      {formatCurrency(rec.potential_savings)}
                    </div>
                    <div className="text-xs text-green-600">potential savings</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Breakdown by service */}
      {estimate.breakdown && Object.keys(estimate.breakdown).length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Cost by Service</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(estimate.breakdown).map(([service, cost]) => (
              <div key={service} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">{service}</div>
                <div className="font-bold text-gray-900">{formatCurrency(cost as number)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message */}
      {estimate.message && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">{estimate.message}</p>
        </div>
      )}
    </div>
  );
}
