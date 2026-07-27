import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

type Props<TOption> = {
  options: TOption[];
  value: TOption[];
  htmlFor?: string;
  placeholder?: string;
  disabled?: boolean;
  emptyText?: string;
  onValueChange: (value: TOption[]) => void;
  optionValue?: (option: TOption) => string | number;
  optionLabel?: (option: TOption) => string;
};

const ComboboxFieldWork = <TOption,>({
  options,
  value,
  htmlFor,
  placeholder,
  disabled = false,
  emptyText = "Không có mục nào",
  onValueChange,
  optionValue,
  optionLabel,
}: Props<TOption>) => {
  const anchor = useComboboxAnchor();

  const resolveOptionValue = (option: TOption): string | number => {
    if (optionValue) return optionValue(option);

    if (typeof option === "object" && option !== null) {
      const record = option as Record<string, unknown>;
      if (typeof record.id === "string" || typeof record.id === "number") {
        return String(record.id);
      }
      if (
        typeof record.value === "string" ||
        typeof record.value === "number"
      ) {
        return String(record.value);
      }
    }

    return String(option);
  };

  const resolveOptionLabel = (option: TOption): string => {
    if (optionLabel) return optionLabel(option);

    if (typeof option === "object" && option !== null) {
      const record = option as Record<string, unknown>;
      if (typeof record.label === "string") return record.label;
    }

    return String(option);
  };

  return (
    <Combobox
      multiple
      autoHighlight
      items={options}
      value={value}
      onValueChange={onValueChange}
    >
      <ComboboxChips
        ref={anchor}
        className="flex-1 rounded min-h-6 py-0 text-[12px]"
      >
        <ComboboxValue>
          {(values: TOption[]) => (
            <>
              {values.map((value) => (
                <ComboboxChip key={String(resolveOptionValue(value))}>
                  {resolveOptionLabel(value)}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                id={htmlFor}
                placeholder={values.length > 0 ? "" : placeholder}
                disabled={disabled}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty className="text-[12px]">{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(item: TOption) => (
            <ComboboxItem
              key={String(resolveOptionValue(item))}
              value={item}
              className="text-[12px]"
            >
              {resolveOptionLabel(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default ComboboxFieldWork;
