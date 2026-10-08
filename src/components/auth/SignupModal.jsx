import { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import Button from '../ui/Button.jsx';
import { Upload, X } from '../ui/Icons.jsx';
import Input from '../ui/Input.jsx';
import Modal from '../ui/Modal.jsx';
import { fieldErrors, rules } from './validation.js';

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export default function SignupModal() {
  const { register, openAuth, closeAuth } = useApp();
  const fileRef = useRef(null);
  const [values, setValues] = useState({ username: '', email: '', password: '', confirm: '' });
  const [avatar, setAvatar] = useState(null); // the File sent to /register
  const [preview, setPreview] = useState(null);
  const [avatarError, setAvatarError] = useState('');
  const [touched, setTouched] = useState({});
  const [server, setServer] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const errors = {
    username: rules.username(values.username),
    email: rules.email(values.email),
    password: rules.password(values.password),
    confirm: rules.confirm(values.confirm, values.password),
  };
  const valid = Object.values(errors).every((e) => !e);
  const filled = Boolean(values.username.trim() && values.email.trim() && values.password && values.confirm);

  const field = (name) => ({
    value: values[name],
    onChange: (e) => {
      setValues((v) => ({ ...v, [name]: e.target.value }));
      setServer((s) => ({ ...s, [name]: '' }));
      setFormError('');
    },
    onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
    error: server[name] || (touched[name] && values[name] ? errors[name] : ''),
    success: Boolean(values[name]) && !errors[name] && !server[name],
  });

  const pickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // picking the same file again must still fire
    if (!AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Unsupported format. Use a JPG, PNG or WEBP image.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('The image must be 2MB or smaller.');
      return;
    }
    setAvatarError('');
    setAvatar(file);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, email: true, password: true, confirm: true });
    if (!valid || busy) return;
    setBusy(true);
    try {
      await register({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        passwordConfirmation: values.confirm,
        avatar,
      });
    } catch (err) {
      if (err.isValidation) {
        const fields = fieldErrors(err, { password_confirmation: 'confirm' });
        setServer(fields);
        if (fields.avatar) setAvatarError(fields.avatar);
      } else setFormError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={closeAuth} labelledBy="signup-title" className="max-w-[475px]">
      <form onSubmit={submit} noValidate className="px-5 pb-[31px] pt-[31px] sm:px-[31px]">
        <button
          type="button"
          aria-label="Close"
          onClick={closeAuth}
          className="absolute right-[30px] top-[30px] flex size-7 items-center justify-center rounded-full text-white transition-colors duration-150 hover:bg-tint"
        >
          <X size={24} strokeWidth={1.75} aria-hidden="true" />
        </button>

        <h2 id="signup-title" className="t-h2">
          Sign up
        </h2>
        <p className="t-body-s mt-2 text-secondary">Welcome to Kino XII</p>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Upload avatar"
            className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-card text-secondary transition-colors duration-150 hover:bg-raised"
          >
            {preview ? (
              <img src={preview} alt="" className="size-full object-cover" />
            ) : (
              <Upload size={16} strokeWidth={1.8} aria-hidden="true" />
            )}
          </button>
          <div className="min-w-0">
            <p className="t-button">Upload avatar (optional)</p>
            <p className={`t-body-s mt-[3px] ${avatarError ? 'text-brand' : 'text-secondary'}`}>{avatarError || 'JPG, PNG or WEBP'}</p>
          </div>
          <input ref={fileRef} type="file" accept={AVATAR_TYPES.join(',')} onChange={pickAvatar} className="sr-only" tabIndex={-1} />
        </div>

        <div className="mt-8 flex flex-col gap-6">
          <Input label="Username" name="username" autoComplete="username" placeholder="User" {...field('username')} />
          <Input label="Email" type="email" name="email" autoComplete="email" placeholder="example@gmail.com" {...field('email')} />
          <div className="grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2">
            <Input
              label="password"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...field('password')}
            />
            <Input
              label="Confirm password"
              type="password"
              name="confirm"
              autoComplete="new-password"
              placeholder="••••••••"
              {...field('confirm')}
            />
          </div>
        </div>

        {formError && (
          <p role="alert" className="t-body-s mt-3 text-brand">
            {formError}
          </p>
        )}

        <Button type="submit" fullWidth disabled={!filled || busy} aria-busy={busy} className="mt-8">
          {busy ? 'Creating account…' : 'Sign up'}
        </Button>

        <p className="t-body-m mt-6 flex justify-center gap-[5px] text-secondary">
          Already have an account?
          <button type="button" onClick={() => openAuth('login')} className="font-extrabold text-brand hover:underline">
            Log in
          </button>
        </p>
      </form>
    </Modal>
  );
}
