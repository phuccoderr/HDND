import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Textarea } from "./ui/textarea";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  htmlFor: string;
} & React.ComponentProps<"textarea">;

export const TextareaField = <T extends FieldValues>({
  control,
  name,
  label,
  ...props
}: Props<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor="event-description">{label}</FieldLabel>
        <Textarea
          {...field}
          aria-invalid={fieldState.invalid}
          id="event-description"
          {...props}
        />
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )}
  />
);
