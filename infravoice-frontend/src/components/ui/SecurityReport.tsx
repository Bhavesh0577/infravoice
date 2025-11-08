'use client';

import { SecurityScanResponse, SecurityIssue } from '@/services/securityService';
import Badge from './Badge';
import ProgressBar from './ProgressBar';
import { clsx } from 'clsx';
import { useState } from 'react';

interface SecurityReportProps {
  scanResult: SecurityScanResponse;
  className?: string;
}

export default function SecurityReport({ scanResult, className }: SecurityReportProps) {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const severityColors = {
    CRITICAL: 'danger',
    HIGH: 'warning',
    MEDIUM: 'info',
    LOW: 'default',
  };

  const filteredIssues =
    filterSeverity === 'all'
      ? scanResult.issues
      : scanResult.issues.filter((issue) => issue.severity === filterSeverity);

  const getScoreVariant = (score: number): 'success' | 'warning' | 'danger' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className={clsx('bg-white rounded-xl border-2 border-gray-200 p-6 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Security Scan Report</h3>
          <p className="text-sm text-gray-500 mt-1">
            Generated on {new Date(scanResult.created_at).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">{scanResult.security_score}</div>
          <div className="text-sm text-gray-500">Security Score</div>
        </div>
      </div>

      {/* Score visualization */}
      <div>
        <ProgressBar
          value={scanResult.security_score}
          max={100}
          variant={getScoreVariant(scanResult.security_score)}
          size="lg"
          showLabel
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-700">{scanResult.passed_checks}</div>
          <div className="text-sm text-green-600">Passed Checks</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="text-2xl font-bold text-red-700">{scanResult.failed_checks}</div>
          <div className="text-sm text-red-600">Failed Checks</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-2xl font-bold text-purple-700">{scanResult.critical_issues}</div>
          <div className="text-sm text-purple-600">Critical Issues</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-700">{scanResult.high_issues}</div>
          <div className="text-sm text-yellow-600">High Issues</div>
        </div>
      </div>

      {/* Severity filter */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Filter by severity:</span>
        <div className="flex gap-2">
          {['all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((severity) => (
            <button
              key={severity}
              onClick={() => setFilterSeverity(severity)}
              className={clsx(
                'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                filterSeverity === severity
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {severity}
            </button>
          ))}
        </div>
      </div>

      {/* Issues list */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">
          Issues Found ({filteredIssues.length})
        </h4>

        {filteredIssues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>No issues found for this filter</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredIssues.map((issue, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
              >
                <button
                  onClick={() => setExpandedIssue(expandedIssue === issue.check_id ? null : issue.check_id)}
                  className="w-full px-4 py-3 flex items-start justify-between bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-3 flex-1 text-left">
                    <Badge
                      variant={severityColors[issue.severity as keyof typeof severityColors] as any}
                      size="sm"
                    >
                      {issue.severity}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{issue.title}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {issue.resource} • {issue.file_path}
                        {issue.line_number && ` (Line ${issue.line_number})`}
                      </div>
                    </div>
                  </div>
                  <svg
                    className={clsx(
                      'w-5 h-5 text-gray-400 transition-transform',
                      expandedIssue === issue.check_id && 'transform rotate-180'
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedIssue === issue.check_id && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
                        <div className="text-sm text-gray-600">{issue.description}</div>
                      </div>
                      {issue.guideline && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Remediation</div>
                          <div className="text-sm text-gray-600">{issue.guideline}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Check ID</div>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{issue.check_id}</code>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message */}
      {scanResult.message && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">{scanResult.message}</p>
        </div>
      )}
    </div>
  );
}
