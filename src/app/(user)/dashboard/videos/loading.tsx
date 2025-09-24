import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-64 animate-pulse rounded bg-slate-800" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <CardHeader>
              <div className="h-5 w-32 animate-pulse rounded bg-slate-800" />
            </CardHeader>
            <CardContent>
              <div className="h-6 w-24 animate-pulse rounded bg-slate-800" />
            </CardContent>
          </div>
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className="h-5 w-40 animate-pulse rounded bg-slate-800" />
        </CardHeader>
        <CardContent>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded bg-slate-900 mb-2" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}