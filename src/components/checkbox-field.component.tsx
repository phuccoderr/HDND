import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Checkbox } from "./animate-ui/components/radix/checkbox";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  htmlFor: string;
} & React.ComponentProps<"input">;

export const CheckboxField = <T extends FieldValues>({
  control,
  name,
  label,
  htmlFor,
}: Props<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <Field orientation="horizontal" data-invalid={fieldState.invalid}>
        <Checkbox
          id={htmlFor}
          checked={field.value}
          onCheckedChange={field.onChange}
        />
        <FieldLabel htmlFor={htmlFor} className="font-normal">
          {label}
        </FieldLabel>
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )}
  />
);
