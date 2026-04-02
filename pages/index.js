import Head from 'next/head'
import { useState } from 'react'

const tools = [
  {
    id: 'scaffolder',
    emoji: '🏗️',
    name: 'Module Scaffolder',
    desc: 'Generate a complete Odoo module folder structure and download it as a zip in seconds.',
    status: 'live',
    href: '/tools/module-scaffolder',
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
  {
    id: 'domain-builder',
    emoji: '🔧',
    name: 'Domain Builder',
    desc: 'Build Odoo domain expressions visually. No more guessing bracket syntax.',
    status: 'coming-soon',
    href: null,
    color: '#0369A1',
    bg: '#E0F2FE',
  },
  {
    id: 'manifest-validator',
    emoji: '✅',
    name: 'Manifest Validator',
    desc: 'Paste your __manifest__.py and get instant errors, warnings, and missing field alerts.',
    status: 'coming-soon',
    href: null,
    color: '#065F46',
    bg: '#D1FAE5',
  },
]

export default function Home() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <>
      <Head>
        <title>I Love Odoo — Free Tools for Odoo Developers</title>
        <meta name="description" content="Free tools built for Odoo developers. Module scaffolder, domain builder, manifest validator and more. Coming soon." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#0A0A0F', fontFamily: "'DM Sans', sans-serif", color: '#F1F0FF' }}>

        {/* grid bg */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* glow */}
        <div style={{
          position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: '700px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* NAV */}
          <nav style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1.25rem 2rem', borderBottom: '1px solid rgba(124,58,237,0.15)',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '22px' }}>❤️</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#F1F0FF' }}>
                iloveodoo
              </span>
            </div>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: '11px',
              color: '#7C3AED', background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.3)', borderRadius: '20px',
              padding: '4px 12px', letterSpacing: '0.05em',
            }}>
              COMING SOON
            </span>
          </nav>

          {/* HERO */}
          <section style={{ textAlign: 'center', padding: '6rem 1.5rem 4rem' }}>
            <div style={{
              display: 'inline-block',
              fontFamily: "'DM Mono', monospace", fontSize: '11px',
              color: '#A78BFA', background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.25)', borderRadius: '20px',
              padding: '5px 16px', marginBottom: '2rem', letterSpacing: '0.08em',
            }}>
              FREE TOOLS FOR ODOO DEVELOPERS
            </div>

            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: 'clamp(2.8rem, 8vw, 5.5rem)', lineHeight: 1.05,
              letterSpacing: '-0.03em', margin: '0 0 1.5rem',
              color: '#FFFFFF',
            }}>
              Build Odoo modules<br />
              <span style={{ color: '#7C3AED' }}>10× faster.</span>
            </h1>

            <p style={{
              fontSize: '1.15rem', color: '#9CA3AF', maxWidth: '520px',
              margin: '0 auto 3rem', lineHeight: 1.7,
            }}>
              A growing suite of free developer tools for the Odoo ecosystem.
              Scaffolders, validators, builders — no login, no nonsense.
            </p>

            {/* EMAIL SIGNUP */}
            {!submitted ? (
              <form onSubmit={handleSubmit} style={{
                display: 'flex', gap: '10px', justifyContent: 'center',
                flexWrap: 'wrap', maxWidth: '460px', margin: '0 auto',
              }}>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    flex: 1, minWidth: '220px', padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.3)',
                    borderRadius: '10px', color: '#F1F0FF', fontSize: '0.95rem',
                    outline: 'none', fontFamily: "'DM Sans', sans-serif",
                  }}
                />
                <button type="submit" style={{
                  padding: '0.75rem 1.5rem', background: '#7C3AED',
                  border: 'none', borderRadius: '10px', color: '#fff',
                  fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
                }}>
                  Notify me
                </button>
              </form>
            ) : (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '0.75rem 1.5rem', background: 'rgba(5,150,105,0.15)',
                border: '1px solid rgba(5,150,105,0.3)', borderRadius: '10px',
                color: '#6EE7B7', fontSize: '0.95rem',
              }}>
                ✓ You're on the list — we'll email you when we launch!
              </div>
            )}
          </section>

          {/* TOOLS PREVIEW */}
          <section style={{ padding: '2rem 1.5rem 5rem', maxWidth: '900px', margin: '0 auto' }}>
            <p style={{
              textAlign: 'center', fontFamily: "'DM Mono', monospace",
              fontSize: '11px', color: '#6B7280', letterSpacing: '0.1em',
              marginBottom: '2rem', textTransform: 'uppercase',
            }}>
              Tools launching soon
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
            }}>
              {tools.map(tool => (
                <div key={tool.id}
                  onClick={() => tool.href && (window.location.href = tool.href)}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: tool.status === 'live' ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(124,58,237,0.15)',
                    borderRadius: '16px', padding: '1.5rem',
                    transition: 'border-color 0.2s, background 0.2s',
                    cursor: tool.href ? 'pointer' : 'default',
                  }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: tool.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '22px', marginBottom: '1rem',
                  }}>
                    {tool.emoji}
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: '8px',
                  }}>
                    <h3 style={{
                      fontFamily: "'Syne', sans-serif", fontWeight: 700,
                      fontSize: '1rem', margin: 0, color: '#F1F0FF',
                    }}>
                      {tool.name}
                    </h3>
                    <span style={{
                      fontFamily: "'DM Mono', monospace", fontSize: '10px',
                      color: tool.status === 'live' ? '#86EFAC' : '#6B7280',
                      background: tool.status === 'live' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                      border: tool.status === 'live' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '20px', padding: '2px 8px', whiteSpace: 'nowrap',
                    }}>
                      {tool.status === 'live' ? '● live' : 'soon'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: 0, lineHeight: 1.6 }}>
                    {tool.desc}
                  </p>
                  {tool.href && (
                    <p style={{ fontSize: '12px', color: '#7C3AED', margin: '10px 0 0', fontFamily: "'DM Mono', monospace" }}>
                      Try it →
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* FOOTER */}
          <footer style={{
            textAlign: 'center', padding: '2rem',
            borderTop: '1px solid rgba(124,58,237,0.1)',
            color: '#4B5563', fontSize: '0.8rem',
            fontFamily: "'DM Mono', monospace",
          }}>
            built with ❤️ for the odoo community · iloveodoo.qzz.io
          </footer>

        </div>
      </div>
    </>
  )
}
