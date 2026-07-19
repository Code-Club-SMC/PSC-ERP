import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CardSkeleton() {
    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <Skeleton className="h-3 w-[80px]" />
                <Skeleton className="h-3.5 w-3.5 rounded-full" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-6 w-[50px] mb-0.5" />
                <Skeleton className="h-2.5 w-[100px]" />
            </CardContent>
        </Card>
    );
}

export function DetailedCardSkeleton() {
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-[120px]" />
                            <Skeleton className="h-2.5 w-[80px]" />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-1.5">
                    <div className="flex justify-between">
                        <Skeleton className="h-2.5 w-[70px]" />
                        <Skeleton className="h-2.5 w-[50px]" />
                    </div>
                    <div className="flex justify-between">
                        <Skeleton className="h-2.5 w-[70px]" />
                        <Skeleton className="h-2.5 w-[35px]" />
                    </div>
                    <div className="flex justify-between">
                        <Skeleton className="h-2.5 w-[70px]" />
                        <Skeleton className="h-2.5 w-[75px]" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <Skeleton className="h-7 w-[160px]" />
                <Skeleton className="h-3.5 w-[240px]" />
            </div>

            <div className="space-y-2">
                <Skeleton className="h-5 w-[120px]" />
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <Skeleton className="h-5 w-[120px]" />
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="w-full">
                        <CardHeader>
                            <Skeleton className="h-5 w-[140px]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[240px] w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-7 w-[80px]" />
            </div>
            <div className="rounded-[6px] border">
                <div className="h-[34px] border-b bg-muted/50 px-3 flex items-center gap-3">
                    {[...Array(cols)].map((_, i) => (
                        <Skeleton key={i} className="h-3 flex-1" />
                    ))}
                </div>
                {[...Array(rows)].map((_, i) => (
                    <div key={i} className="h-[36px] border-b px-3 flex items-center gap-3">
                        {[...Array(cols)].map((_, j) => (
                            <Skeleton key={j} className="h-3.5 flex-1" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}