import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { Dialog, FormField, TemplateCards } from './components'
import { SkillsField } from './SkillsField'
import { Field } from './ui/components/field/field'
import { Select } from './ui/components/select/select'
import { Switch } from './ui/components/switch/switch'
import { Textarea } from './ui/components/textarea/textarea'
import type { Template } from './model'
import './index.css'
import './App.css'
import './gallery.css'
import { Disclosure, useLingering } from './motion'

function Gallery() {
  const [dark, setDark] = useState(
    () => matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const [name, setName] = useState('Alex Morgan')
  const [email, setEmail] = useState('missing-at-sign')
  const [profile, setProfile] = useState(
    'Designed clear, accessible experiences.\nImproved task completion by 24%.',
  )
  const [skills, setSkills] = useState('Accessibility, Design systems')
  const [included, setIncluded] = useState(true)
  const [density, setDensity] = useState('comfortable')
  const [dialog, setDialog] = useState(false)
  const dialogView = useLingering(dialog, dialog)
  const [busy, setBusy] = useState(false)
  const [disableTemplates, setDisableTemplates] = useState(false)
  const [template, setTemplate] = useState<Template>('modern')
  const [status, setStatus] = useState('Ready to review')
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])
  useEffect(() => {
    if (!busy) return
    const timer = setTimeout(() => {
      setBusy(false)
      setStatus('Example action complete')
    }, 1800)
    return () => clearTimeout(timer)
  }, [busy])
  return (
    <div className="component-gallery">
      <a className="skip-link" href="#gallery-main">
        Skip to components
      </a>
      <header className="gallery-header">
        <a className="gallery-brand" href="/" aria-label="NeatCV home">
          <img src="/brand.svg" alt="" width="36" height="36" />
          <strong>neat cv</strong>
        </a>
        <button
          className="button secondary"
          aria-pressed={dark}
          onClick={() => setDark(!dark)}
        >
          Dark theme
        </button>
      </header>
      <main id="gallery-main">
        <div className="gallery-intro">
          <p className="gallery-eyebrow">NEATCV / COMPONENTS</p>
          <h1>Small details. Consistent care.</h1>
          <p>
            Real editor components, ready for a closer look. Try the keyboard,
            change the theme, narrow the screen. Changes here are temporary and
            leave your resume untouched.
          </p>
          <nav aria-label="Component groups">
            <a href="#fields">Fields</a>
            <a href="#actions">Actions</a>
            <a href="#skills">Skills</a>
            <a href="#templates">Templates</a>
          </nav>
        </div>
        <div className="gallery-grid">
          <section
            id="fields"
            className="gallery-card"
            aria-labelledby="fields-title"
          >
            <p className="gallery-eyebrow">01 / WRITING</p>
            <h2 id="fields-title">Fields & feedback</h2>
            <FormField
              label="Full name"
              value={name}
              onChange={setName}
              hint="A normal editable field with a linked hint."
            />
            <FormField
              label="Email — blur to validate"
              value={email}
              onChange={setEmail}
              inputMode="email"
              autoCapitalize="none"
              validate={(value) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
                  ? undefined
                  : 'Enter a valid email address.'
              }
            />
            <Field
              className="field"
              label="Email with an error"
              error="Enter a valid email address."
            >
              <input defaultValue="invalid-email" />
            </Field>
            <Field
              className="field"
              label="Unavailable field"
              hint="Disabled controls remain visible."
            >
              <input disabled value="Unavailable" readOnly />
            </Field>
            <Field
              className="field"
              label="Berufsbezeichnung oder Spezialisierung — eine lange Beschriftung zur Prüfung schmaler Bildschirme"
            >
              <input lang="de" placeholder="Frontend-Entwicklerin" />
            </Field>
          </section>
          <section className="gallery-card" aria-labelledby="choices-title">
            <p className="gallery-eyebrow">02 / CHOOSING</p>
            <h2 id="choices-title">Choices & long text</h2>
            <Field className="field" label="Text density">
              <Select
                className="ui-select"
                value={density}
                onChange={(event) => setDensity(event.target.value)}
              >
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </Select>
            </Field>
            <Field className="field" label="Unavailable choice">
              <Select className="ui-select" disabled defaultValue="locked">
                <option value="locked">Unavailable</option>
              </Select>
            </Field>
            <div className="switch-row">
              <Switch
                className="ui-switch"
                label="Include this section"
                checked={included}
                onChange={(event) => setIncluded(event.target.checked)}
              />
            </div>
            <div className="switch-row">
              <Switch
                className="ui-switch"
                label="Unavailable switch"
                disabled
                checked={false}
                readOnly
              />
            </div>
            <Field
              className="field"
              label="Profile"
              hint="Multiline writing keeps Enter as a new line."
            >
              <Textarea
                className="ui-textarea"
                rows={3}
                autoGrow
                showCount
                maxLength={300}
                value={profile}
                onChange={(event) => setProfile(event.target.value)}
              />
            </Field>
          </section>
          <section
            id="actions"
            className="gallery-card"
            aria-labelledby="actions-title"
          >
            <p className="gallery-eyebrow">03 / DOING</p>
            <h2 id="actions-title">Actions & dialog</h2>
            <div className="gallery-actions">
              <button
                className="button primary"
                disabled={busy}
                aria-busy={busy}
                onClick={() => {
                  setBusy(true)
                  setStatus('Preparing example action…')
                }}
              >
                {busy ? (
                  <>
                    <LoaderCircle size={18} aria-hidden="true" />
                    Preparing…
                  </>
                ) : (
                  <>
                    Try loading state
                    <ArrowRight size={18} aria-hidden="true" />
                  </>
                )}
              </button>
              <button
                className="button secondary"
                onClick={(event) => {
                  event.currentTarget.focus({ preventScroll: true })
                  setDialog(true)
                }}
              >
                Open dialog
              </button>
              <button className="button primary" disabled>
                Unavailable action
              </button>
            </div>
            <p className="gallery-status" role="status">
              {status}
            </p>
            <p>
              Escape closes the dialog and returns focus. Tab stays inside while
              it is open.
            </p>
            <Disclosure
              summary="Expandable details"
              className="gallery-disclosure"
            >
              <div className="gallery-disclosure-content">
                <p>
                  Open and close this block, including halfway through a
                  transition.
                </p>
                <Field
                  className="field"
                  label="A field inside the expanded block"
                >
                  <input defaultValue="Your work stays here while the block is open" />
                </Field>
              </div>
            </Disclosure>
          </section>
          <section
            id="skills"
            className="gallery-card is-editing"
            aria-labelledby="skills-title"
          >
            <p className="gallery-eyebrow">04 / ADDING</p>
            <h2 id="skills-title">Skills & suggestions</h2>
            <SkillsField
              value={skills}
              onChange={setSkills}
              locale="en"
              lang="en"
              jobTitle="Product designer"
            />
          </section>
        </div>
        <section
          id="templates"
          className="gallery-card"
          aria-labelledby="templates-title"
        >
          <p className="gallery-eyebrow">05 / PRESENTING</p>
          <h2 id="templates-title">The twelve templates</h2>
          <div className="switch-row">
            <Switch
              className="ui-switch"
              label="Disable template choices"
              checked={disableTemplates}
              onChange={(event) => setDisableTemplates(event.target.checked)}
            />
          </div>
          <p className="gallery-status" role="status">
            Selected template: {template}
          </p>
          <TemplateCards
            locale="en"
            disabled={disableTemplates}
            onPick={setTemplate}
          />
        </section>
      </main>
      <footer className="gallery-footer">
        <a href="/#/edit">
          Back to the resume editor <ArrowRight size={16} aria-hidden="true" />
        </a>
      </footer>
      {dialogView.shown && (
        <Dialog
          closing={dialogView.closing}
          title="Continue with your latest edits"
          closeLabel="Close dialog"
          close={() => setDialog(false)}
        >
          <p>
            This is the same native dialog used by the editor. Long content
            should remain readable on a phone, and its actions should stay
            reachable without sideways scrolling.
          </p>
          <Field className="field" label="Copy name">
            <input defaultValue="Application — Frontend engineer" />
          </Field>
          <div className="dialog-actions">
            <button
              className="button secondary"
              onClick={() => setDialog(false)}
            >
              Cancel
            </button>
            <button
              className="button primary"
              onClick={() => {
                setStatus('Example copy saved')
                setDialog(false)
              }}
            >
              Save example copy
            </button>
          </div>
        </Dialog>
      )}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
)
