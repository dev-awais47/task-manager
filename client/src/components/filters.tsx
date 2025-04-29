import { Button } from "@/components/ui/button";

type FilterProps = {
  currentFilter: "all" | "pending" | "completed";
  onFilterChange: (filter: "all" | "pending" | "completed") => void;
};

export function Filters({ currentFilter, onFilterChange }: FilterProps) {
  return (
    <div className="inline-flex rounded-md shadow-sm">
      <Button
        variant={currentFilter === "all" ? "default" : "outline"}
        className="rounded-r-none"
        onClick={() => onFilterChange("all")}
      >
        All
      </Button>
      <Button
        variant={currentFilter === "pending" ? "default" : "outline"}
        className="rounded-none border-x-0"
        onClick={() => onFilterChange("pending")}
      >
        Pending
      </Button>
      <Button
        variant={currentFilter === "completed" ? "default" : "outline"}
        className="rounded-l-none"
        onClick={() => onFilterChange("completed")}
      >
        Completed
      </Button>
    </div>
  );
}
