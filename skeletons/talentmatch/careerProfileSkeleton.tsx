import { Skeleton, SVGSkeleton } from "../SkeletonHook";

export const CareerProfileSkeleton = () => (
    <>
        <div className="border border-gray-200 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md">
            <div className="flex items-center gap-3">
                <div className="p-3">
                    <SVGSkeleton className="w-[24px] h-[24px]" />
                </div>
                <h2 className="tracking-tight">
                    <Skeleton className="w-[136px] max-w-full" />
                </h2>
            </div>
            <div className="space-y-2">
                <h3>
                    <Skeleton className="w-[80px] max-w-full" />
                </h3>
                <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center border transition-colors border-transparent px-3 py-1">
                        <Skeleton className="w-[40px] max-w-full" />
                    </div>
                    <div className="inline-flex items-center border transition-colors border-transparent px-3 py-1">
                        <Skeleton className="w-[80px] max-w-full" />
                    </div>
                    <div className="inline-flex items-center border transition-colors border-transparent px-3 py-1">
                        <Skeleton className="w-[32px] max-w-full" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h3 className="flex items-center gap-2">
                        <Skeleton className="w-[96px] max-w-full" />
                        <SVGSkeleton className="w-[24px] h-[24px]" />
                    </h3>
                    <div className="inline-flex items-center border transition-colors px-3 py-1">
                        <Skeleton className="w-[80px] max-w-full" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="flex items-center gap-2">
                        <Skeleton className="w-[104px] max-w-full" />
                        <SVGSkeleton className="w-[24px] h-[24px]" />
                    </h3>
                    <div className="inline-flex items-center border transition-colors px-3 py-1">
                        <Skeleton className="w-[72px] max-w-full" />
                    </div>
                </div>
            </div>
            <div className="h-px w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 px-4 py-2">
                            <SVGSkeleton className="w-[24px] h-[24px]" />
                            <span>
                                <Skeleton className="w-[48px] max-w-full" />
                            </span>
                        </div>
                        <div className="p-2">
                            <div className="p-1">
                                <SVGSkeleton className="w-[24px] h-[24px]" />
                            </div>
                        </div>
                    </div>
                    <div className="pl-1">
                        <Skeleton className="w-[120px] max-w-full" />
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 px-4 py-2">
                            <SVGSkeleton className="w-[24px] h-[24px]" />
                            <span>
                                <Skeleton className="w-[72px] max-w-full" />
                            </span>
                        </div>
                        <div className="p-2">
                            <SVGSkeleton className="w-[24px] h-[24px]" />
                        </div>
                    </div>
                    <div className="pl-1">
                        <Skeleton className="w-[272px] max-w-full" />
                    </div>
                </div>
            </div>
        </div>
    </>
);