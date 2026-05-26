const STEPS = [
  {
    n: '01', icon: '📤',
    title: 'Upload any photo',
    desc: 'Drag & drop, paste from clipboard, or snap one with your phone. Works with messy backgrounds, printed photos, or casual portraits.',
  },
  {
    n: '02', icon: '🤖',
    title: 'AI detects your face',
    desc: 'Claude Vision AI instantly locates your face, computes the perfect biometric crop, and aligns your eyes to the correct position.',
  },
  {
    n: '03', icon: '✨',
    title: 'Background removed',
    desc: 'All background elements are completely removed. Replaced with clean white — smooth edges, no sticker-like cutouts.',
  },
  {
    n: '04', icon: '⬇️',
    title: 'Download all formats',
    desc: 'Get Passport, Visa, and CV Portrait versions in one click. Each photo has its own Download button right below it.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="py-24 px-6 max-w-6xl mx-auto">
      <div className="mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Simple process</p>
        <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] tracking-tight text-ink mb-4">
          From any photo to perfect ID photo
        </h2>
        <p className="text-base text-ink-3 font-light max-w-md leading-relaxed">
          Fully automatic. No manual cropping. No background editing. Just upload and download.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden">
        {STEPS.map(({ n, icon, title, desc }) => (
          <div key={n} className="bg-white p-8">
            <div className="font-display text-3xl text-border-2 mb-4 leading-none">{n}</div>
            <div className="text-2xl mb-3">{icon}</div>
            <h3 className="text-sm font-semibold text-ink mb-2">{title}</h3>
            <p className="text-sm text-ink-3 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Before / after */}
      <div className="mt-20 flex flex-col items-center gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-4">Before & after</p>
        <div className="flex items-center gap-8 md:gap-16 flex-wrap justify-center">
          <div className="text-center">
            <div className="w-[130px] h-[165px] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-100 to-stone-200 flex items-center justify-center mb-3 shadow-card mx-auto relative">
              <span className="text-5xl">🤳</span>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwbDQgNE0tMSAxbDIgLTJNMyA1bDIgLTIiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9zdmc+')] opacity-30" />
            </div>
            <span className="text-xs font-medium text-ink-4">Messy background</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1">
              {['🤖','✂️','✨'].map((e, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm">
                  {e}
                </div>
              ))}
            </div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent"/>
            <span className="text-[10px] text-ink-4 font-medium">AI Processing</span>
          </div>

          <div className="text-center">
            <div className="w-[110px] h-[141px] rounded-xl overflow-hidden bg-white border-2 border-border-2 flex items-center justify-center mb-3 shadow-lg mx-auto relative">
              <span className="text-4xl">🙂</span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[9px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                ✓ Compliant
              </span>
            </div>
            <span className="text-xs font-medium text-ink">Clean passport photo</span>
          </div>
        </div>
      </div>
    </section>
  )
}
