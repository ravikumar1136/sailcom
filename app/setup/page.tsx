'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string; details?: string } | null>(null);
  const [host, setHost] = useState('localhost');
  const [user, setUser] = useState('root');
  const [password, setPassword] = useState('');
  const [dbName, setDbName] = useState('sailstock');

  const setupDatabase = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Update environment variables in memory
      if (typeof window !== 'undefined') {
        (window as any).process = {
          ...(window as any).process,
          env: {
            ...(window as any).process?.env,
            DB_HOST: host,
            DB_USER: user,
            DB_PASSWORD: password,
            DB_NAME: dbName,
          },
        };
      }

      const response = await fetch('/api/setup-db');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to set up database',
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to test database connection',
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SAIL Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold">SAIL</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Database Setup</CardTitle>
            <CardDescription>Configure and set up your MySQL database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="host">Database Host</Label>
                <Input
                  id="host"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="localhost"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user">Database User</Label>
                <Input
                  id="user"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="root"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Database Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbName">Database Name</Label>
                <Input
                  id="dbName"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  placeholder="sailstock"
                />
              </div>

              {result && (
                <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {result.success ? (
                    <p>{result.message || 'Operation successful'}</p>
                  ) : (
                    <div>
                      <p className="font-semibold">{result.error || 'An error occurred'}</p>
                      {result.details && <p className="text-sm mt-1">{result.details}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="flex space-x-2 w-full">
              <Button onClick={testConnection} variant="outline" className="flex-1" disabled={loading}>
                {loading ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button onClick={setupDatabase} className="flex-1" disabled={loading}>
                {loading ? 'Setting up...' : 'Setup Database'}
              </Button>
            </div>
            <div className="text-center text-sm">
              <Link href="/" className="text-primary underline-offset-4 hover:underline">
                Back to Home
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
      <footer className="border-t py-4">
        <div className="container flex justify-between px-4 md:px-6">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SAIL. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
