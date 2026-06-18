import { useTranslation } from "@/hooks/useTranslation"

export default function TrainingSection() {
  const { t } = useTranslation()

  return (
    <div className="space-y-4 ag-fade">
      <div>
        <p style={{ fontFamily: "var(--font-syne)", color: "var(--text-1)", fontSize: "15px" }} className="font-bold">
          {t("training", "title")}
        </p>
        <p style={{ fontFamily: "var(--font-dm-sans)", color: "var(--text-3)", fontSize: "12px" }} className="mt-1">
          {t("training", "subtitle")}
        </p>
      </div>

      <div style={{ background: "var(--card)", border: `1px solid var(--border)`, borderRadius: "20px" }} className="p-8 flex flex-col items-center gap-5">
        <div className="relative w-11 h-11">
          <div style={{ border: `2px solid var(--border)`, borderRadius: "50%" }} className="absolute inset-0" />
          <div style={{ border: "2px solid transparent", borderTopColor: "#0147FF", borderRadius: "50%" }} className="absolute inset-0 ag-spin" />
        </div>

        <div className="text-center space-y-1">
          <p style={{ fontFamily: "var(--font-syne)", color: "var(--text-1)", fontSize: "14px" }} className="font-bold">
            {t("training", "inProgress")}
          </p>
          <p style={{ fontFamily: "var(--font-dm-sans)", color: "var(--text-3)", fontSize: "12px" }}>
            {t("training", "takesTime")}
          </p>
        </div>

        <div className="space-y-2 w-full max-w-[200px]">
          {[
            t("training", "step1"),
            t("training", "step2"),
            t("training", "step3"),
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span style={{ background: "#0147FF", animationDelay: `${i * 300}ms` }} className="w-1.5 h-1.5 rounded-full ag-pulse shrink-0" />
              <span style={{ fontFamily: "var(--font-dm-sans)", color: "var(--text-3)", fontSize: "12px" }}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}