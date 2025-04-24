import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Rewind, FastForward, Maximize, PictureInPicture } from 'lucide-react';

const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPiPSupported, setIsPiPSupported] = useState(false);
    const [isInPiPMode, setIsInPiPMode] = useState(false);

    useEffect(() => {

        const video = videoRef.current;
        if (!video) return
        // Set up event listeners for the video
        // console.log("duration: ", video.duration)
        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleLoadedMetadata = () => setDuration(video.duration);

        setIsPiPSupported(
            document.pictureInPictureEnabled &&
            !video.disablePictureInPicture
        );
        // Set up PiP event listeners
        const handleEnterPiP = () => setIsInPiPMode(true);
        const handleExitPiP = () => setIsInPiPMode(false);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('enterpictureinpicture', handleEnterPiP);
        video.addEventListener('leavepictureinpicture', handleExitPiP);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('enterpictureinpicture', handleEnterPiP);
            video.removeEventListener('leavepictureinpicture', handleExitPiP);
        };
    }, []);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return
        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time: any) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current) return;
        const progressBar = progressRef.current;
        const position = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
        videoRef.current!.currentTime = position * duration;
    };

    const handleForward = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
    };

    const handleRewind = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    };

    const togglePictureInPicture = async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else if (videoRef.current) {
                await videoRef.current.requestPictureInPicture();
            }
        } catch (error) {
            console.error('Failed to toggle Picture-in-Picture mode:', error);
        }
    };

    return (
        <div className="video-container relative">
            <video
                ref={videoRef}
                src={videoUrl}
                className="w-full aspect-video"
                controls={false}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            <div className="video-controls absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 flex flex-col">
                {/* Progress bar */}
                <div
                    ref={progressRef}
                    className="progress-bar h-2 bg-gray-500 w-full cursor-pointer mb-2"
                    onClick={handleProgressClick}
                >
                    <div
                        className="progress-filled bg-red-500 h-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <button onClick={handleRewind} className="mr-2 text-white p-1">
                            <Rewind size={20} />
                        </button>

                        <button onClick={togglePlay} className="mr-2 text-white p-1">
                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                        </button>

                        <button onClick={handleForward} className="text-white p-1">
                            <FastForward size={20} />
                        </button>
                    </div>

                    <div className="time-display text-white text-sm">
                        {formatTime(currentTime)}
                    </div>
                    {/* <div className="time-display text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div> */}

                    <div className="flex items-center">
                        {isPiPSupported && (
                            <button
                                onClick={togglePictureInPicture}
                                className={`text-white p-1 mr-2 ${isInPiPMode ? 'text-blue-400' : ''}`}
                                title="Picture-in-Picture"
                            >
                                <PictureInPicture size={20} />
                            </button>
                        )}

                        <button
                            onClick={() => videoRef.current?.requestFullscreen()}
                            className="text-white p-1"
                            title="Fullscreen"
                        >
                            <Maximize size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;