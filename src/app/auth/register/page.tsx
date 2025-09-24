import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="container grid place-items-center py-16">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <h1 className="text-xl font-semibold">Criar conta EloX</h1>
          <p className="text-sm text-muted-foreground">Torne-se um clipador e comece a monetizar seus cortes.</p>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </main>
  );
}