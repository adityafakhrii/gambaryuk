export function PageSkeleton() {
    return (
        <div className="min-h-full animate-pulse">
            <div className="container mx-auto max-w-5xl px-4 py-8">
                {/* Title skeleton */}
                <div className="h-8 w-64 rounded-lg bg-muted/60" />
                <div className="mt-2 h-4 w-48 rounded-lg bg-muted/40" />

                {/* Content area skeleton */}
                <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
                    {/* Main area */}
                    <div className="space-y-4">
                        <div className="h-[300px] rounded-2xl border-2 border-dashed border-muted/50 bg-muted/20" />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-muted/30 bg-card p-6 space-y-4">
                            <div className="h-5 w-32 rounded bg-muted/50" />
                            <div className="grid grid-cols-2 gap-2">
                                <div className="h-8 rounded-lg bg-muted/40" />
                                <div className="h-8 rounded-lg bg-muted/40" />
                                <div className="h-8 rounded-lg bg-muted/40" />
                                <div className="h-8 rounded-lg bg-muted/40" />
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="h-4 w-20 rounded bg-muted/50" />
                                <div className="h-10 rounded-lg bg-muted/30" />
                                <div className="h-4 w-20 rounded bg-muted/50" />
                                <div className="h-10 rounded-lg bg-muted/30" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
