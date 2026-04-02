import Head from 'next/head'
import { useState } from 'react'

const ODOO_VERSIONS = ['18.0', '17.0', '16.0', '15.0', '14.0']
const LICENSES = ['LGPL-3', 'OPL-1', 'AGPL-3', 'MIT', 'Apache-2']
const CATEGORIES = [
  'Uncategorized', 'Accounting', 'CRM', 'eCommerce', 'Human Resources',
  'Inventory', 'Manufacturing', 'Project', 'Purchase', 'Sales', 'Website',
  'Technical', 'Extra Tools',
]
const COMMON_DEPS = [
  'base', 'web', 'mail', 'sale', 'purchase', 'account', 'stock',
  'project', 'hr', 'crm', 'website', 'mrp', 'point_of_sale',
]

const colors = {
  bg: '#0A0A0F',
  card: 'rgba(255,255,255,0.03)',
  border: 'rgba(124,58,237,0.2)',
  borderHover: 'rgba(124,58,237,0.5)',
  purple: '#7C3AED',
  purpleLight: 'rgba(124,58,237,0.12)',
  text: '#F1F0FF',
  muted: '#9CA3AF',
  dimmer: '#6B7280',
  green: '#10B981',
  greenBg: 'rgba(16,185,129,0.1)',
  greenBorder: 'rgba(16,185,129,0.3)',
  error: '#EF4444',
  errorBg: 'rgba(239,68,68,0.1)',
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid ${colors.border}`,
  borderRadius: '10px',
  color: colors.text,
  fontSize: '0.9rem',
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
  transition: 'border-color 0.15s',
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: colors.muted,
  marginBottom: '6px',
  fontFamily: "'DM Mono', monospace",
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

function Field({ label, hint, error, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: '11px', color: colors.dimmer, marginTop: '4px', lineHeight: 1.4 }}>{hint}</p>}
      {error && <p style={{ fontSize: '11px', color: colors.error, marginTop: '4px' }}>{error}</p>}
    </div>
  )
}

function Checkbox({ id, label, desc, checked, onChange }) {
  return (
    <label htmlFor={id} style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      padding: '10px 14px',
      background: checked ? 'rgba(124,58,237,0.08)' : colors.card,
      border: `1px solid ${checked ? colors.purple : colors.border}`,
      borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
    }}>
      <input
        id={id} type="checkbox" checked={checked} onChange={onChange}
        style={{ marginTop: '2px', accentColor: colors.purple, width: '15px', height: '15px', cursor: 'pointer' }}
      />
      <div>
        <p style={{ fontSize: '13px', fontWeight: 500, color: colors.text, margin: '0 0 2px' }}>{label}</p>
        <p style={{ fontSize: '11px', color: colors.dimmer, margin: 0, lineHeight: 1.4 }}>{desc}</p>
      </div>
    </label>
  )
}

function SectionTitle({ number, title, subtitle }) {
  return (
    <div style={{ marginBottom: '1.25rem', paddingTop: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <span style={{
          width: '24px', height: '24px', borderRadius: '50%',
          background: colors.purple, color: '#fff',
          fontSize: '12px', fontWeight: 700, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          fontFamily: "'DM Mono', monospace",
        }}>{number}</span>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.05rem', fontWeight: 700, color: colors.text, margin: 0 }}>{title}</h2>
      </div>
      {subtitle && <p style={{ fontSize: '12px', color: colors.dimmer, margin: '0 0 0 34px' }}>{subtitle}</p>}
      <div style={{ height: '1px', background: colors.border, marginTop: '12px' }} />
    </div>
  )
}

export default function ModuleScaffolder() {
  const [form, setForm] = useState({
    techName: '',
    displayName: '',
    version: '17.0',
    author: '',
    website: '',
    category: 'Uncategorized',
    summary: '',
    license: 'LGPL-3',
    modelName: '',
    modelDescription: '',
    includeModels: true,
    includeViews: true,
    includeSecurity: true,
    includeControllers: false,
    includeWizard: false,
    includeStatic: false,
    includeI18n: false,
    includeDemo: false,
    dependencies: ['base'],
  })

  const [depInput, setDepInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  function autoTechName(displayName) {
    return displayName.toLowerCase().trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
  }

  function handleDisplayName(val) {
    set('displayName', val)
    if (!form.techName || form.techName === autoTechName(form.displayName)) {
      set('techName', autoTechName(val))
    }
  }

  function addDep(dep) {
    const d = dep.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (d && !form.dependencies.includes(d)) {
      set('dependencies', [...form.dependencies, d])
    }
    setDepInput('')
  }

  function removeDep(dep) {
    set('dependencies', form.dependencies.filter(d => d !== dep))
  }

  function validate() {
    const e = {}
    if (!form.displayName.trim()) e.displayName = 'Required'
    if (!form.techName.trim()) e.techName = 'Required'
    if (!/^[a-z][a-z0-9_]*$/.test(form.techName)) e.techName = 'Must be snake_case (lowercase letters, numbers, underscores)'
    if (!form.author.trim()) e.author = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch('/api/scaffold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${form.techName}.zip`
      a.click()
      URL.revokeObjectURL(url)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fileCount = [
    2, // __init__ + __manifest__
    form.includeModels ? 2 : 0,
    form.includeViews ? 1 : 0,
    form.includeControllers ? 3 : 0,
    form.includeSecurity ? 2 : 0,
    form.includeWizard ? 3 : 0,
    form.includeStatic ? 3 : 0,
    form.includeI18n ? 1 : 0,
    form.includeDemo ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <>
      <Head>
        <title>Module Scaffolder — I Love Odoo</title>
        <meta name="description" content="Generate a complete Odoo module structure and download it as a zip. Free, instant, no login required." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'DM Sans', sans-serif", color: colors.text }}>

        {/* grid bg */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        <div style={{
          position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: '700px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* NAV */}
          <nav style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1.1rem 2rem', borderBottom: `1px solid ${colors.border}`,
            backdropFilter: 'blur(12px)',
          }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <span style={{ fontSize: '20px' }}>❤️</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: colors.text }}>iloveodoo</span>
            </a>
            <span style={{ fontSize: '13px', color: colors.muted }}>Module Scaffolder</span>
          </nav>

          {/* HEADER */}
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem 2rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontFamily: "'DM Mono', monospace", fontSize: '11px',
              color: '#A78BFA', background: colors.purpleLight,
              border: `1px solid rgba(124,58,237,0.25)`, borderRadius: '20px',
              padding: '4px 14px', marginBottom: '1.25rem', letterSpacing: '0.08em',
            }}>
              FREE TOOL
            </div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.1,
              letterSpacing: '-0.03em', margin: '0 0 0.75rem', color: '#fff',
            }}>
              Odoo Module Scaffolder
            </h1>
            <p style={{ color: colors.muted, fontSize: '1rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
              Fill the form below and download a production-ready Odoo module zip in seconds. No login, no limits.
            </p>
          </div>

          {/* MAIN LAYOUT */}
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem 4rem', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: '24px', alignItems: 'start' }}>

            {/* FORM */}
            <form onSubmit={handleSubmit}>

              {/* Section 1 */}
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '1.5rem', marginBottom: '16px' }}>
                <SectionTitle number="1" title="Module info" subtitle="Basic details about your module" />

                <Field label="Display name *" error={errors.displayName}>
                  <input
                    style={{ ...inputStyle, borderColor: errors.displayName ? colors.error : colors.border }}
                    placeholder="e.g. My Custom Module"
                    value={form.displayName}
                    onChange={e => handleDisplayName(e.target.value)}
                  />
                </Field>

                <Field label="Technical name *" hint="snake_case only — this becomes the module folder name and _name prefix" error={errors.techName}>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={{ ...inputStyle, fontFamily: "'DM Mono', monospace", borderColor: errors.techName ? colors.error : colors.border }}
                      placeholder="my_custom_module"
                      value={form.techName}
                      onChange={e => set('techName', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    />
                  </div>
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Odoo version *">
                    <select
                      style={{ ...inputStyle, cursor: 'pointer' }}
                      value={form.version}
                      onChange={e => set('version', e.target.value)}
                    >
                      {ODOO_VERSIONS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </Field>
                  <Field label="License">
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.license} onChange={e => set('license', e.target.value)}>
                      {LICENSES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Author *" error={errors.author}>
                    <input style={{ ...inputStyle, borderColor: errors.author ? colors.error : colors.border }} placeholder="Your Name or Company" value={form.author} onChange={e => set('author', e.target.value)} />
                  </Field>
                  <Field label="Category">
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.category} onChange={e => set('category', e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Website" >
                  <input style={inputStyle} placeholder="https://yourwebsite.com" value={form.website} onChange={e => set('website', e.target.value)} />
                </Field>

                <Field label="Summary" hint="One-line description shown in the Odoo app list">
                  <input style={inputStyle} placeholder="A short summary of what this module does" value={form.summary} onChange={e => set('summary', e.target.value)} />
                </Field>
              </div>

              {/* Section 2 — Model */}
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '1.5rem', marginBottom: '16px' }}>
                <SectionTitle number="2" title="Model details" subtitle="Used when generating models, views, and security files" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Model name" hint="snake_case — defaults to technical name if left blank">
                    <input style={{ ...inputStyle, fontFamily: "'DM Mono', monospace" }} placeholder={form.techName || 'my_model'} value={form.modelName} onChange={e => set('modelName', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} />
                  </Field>
                  <Field label="Model description">
                    <input style={inputStyle} placeholder={form.displayName || 'My Model'} value={form.modelDescription} onChange={e => set('modelDescription', e.target.value)} />
                  </Field>
                </div>
              </div>

              {/* Section 3 — Dependencies */}
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '1.5rem', marginBottom: '16px' }}>
                <SectionTitle number="3" title="Dependencies" subtitle="Modules this module depends on" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  {form.dependencies.map(dep => (
                    <span key={dep} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '4px 10px', background: colors.purpleLight,
                      border: `1px solid rgba(124,58,237,0.3)`, borderRadius: '20px',
                      fontSize: '12px', fontFamily: "'DM Mono', monospace", color: '#A78BFA',
                    }}>
                      {dep}
                      {dep !== 'base' && (
                        <button type="button" onClick={() => removeDep(dep)} style={{ background: 'none', border: 'none', color: '#A78BFA', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0 }}>×</button>
                      )}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    style={{ ...inputStyle, flex: 1, fontFamily: "'DM Mono', monospace" }}
                    placeholder="Type a module name and press Enter or Add"
                    value={depInput}
                    onChange={e => setDepInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDep(depInput) } }}
                  />
                  <button type="button" onClick={() => addDep(depInput)} style={{
                    padding: '10px 16px', background: colors.purpleLight, border: `1px solid rgba(124,58,237,0.3)`,
                    borderRadius: '10px', color: '#A78BFA', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {COMMON_DEPS.filter(d => !form.dependencies.includes(d)).map(d => (
                    <button key={d} type="button" onClick={() => addDep(d)} style={{
                      padding: '3px 10px', background: 'transparent',
                      border: `1px solid ${colors.border}`, borderRadius: '20px',
                      color: colors.dimmer, cursor: 'pointer', fontSize: '11px',
                      fontFamily: "'DM Mono', monospace", transition: 'all 0.1s',
                    }}>+ {d}</button>
                  ))}
                </div>
              </div>

              {/* Section 4 — Files */}
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '1.5rem', marginBottom: '16px' }}>
                <SectionTitle number="4" title="Include files" subtitle="Choose which folders and files to generate" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <Checkbox id="models" label="Models" desc="models/ folder + sample model class" checked={form.includeModels} onChange={e => set('includeModels', e.target.checked)} />
                  <Checkbox id="views" label="Views" desc="Form, tree, search views + menus + action" checked={form.includeViews} onChange={e => set('includeViews', e.target.checked)} />
                  <Checkbox id="security" label="Security" desc="Groups XML + ir.model.access.csv" checked={form.includeSecurity} onChange={e => set('includeSecurity', e.target.checked)} />
                  <Checkbox id="controllers" label="Controllers" desc="HTTP routes + website templates" checked={form.includeControllers} onChange={e => set('includeControllers', e.target.checked)} />
                  <Checkbox id="wizard" label="Wizard" desc="TransientModel + wizard form view" checked={form.includeWizard} onChange={e => set('includeWizard', e.target.checked)} />
                  <Checkbox id="static" label="Static assets" desc="JS (OWL) + CSS starter files" checked={form.includeStatic} onChange={e => set('includeStatic', e.target.checked)} />
                  <Checkbox id="i18n" label="i18n" desc=".pot translation template file" checked={form.includeI18n} onChange={e => set('includeI18n', e.target.checked)} />
                  <Checkbox id="demo" label="Demo data" desc="Sample XML demo records" checked={form.includeDemo} onChange={e => set('includeDemo', e.target.checked)} />
                </div>
              </div>

              {/* ERRORS */}
              {error && (
                <div style={{ background: colors.errorBg, border: `1px solid rgba(239,68,68,0.3)`, borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: colors.error, fontSize: '13px' }}>
                  {error}
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div style={{ background: colors.greenBg, border: `1px solid ${colors.greenBorder}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: colors.green, fontSize: '13px' }}>
                  ✓ Your module zip is downloading now!
                </div>
              )}

              {/* SUBMIT */}
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px', background: loading ? 'rgba(124,58,237,0.5)' : colors.purple,
                border: 'none', borderRadius: '12px', color: '#fff',
                fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Syne', sans-serif", letterSpacing: '-0.01em',
                transition: 'all 0.2s',
              }}>
                {loading ? 'Generating your module...' : `Generate & Download ${form.techName || 'module'}.zip`}
              </button>
            </form>

            {/* SIDEBAR */}
            <div style={{ position: 'sticky', top: '24px' }}>

              {/* Preview */}
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '1.25rem', marginBottom: '14px' }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: colors.dimmer, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Preview</p>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', lineHeight: 1.9, color: colors.muted }}>
                  <div style={{ color: '#A78BFA', fontWeight: 500 }}>{form.techName || 'your_module'}/</div>
                  <div style={{ paddingLeft: '14px' }}>├── __init__.py</div>
                  <div style={{ paddingLeft: '14px' }}>├── __manifest__.py</div>
                  {form.includeModels && <><div style={{ paddingLeft: '14px' }}>├── models/</div><div style={{ paddingLeft: '28px', color: colors.dimmer }}>└── {form.modelName || form.techName || 'model'}.py</div></>}
                  {form.includeViews && <><div style={{ paddingLeft: '14px' }}>├── views/</div><div style={{ paddingLeft: '28px', color: colors.dimmer }}>└── {form.modelName || form.techName || 'model'}_views.xml</div></>}
                  {form.includeSecurity && <><div style={{ paddingLeft: '14px' }}>├── security/</div><div style={{ paddingLeft: '28px', color: colors.dimmer }}>├── ir.model.access.csv</div><div style={{ paddingLeft: '28px', color: colors.dimmer }}>└── security_groups.xml</div></>}
                  {form.includeControllers && <div style={{ paddingLeft: '14px' }}>├── controllers/</div>}
                  {form.includeWizard && <div style={{ paddingLeft: '14px' }}>├── wizard/</div>}
                  {form.includeStatic && <div style={{ paddingLeft: '14px' }}>├── static/</div>}
                  {form.includeI18n && <div style={{ paddingLeft: '14px' }}>├── i18n/</div>}
                  {form.includeDemo && <div style={{ paddingLeft: '14px' }}>└── demo/</div>}
                </div>
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: colors.dimmer }}>Files to generate</span>
                  <span style={{ color: '#A78BFA', fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>{fileCount}</span>
                </div>
              </div>

              {/* Module info summary */}
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '1.25rem', marginBottom: '14px' }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: colors.dimmer, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Manifest preview</p>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', lineHeight: 1.8, color: colors.muted }}>
                  <div><span style={{ color: colors.dimmer }}>version: </span><span style={{ color: '#86EFAC' }}>'{form.version}.1.0.0'</span></div>
                  <div><span style={{ color: colors.dimmer }}>license: </span><span style={{ color: '#86EFAC' }}>'{form.license}'</span></div>
                  <div><span style={{ color: colors.dimmer }}>depends: </span><span style={{ color: '#86EFAC' }}>[{form.dependencies.map(d => `'${d}'`).join(', ')}]</span></div>
                </div>
              </div>

              {/* Tips */}
              <div style={{ background: colors.purpleLight, border: `1px solid rgba(124,58,237,0.2)`, borderRadius: '16px', padding: '1.25rem' }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Tips</p>
                <ul style={{ fontSize: '12px', color: colors.muted, lineHeight: 1.7, paddingLeft: '14px', margin: 0 }}>
                  <li>Generated code works with Odoo {form.version}</li>
                  <li>All Python files include utf-8 encoding header</li>
                  <li>Models include chatter & tracking support</li>
                  <li>Security CSV is pre-filled for User & Manager roles</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
