import { useSpecs } from "@/hooks/use-specs";
import { Layout } from "@/components/layout";
import { CreateSpecDialog } from "@/components/create-spec-dialog";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Plus, ArrowRight, FileText, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const { data: specs, isLoading } = useSpecs();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 md:py-20 text-center space-y-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight">
            Turn Ideas into <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Execution Plans
            </span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
            Describe your product goal, and our AI will generate comprehensive user stories and engineering tasks instantly.
          </p>
          <div className="mt-8">
            <CreateSpecDialog 
              trigger={
                <Button size="lg" className="h-12 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  <Plus className="mr-2 h-5 w-5" /> Start Planning
                </Button>
              } 
            />
          </div>
        </motion.div>
      </section>

      {/* Steps Section */}
      <section className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-display font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center p-6 rounded-lg border bg-card"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="font-semibold mb-2">Fill the Form</h3>
            <p className="text-sm text-muted-foreground">
              Enter your feature goal, target users, constraints, and any risks or unknowns.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center p-6 rounded-lg border bg-card"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="font-semibold mb-2">Generate Plan</h3>
            <p className="text-sm text-muted-foreground">
              AI analyzes your requirements and creates structured user stories and engineering tasks.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center p-6 rounded-lg border bg-card"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="font-semibold mb-2">Edit & Export</h3>
            <p className="text-sm text-muted-foreground">
              Reorder tasks, customize the plan, and export as markdown for your team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Recent Specs Section */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-bold">Recent Specifications</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
          </div>
        ) : specs?.length === 0 ? (
          <Card className="border-dashed py-16 text-center bg-muted/10">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No specs yet</h3>
                <p className="text-muted-foreground mt-1">Create your first specification to get started.</p>
              </div>
              <CreateSpecDialog />
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specs?.map((spec, index) => (
              <motion.div
                key={spec.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={`/specs/${spec.id}`} className="block group h-full">
                  <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="font-display text-xl leading-tight group-hover:text-primary transition-colors">
                          {spec.title}
                        </CardTitle>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground whitespace-nowrap">
                          {spec.template || "General"}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3 text-sm">
                        {spec.goal}
                      </p>
                    </CardContent>
                    <CardFooter className="border-t pt-4 text-xs text-muted-foreground flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Created {formatDistanceToNow(new Date(spec.createdAt!), { addSuffix: true })}
                      </div>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-4px] group-hover:translate-x-0" />
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
