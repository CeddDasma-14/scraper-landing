export default function Home() {
  return (
    <main className="bg-[#0d0d1a] text-white font-sans">

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="font-bold text-lg tracking-tight">ShopSpy</span>
        <a href="#pricing" className="text-sm bg-white text-[#0d0d1a] px-4 py-2 rounded-full font-semibold hover:bg-gray-200 transition">
          See Pricing
        </a>
      </nav>

      {/* HERO */}
      <section className="px-6 py-20 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left: text */}
        <div>
          <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-4 block fade-up">
            Shopify Competitor Monitoring
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 fade-up-1">
            Know What Your Competitors<br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Are Doing — Before Your Customers Do.
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mb-10 fade-up-2">
            Automated Shopify store monitoring. Real-time alerts. AI-powered insights. All on autopilot.
          </p>
          <a href="#pricing" className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition fade-up-3">
            Get Started Today
          </a>
        </div>

        {/* Right: animated scraper visual */}
        <div className="float relative flex items-center justify-center">
          {/* Radar rings */}
          <div className="absolute w-16 h-16 rounded-full border border-purple-500/40 radar-ring" />
          <div className="absolute w-16 h-16 rounded-full border border-purple-500/30 radar-ring-2" />
          <div className="absolute w-16 h-16 rounded-full border border-purple-500/20 radar-ring-3" />

          {/* Main card */}
          <div className="relative w-full max-w-sm bg-[#12122a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/30">
            {/* Card header */}
            <div className="bg-[#1a1a3a] px-4 py-3 flex items-center gap-2 border-b border-white/10">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-xs text-gray-400 ml-2 font-mono">shopspy — live monitor</span>
              <span className="ml-auto flex items-center gap-1 text-xs text-green-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block blink" />
                LIVE
              </span>
            </div>

            {/* Scanning bar */}
            <div className="relative h-1 bg-white/5 overflow-hidden">
              <div className="scan-line absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
            </div>

            {/* Feed */}
            <div className="p-4 space-y-2 font-mono text-xs">
              <div className="text-gray-500 mb-3">Scanning stores<span className="blink">_</span></div>

              <div className="feed-item-1 flex items-center gap-2">
                <span className="text-purple-400">→</span>
                <span className="text-gray-300">gymshark.com</span>
                <span className="ml-auto text-green-400">✓ 2,500 products</span>
              </div>
              <div className="feed-item-2 flex items-center gap-2">
                <span className="text-purple-400">→</span>
                <span className="text-gray-300">kyliecosmetics.com</span>
                <span className="ml-auto text-green-400">✓ 258 products</span>
              </div>
              <div className="feed-item-3 flex items-center gap-2">
                <span className="text-purple-400">→</span>
                <span className="text-gray-300">istore.ph</span>
                <span className="ml-auto text-green-400">✓ 529 products</span>
              </div>

              <div className="border-t border-white/10 my-2" />

              <div className="feed-item-4 flex items-center gap-2">
                <span className="text-blue-400">↑</span>
                <span className="text-gray-300">Price change detected</span>
                <span className="ml-auto text-red-400">+12%</span>
              </div>
              <div className="feed-item-5 flex items-center gap-2">
                <span className="text-yellow-400">★</span>
                <span className="text-gray-300">New drop detected</span>
                <span className="ml-auto text-yellow-400">3 items</span>
              </div>

              {/* Alert pop */}
              <div className="alert-pop mt-3 bg-gradient-to-r from-purple-900/60 to-blue-900/60 border border-purple-500/40 rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="text-lg">🔔</span>
                <div>
                  <div className="text-white font-semibold text-xs">Alert sent!</div>
                  <div className="text-gray-400 text-xs">Email delivered to client</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-white/10 py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-3 text-center gap-6 px-6">
          {[
            { value: "24/7", label: "Monitoring" },
            { value: "< 1min", label: "Alert Speed" },
            { value: "100%", label: "Automated" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-white">{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATCHPHRASE */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 uppercase tracking-widest text-xs mb-6 font-semibold">The only thing that matters</p>
          <blockquote className="text-3xl md:text-5xl font-extrabold leading-tight bg-gradient-to-r from-white via-purple-200 to-blue-300 bg-clip-text text-transparent">
            &ldquo;You&apos;ll know before anyone else when your competitor drops a price or launches a new product.&rdquo;
          </blockquote>
          <p className="text-gray-500 mt-8 text-lg">
            Not because you checked. Because we told you.
          </p>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="px-6 py-20 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Are you still checking manually?</h2>
        <p className="text-gray-400 text-lg leading-relaxed">
          Checking if a competitor dropped their price. Guessing when they launch new products.
          Finding out too late that they restocked. That&apos;s hours of your week gone —
          and you still miss things.
        </p>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Everything You Need</h2>
        <p className="text-gray-400 text-center mb-14">Set up once. Runs forever. Zero manual work.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🔔", title: "Instant Alerts", desc: "Get emailed the moment a competitor drops a new product or changes a price.", delay: "fade-up-1" },
            { icon: "📊", title: "Live Dashboard", desc: "Google Sheets dashboard always updated with the latest data across all stores.", delay: "fade-up-2" },
            { icon: "🤖", title: "AI Insights", desc: "AI analyzes the data and tells you what it means — trends, strategy, opportunities.", delay: "fade-up-3" },
            { icon: "💰", title: "Price Tracking", desc: "Every price change logged with old price, new price, and % change.", delay: "fade-up-4" },
            { icon: "📦", title: "Stock Monitoring", desc: "Know instantly when a product sells out or comes back in stock.", delay: "fade-up-5" },
            { icon: "📧", title: "Daily Report", desc: "Morning digest email with a 24-hour summary so you start every day informed.", delay: "fade-up-6" },
          ].map((f) => (
            <div key={f.title} className={`bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition ${f.delay}`}>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-20 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-14">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {[
              { step: "01", title: "Tell Us Your Competitors", desc: "Send us the Shopify store URLs you want to monitor." },
              { step: "02", title: "We Set Everything Up", desc: "Takes less than 24 hours. No technical work needed from you." },
              { step: "03", title: "Get Alerts & Reports", desc: "Sit back. We email you the moment something changes." },
            ].map((h) => (
              <div key={h.step}>
                <div className="text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">{h.step}</div>
                <h3 className="font-bold text-lg mb-2">{h.title}</h3>
                <p className="text-gray-400 text-sm">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IS IT FOR */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-14">Who Is This For?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Resellers", desc: "Match competitor prices fast before you lose a sale." },
            { title: "Brand Owners", desc: "Track every new product launch from your competitors." },
            { title: "Dropshippers", desc: "Find trending products by watching what sells out fast." },
            { title: "Business Owners", desc: "Stop doing manual competitor research. Automate it." },
          ].map((w) => (
            <div key={w.title} className="flex gap-4 bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-purple-400 mt-1">✓</div>
              <div>
                <div className="font-bold mb-1">{w.title}</div>
                <div className="text-gray-400 text-sm">{w.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-6 py-20 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple Monthly Plans</h2>
          <p className="text-gray-400 text-center mb-14">No contracts. Cancel anytime.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Basic",
                price: "₱800",
                highlight: false,
                features: [
                  "1 competitor store",
                  "Daily scrape",
                  "Email alerts",
                  "Live dashboard",
                ],
              },
              {
                name: "Standard",
                price: "₱2,000",
                highlight: true,
                features: [
                  "3 competitor stores",
                  "Every 6 hours",
                  "Email alerts",
                  "Stock tracking",
                  "Keyword filtering",
                  "AI insights (basic)",
                  "Full dashboard",
                ],
              },
              {
                name: "Premium",
                price: "₱3,500",
                highlight: false,
                features: [
                  "Unlimited stores",
                  "Hourly monitoring",
                  "Everything in Standard",
                  "Full AI insights",
                  "Charts & analytics",
                  "Up to 5 team emails",
                ],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border transition-all duration-300 cursor-pointer group ${
                  plan.highlight
                    ? "border-purple-500 bg-gradient-to-b from-purple-900/40 to-transparent hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
                    : "border-white/10 bg-white/5 opacity-60 hover:opacity-100 hover:border-purple-500 hover:bg-gradient-to-b hover:from-purple-900/40 hover:to-transparent hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
                }`}
              >
                {plan.highlight && (
                  <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold block mb-3">
                    Most Popular
                  </span>
                )}
                <div className="text-xl font-bold mb-1">{plan.name}</div>
                <div className="text-4xl font-extrabold mb-1">{plan.price}</div>
                <div className="text-gray-400 text-sm mb-8">/month</div>
                <ul className="space-y-3 mb-10">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                      <span className="text-purple-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={`block text-center py-3 rounded-full font-semibold text-sm transition ${
                    plan.highlight
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="px-6 py-24 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Ready to stop guessing?</h2>
        <p className="text-gray-400 mb-10">
          Message us today and we&apos;ll set everything up within 24 hours.
          Limited slots available per month.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://www.facebook.com/share/1Gdh9atb1y/"
            target="_blank" rel="noopener noreferrer"
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-full font-bold hover:opacity-90 transition"
          >
            Message on Facebook
          </a>
          <a
            href="mailto:cedd.dasma@gmail.com"
            className="bg-white/10 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition"
          >
            Send an Email
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <div className="font-bold text-lg">ShopSpy</div>
          <p className="text-gray-500 text-sm">Built by Cedy Dasmarinas · Powered by Google Sheets + AI</p>
          <div className="flex items-center gap-5 text-gray-400">
            <a href="mailto:cedd.dasma@gmail.com" className="hover:text-white transition" title="Email">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" /></svg>
            </a>
            <a href="https://github.com/CeddDasma-14" target="_blank" rel="noopener noreferrer" className="hover:text-white transition" title="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a href="https://www.instagram.com/cedydasma" target="_blank" rel="noopener noreferrer" className="hover:text-white transition" title="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.975-.975 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.333.014 7.053.072 5.197.157 3.355.673 2.014 2.014.673 3.355.157 5.197.072 7.053.014 8.333 0 8.741 0 12c0 3.259.014 3.667.072 4.947.085 1.856.601 3.698 1.942 5.039 1.341 1.341 3.183 1.857 5.039 1.942C8.333 23.986 8.741 24 12 24s3.667-.014 4.947-.072c1.856-.085 3.698-.601 5.039-1.942 1.341-1.341 1.857-3.183 1.942-5.039.058-1.28.072-1.688.072-4.947 0-3.259-.014-3.667-.072-4.947-.085-1.856-.601-3.698-1.942-5.039C20.645.673 18.803.157 16.947.072 15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://www.facebook.com/share/1Gdh9atb1y/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition" title="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.931-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
            </a>
          </div>
          <p className="text-gray-600 text-xs mt-2">© {new Date().getFullYear()} ShopSpy. All rights reserved.</p>
        </div>
      </footer>

    </main>
  );
}
