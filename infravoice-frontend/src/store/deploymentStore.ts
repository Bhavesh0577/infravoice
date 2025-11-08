import { create } from 'zustand';
import { Deployment } from '@/services/deploymentService';

interface DeploymentState {
  deployments: Deployment[];
  currentDeployment: Deployment | null;
  setDeployments: (deployments: Deployment[]) => void;
  setCurrentDeployment: (deployment: Deployment | null) => void;
  addDeployment: (deployment: Deployment) => void;
  updateDeployment: (id: string, updates: Partial<Deployment>) => void;
}

export const useDeploymentStore = create<DeploymentState>((set) => ({
  deployments: [],
  currentDeployment: null,

  setDeployments: (deployments) => set({ deployments }),

  setCurrentDeployment: (deployment) => set({ currentDeployment: deployment }),

  addDeployment: (deployment) =>
    set((state) => ({
      deployments: [deployment, ...state.deployments],
    })),

  updateDeployment: (id, updates) =>
    set((state) => ({
      deployments: state.deployments.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
      currentDeployment:
        state.currentDeployment?.id === id
          ? { ...state.currentDeployment, ...updates }
          : state.currentDeployment,
    })),
}));
