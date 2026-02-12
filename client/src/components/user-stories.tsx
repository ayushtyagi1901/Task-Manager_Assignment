import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { GeneratedOutput } from "@shared/schema";

interface UserStory {
  number: number;
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: {
    given: string;
    when: string;
    then: string;
  }[];
}

interface UserStoriesProps {
  userStories: NonNullable<GeneratedOutput["userStories"]>;
}

export function UserStories({ userStories }: UserStoriesProps) {
  // Handle backward compatibility - if userStories is a string (old format), show it as markdown
  if (typeof userStories === "string") {
    return (
      <div className="bg-card rounded-xl border p-8 shadow-sm">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <pre className="whitespace-pre-wrap text-sm">{userStories}</pre>
        </div>
      </div>
    );
  }

  // New structured format
  const stories = userStories as UserStory[];

  if (!stories || stories.length === 0) {
    return (
      <div className="bg-muted/20 border-2 border-dashed border-muted-foreground/20 rounded-xl p-12 text-center">
        <p className="text-muted-foreground">No user stories generated yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stories.map((story, index) => (
        <motion.div
          key={story.number || index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      US-{story.number || index + 1}
                    </Badge>
                    <CardTitle className="text-xl font-display">
                      {story.title}
                    </CardTitle>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User Story Statement */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                <p className="text-sm leading-relaxed">
                  <span className="font-semibold text-foreground">{story.asA}</span>
                  {", "}
                  <span className="font-semibold text-foreground">{story.iWant}</span>
                  {" "}
                  <span className="text-muted-foreground">{story.soThat}</span>
                </p>
              </div>

              {/* Acceptance Criteria */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Acceptance Criteria
                </h4>
                <div className="space-y-2 pl-6">
                  {story.acceptanceCriteria?.map((criteria, critIndex) => (
                    <div
                      key={critIndex}
                      className="text-sm text-muted-foreground border-l-2 border-l-muted pl-3 py-1"
                    >
                      <p>
                        <span className="font-medium text-foreground">Given</span>{" "}
                        {criteria.given}
                      </p>
                      <p className="mt-1">
                        <span className="font-medium text-foreground">When</span>{" "}
                        {criteria.when}
                      </p>
                      <p className="mt-1">
                        <span className="font-medium text-foreground">Then</span>{" "}
                        {criteria.then}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

