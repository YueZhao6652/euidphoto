import { Zap, ShieldCheck, Layers, Printer, Globe, Smartphone, Lock, Cpu } from 'lucide-react'

const FEATURES = [
  { icon: Cpu,         title: 'AI Face Detection',      desc: 'Claude Vision AI precisely locates your face and computes the optimal biometric crop automatically.' },
  { icon: Zap,         title: 'Instant Processing',     desc: 'Upload and get three ready-to-download photo formats in under 15 seconds. No queue, no waiting.' },
  { icon: Layers,      title: 'Background Removal',     desc: 'AI removes all background elements. Replaced with clean white, gray, or blue — smooth professional edges.' },
  { icon: ShieldCheck, title: 'Compliance Verified',    desc: 'Every output is verified against ICAO 9303 and country-specific requirements before download.' },
  { icon: Printer,     title: 'Print-Ready PDF',        desc: 'Generate an A4 sheet with 6 passport photos and crop marks — ready for any photo lab.' },
  { icon: Globe,       title: '8 Country Templates',    desc: 'Official specs for Germany, France, UK, USA, Netherlands, Belgium, Spain, and Italy.' },
  { icon: Smartphone,  title: 'Mobile-First Design',    desc: 'Designed for phone use. Paste from clipboard, use camera, or drag and drop — all supported.' },
  { icon: Lock,        title: 'Privacy First',          desc: 'Photos are never stored on our servers. All processing is immediate and deleted after use.' },
]

export default function Features() {
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <div className="mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Features</p>
        <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] tracking-tight text-ink mb-4">
          Everything you need,<br />nothing you don&apos;t
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title}
            className="bg-white border border-border rounded-2xl p-6 hover:border-border-2 hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 group">
            <div className="w-10 h-10 bg-accent-light rounded-xl flex items-center justify-center text-accent mb-4 group-hover:bg-accent group-hover:text-white transition-colors">
              <Icon size={18} strokeWidth={1.75}/>
            </div>
            <h3 className="text-sm font-semibold text-ink mb-2">{title}</h3>
            <p className="text-sm text-ink-3 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
