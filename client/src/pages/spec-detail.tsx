import { useSpec, useGenerateContent } from "@/hooks/use-specs";
import { Layout } from "@/components/layout";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskBoard } from "@/components/task-board";
import { UserStories } from "@/components/user-stories";
import { Loader2, ArrowLeft, Sparkles, Copy, Download, AlertTriangle, Layers, Target, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function SpecDetailPage() {
  const [, params] = useRoute("/specs/:id");
  const id = Number(params?.id);
  const { data: spec, isLoading, error } = useSpec(id);
  const generate = useGenerateContent();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground animate-pulse">Loading specification...</p>
        </div>
      </Layout>
    );
  }

  if (error || !spec) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Specification Not Found</h2>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleGenerate = () => {
    generate.mutate(id);
  };

  const generateMarkdown = () => {
    if (!spec.output) return "";
    
    let userStoriesText = "";
    
    // Handle both old (string) and new (array) formats
    if (typeof spec.output.userStories === "string") {
      userStoriesText = spec.output.userStories;
    } else if (Array.isArray(spec.output.userStories)) {
      userStoriesText = spec.output.userStories.map((story: any) => {
        const criteria = story.acceptanceCriteria?.map((ac: any) => 
          `  - Given ${ac.given}, when ${ac.when}, then ${ac.then}`
        ).join('\n') || '';
        
        return `User Story ${story.number || 'N'}: ${story.title}
As a ${story.asA}, I want ${story.iWant} so that ${story.soThat}

Acceptance Criteria
${criteria}`;
      }).join('\n\n');
    }
    
    return `# ${spec.title}

## Goal
${spec.goal}

## Target Users
${spec.targetUsers}

## Constraints
${spec.constraints}

${spec.risks ? `## Risks\n${spec.risks}\n` : ''}
## User Stories
${userStoriesText}

## Engineering Tasks
${spec.output.engineeringTasks?.map(t => `- [ ] **${t.title}** (${t.group}): ${t.description || ''}`).join('\n')}
`;
  };

  const copyToClipboard = () => {
    if (!spec.output) return;
    const content = generateMarkdown();
    navigator.clipboard.writeText(content);
    toast({ title: "Copied!", description: "Spec content copied to clipboard" });
  };

  const downloadMarkdown = () => {
    if (!spec.output) return;
    const content = generateMarkdown();
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${spec.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_spec.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "Spec downloaded as markdown file" });
  };

  return (
    <Layout>
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to List
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">{spec.title}</h1>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">{spec.template || "General"}</Badge>
              <span className="text-sm text-muted-foreground">ID: #{spec.id}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {spec.output && (
              <>
                <Button variant="outline" onClick={copyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
                <Button variant="outline" onClick={downloadMarkdown}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </>
            )}
            
            <Button 
              onClick={handleGenerate} 
              disabled={generate.isPending}
              className={!spec.output ? "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30" : ""}
              variant={spec.output ? "secondary" : "default"}
            >
              {generate.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> {spec.output ? "Regenerate Plan" : "Generate Plan"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Spec Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 space-y-6 sticky top-24">
            <div>
              <div className="flex items-center gap-2 mb-2 text-primary font-medium">
                <Target className="h-4 w-4" />
                <h3>Goal</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{spec.goal}</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2 text-primary font-medium">
                <Users className="h-4 w-4" />
                <h3>Target Users</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{spec.targetUsers}</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2 text-primary font-medium">
                <Layers className="h-4 w-4" />
                <h3>Constraints</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{spec.constraints}</p>
            </div>

            {spec.risks && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-2 text-amber-500 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  <h3>Risks</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{spec.risks}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Generated Content */}
        <div className="lg:col-span-2">
          {!spec.output ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted/20 border-2 border-dashed border-muted-foreground/20 rounded-xl p-12 text-center"
            >
              <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Ready to Generate</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We'll use AI to analyze your requirements and break them down into actionable user stories and engineering tasks.
              </p>
              <Button onClick={handleGenerate} size="lg">
                Generate Plan
              </Button>
            </motion.div>
          ) : (
            <Tabs defaultValue="stories" className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="stories">User Stories</TabsTrigger>
                <TabsTrigger value="tasks">Engineering Tasks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="stories" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <UserStories userStories={spec.output.userStories || []} />
                </motion.div>
              </TabsContent>
              
              <TabsContent value="tasks" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <TaskBoard 
                    specId={spec.id} 
                    tasks={spec.output.engineeringTasks || []} 
                  />
                </motion.div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </Layout>
  );
}
