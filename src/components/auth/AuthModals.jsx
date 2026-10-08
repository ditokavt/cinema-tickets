import { useApp } from '../../context/AppContext.jsx';
import LoginModal from './LoginModal.jsx';
import SignupModal from './SignupModal.jsx';

/** Mounted once in the layout; the context decides which overlay is open. */
export default function AuthModals() {
  const { authModal } = useApp();
  if (authModal === 'login') return <LoginModal />;
  if (authModal === 'signup') return <SignupModal />;
  return null;
}
