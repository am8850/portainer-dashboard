import { useEffect, useState } from 'react';
import { type Container, containerApi } from '../services/api';
import ContainerCard from './ContainerCard';
import toast from 'react-hot-toast';
import { FaSync } from 'react-icons/fa';

const Dashboard = () => {
    const [containers, setContainers] = useState<Container[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchContainers = async () => {
        try {
            setLoading(true);
            const items = await containerApi.listContainers();
            const data = items.sort((a, b) => a.Names[0].localeCompare(b.Names[0]));
            // Remove the portainer container from the list
            const portainerContainerName = 'portainer';
            const filteredData = data.filter(
                (container) => !container.Names.includes(portainerContainerName)
            );
            setContainers(filteredData);
            toast.success('Containers loaded successfully');
        } catch (error) {
            console.error('Error fetching containers:', error);
            toast.error('Failed to load containers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContainers();
    }, []);

    const handleAction = async (
        action: (id: string) => Promise<any>,
        containerId: string,
        actionName: string
    ) => {
        try {
            setActionLoading(containerId);
            await action(containerId);
            toast.success(`Container ${actionName} successfully`);
            // Refresh container list after action
            await fetchContainers();
        } catch (error: any) {
            console.error(`Error ${actionName} container:`, error);
            toast.error(error.response?.data?.detail || `Failed to ${actionName} container`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleStart = (id: string) => handleAction(containerApi.startContainer, id, 'started');
    const handleStop = (id: string) => handleAction(containerApi.stopContainer, id, 'stopped');
    const handleRestart = (id: string) => handleAction(containerApi.restartContainer, id, 'restarted');
    const handlePause = (id: string) => handleAction(containerApi.pauseContainer, id, 'paused');
    const handleResume = (id: string) => handleAction(containerApi.resumeContainer, id, 'resumed');

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading containers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Portainer Container Dashboard</h1>
                        <p className="text-gray-600">Manage your Docker containers via Portainer</p>
                    </div>
                    <button
                        onClick={fetchContainers}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                    >
                        <FaSync className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>

                {containers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-gray-600 text-lg">No containers found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {containers.map((container) => (
                            <ContainerCard
                                key={container.Id}
                                container={container}
                                onStart={handleStart}
                                onStop={handleStop}
                                onRestart={handleRestart}
                                onPause={handlePause}
                                onResume={handleResume}
                                isLoading={actionLoading === container.Id}
                            />
                        ))}
                    </div>
                )}

                <div className="mt-8 text-center text-gray-500 text-sm">
                    Total Containers: {containers.length}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
