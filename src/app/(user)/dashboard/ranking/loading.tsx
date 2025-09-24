import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-64 animate-pulse rounded bg-slate-800" />
      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="h-5 w-32 animate-pulse rounded bg-slate-800" />
          </CardHeader>
          <CardContent>
            <div className="h-24 w-full animate-pulse rounded bg-slate-900" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="h-5 w-40 animate-pulse rounded bg-slate-800" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 w-full animate-pulse rounded bg-slate-900" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="h-5 w-40 animate-pulse rounded bg-slate-800" />
        </CardHeader>
        <CardContent>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded bg-slate-900 mb-2" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}