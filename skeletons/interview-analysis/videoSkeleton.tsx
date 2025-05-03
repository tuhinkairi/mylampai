import { Skeleton, SVGSkeleton } from "../SkeletonHook";

export const VideoSkeleton = () => (
  <>
    <div className="mt-2 p-0">
      <div className="relative">
        <div>
          <div className="video-container relative">
            <video className="w-full aspect-video"></video>
            <div className="absolute bottom-0 left-0 right-0 p-2 flex flex-col">
              <div className="h-2 w-full mb-2">
                <div className="h-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-2 p-1">
                    <SVGSkeleton className="w-[20px] h-[20px]" />
                  </div>
                  <div className="mr-2 p-1">
                    <SVGSkeleton className="w-[20px] h-[20px]" />
                  </div>
                  <div className="p-1">
                    <SVGSkeleton className="w-[20px] h-[20px]" />
                  </div>
                </div>
                <div className="time-display">
                  <Skeleton className="w-[32px] max-w-full" />
                </div>
                <div className="flex items-center">
                  <div className="p-1 mr-2">
                    <SVGSkeleton className="w-[20px] h-[20px]" />
                  </div>
                  <div className="p-1">
                    <SVGSkeleton className="w-[20px] h-[20px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);
