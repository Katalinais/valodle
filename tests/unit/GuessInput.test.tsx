import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GuessInput } from "@/components/GuessInput";
import { I18nProvider } from "@/i18n/I18nProvider";

const options = [
  { id: "kayo", label: "KAY/O" },
  { id: "killjoy", label: "Killjoy" },
  { id: "sage", label: "Sage" },
];

function setup(excludeIds: string[] = []) {
  const onGuess = vi.fn();
  render(
    <I18nProvider locale="es">
      <GuessInput
        options={options}
        excludeIds={excludeIds}
        onGuess={onGuess}
        placeholder="Agente"
      />
    </I18nProvider>,
  );
  return { onGuess, input: screen.getByRole("combobox") };
}

describe("GuessInput", () => {
  it("filtra sin mayúsculas ni signos y envía con Enter", async () => {
    const { onGuess, input } = setup();
    await userEvent.type(input, "kay");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["KAY/O"]);
    await userEvent.keyboard("{Enter}");
    expect(onGuess).toHaveBeenCalledWith("kayo");
  });

  it("navega con flechas", async () => {
    const { onGuess, input } = setup();
    await userEvent.type(input, "k");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onGuess).toHaveBeenCalledWith("killjoy");
  });

  it("oculta las opciones ya intentadas", async () => {
    const { input } = setup(["kayo"]);
    await userEvent.type(input, "k");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Killjoy"]);
  });
});
