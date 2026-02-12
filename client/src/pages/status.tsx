import { useStatus } from "@/hooks/use-specs";
import { Layout } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, Database, Server, Brain } from "lucide-react";

function StatusItem({ label, status, icon: Icon }: { label: string, status?: boolean, icon: any }) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-background rounded-md border shadow-sm">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {status === undefined ? (
          <span className="text-muted-foreground text-sm">Checking...</span>
        ) : status ? (
          <span className="flex items-center text-green-600 dark:text-green-400 text-sm font-semibold bg-green-500/10 px-3 py-1 rounded-full">
            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Operational
          </span>
        ) : (
          <span className="flex items-center text-red-600 dark:text-red-400 text-sm font-semibold bg-red-500/10 px-3 py-1 rounded-full">
            <XCircle className="h-4 w-4 mr-1.5" /> Outage
          </span>
        )}
      </div>
    </div>
  );
}

export default function StatusPage() {
  const { data: status, isLoading } = useStatus();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold mb-3">System Status</h1>
          <p className="text-muted-foreground">Live monitoring of system components</p>
        </div>

        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle>Component Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <StatusItem 
                  label="Backend API" 
                  status={status?.backend} 
                  icon={Server} 
                />
                <StatusItem 
                  label="PostgreSQL Database" 
                  status={status?.database} 
                  icon={Database} 
                />
                <StatusItem 
                  label="Google Gemini API" 
                  status={status?.llm} 
                  icon={Brain} 
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
