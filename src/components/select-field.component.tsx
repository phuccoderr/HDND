import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Field, FieldError, FieldLabel } from "./ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { ReactNode } from "react";

type SelectItemType = { label: string; value: string; [key: string]: any };

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  htmlFor: string;
  placeholder: string;
  items: SelectItemType[];
  renderItem?: (item: SelectItemType) => ReactNode;
};

export const SelectField = <T extends FieldValues>({
  control,
  name,
  label,
  htmlFor,
  placeholder,
  items,
  renderItem,
}: Props<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
        <Select value={field.value} onValueChange={field.onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {renderItem ? renderItem(item) : item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )}
  />
);
