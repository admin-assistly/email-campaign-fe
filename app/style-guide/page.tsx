

export default function StyleGuidePage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Style Guide</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Colors (from theme)</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            "--primary",
            "--primary-foreground",
            "--secondary",
            "--secondary-foreground",
            "--accent",
            "--error-bg",
            "--error-text",
            "--success-bg",
            "--success-text",
            "--warning-bg",
            "--warning-text",
            "--card",
            "--card-foreground",
            "--muted",
            "--muted-foreground",
            "--border",
          ].map((token) => (
            <div key={token} className="flex items-center gap-2">
              <span
                className="inline-block w-8 h-8 rounded border"
                style={{
                  background: `hsl(var(${token}))`,
                  borderColor: "hsl(var(--border))",
                }}
              />
              <span className="text-sm">{token}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
