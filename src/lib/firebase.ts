import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ApplicationVerifier } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBirtqIZoybUZz_d30Er_TZshbl9dyyXZo",
  authDomain: "unifeel--esoneworld.firebaseapp.com",
  projectId: "unifeel--esoneworld",
  storageBucket: "unifeel--esoneworld.firebasestorage.app",
  messagingSenderId: "801094166684",
  appId: "1:801094166684:web:c9ea55ffe4b964ad23a559"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export let recaptchaVerifier: RecaptchaVerifier | null = null;

export function setupRecaptcha(containerId: string = 'recaptcha-container'): ApplicationVerifier {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      'size': 'invisible',
      'callback': (response: string) => {
        console.log('reCAPTCHA solved:', response);
      }
    });
  }
  return recaptchaVerifier;
}

export async function sendPhoneOTP(phoneNumber: string): Promise<void> {
  const appVerifier = setupRecaptcha();
  
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    (window as any).firebaseConfirmationResult = confirmationResult;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
}

export async function verifyPhoneOTP(otp: string): Promise<any> {
  const confirmationResult = (window as any).firebaseConfirmationResult;
  
  if (!confirmationResult) {
    throw new Error('No OTP sent. Please request OTP first.');
  }

  try {
    const result = await confirmationResult.confirm(otp);
    const user = result.user;
    (window as any).firebaseConfirmationResult = null;
    
    return {
      user,
      userId: user.uid,
      phoneNumber: user.phoneNumber,
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
}


const firebaseConfig = {
  apiKey: "AIzaSyBirtqTZoybU2z_d3OEr_TZshb19dyyXZo",
  authDomain: "unifeel--esoneworld.firebaseapp.com",
  projectId: "unifeel--esoneworld",
  storageBucket: "unifeel--esoneworld.firebasestorage.app",
  messagingSenderId: "801094166684",
  appId: "1:801094166684:web:c9ea55ffe4b964ad23a559"
};