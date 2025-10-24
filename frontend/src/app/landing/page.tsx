"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

type NavLinkProps = { href: string; label: string; active: string };

function NavLink({ href, label, active }: NavLinkProps) {
  return (
    <Link
      href={`#${href}`}
      className={`hover:text-white transition-colors ${active === href ? 'text-white' : 'text-slate-300'}`}
    >
      {label}
    </Link>
  );
}

export default function LandingPage() {
  const [active, setActive] = useState<string>('');
  const sectionIds = useMemo(
    () => ['features', 'how', 'tools', 'screens', 'testimonials', 'integrations', 'faq'],
    [],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sectionIds]);

  return (
    <div className="bg-gradient-to-b from-gray-900 via-slate-900 to-black text-slate-100 antialiased">
      {/* NAVBAR */}
      <header className="w-full py-4 sticky top-0 z-50 border-b border-white/5 bg-black/30 backdrop-blur supports-[backdrop-filter]:bg-black/20">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between relative" role="navigation" aria-label="Primary">
          <Link href="#" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center text-white font-bold">YG</div>
            <div>
              <div className="font-semibold">YouTube Growth AI</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <NavLink href="features" label="Features" active={active} />
            <NavLink href="how" label="How it works" active={active} />
            <NavLink href="tools" label="Popular tools" active={active} />
            <NavLink href="testimonials" label="Testimonials" active={active} />
            <NavLink href="integrations" label="Integrations" active={active} />
            <NavLink href="faq" label="FAQ" active={active} />
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/extension"
              className="px-4 py-2 rounded-md bg-slate-800 text-slate-100 hover:bg-slate-700"
            >
              Extension
            </Link>
            <Link href="/auth/signin" className="px-4 py-2 rounded-md bg-slate-800 text-slate-100 hover:bg-slate-700">Sign in with Google</Link>
          </div>

          <button className="md:hidden p-2 rounded-md bg-slate-800">☰</button>
        </div>
      </header>

      {/* HERO */}
      <motion.section className="py-20 lg:py-28 min-h-[80vh] flex items-center" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <div className="mx-auto max-w-6xl px-6 grid gap-10 lg:grid-cols-2 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-snug tracking-tight max-w-2xl">Grow your YouTube channel with AI</h1>
            <p className="mt-6 text-slate-300 text-lg max-w-2xl">Free AI tools for YouTube SEO, titles, descriptions, keywords, thumbnail analysis, and channel analytics - all in one place.</p>
            <div className="mt-7 flex items-center gap-3">
              <Link href="/auth/signin" className="inline-flex items-center gap-3 bg-purple-600 hover:bg-purple-500 px-5 py-3 rounded-md font-semibold shadow">Sign in with Google</Link>
              <Link href="#features" className="text-slate-300 hover:text-white">Explore all features →</Link>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-6 text-sm text-slate-400">
              <div>
                <div className="font-bold text-white">100% Free</div>
                <div>Ad-supported</div>
              </div>
              <div>
                <div className="font-bold text-white">English-first</div>
                <div>Creator-friendly copy</div>
              </div>
              <div>
                <div className="font-bold text-white">No credit card</div>
                <div>Get started instantly</div>
              </div>
            </div>
          </motion.div>

          {/* HERO VISUAL */}
          <motion.div className="relative" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl bg-slate-900/60">
              <Image src="/mockups/dashboard.svg" alt="Product dashboard mockup" width={1200} height={680} className="mx-auto w-full h-auto max-h-[60vh] md:max-h-[70vh] lg:max-h-[72vh] object-contain" priority />
            </div>
            <div className="mt-3 flex justify-center items-center gap-3 text-xs text-slate-400 w-full">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">Secure by design</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">No credit card required</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <section className="py-8 border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center text-slate-400 text-sm">Trusted by creators and marketers worldwide</div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 opacity-80">
            {[
              {name:'CreatorHub',src:'/brands/creatorhub.svg'},
              {name:'StreamX',src:'/brands/streamx.svg'},
              {name:'TubePro',src:'/brands/tubepro.svg'},
              {name:'AdNexus',src:'/brands/adnexus.svg'},
              {name:'GrowthLab',src:'/brands/growthlab.svg'},
              {name:'Metricly',src:'/brands/metricly.svg'},
            ].map((b)=> (
              <div key={b.name} className="flex items-center justify-center">
                <Image src={b.src} alt={`${b.name} logo`} width={160} height={40} className="h-8 w-auto opacity-90" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* FEATURES */}
      <motion.section id="features" className="py-12 border-t border-slate-800" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold">What can you do?</h2>
            <p className="mt-2 text-slate-400">Optimize every video and your entire channel with AI — free forever.</p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="p-6 rounded-lg bg-slate-800 shadow transition-colors hover:bg-slate-800/80">
              <div className="text-2xl">🔍</div>
              <h3 className="mt-3 font-semibold">Keyword & SEO Research</h3>
              <p className="mt-2 text-slate-400 text-sm">Discover search volume, competition, and related keywords to rank faster.</p>
            </div>
            <div className="p-6 rounded-lg bg-slate-800 shadow transition-colors hover:bg-slate-800/80">
              <div className="text-2xl">✍️</div>
              <h3 className="mt-3 font-semibold">AI Titles & Descriptions</h3>
              <p className="mt-2 text-slate-400 text-sm">Generate click‑worthy titles and SEO‑friendly descriptions in one click.</p>
            </div>
            <div className="p-6 rounded-lg bg-slate-800 shadow transition-colors hover:bg-slate-800/80">
              <div className="text-2xl">🖼️</div>
              <h3 className="mt-3 font-semibold">Thumbnail Analyzer</h3>
              <p className="mt-2 text-slate-400 text-sm">Improve brightness, contrast, face detection, and overall click‑through potential.</p>
            </div>
            <div className="p-6 rounded-lg bg-slate-800 shadow transition-colors hover:bg-slate-800/80">
              <div className="text-2xl">📈</div>
              <h3 className="mt-3 font-semibold">Channel Analytics</h3>
              <p className="mt-2 text-slate-400 text-sm">Track views, CTR, watch time, and growth insights in one simple dashboard.</p>
            </div>
            <div className="p-6 rounded-lg bg-slate-800 shadow transition-colors hover:bg-slate-800/80">
              <div className="text-2xl">🤖</div>
              <h3 className="mt-3 font-semibold">Competitor Analysis</h3>
              <p className="mt-2 text-slate-400 text-sm">Reverse‑engineer top videos, tags, and upload cadence from your niche.</p>
            </div>
            <div className="p-6 rounded-lg bg-slate-800 shadow transition-colors hover:bg-slate-800/80">
              <div className="text-2xl">⚡</div>
              <h3 className="mt-3 font-semibold">Fast & Free</h3>
              <p className="mt-2 text-slate-400 text-sm">100% free and blazing fast. No subscription required.</p>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="section-divider" />

      {/* HOW IT WORKS */}
      <motion.section id="how" className="py-12" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <div className="mx-auto max-w-6xl px-6 grid gap-8 lg:grid-cols-3 items-start">
          <div>
            <h2 className="text-3xl font-bold">How it works</h2>
            <p className="mt-2 text-slate-400">Sign in with Google, connect your channel, then optimize from your video page with one‑click AI tools.</p>
            <ol className="mt-6 space-y-4 text-slate-300">
              <li className="flex gap-3 items-start"><div className="font-semibold">1.</div> Sign in with Google & connect your channel.</li>
              <li className="flex gap-3 items-start"><div className="font-semibold">2.</div> Select a video or paste a link.</li>
              <li className="flex gap-3 items-start"><div className="font-semibold">3.</div> Generate titles, tags, analyze thumbnails, and apply suggestions.</li>
            </ol>
          </div>
          <div className="lg:col-span-2">
            <div className="rounded-lg overflow-hidden bg-slate-800 p-4 shadow">
              <h3 className="font-semibold">Quick demo</h3>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900 rounded">Input: Video URL</div>
                <div className="p-4 bg-slate-900 rounded">Output: 5 Suggested Titles</div>
                <div className="p-4 bg-slate-900 rounded">Thumbnail Score: 78</div>
                <div className="p-4 bg-slate-900 rounded">Top Keywords: [কীওয়ার্ড১, কীওয়ার্ড২]</div>
              </div>
            </div>
            <div className="mt-4 p-4 rounded bg-slate-900 text-center text-slate-400">Ad slot (Google AdSense)</div>
          </div>
        </div>
      </motion.section>

      <div className="section-divider" />

      {/* SCREENSHOTS */}
      <motion.section id="screens" className="py-12 border-t border-slate-800" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold">Results from real creators</h2>
            <p className="mt-2 text-slate-400">Creators use YouTube Growth AI to find topics, improve CTR, and grow faster.</p>
          </div>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {[
              {stat:'+132% CTR',desc:'after testing titles for 2 weeks'},
              {stat:'+48% views',desc:'from optimizing thumbnails & keywords'},
              {stat:'10h saved/mo',desc:'automating research with AI'},
            ].map((c,i)=> (
              <div key={i} className="rounded overflow-hidden bg-slate-900 p-6 border border-slate-800">
                <div className="text-2xl font-bold text-white">{c.stat}</div>
                <div className="mt-2 text-sm text-slate-400">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="section-divider" />

      <motion.section id="testimonials" className="py-12" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold">What creators are saying</h2>
          </div>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {[
              {name:'Alex G.',title:'Gaming Creator',quote:'Title tests alone boosted my CTR by 2x.', avatar:'/avatars/alex.svg'},
              {name:'Maya K.',title:'Education',quote:'Daily ideas keep me consistent without the burnout.', avatar:'/avatars/maya.svg'},
              {name:'Studio 9',title:'Production',quote:'Keyword research is faster and smarter than spreadsheets.', avatar:'/avatars/alex.svg'},
            ].map((t,i)=> (
              <div key={i} className="p-6 rounded-lg bg-slate-900 border border-slate-800 transition-colors hover:bg-slate-900/70">
                <p className="text-slate-200">“{t.quote}”</p>
                <div className="mt-4 flex items-center gap-3">
                  <Image src={t.avatar} alt={`${t.name} avatar`} width={40} height={40} className="h-10 w-10 rounded-full" />
                  <div className="text-sm text-slate-300">{t.name} • <span className="text-slate-400">{t.title}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="section-divider" />

      <motion.section id="integrations" className="py-12 border-t border-slate-800" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold">Integrations</h2>
            <p className="mt-2 text-slate-400">Works with your existing workflow.</p>
          </div>
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-slate-900 border border-slate-800">
              <h3 className="font-semibold">YouTube</h3>
              <p className="mt-2 text-slate-400 text-sm">Connect your channel securely to analyze performance and apply suggestions.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-slate-900 border border-slate-800">
              <h3 className="font-semibold">Chrome Extension (coming soon)</h3>
              <p className="mt-2 text-slate-400 text-sm">Optimize titles and keywords right from YouTube Studio.</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold">Start free — today</h2>
          <p className="mt-2 text-slate-400">Sign in, connect your channel, and get AI‑powered suggestions instantly.</p>
          <div className="mt-6">
            <Link href="/api/auth/signin" className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 px-6 py-3 rounded-md font-semibold">Sign in with Google</Link>
          </div>
          <div className="mt-6 text-sm text-slate-500">By signing in you agree to our <Link href="#" className="underline">Terms</Link> and <Link href="#" className="underline">Privacy Policy</Link>.</div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold">Frequently asked questions</h2>
          </div>
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-800 rounded">
              <h4 className="font-semibold">Is this service really free?</h4>
              <p className="mt-2 text-slate-400 text-sm">Yes. It’s free for all creators. We support the platform with Google AdSense.</p>
            </div>
            <div className="p-4 bg-slate-800 rounded">
              <h4 className="font-semibold">Do you store my YouTube token?</h4>
              <p className="mt-2 text-slate-400 text-sm">Tokens are encrypted at rest and can be revoked or deleted at any time.</p>
            </div>
            <div className="p-4 bg-slate-800 rounded">
              <h4 className="font-semibold">Will AI usage be expensive?</h4>
              <p className="mt-2 text-slate-400 text-sm">We optimize API usage on the backend to balance cost and performance.</p>
            </div>
            <div className="p-4 bg-slate-800 rounded">
              <h4 className="font-semibold">Where will ads appear?</h4>
              <p className="mt-2 text-slate-400 text-sm">Ads are placed on public pages (e.g., blog/keyword pages) with low density inside the dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer is rendered globally via Root layout */}
    </div>
  );
}
