import { Skeleton } from "../SkeletonHook";

export const SummarySkeleton = () => (
    <>
        <div className="shadow-lg p-6 mb-8">
            <h2 className="mb-4">
                <Skeleton className="w-[152px] max-w-full" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="from-primary p-6 flex flex-col items-center justify-center">
                    <h3 className="mb-2">
                        <Skeleton className="w-[104px] max-w-full" />
                    </h3>
                    <div>
                        <Skeleton className="w-[40px] max-w-full" />
                    </div>
                </div>
                <div className="border border-green-200 p-6">
                    <h3 className="mb-2">
                        <Skeleton className="w-[104px] max-w-full" />
                    </h3>
                    <ul className="space-y-2">
                        <li className="flex items-start">
                            <span className="inline-block p-1 mr-2">
                                <Skeleton className="w-[14px] max-w-full" />
                            </span>
                            <span>
                                <Skeleton className="w-[288px] max-w-full" />
                            </span>
                        </li>
                    </ul>
                </div>
                <div className="border border-orange-200 p-6">
                    <h3 className="mb-2">
                        <Skeleton className="w-[128px] max-w-full" />
                    </h3>
                    <ul className="space-y-2">
                        <li className="flex items-start">
                            <span className="inline-block p-1 mr-2">
                                <Skeleton className="w-[14px] max-w-full" />
                            </span>
                            <span>
                                <Skeleton className="w-[776px] max-w-full" />
                            </span>
                        </li>
                        <li className="flex items-start">
                            <span className="inline-block p-1 mr-2">
                                <Skeleton className="w-[14px] max-w-full" />
                            </span>
                            <span>
                                <Skeleton className="w-[440px] max-w-full" />
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </>
);