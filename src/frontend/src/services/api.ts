import axios from 'axios';

const API_BASE_URL = '';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Container {
    Id: string;
    Names: string[];
    Image: string;
    State: string;
    Status: string;
    Labels?: Record<string, any>;
}

export interface ContainerActionResponse {
    status: string;
    container_id: string;
}

export const containerApi = {
    // Get all containers
    listContainers: async (): Promise<Container[]> => {
        const response = await api.get<Container[]>('/api/containers');
        return response.data;
    },

    // Start a container
    startContainer: async (containerId: string): Promise<ContainerActionResponse> => {
        const response = await api.post<ContainerActionResponse>(`/api/start/${containerId}`);
        return response.data;
    },

    // Stop a container
    stopContainer: async (containerId: string): Promise<ContainerActionResponse> => {
        const response = await api.post<ContainerActionResponse>(`/api/stop/${containerId}`);
        return response.data;
    },

    // Restart a container
    restartContainer: async (containerId: string): Promise<ContainerActionResponse> => {
        const response = await api.post<ContainerActionResponse>(`/api/restart/${containerId}`);
        return response.data;
    },

    // Pause a container
    pauseContainer: async (containerId: string): Promise<ContainerActionResponse> => {
        const response = await api.post<ContainerActionResponse>(`/api/pause/${containerId}`);
        return response.data;
    },

    // Resume (unpause) a container
    resumeContainer: async (containerId: string): Promise<ContainerActionResponse> => {
        const response = await api.post<ContainerActionResponse>(`/api/resume/${containerId}`);
        return response.data;
    },
};

export default api;
