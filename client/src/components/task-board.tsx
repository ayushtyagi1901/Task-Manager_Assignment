import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { GeneratedOutput } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUpdateTasks } from "@/hooks/use-specs";

interface TaskBoardProps {
  specId: number;
  tasks: NonNullable<GeneratedOutput["engineeringTasks"]>;
}

interface SortableTaskItemProps {
  id: string;
  task: NonNullable<GeneratedOutput["engineeringTasks"]>[number];
}

function SortableTaskItem({ id, task }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <Card className={`p-4 flex items-start gap-3 hover:border-primary/50 transition-colors ${isDragging ? 'shadow-xl rotate-1 border-primary bg-primary/5' : 'shadow-sm'}`}>
        <button
          {...attributes}
          {...listeners}
          className="mt-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs bg-muted/50 font-normal">
              {task.group}
            </Badge>
            <h4 className="font-medium text-sm text-foreground">{task.title}</h4>
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
          )}
        </div>
      </Card>
    </div>
  );
}

export function TaskBoard({ specId, tasks: initialTasks }: TaskBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const updateTasks = useUpdateTasks();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Optimistic update
        updateTasks.mutate({
          id: specId,
          data: { tasks: newOrder }
        });
        
        return newOrder;
      });
    }
  }

  // Group tasks by their group/epic for display (though drag works across list)
  // For a simple sortable list, we'll just show them all in one list but display badges
  // A more complex implementation would involve multiple containers.

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-lg font-semibold">Engineering Tasks</h3>
          <span className="text-sm text-muted-foreground">{tasks.length} items</span>
        </div>

        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {tasks.map((task) => (
              <SortableTaskItem key={task.id} id={task.id} task={task} />
            ))}
          </div>
        </SortableContext>
      </div>
    </DndContext>
  );
}
