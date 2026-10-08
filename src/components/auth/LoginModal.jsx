import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import Button from '../ui/Button.jsx';
import { X } from '../ui/Icons.jsx';
import Input from '../ui/Input.jsx';
import Modal from '../ui/Modal.jsx';
import { fieldErrors, rules } from './validation.js';

export default function LoginModal() {
  const { login, openAuth, closeAuth } = useApp();
  const [values, setValues] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [server, setServer] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const errors = { email: rules.email(values.email), password: rules.password(values.password) };
  const valid = !errors.email && !errors.password;
  const filled = Boolean(values.email.trim() && values.password);

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

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!valid || busy) return;
    setBusy(true);
    try {
      await login({ email: values.email.trim(), password: values.password });
    } catch (err) {
      if (err.isValidation) setServer(fieldErrors(err));
      else setFormError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={closeAuth} labelledBy="login-title" className="max-w-[403px]">
      <form onSubmit={submit} noValidate className="px-5 pb-[31px] pt-[31px] sm:px-[31px]">
        <button
          type="button"
          aria-label="Close"
          onClick={closeAuth}
          className="absolute right-[30px] top-[30px] flex size-7 items-center justify-center rounded-full text-white transition-colors duration-150 hover:bg-tint"
        >
          <X size={24} strokeWidth={1.75} aria-hidden="true" />
        </button>

        <h2 id="login-title" className="t-h2">
          Log in
        </h2>
        <p className="t-body-s mt-2 text-secondary">Welcome back to Kino XII</p>

        <div className="mt-6 flex flex-col gap-6">
          <Input label="Email" type="email" name="email" autoComplete="email" placeholder="example@gmail.com" {...field('email')} />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...field('password')}
          />
        </div>

        {formError && (
          <p role="alert" className="t-body-s mt-3 text-brand">
            {formError}
          </p>
        )}

        <Button type="submit" fullWidth disabled={!filled || busy} aria-busy={busy} className="mt-8">
          {busy ? 'Logging in…' : 'Log in'}
        </Button>

        <p className="t-body-m mt-6 flex justify-center gap-[5px] text-secondary">
          Don’t have an account?
          <button type="button" onClick={() => openAuth('signup')} className="font-extrabold text-brand hover:underline">
            Sign up
          </button>
        </p>
      </form>
    </Modal>
  );
}
