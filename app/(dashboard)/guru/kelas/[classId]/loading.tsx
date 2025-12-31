import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ClassDetailLoading() {
  return (
    <div className="space-y-6 pt-4 md:p-4 animate-pulse">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button Skeleton */}
            <Skeleton className="h-10 w-10 rounded-full" />

            {/* Title & Desc Skeleton */}
            <div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
          </div>
        </div>

        {/* Materials List Skeleton */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-7 w-48" /> {/* "Materi Pembelajaran" */}
            <Skeleton className="h-9 w-36" /> {/* Button "Tambah Materi" */}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-6 w-3/4" /> {/* Material Name */}
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-32" /> {/* Date */}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-5 w-20 rounded-full" />{" "}
                    {/* Badge 1 */}
                    <Skeleton className="h-5 w-16 rounded-full" />{" "}
                    {/* Badge 2 */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
