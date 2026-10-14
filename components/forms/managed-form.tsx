"use client";
import { useEffect, useId, useState, type ReactNode } from "react";
import type { SiteLocale } from "@/i18n/navigation";
import type { CmsForm, FormPurpose, FormField } from "@/lib/forms/types";
import type { CountryOption } from "@/lib/countries";
import type { FormResult } from "@/lib/api/forms";
import { submitBuilderForm } from "@/lib/forms/submit";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { useFormDefinition } from "./forms-provider";
import { useForm } from "./use-form";
import { FormActions } from "./form-actions";
import { FormConsent } from "./form-consent";
import { FormFieldError } from "./form-field-error";

type ManagedFormProps = {
  purpose: FormPurpose;
  locale: SiteLocale;
  ownerId?: number;
  jobTitle?: string;
  slotId?: number;
  actions?: ReactNode;
  onSuccess?: (result: FormResult) => void;
};

export function ManagedForm(props: ManagedFormProps) {
  const {definition, countries} = useFormDefinition(props.purpose, props.ownerId);
  return <BuilderForm {...props} definition={definition} countries={countries}/>;
}

export function BuilderForm({
  purpose, locale, jobTitle, slotId, actions, onSuccess, definition, countries, pageId,
}: Omit<ManagedFormProps, 'purpose'> & {
  purpose: CmsForm['purpose'];
  definition?: CmsForm;
  countries: readonly CountryOption[];
  pageId?: number;
}) {
  const instanceId = useId();
  const [sent, setSent] = useState(false);
  const initial = Object.fromEntries(
    (definition?.fields ?? [])
      .filter((field) => field.name)
      .map((field) => [
        field.name!,
        field.defaultValue ??
          (field.blockType === "checkbox"
            ? false
            : (field.blockType === "select"||field.blockType === "product-select") && !field.placeholder
              ? (field.options?.[0]?.value ?? "")
              : ""),
      ]),
  );
  const form = useForm<Record<string, unknown>>({
    initialValues: { ...initial, key: "", locale, trap: "", slotId },
    submitter: async ({ formData }) => {
      if (!definition)
        return {
          ok: false,
          valid: false,
          status: 400,
          values: {},
          errors: { _root: ["failed"] },
        };
      const result = await submitBuilderForm(definition, formData, pageId);
      if (result.ok) {
        setSent(true);
        onSuccess?.(result);
        if (result.data?.redirectTo)
          window.location.assign(result.data.redirectTo);
      }
      return result;
    },
  });
  useEffect(() => {
    form.reset({
      ...initial,
      key: crypto.randomUUID(),
      locale,
      trap: "",
      slotId,
    });
    setSent(false);
  }, [definition?.id, locale, slotId]);
  if (!definition) return null;
  const labels=definition.ui??{};
  const prefix = {
    home: "e",
    contact: "f",
    quote: "rq",
    application: "application",
    reservation: "bk",
    search: "q",
    custom: `form-${instanceId}`,
  }[purpose];
  const values = form.values;
  const error = (name: string) =>
    form.errors.has(name) ? labels.invalid : undefined;
  const onChange = (name: string, value: unknown) => {
    setSent(false);
    form.setValue(name, value);
  };
  const renderField = (field: FormField) => {
    if (field.visible === false) return null;
    if (field.blockType === "message")
      return (
        <div key={field.id} className="field full">
          <RichText
            data={field.message as Parameters<typeof RichText>[0]["data"]}
          />
        </div>
      );
    const name = field.name!;
    const id = `${prefix}-${name}`;
    const required = Boolean(field.required);
    const shared = {
      id,
      name,
      required,
      "aria-invalid": Boolean(error(name)),
      "aria-describedby": error(name) ? `${id}-error` : undefined,
    };
    const value = String(values[name] ?? "");
    let input: ReactNode;
    if (field.blockType === "checkbox" && name === "consent")
      return (
        <FormConsent
          key={name}
          {...shared}
          checked={Boolean(values[name])}
          onChange={(event) => onChange(name, event.target.checked)}
          label={field.label}
          privacyLabel={field.privacyLabel ?? ""}
          privacyHref={`${locale === "en" ? "" : "/" + locale}/privacy`}
          error={error(name)}
          errorId={`${id}-error`}
        />
      );
    if (field.blockType === "checkbox")
      input = (
        <input
          {...shared}
          type="checkbox"
          checked={Boolean(values[name])}
          onChange={(event) => onChange(name, event.target.checked)}
        />
      );
    else if (field.blockType === "upload")
      input = (
        <input
          {...shared}
          type="file"
          accept={field.mimeTypes?.map((type) => type.mimeType).join(",")}
          multiple={field.multiple}
          onChange={(event) => onChange(name, event.target.files?.[0])}
        />
      );
    else if (field.blockType === "textarea")
      input = (
        <textarea
          {...shared}
          value={value}
          placeholder={field.placeholder}
          onChange={(event) => onChange(name, event.target.value)}
        />
      );
    else if (field.blockType === "select" || field.blockType === "product-select" || field.blockType === "country")
      input = (
        <select
          {...shared}
          value={value}
          onChange={(event) => {
            onChange(name, event.target.value);
            if (field.blockType === "country")
              onChange(
                "dialCode",
                countries.find((country) => country.name === event.target.value)
                  ?.dialCode ?? "",
              );
          }}
        >
          {field.placeholder && <option value="">{field.placeholder}</option>}
          {field.blockType === "country"
            ? countries.map((country) => (
                <option key={country.name} value={country.name}>
                  {country.name}
                </option>
              ))
            : field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
        </select>
      );
    else if (field.blockType === "radio")
      input = (
        <div role="radiogroup" aria-label={field.label}>
          {field.options?.map((option) => (
            <label key={option.value}>
              <input
                name={name}
                type="radio"
                value={option.value}
                required={required}
                checked={value === option.value}
                onChange={() => onChange(name, option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      );
    else {
      const control = (
        <input
          {...shared}
          type={
            field.blockType === "email"
              ? "email"
              : field.blockType === "number"
                ? "number"
                : field.blockType === "date"
                  ? "date"
                  : (field.inputType ?? "text")
          }
          value={value}
          placeholder={field.placeholder}
          autoComplete={
            name === "name"
              ? "name"
              : name === "email"
                ? "email"
                : name === "phone"
                  ? "tel-national"
                  : name === "company"
                    ? "organization"
                    : undefined
          }
          onChange={(event) => onChange(name, event.target.value)}
        />
      );
      input = field.includeDialCode ? (
        <div className="phone-row">
          <select
            id={`${prefix}-dial`}
            name="dialCode"
            aria-label={field.dialCodePlaceholder}
            required={required}
            value={String(values.dialCode ?? "")}
            onChange={(event) => onChange("dialCode", event.target.value)}
          >
            <option value="">{field.dialCodePlaceholder}</option>
            {countries.map((country) => (
              <option key={country.name} value={country.dialCode}>
                {country.dialCode} {country.name}
              </option>
            ))}
          </select>
          {control}
        </div>
      ) : (
        control
      );
    }
    return (
      <div className={`field${field.width === 100 ? " full" : ""}`} key={name}>
        <label htmlFor={id}>
          {field.label}
          {required ? " *" : ""}
        </label>
        {input}
        {field.helpText && <small>{field.helpText}</small>}
        {error(name) && (
          <FormFieldError id={`${id}-error`}>{error(name)}</FormFieldError>
        )}
      </div>
    );
  };
  return (
    <form
      method="post"
      className={`form${purpose === "home" ? " enquiry-form" : purpose === "application" ? " career-application-form reveal" : ""}`}
      data-payload-form={purpose}
      data-form-ready={Boolean(values.key)}
      aria-busy={form.submitting}
      style={purpose === "contact" ? { marginTop: 22 } : undefined}
      onSubmit={(event) => {
        event.preventDefault();
        void form.submit();
      }}
    >
      <input type="hidden" name="key" value={String(values.key)} />
      <input type="hidden" name="locale" value={locale} />
      <fieldset
        disabled={form.submitting || !values.key}
        style={purpose === "application" ? undefined : { display: "contents" }}
      >
        {jobTitle && (
          <div className="field full locked">
            <label htmlFor="application-position">{labels.positionLabel}</label>
            <input id="application-position" value={jobTitle} readOnly />
          </div>
        )}
        {definition.fields.map(renderField)}
        <input
          className="form-hp"
          name="trap"
          tabIndex={-1}
          autoComplete="off"
          value={String(values.trap ?? "")}
          onChange={(event) => onChange("trap", event.target.value)}
        />
        {form.errors.has("_root") && (
          <p className="form-error" role="alert">
            {labels.failure}
          </p>
        )}
        {sent && definition.confirmationType === "message" && (
          <div className="field full form-success" role="status">
            <RichText
              data={
                definition.confirmationMessage as Parameters<
                  typeof RichText
                >[0]["data"]
              }
            />
          </div>
        )}
        <FormActions>
          <button
            className="btn"
            type="submit"
            disabled={form.submitting || !values.key}
          >
            {form.submitting ? labels.sending : definition.submitButtonLabel}
          </button>
          {actions}
        </FormActions>
      </fieldset>
    </form>
  );
}
