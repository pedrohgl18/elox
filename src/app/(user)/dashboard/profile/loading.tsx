import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function Loading() {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="h-20 w-20 mx-auto rounded-full bg-slate-800 animate-pulse" />
            <div className="h-4 w-32 mx-auto mt-4 rounded bg-slate-800 animate-pulse" />
            <div className="h-3 w-40 mx-auto mt-2 rounded bg-slate-900 animate-pulse" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-5 w-40 rounded bg-slate-800 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-5 w-full rounded bg-slate-900 animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2 space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <CardHeader>
              <div className="h-5 w-40 rounded bg-slate-800 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-10 w-full rounded bg-slate-900 animate-pulse" />
                ))}
              </div>
            </CardContent>
          </div>
        ))}
      </div>
    </div>
  );
}