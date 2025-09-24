import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="container space-y-6 py-8">
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
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="h-5 w-40 animate-pulse rounded bg-slate-800" />
            </CardHeader>
            <CardContent>
              <div className="h-56 w-full animate-pulse rounded bg-slate-800" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-5 w-40 animate-pulse rounded bg-slate-800" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-9 w-full animate-pulse rounded bg-slate-800" />
                <div className="h-9 w-full animate-pulse rounded bg-slate-800" />
                <div className="h-10 w-32 animate-pulse rounded bg-slate-800" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
