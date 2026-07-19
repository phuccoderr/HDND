import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Field, FieldError, FieldLabel } from "./ui/field";
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
} from "./ui/combobox";

type Props<T extends FieldValues, TOption> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  htmlFor: string;
  options: TOption[];
  optionValue?: (option: TOption) => string | number;
  optionLabel?: (option: TOption) => string;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  multiple?: boolean;
};

export const ComboboxField = <T extends FieldValues, TOption>({
  control,
  name,
  label,
  htmlFor,
  options,
  optionValue,
  optionLabel,
  placeholder = "Chọn một mục",
  emptyText = "Không có mục nào",
  disabled = false,
  multiple = true,
}: Props<T, TOption>) => {
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
      if (typeof record.full_name === "string") return record.full_name;
      if (typeof record.label === "string") return record.label;
      if (typeof record.name === "string") return record.name;
    }

    return String(option);
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedValues: Array<string | number> = Array.isArray(
          field.value,
        )
          ? field.value.map((value: unknown) => String(value))
          : field.value == null
            ? []
            : [String(field.value)];

        const selectedOptions = options.filter((option) =>
          selectedValues.includes(String(resolveOptionValue(option))),
        );

        const handleValueChange = (nextValue: TOption[] | TOption | null) => {
          if (multiple) {
            const selected = Array.isArray(nextValue) ? nextValue : [];
            field.onChange(selected.map((item) => resolveOptionValue(item)));
          } else {
            const selected = Array.isArray(nextValue)
              ? nextValue[0]
              : nextValue;
            field.onChange(selected ? resolveOptionValue(selected) : null);
          }
          field.onBlur();
        };
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
            <Combobox
              multiple={multiple}
              autoHighlight
              items={options}
              value={selectedOptions}
              onValueChange={handleValueChange}
            >
              <ComboboxChips ref={anchor} className="w-full">
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
                        name={name}
                        placeholder={values.length > 0 ? "" : placeholder}
                        disabled={disabled}
                        aria-invalid={fieldState.invalid}
                      />
                    </>
                  )}
                </ComboboxValue>
              </ComboboxChips>
              <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>{emptyText}</ComboboxEmpty>
                <ComboboxList>
                  {(item: TOption) => (
                    <ComboboxItem
                      key={String(resolveOptionValue(item))}
                      value={item}
                    >
                      {resolveOptionLabel(item)}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
};
