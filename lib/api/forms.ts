"use client";

export type FormResult = {
  ok: boolean;
  valid: boolean;
  status: number;
  values: Record<string, unknown>;
  errors: Record<string, string[]>;
  data?: {
    redirectTo: string;
    startsAt: string;
    endsAt: string;
    event: string;
    timezone?: string;
  };
};
