import api from './api';

export interface SecurityIssue {
  check_id: string;
  severity: string;
  title: string;
  description: string;
  resource: string;
  file_path: string;
  line_number?: number;
  guideline?: string;
}

export interface SecurityScanResponse {
  id: string;
  deployment_id?: string;
  security_score: number;
  passed_checks: number;
  failed_checks: number;
  critical_issues: number;
  high_issues: number;
  medium_issues: number;
  low_issues: number;
  issues: SecurityIssue[];
  created_at: string;
  message: string;
}

const securityService = {
  async scan(code: string, deploymentId?: string): Promise<SecurityScanResponse> {
    const response = await api.post<SecurityScanResponse>('/api/v1/security/scan', {
      terraform_code: code,
      deployment_id: deploymentId,
    });
    return response.data;
  },

  async get(scanId: string): Promise<SecurityScanResponse> {
    const response = await api.get<SecurityScanResponse>(`/api/v1/security/${scanId}`);
    return response.data;
  },
};

export default securityService;
