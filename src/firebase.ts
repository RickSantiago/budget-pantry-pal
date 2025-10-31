import app, { db } from '@/lib/firebase';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Initialize auth and providers using the already-initialized app
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { db };
export default app;