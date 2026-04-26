// src/pages/Settings.jsx
// ─── System Settings: editable config, save to local state ────

import React, { useState } from 'react'
import {
  Settings as SettingsIcon, Save, RotateCcw, Zap, Bell,
  Map, Clock, Shield, Globe, Database, CheckCircle, AlertTriangle,
} from 'lucide-react'

const DEFAULTS = {
  systemName: 'Civitas AI Dispatch',
  orgName: 'Pune District EOC',
  timezone: 'Asia/Kolkata',
  language: 'en-IN',
  criticalAlertThreshold: 'critical',
  alertCooldownMinutes: 5,
  maxVolunteersPerIssue: 3,
  autoDispatchEnabled: true,
  aiModel: 'gemini-1.5-flash',
  aiConfidenceThreshold: 0.75,
  aiSummaryEnabled: true,
  mapDefaultZoom: 12,
  mapCenter: '18.52°N, 73.86°E',
  dataRetentionDays: 30,
  firestoreRegion: 'asia-south1',
  maintenanceMode: false,
}

function Field({ label, desc, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, padding: '14px 0', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, color = 'var(--color-cyan)' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '16px 0 10px', marginTop: 8,
      borderBottom: `1px solid ${color}30`,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 6,
        background: `${color}15`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={13} color={color} />
      </div>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color, textTransform: 'uppercase' }}>{title}</span>
    </div>
  )
}

function TextInput({ value, onChange, placeholder, mono }) {
  return (
    <input
      className="form-input"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: 240, fontFamily: mono ? 'var(--font-mono)' : undefined, fontSize: 12 }}
    />
  )
}

function NumberInput({ value, onChange, min, max, step = 1 }) {
  return (
    <input
      type="number"
      className="form-input"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      min={min} max={max} step={step}
      style={{ width: 100, fontFamily: 'var(--font-mono)', fontSize: 12 }}
    />
  )
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      className="form-input"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ width: 200, fontSize: 12, appearance: 'none', cursor: 'pointer' }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', padding: 0,
        background: value ? 'var(--color-cyan)' : 'var(--color-muted)',
        position: 'relative', transition: 'background 0.25s',
        boxShadow: value ? '0 0 10px rgba(0,212,255,0.4)' : 'none',
      }}
    >
      <div style={{
        position: 'absolute', top: 4, left: value ? 23 : 4,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        transition: 'left 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  )
}

function SliderInput({ value, onChange, min, max, step = 0.05 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: 140, accentColor: 'var(--color-cyan)' }}
      />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-cyan)', width: 36, textAlign: 'right' }}>
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  )
}

