import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ResultsContentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {/* Search Bar Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-72" />
        </div>

        {/* Table Skeleton */}
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Siswa</TableHead>
                <TableHead className="text-center">Rata-rata Skor</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Tunggakan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default function ResultsLoading() {
  return (
    <div className="pt-4 space-y-6 md:p-4 pb-12 fade-in-50">
      {/* Header + Select Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="">
          <Skeleton className="h-10 w-[200px]" />
        </div>
      </div>

      <ResultsContentSkeleton />
    </div>
  );
}
