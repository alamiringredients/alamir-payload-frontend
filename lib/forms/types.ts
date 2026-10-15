import type { ownerFormPolicy } from "./owner-policy";

export type FormPurpose = keyof typeof ownerFormPolicy;
export type FormField = {
  id?: string;
  blockType: string;
  name?: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  visible?: boolean;
  required?: boolean;
  width?: number;
  defaultValue?: string | number | boolean | {id:number};
  inputType?: "text" | "tel" | "url";
  includeDialCode?: boolean;
  dialCodePlaceholder?: string;
  privacyLabel?: string;
  options?: { label: string; value: string }[];
  mimeTypes?: { mimeType: string }[];
  message?: unknown;
  maxFileSize?: number;
  multiple?: boolean;
};
export type CmsForm = {
 ui?:Record<string,string>;
  id: number;
  purpose: FormPurpose | "custom";
  title: string;
  fields: FormField[];
  submitButtonLabel: string;
  confirmationType: "message" | "redirect";
  confirmationMessage?: unknown;
  redirect?: { url: string };
  owner?: {
    relationTo: string;
    value: FormOwner;
  };
};

export type FormOwner = {id: number; sourceId?: number; slug?: string; sourceKey?: string};
export type FormScope = {purpose: FormPurpose; collection: (typeof ownerFormPolicy)[FormPurpose]['collection']; ownerId?: number; slug?: string};
