import { FaPlay, FaStop, FaRedo, FaPause, FaPlayCircle } from 'react-icons/fa';
import type { Container } from '../services/api';

interface ContainerCardProps {
    container: Container;
    onStart: (id: string) => void;
    onStop: (id: string) => void;
    onRestart: (id: string) => void;
    onPause: (id: string) => void;
    onResume: (id: string) => void;
    isLoading?: boolean;
}

const ContainerCard = ({
    container,
    onStart,
    onStop,
    onRestart,
    onPause,
    onResume,
    isLoading = false,
}: ContainerCardProps) => {
    const containerName = container.Names[0]?.replace(/^\//, '') || 'Unnamed';
    const isRunning = container.State === 'running';
    const isPaused = container.State === 'paused';
    const isExited = container.State === 'exited';

    const getStateColor = () => {
        switch (container.State) {
            case 'running':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'exited':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2 truncate" title={containerName}>
                    {containerName}
                </h3>
                <p className="text-sm text-gray-600 mb-2 truncate" title={container.Image}>
                    <span className="font-semibold">Image:</span> {container.Image}
                </p>
                <div className="flex items-center gap-2 mb-2">
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStateColor()}`}
                    >
                        {container.State.toUpperCase()}
                    </span>
                </div>
                <p className="text-xs text-gray-500">{container.Status}</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {/* Start Button */}
                <button
                    onClick={() => onStart(container.Id)}
                    disabled={isLoading || isRunning || isPaused}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${isRunning || isPaused
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                    title="Start container"
                >
                    <FaPlay className="text-xs" />
                    Start
                </button>

                {/* Stop Button */}
                <button
                    onClick={() => onStop(container.Id)}
                    disabled={isLoading || isExited}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${isExited
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                    title="Stop container"
                >
                    <FaStop className="text-xs" />
                    Stop
                </button>

                {/* Restart Button */}
                <button
                    onClick={() => onRestart(container.Id)}
                    disabled={isLoading || isExited}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${isExited
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    title="Restart container"
                >
                    <FaRedo className="text-xs" />
                    Restart
                </button>

                {/* Pause Button */}
                <button
                    onClick={() => onPause(container.Id)}
                    disabled={isLoading || !isRunning}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${!isRunning
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                        }`}
                    title="Pause container"
                >
                    <FaPause className="text-xs" />
                    Pause
                </button>

                {/* Resume Button */}
                <button
                    onClick={() => onResume(container.Id)}
                    disabled={isLoading || !isPaused}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${!isPaused
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-500 text-white hover:bg-purple-600'
                        }`}
                    title="Resume container"
                >
                    <FaPlayCircle className="text-xs" />
                    Resume
                </button>
            </div>

            <div className="mt-3 text-xs text-gray-400 truncate" title={container.Id}>
                ID: {container.Id.substring(0, 12)}
            </div>
        </div>
    );
};

export default ContainerCard;
