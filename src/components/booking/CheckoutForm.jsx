import Input from '../ui/Input.jsx';

const digits = (v) => String(v ?? '').replace(/\D/g, '');

/** Client-side mirror of the API's checks, so the Pay button only lights up for a request that can succeed. */
export const checkoutRules = {
  fullName: (v) => (!v.trim() ? 'Name is required' : v.trim().length < 3 ? 'Name must be at least 3 characters' : ''),
  email: (v) => (!v.trim() ? 'Email is required' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address'),
  mobileNumber: (v) => {
    const d = digits(v);
    if (!d) return 'Mobile number is required';
    if (!d.startsWith('5')) return 'Georgian mobile numbers must start with 5';
    return d.length === 9 ? '' : 'Mobile number must be exactly 9 digits';
  },
  cardNumber: (v) => (digits(v).length === 16 ? '' : 'Card number must be 16 digits'),
  expiry: (v) => {
    const m = /^(\d{2})\/(\d{2})$/.exec(v);
    if (!m || +m[1] < 1 || +m[1] > 12) return 'Use the MM/YY format';
    const now = new Date();
    const year = 2000 + +m[2];
    const expired = year < now.getFullYear() || (year === now.getFullYear() && +m[1] < now.getMonth() + 1);
    return expired ? 'This card has expired' : '';
  },
  cvv: (v) => (/^\d{3}$/.test(v) ? '' : 'CVV must be 3 digits'),
};

export const CHECKOUT_FIELDS = Object.keys(checkoutRules);
export const isCheckoutValid = (values) => CHECKOUT_FIELDS.every((key) => !checkoutRules[key](values[key] ?? ''));

/** "555123456" -> "555 123 456" */
export const formatMobile = (v) => digits(v).slice(0, 9).replace(/(\d{3})(?=\d)/g, '$1 ');

const MASKS = {
  mobileNumber: formatMobile,
  cardNumber: (v) => digits(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '),
  expiry: (v) => {
    const d = digits(v).slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  },
  cvv: (v) => digits(v).slice(0, 3),
};

/**
 * Contact and card fields for the checkout step. Field names are the API's
 * (fullName, email, mobileNumber, cardNumber, expiry, cvv) so a 422 `errors`
 * object maps straight onto the inputs.
 */
export default function CheckoutForm({ values, touched, serverErrors = {}, disabled = false, onChange, onBlur }) {
  const field = (name) => ({
    name,
    value: values[name],
    disabled,
    onChange: (e) => onChange(name, MASKS[name] ? MASKS[name](e.target.value) : e.target.value),
    onBlur: () => onBlur(name),
    error: serverErrors[name] || (touched[name] ? checkoutRules[name](values[name] ?? '') : ''),
    success: Boolean(values[name]) && !checkoutRules[name](values[name]) && !serverErrors[name],
  });

  return (
    <div className="flex flex-col gap-6">
      <Input label="Full name" autoComplete="name" placeholder="e.g. Text" {...field('fullName')} />
      <div className="grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2">
        <Input label="Email" type="email" autoComplete="email" placeholder="e.g. Text" {...field('email')} />
        <Input label="Mobile number" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="e.g. Text" {...field('mobileNumber')} />
      </div>
      <div aria-hidden="true" className="h-px rounded-full bg-card" />
      <Input label="Card number" inputMode="numeric" autoComplete="cc-number" placeholder="e.g. 1234 4567 8901 2345" {...field('cardNumber')} />
      <div className="grid grid-cols-2 gap-x-3">
        <Input label="Expiry" inputMode="numeric" autoComplete="cc-exp" placeholder="e.g. 12/34" {...field('expiry')} />
        <Input label="CVV" inputMode="numeric" autoComplete="cc-csc" placeholder="e.g. 123" {...field('cvv')} />
      </div>
    </div>
  );
}
