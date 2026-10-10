import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { ageFrom, today } from '../../lib/format.js';
import Button from '../ui/Button.jsx';
import { Calendar } from '../ui/Icons.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import { eligibility, isProfileValid, PROFILE_FIELDS, profileRules } from './validation.js';

/** "599123456" -> "599 123 456", as the designs show it. Anything else is left as typed. */
const spaced = (mobile) => (/^\d{9}$/.test(mobile ?? '') ? mobile.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3') : (mobile ?? ''));
const compact = (mobile) => String(mobile ?? '').replace(/\s+/g, '');

const fromUser = (u) => ({
  fullName: u.fullName ?? '',
  mobileNumber: spaced(u.mobileNumber),
  dateOfBirth: u.dateOfBirth ?? '',
  preferredVenueId: u.preferredVenue?.id ?? '',
});

const same = (a, b) =>
  a.fullName.trim() === b.fullName.trim() &&
  compact(a.mobileNumber) === compact(b.mobileNumber) &&
  a.dateOfBirth === b.dateOfBirth &&
  String(a.preferredVenueId) === String(b.preferredVenueId);

/**
 * Personal Information. Email is fixed at registration and so is the avatar:
 * neither can be changed here. "Save changes" wakes up only once something has
 * changed and every field is valid; what is shown afterwards is the API's answer.
 */
export default function ProfileForm() {
  const { user, filterOptions, updateProfile, handleUnauthorized } = useApp();
  const [values, setValues] = useState(() => fromUser(user));
  const [touched, setTouched] = useState({});
  const [server, setServer] = useState({});
  const [status, setStatus] = useState('idle'); // idle | saving | saved | failed
  const [failure, setFailure] = useState('');
  const [dobFocused, setDobFocused] = useState(false);
  const dobRef = useRef(null);

  useEffect(() => {
    setValues(fromUser(user));
    setTouched({});
    setServer({});
  }, [user]);

  const saved = fromUser(user);
  const dirty = !same(values, saved);
  const valid = isProfileValid(values);
  const saving = status === 'saving';

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setServer((e) => ({ ...e, [name]: '' }));
    setStatus('idle');
  };
  const blur = (name) => setTouched((t) => ({ ...t, [name]: true }));
  const errorOf = (name) => server[name] || (touched[name] ? profileRules[name](values[name]) : '');

  const save = async () => {
    setTouched(Object.fromEntries(PROFILE_FIELDS.map((name) => [name, true])));
    if (!dirty || !valid || saving) return;
    setStatus('saving');
    try {
      await updateProfile({ ...values, fullName: values.fullName.trim(), mobileNumber: compact(values.mobileNumber) });
      setStatus('saved');
    } catch (err) {
      if (handleUnauthorized(err, save)) {
        setStatus('idle');
        return;
      }
      const fields = {};
      Object.entries(err.errors ?? {}).forEach(([key, messages]) => {
        fields[key] = Array.isArray(messages) ? messages[0] : String(messages);
      });
      setServer(fields);
      setFailure(err.errors ? '' : err.message);
      setStatus(err.errors ? 'idle' : 'failed');
    }
  };

  const venueOptions = [{ value: '', label: 'No preference' }, ...(filterOptions?.venues ?? []).map((v) => ({ value: v.id, label: v.name }))];
  const dobError = errorOf('dateOfBirth');
  const age = values.dateOfBirth && !profileRules.dateOfBirth(values.dateOfBirth) ? ageFrom(values.dateOfBirth) : null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      noValidate
      className="w-full max-w-[880px]"
    >
      <div className="flex flex-col gap-5">
        <Input
          className="-mb-[2px]"
          label="Full name"
          name="fullName"
          autoComplete="name"
          placeholder="e.g. Text"
          maxLength={60}
          value={values.fullName}
          onChange={(e) => set('fullName', e.target.value)}
          onBlur={() => blur('fullName')}
          error={errorOf('fullName')}
          disabled={saving}
        />
        <Input label="Email" name="email" value={user.email} disabled readOnly helper="Set at registration and cannot be changed" className="-mb-[2px]" />
        <Input
          label="Mobile number"
          name="mobileNumber"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="e.g. Text"
          value={values.mobileNumber}
          onChange={(e) => set('mobileNumber', e.target.value)}
          onBlur={() => {
            blur('mobileNumber');
            setValues((v) => ({ ...v, mobileNumber: spaced(compact(v.mobileNumber)) }));
          }}
          error={errorOf('mobileNumber')}
          disabled={saving}
        />
        <Input
          ref={dobRef}
          label="Date of birth"
          name="dateOfBirth"
          type={dobFocused || values.dateOfBirth ? 'date' : 'text'}
          max={today()}
          autoComplete="bday"
          placeholder="e.g. Text"
          value={values.dateOfBirth}
          onChange={(e) => set('dateOfBirth', e.target.value)}
          onFocus={() => setDobFocused(true)}
          onBlur={() => {
            setDobFocused(false);
            blur('dateOfBirth');
          }}
          error={dobError}
          helper={eligibility(age, filterOptions?.ageRatings)}
          disabled={saving}
          inputClassName="pr-11"
          rightSlot={
            <button
              type="button"
              aria-label="Open date picker"
              tabIndex={-1}
              onClick={() => {
                setDobFocused(true);
                requestAnimationFrame(() => {
                  dobRef.current?.focus();
                  dobRef.current?.showPicker?.();
                });
              }}
              className="flex size-6 items-center justify-center text-white"
            >
              <Calendar size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
          }
        />
        <Select label="Preferred Venue (Optional)" value={values.preferredVenueId} onChange={(v) => set('preferredVenueId', v)} options={venueOptions} />
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={!dirty || !valid || saving} aria-busy={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        <p aria-live="polite" className="t-label-s">
          {status === 'saved' && !dirty && <span className="text-success">Changes saved</span>}
          {status === 'failed' && <span className="text-brand">{failure || 'Could not save. Please try again.'}</span>}
        </p>
      </div>
    </form>
  );
}
