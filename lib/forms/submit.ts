"use client";
import type { CmsForm } from "./types";
import type { FormResult } from "@/lib/api/forms";
export async function submitBuilderForm(
  form: CmsForm,
  formData: FormData,
  pageId?: number,
): Promise<FormResult> {
  const values = Object.fromEntries(formData.entries());
  try {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "");
    if (!backend) throw new Error("Missing backend URL");
    const submissionData = form.fields
      .filter(
        (field) =>
          field.name && field.visible !== false && field.blockType !== "upload",
      )
      .map((field) => ({
        field: field.name,
        value: String(values[field.name!] ?? ""),
      }));
    if (
      form.fields.some(
        (field) => field.visible !== false && field.includeDialCode,
      )
    )
      submissionData.push({
        field: "dialCode",
        value: String(values.dialCode ?? ""),
      });
    const data = {
      form: form.id,
      page: pageId,
      submissionData,
      locale: values.locale,
      key: values.key,
      slotId: values.slotId ? Number(values.slotId) : undefined,
      trap: values.trap,
    };
    const files = Object.entries(values).filter(
      (entry): entry is [string, File] =>
        entry[1] instanceof File && entry[1].size > 0,
    );
    let body: BodyInit = JSON.stringify(data),
      headers: HeadersInit = { "Content-Type": "application/json" };
    if (files.length) {
      const multipart = new FormData();
      multipart.set("_payload", JSON.stringify(data));
      for (const [name, file] of files) multipart.set(name, file);
      body = multipart;
      headers = {};
    }
    const response = await fetch(
      `${backend}/api/form-submissions?locale=${values.locale}&depth=0`,
      { method: "POST", headers, body },
    );
    const result = await response.json();
    if (!response.ok) {
      const errors: Record<string, string[]> = {};
      for (const error of result.errors ?? [])
        for (const field of error.data?.errors ?? [])
          errors[field.path === "slot" ? "slotId" : field.path] = ["invalid"];
      if (!Object.keys(errors).length)
        errors._root = [response.status === 413 ? "file" : "failed"];
      return {
        ok: false,
        valid: false,
        status: response.status,
        values,
        errors,
      };
    }
    const locale =
      values.locale === "ar" || values.locale === "fr"
        ? `/${values.locale}`
        : "";
    const url = form.redirect?.url ?? "";
    const redirectTo =
      form.confirmationType === "redirect"
        ? url.startsWith("/") &&
          !url.startsWith("/ar/") &&
          !url.startsWith("/fr/")
          ? locale + url
          : url
        : "";
    return {
      ok: true,
      valid: true,
      status: response.status,
      values,
      errors: {},
      data: {
        redirectTo,
        startsAt: "",
        endsAt: "",
        event: "",
        ...result.doc?.bookingReceipt,
      },
    };
  } catch {
    return {
      ok: false,
      valid: false,
      status: 503,
      values,
      errors: { _root: ["failed"] },
    };
  }
}
