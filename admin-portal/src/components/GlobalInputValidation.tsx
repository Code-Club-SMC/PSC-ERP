import { useEffect } from "react";
import {
  sanitizeNumericInput,
  shouldUseIntegerInput,
  showFieldError,
  validateContainer,
  validateFieldElement,
} from "@/utils/validation";

const ACTION_TEXT = /^(add|create|update|save|send|submit|record payment|generate|upload|approve)\b/i;

function closestValidationContainer(target: HTMLElement) {
  return (
    target.closest("form") ||
    target.closest("[role='dialog']") ||
    target.closest("main") ||
    document
  );
}

export function GlobalInputValidation() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const field = event.target as HTMLInputElement;
      if (!(field instanceof HTMLInputElement) || field.type !== "number") return;
      if (["e", "E", "+", "-"].includes(event.key)) event.preventDefault();
    };

    const onInput = (event: Event) => {
      const field = event.target as HTMLInputElement;
      if (!(field instanceof HTMLInputElement)) return;
      if (field.type === "number") {
        const next = sanitizeNumericInput(field.value, shouldUseIntegerInput(field));
        if (next !== field.value) field.value = next;
      }
      if (field.getAttribute("aria-invalid") === "true") {
        showFieldError(field, validateFieldElement(field));
      }
    };

    const onBlur = (event: FocusEvent) => {
      const field = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) return;
      showFieldError(field, validateFieldElement(field));
    };

    const onSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      if (!(form instanceof HTMLFormElement)) return;
      if (!validateContainer(form)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest("button");
      if (!button || button.disabled) return;
      if (button.type === "button" && !ACTION_TEXT.test(button.textContent?.trim() || "")) return;
      if (button.closest("[data-skip-global-validation='true']")) return;

      const text = button.textContent?.replace(/\s+/g, " ").trim() || "";
      if (!ACTION_TEXT.test(text)) return;
      const container = closestValidationContainer(button);
      if (!validateContainer(container)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("input", onInput, true);
    document.addEventListener("blur", onBlur, true);
    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("blur", onBlur, true);
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
