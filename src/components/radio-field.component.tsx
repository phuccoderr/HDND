import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { RadioGroup } from "./ui/radio-group";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  items: string[];
} & React.ComponentProps<typeof RadioGroupPrimitive.Root>;

export const RadioField = <T extends FieldValues>({
  control,
  name,
  label,
  items = [],
  children,
  ...props
}: Props<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel>{label}</FieldLabel>
        <RadioGroup
          value={field.value ?? items[0]}
          onValueChange={field.onChange}
          {...props}
        >
          {children}
        </RadioGroup>
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )}
  />
);
