export type ValidationResult = string | null;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PK_PHONE_PATTERN = /^(03\d{9}|923\d{9}|\+923\d{9}|0\d{2,4}\d{6,8})$/;
const CNIC_PATTERN = /^\d{13}$/;

const normalizeDigits = (value: string) => value.replace(/[\s-]/g, "");

export function validateEmail(value: string, required = false): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return required ? "Email is required" : null;
  const [local] = trimmed.split("@");
  if (!EMAIL_PATTERN.test(trimmed) || !local || local.length < 3) {
    return "Enter a valid email, e.g. atf@gmail.com";
  }
  return null;
}

export function validatePakistanPhone(value: string, required = false): ValidationResult {
  const normalized = normalizeDigits(value);
  if (!normalized) return required ? "Contact number is required" : null;
  if (!PK_PHONE_PATTERN.test(normalized)) {
    return "Enter Pakistan phone number, e.g. 03001234567 or 0919212753";
  }
  return null;
}

export function validateCnic(value: string, required = false): ValidationResult {
  const normalized = normalizeDigits(value);
  if (!normalized) return required ? "CNIC is required" : null;
  if (!CNIC_PATTERN.test(normalized)) return "CNIC must be 13 digits";
  return null;
}

export function validateRequiredText(value: string, label = "This field"): ValidationResult {
  return value.trim() ? null : `${label} is required`;
}

export function validateNumberString(
  value: string,
  options: { required?: boolean; integer?: boolean; min?: number; label?: string } = {},
): ValidationResult {
  const { required = false, integer = false, min = 0, label = "Value" } = options;
  const trimmed = value.trim();
  if (!trimmed) return required ? `${label} is required` : null;
  const pattern = integer ? /^\d+$/ : /^\d+(\.\d+)?$/;
  if (!pattern.test(trimmed)) return `${label} must be ${integer ? "whole " : ""}number`;
  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric) || numeric < min) return `${label} must be at least ${min}`;
  return null;
}

export function sanitizeNumericInput(value: string, integer = false) {
  let next = value.replace(/[^\d.]/g, "");
  if (integer) return next.replace(/\./g, "");
  const firstDot = next.indexOf(".");
  if (firstDot >= 0) {
    next = next.slice(0, firstDot + 1) + next.slice(firstDot + 1).replace(/\./g, "");
  }
  return next;
}

function getFieldLabel(field: HTMLElement): string {
  const id = field.getAttribute("id");
  const explicit = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent : "";
  const wrapper = field.closest("div");
  const nearby = wrapper?.querySelector("label")?.textContent;
  const aria = field.getAttribute("aria-label");
  const placeholder = field.getAttribute("placeholder");
  const name = field.getAttribute("name");
  return (explicit || nearby || aria || placeholder || name || "This field").replace(/\*/g, "").trim();
}

function fieldKey(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  const haystack = [
    field.name,
    field.id,
    field.getAttribute("aria-label"),
    field.getAttribute("placeholder"),
    getFieldLabel(field),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    field instanceof HTMLInputElement &&
    (
      field.type === "search" ||
      haystack.includes("search") ||
      haystack.includes("filter") ||
      haystack.includes("membership")
    )
  ) return "search";

  if (haystack.includes("email")) return "email";
  if (haystack.includes("cnic")) return "cnic";
  if (haystack.includes("phone") || haystack.includes("contact") || haystack.includes("mobile")) return "phone";
  if (haystack.includes("card number")) return "integer";
  if (haystack.includes("check number") || haystack.includes("cheque number")) return "integer";
  if (haystack.includes("amount") || haystack.includes("price") || haystack.includes("charge") || haystack.includes("balance") || haystack.includes("gst")) return "decimal";
  if (
    haystack.includes("capacity") ||
    haystack.includes("order") ||
    haystack.includes("adult") ||
    haystack.includes("children") ||
    haystack.includes("number of guests") ||
    haystack.includes("guest count") ||
    haystack.includes("guests count") ||
    haystack.includes("room #") ||
    haystack.includes("room number")
  ) return "integer";
  return "";
}

function isRequired(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  return field.required || getFieldLabel(field).includes("*") || field.getAttribute("aria-required") === "true";
}

export function validateFieldElement(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): ValidationResult {
  if (field.disabled || field.readOnly || field.type === "hidden" || field.type === "file") return null;
  if (field.type === "date" || field.type === "time" || field.type === "datetime-local") return null;

  const key = fieldKey(field);
  const required = isRequired(field);
  const label = getFieldLabel(field);
  const value = field.value || "";

  if (key === "search") return null;
  if (key === "email") return validateEmail(value, required);
  if (key === "phone") return validatePakistanPhone(value, required);
  if (key === "cnic") return validateCnic(value, required);
  if (key === "integer") return validateNumberString(value, { required, integer: true, label });
  if (key === "decimal" || field.type === "number") {
    return validateNumberString(value, { required, integer: key === "integer", label });
  }
  if (required) return validateRequiredText(value, label);
  return null;
}

export function showFieldError(field: HTMLElement, message: ValidationResult) {
  const existing = field.parentElement?.querySelector<HTMLElement>("[data-field-error='true']");
  field.setAttribute("aria-invalid", message ? "true" : "false");
  field.classList.toggle("border-destructive", !!message);

  if (!message) {
    existing?.remove();
    return;
  }

  const error = existing || document.createElement("p");
  error.dataset.fieldError = "true";
  error.className = "mt-1 text-[11px] leading-4 text-destructive";
  error.textContent = message;
  if (!existing) field.insertAdjacentElement("afterend", error);
}

export function validateContainer(container: ParentNode): boolean {
  const fields = Array.from(
    container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select"),
  ).filter((field) => field.offsetParent !== null);

  let firstInvalid: HTMLElement | null = null;
  fields.forEach((field) => {
    const message = validateFieldElement(field);
    showFieldError(field, message);
    if (message && !firstInvalid) firstInvalid = field;
  });
  firstInvalid?.focus();
  return !firstInvalid;
}

export function shouldUseIntegerInput(field: HTMLInputElement) {
  return fieldKey(field) === "integer";
}
