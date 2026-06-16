import { EXPERTS, getExpert } from "@/lib/experts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExpertSelectorProps {
  selected: string;
  onChange: (id: string) => void;
}

export function ExpertSelector({ selected, onChange }: ExpertSelectorProps) {
  const current = getExpert(selected);
  return (
    <Select value={selected} onValueChange={onChange}>
      <SelectTrigger className="w-[210px] border-border bg-muted text-sm">
        <SelectValue>
          <span className="flex items-center gap-2">
            <span>{current.icon}</span>
            <span className="truncate">{current.name}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-popover border-border max-h-[420px]">
        <SelectGroup>
          <SelectLabel className="text-xs text-muted-foreground">
            Expert Agent Network
          </SelectLabel>
          {EXPERTS.map((e) => (
            <SelectItem key={e.id} value={e.id} className="text-sm">
              <div className="flex items-start gap-2">
                <span className="mt-0.5">{e.icon}</span>
                <div>
                  <div className="font-medium">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.tagline}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
