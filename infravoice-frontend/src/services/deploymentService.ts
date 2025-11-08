import api from './api';

export interface Deployment {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cloud_provider: 'aws' | 'gcp' | 'azure';
  region: string;
  terraform_code?: string;
  status: string;
  error_message?: string;
  resources?: string[];
  created_at: string;
  updated_at: string;
  deployed_at?: string;
  destroyed_at?: string;
}

export interface DeploymentStats {
  total_deployments: number;
  active_deployments: number;
  failed_deployments: number;
  total_cost: number;
  success_rate: number;
}

const deploymentService = {
  async list(params?: { skip?: number; limit?: number; status?: string; cloud_provider?: string }) {
    const response = await api.get<Deployment[]>('/api/v1/deployment/', { params });
    return response.data;
  },

  async get(id: string): Promise<Deployment> {
    const response = await api.get<Deployment>(`/api/v1/deployment/${id}`);
    return response.data;
  },

  async getStats(): Promise<DeploymentStats> {
    const response = await api.get<DeploymentStats>('/api/v1/deployment/stats');
    return response.data;
  },

  async deploy(id: string) {
    const response = await api.post(`/api/v1/deployment/${id}/deploy`);
    return response.data;
  },

  async destroy(id: string) {
    const response = await api.delete(`/api/v1/deployment/${id}`);
    return response.data;
  },
};

export default deploymentService;
