import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  htmlFor: string;
} & React.ComponentProps<"input">;

export const InputField = <T extends FieldValues>({
  control,
  name,
  label,
  htmlFor,
  ...props
}: Props<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
        <Input
          {...field}
          aria-invalid={fieldState.invalid}
          id={htmlFor}
          {...props}
        />
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )}
  />
);
