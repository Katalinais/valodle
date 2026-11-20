"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { useGameStore } from "@/store/gameStore";
import { Modal } from "./Modal";
import { Toggle } from "./Toggle";

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const highContrast = useGameStore((s) => s.settings.highContrast);
  const setSetting = useGameStore((s) => s.setSetting);
  const reset = useGameStore((s) => s.reset);
  return (
    <Modal open={open} onClose={onClose} title={t("settings.title")} closeLabel={t("stats.close")}>
      <div className="flex flex-col gap-5">
        <Toggle
          label={t("settings.highContrast")}
          checked={highContrast}
          onChange={(v) => setSetting("highContrast", v)}
        />
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t("settings.resetConfirm"))) reset();
          }}
          className="self-start rounded border border-miss px-3 py-1.5 text-sm text-miss hover:bg-miss hover:text-white"
        >
          {t("settings.reset")}
        </button>
      </div>
    </Modal>
  );
}
