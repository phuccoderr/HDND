import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { AnimatedCalendar } from "./ui/calender";
import { vi } from "date-fns/locale";
import { format } from "date-fns";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
};

export const CalenderField = <T extends FieldValues>({
  control,
  name,
  label,
}: Props<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel>{label}</FieldLabel>
        <AnimatedCalendar
          mode="single"
          showTime
          size="sm"
          locale={vi}
          value={new Date(field.value) ?? new Date()}
          onChange={(date) => {
            field.onChange(format(date ?? new Date(), "yyyy-MM-dd'T'HH:mm:ss"));
          }}
        />
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )}
  />
);
