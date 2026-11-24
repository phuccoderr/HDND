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
  type,
  ...props
}: Props<T>) => {
  const isNumber = type === "number";
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const displayValue = isNumber
          ? field.value === undefined || field.value === null
            ? ""
            : String(field.value)
          : (field.value ?? "");
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
            <Input
              {...field}
              {...props}
              type={type}
              id={htmlFor}
              value={displayValue}
              aria-invalid={fieldState.invalid}
              onChange={(e) => {
                if (!isNumber) {
                  field.onChange(e);
                  return;
                }

                const raw = e.target.value;
                if (raw === "") {
                  field.onChange(undefined);
                  return;
                }

                const parsed = Number(raw);
                field.onChange(Number.isNaN(parsed) ? undefined : parsed);
              }}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
};
