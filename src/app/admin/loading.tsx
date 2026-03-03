export default function AdminLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            <div>
                <div className="h-9 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
                <div className="h-4 w-64 bg-gray-100 dark:bg-gray-700 rounded-lg" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between pb-2">
                            <div className="h-4 w-24 bg-gray-100 dark:bg-gray-700 rounded" />
                            <div className="h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full" />
                        </div>
                        <div className="flex items-baseline space-x-2">
                            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                            <div className="h-4 w-10 bg-gray-100 dark:bg-gray-700 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                    <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4" />
                    <div className="h-[200px] bg-gray-50 dark:bg-gray-900/50 rounded-lg" />
                </div>
                <div className="col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                    <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4" />
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-50 dark:bg-gray-700/50 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
