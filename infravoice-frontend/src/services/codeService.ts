import api from './api';

export interface CodeGenerationRequest {
  description: string;
  cloud_provider: 'aws' | 'gcp' | 'azure';
  region: string;
}

export interface CodeGenerationResponse {
  deployment_id: string;
  main_tf: string;
  variables_tf: string;
  outputs_tf: string;
  resources: string[];
  message: string;
}

const codeService = {
  async generate(data: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    const response = await api.post<CodeGenerationResponse>('/api/v1/code/generate', data);
    return response.data;
  },

  async get(id: string) {
    const response = await api.get(`/api/v1/code/${id}`);
    return response.data;
  },

  async update(id: string, code: string) {
    const response = await api.put(`/api/v1/code/${id}`, {
      terraform_code: code,
    });
    return response.data;
  },
};

export default codeService;
