import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-64 animate-pulse rounded bg-slate-800" />
      <Card>
        <CardHeader>
          <div className="h-5 w-40 animate-pulse rounded bg-slate-800" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded bg-slate-900" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}