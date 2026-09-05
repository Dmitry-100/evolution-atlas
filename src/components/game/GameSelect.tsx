import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

export function GameSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Выберите",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; detail?: string }[];
  placeholder?: string;
}) {
  return (
    <label className="game-field">
      <span>{label}</span>
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger className="game-select" aria-label={label}>
          <Select.Value placeholder={placeholder} />
          <Select.Icon>
            <ChevronDown size={15} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className="game-select-menu"
            position="popper"
            sideOffset={6}
            collisionPadding={12}
          >
            <Select.ScrollUpButton className="game-select-scroll">
              <ChevronUp size={14} />
            </Select.ScrollUpButton>
            <Select.Viewport>
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="game-select-option"
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                  {option.detail && <small>{option.detail}</small>}
                  <Select.ItemIndicator>
                    <Check size={15} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="game-select-scroll">
              <ChevronDown size={14} />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </label>
  );
}
