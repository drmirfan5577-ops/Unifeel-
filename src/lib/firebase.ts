import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ApplicationVerifier } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "آپ_کی_API_KEY",
  authDomain: "آپ_کا_PROJECT_ID.firebaseapp.com",
  projectId: "آپ_کا_PROJECT_ID",
  storageBucket: "آپ_کا_PROJECT_ID.appspot.com",
  messagingSenderId: "آپ_کا_MESSAGING_SENDER_ID",
  appId: "آپ_کا_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Setup reCAPTCHA verifier
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

export async function sendPhoneOTP(phoneNumber: string, otp: string): Promise<void> {
  const appVerifier = setupRecaptcha();
  
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    // Store confirmation result for verification
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
    
    // Clean up
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