import api from './api';

export interface ResourceCost {
  name: string;
  type: string;
  monthly_cost: number;
  percentage: number;
}

export interface CostOptimization {
  title: string;
  description: string;
  potential_savings: number;
  priority: string;
}

export interface CostEstimateResponse {
  id: string;
  deployment_id?: string;
  monthly_cost: number;
  annual_cost: number;
  breakdown: Record<string, number>;
  resource_costs: ResourceCost[];
  recommendations: CostOptimization[];
  created_at: string;
  warning?: string;
  message: string;
}

const costService = {
  async estimate(code: string, deploymentId?: string): Promise<CostEstimateResponse> {
    const response = await api.post<CostEstimateResponse>('/api/v1/cost/estimate', {
      terraform_code: code,
      deployment_id: deploymentId,
    });
    return response.data;
  },

  async getDeploymentCost(deploymentId: string): Promise<CostEstimateResponse> {
    const response = await api.get<CostEstimateResponse>(`/api/v1/cost/${deploymentId}/cost`);
    return response.data;
  },
};

export default costService;