export default function Settings() {
  const [settings, setSettings] = useState(DEFAULTS)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)

  function set(key, value) {
    setSettings(s => ({ ...s, [key]: value }))
    setDirty(true)
    setSaved(false)
  }

  function handleSave() {
    // In a real app: push to Firestore / API
    setSaved(true)
    setDirty(false)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleReset() {
    setSettings(DEFAULTS)
    setDirty(false)
    setSaved(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Save bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 24px', borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SettingsIcon size={13} style={{ color: 'var(--color-text-muted)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
            SYSTEM CONFIGURATION
          </span>
          {dirty && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em',
              padding: '2px 8px', borderRadius: 3,
              background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)',
            }}>
              UNSAVED CHANGES
            </span>
          )}
          {saved && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em',
              padding: '2px 8px', borderRadius: 3,
              background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <CheckCircle size={9} /> SAVED
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={handleReset} style={{ fontSize: 12 }}>
            <RotateCcw size={12} /> Reset to Defaults
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <Save size={12} /> Save Settings
          </button>
        </div>
      </div>

      {/* Settings body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 40px' }}>

          {/* General */}
          <SectionHeader icon={Globe} title="General" color="var(--color-cyan)" />
          <Field label="System Name" desc="Display name shown across all dashboards and reports">
            <TextInput value={settings.systemName} onChange={v => set('systemName', v)} placeholder="Civitas AI Dispatch" />
          </Field>
          <Field label="Organisation Name" desc="Name of the deploying organisation or EOC">
            <TextInput value={settings.orgName} onChange={v => set('orgName', v)} placeholder="Pune District EOC" />
          </Field>
          <Field label="Timezone" desc="All timestamps will use this timezone">
            <SelectInput value={settings.timezone} onChange={v => set('timezone', v)} options={[
              { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
              { value: 'UTC', label: 'UTC' },
              { value: 'Asia/Dubai', label: 'Asia/Dubai' },
              { value: 'Europe/London', label: 'Europe/London' },
            ]} />
          </Field>
          <Field label="Language / Locale" desc="Interface language and date format">
            <SelectInput value={settings.language} onChange={v => set('language', v)} options={[
              { value: 'en-IN', label: 'English (India)' },
              { value: 'en-US', label: 'English (US)' },
              { value: 'hi-IN', label: 'Hindi (India)' },
            ]} />
          </Field>
          <Field label="Maintenance Mode" desc="Disable all dispatch operations — use during updates only">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Toggle value={settings.maintenanceMode} onChange={v => set('maintenanceMode', v)} />
              {settings.maintenanceMode && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#ef4444', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertTriangle size={9} /> ACTIVE
                </span>
              )}
            </div>
          </Field>

          {/* Alerts */}
          <SectionHeader icon={Bell} title="Alerts & Thresholds" color="#f59e0b" />
          <Field label="Critical Alert Threshold" desc="Minimum urgency level to trigger immediate push alerts">
            <SelectInput value={settings.criticalAlertThreshold} onChange={v => set('criticalAlertThreshold', v)} options={[
              { value: 'critical', label: 'Critical only' },
              { value: 'high', label: 'High and above' },
              { value: 'medium', label: 'Medium and above' },
              { value: 'low', label: 'All issues' },
            ]} />
          </Field>
          <Field label="Alert Cooldown" desc="Minimum minutes between repeat alerts for the same issue">
            <NumberInput value={settings.alertCooldownMinutes} onChange={v => set('alertCooldownMinutes', v)} min={1} max={60} />
          </Field>
          <Field label="Max Volunteers per Issue" desc="Maximum volunteers auto-dispatched to a single issue">
            <NumberInput value={settings.maxVolunteersPerIssue} onChange={v => set('maxVolunteersPerIssue', v)} min={1} max={10} />
          </Field>

          {/* AI */}
          <SectionHeader icon={Zap} title="AI Engine" color="#8b5cf6" />
          <Field label="AI Auto-Dispatch" desc="Automatically match and dispatch volunteers using AI scoring">
            <Toggle value={settings.autoDispatchEnabled} onChange={v => set('autoDispatchEnabled', v)} />
          </Field>
          <Field label="AI Model" desc="LLM used for issue analysis and volunteer matching">
            <SelectInput value={settings.aiModel} onChange={v => set('aiModel', v)} options={[
              { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fast)' },
              { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Accurate)' },
              { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
            ]} />
          </Field>
          <Field label="Confidence Threshold" desc="Minimum AI confidence score to auto-dispatch a match">
            <SliderInput value={settings.aiConfidenceThreshold} onChange={v => set('aiConfidenceThreshold', v)} min={0.5} max={1} step={0.05} />
          </Field>
          <Field label="AI Issue Summaries" desc="Generate AI summaries for all incoming issues">
            <Toggle value={settings.aiSummaryEnabled} onChange={v => set('aiSummaryEnabled', v)} />
          </Field>

          {/* Map */}
          <SectionHeader icon={Map} title="Map Configuration" color="#10b981" />
          <Field label="Default Zoom Level" desc="Initial zoom level for the dispatch map (1–20)">
            <NumberInput value={settings.mapDefaultZoom} onChange={v => set('mapDefaultZoom', v)} min={5} max={20} />
          </Field>
          <Field label="Map Centre" desc="Default lat/lng coordinates for map centre">
            <TextInput value={settings.mapCenter} onChange={v => set('mapCenter', v)} placeholder="18.52°N, 73.86°E" mono />
          </Field>

          {/* Data */}
          <SectionHeader icon={Database} title="Data & Storage" color="#ef4444" />
          <Field label="Data Retention" desc="Days to retain resolved issues and logs before archiving">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <NumberInput value={settings.dataRetentionDays} onChange={v => set('dataRetentionDays', v)} min={7} max={365} />
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>days</span>
            </div>
          </Field>
          <Field label="Firestore Region" desc="GCP region where data is stored">
            <SelectInput value={settings.firestoreRegion} onChange={v => set('firestoreRegion', v)} options={[
              { value: 'asia-south1', label: 'asia-south1 (Mumbai)' },
              { value: 'us-central1', label: 'us-central1 (Iowa)' },
              { value: 'europe-west1', label: 'europe-west1 (Belgium)' },
            ]} />
          </Field>

        </div>
      </div>
    </div>
  )
}
