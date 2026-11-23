import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Status from "../components/Status";

function AuthShell({ eyebrow, title, description, children }) {
  return <div className="grid min-h-[calc(100vh-76px)] bg-turbo-paper lg:grid-cols-2">
    <div className="flex items-center justify-center px-6 py-14"><div className="w-full max-w-md">
      <Link to="/" className="font-display text-4xl font-black tracking-[-2px]">TURBO<span className="text-lime-600">.</span></Link>
      <p className="mt-12 text-[11px] font-black uppercase tracking-[.25em] text-neutral-500">{eyebrow}</p>
      <h1 className="mt-3 font-display text-6xl font-black uppercase leading-[.95] tracking-tight">{title}</h1>
      <p className="mt-5 max-w-sm text-sm leading-6 text-neutral-500">{description}</p>
      <div className="mt-8">{children}</div>
    </div></div>
    <div className="relative hidden min-h-[700px] overflow-hidden bg-neutral-900 lg:block">
      <img src="https://images.pexels.com/photos/36510848/pexels-photo-36510848.jpeg?auto=compress&cs=tinysrgb&w=1400" alt="Menswear campaign" className="absolute inset-0 h-full w-full object-cover opacity-80"/>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/10"/>
      <div className="absolute bottom-12 left-12 right-12 text-white"><p className="text-xs font-bold uppercase tracking-[.3em] text-turbo-lime">TURBO / 001</p><p className="mt-3 max-w-lg font-display text-6xl font-black uppercase leading-[.9]">Move with<br/>your own pace.</p></div>
    </div>
  </div>;
}
function Field({ label, ...props }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider">{label}</span><input {...props} className="field"/></label>;
}

export function Signup() {
  const [form,setForm] = useState({name:"",email:"",password:""});
  const [message,setMessage] = useState(""); const [error,setError] = useState(false); const [busy,setBusy] = useState(false);
  const nav = useNavigate();
  const submit = async e => {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const result = await api("/auth/signup",{method:"POST",body:form});
      nav(`/verify-email?email=${encodeURIComponent(result.email || form.email)}`);
    } catch(err) {
      if (err.status === 503) { nav(`/verify-email?email=${encodeURIComponent(form.email)}`); return; }
      setMessage(err.message); setError(true);
    } finally { setBusy(false); }
  };
  return <AuthShell eyebrow="Your TURBO account" title={<>Create<br/>account.</>} description="Join the movement. Create your account to unlock your personal shopping space, orders and saved cart.">
    <form onSubmit={submit} className="space-y-4">
      <Field label="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} minLength="2" maxLength="80" required autoComplete="name"/>
      <Field label="Email address" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required autoComplete="email"/>
      <Field label="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} minLength="8" maxLength="72" required autoComplete="new-password"/>
      <p className="text-[11px] text-neutral-500">Use at least 8 characters. Passwords are securely hashed by the existing backend.</p>
      <Status error={error}>{message}</Status>
      <button disabled={busy} className="btn-primary w-full">{busy?"Creating account...":"Create your account"} <ArrowRight size={17}/></button>
    </form>
    <p className="mt-6 text-sm text-neutral-500">Already registered? <Link className="font-bold text-black underline" to="/login">Sign in</Link></p>
  </AuthShell>;
}

export function Login() {
  const [form,setForm] = useState({email:"",password:""}); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  const {login} = useAuth(); const nav=useNavigate();
  const submit=async e=>{e.preventDefault();setBusy(true);setMessage("");try{await login(form);nav("/home");}catch(err){setMessage(err.message);}finally{setBusy(false);}};
  return <AuthShell eyebrow="Welcome back" title={<>Sign<br/>in.</>} description="Sign in to continue shopping, manage your account and track your TURBO orders.">
    <form onSubmit={submit} className="space-y-4">
      <Field label="Email address" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required autoComplete="email"/>
      <Field label="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required autoComplete="current-password"/>
      <div className="text-right"><Link className="text-xs font-bold underline" to="/forgot-password">Forgot password?</Link></div>
      <Status error>{message}</Status>
      <button disabled={busy} className="btn-primary w-full">{busy?"Signing in...":"Sign in"} <ArrowRight size={17}/></button>
    </form>
    <p className="mt-4 text-sm text-neutral-500">Need to verify your email? <Link className="font-bold text-black underline" to="/verify-email">Verify email</Link></p>
    <p className="mt-6 text-sm text-neutral-500">New to TURBO? <Link className="font-bold text-black underline" to="/signup">Create an account</Link></p>
  </AuthShell>;
}

export function VerifyEmail() {
  const [params] = useSearchParams(); const [email,setEmail]=useState(params.get("email")||""); const [otp,setOtp]=useState("");
  const [message,setMessage]=useState(""); const [error,setError]=useState(false); const [busy,setBusy]=useState(false); const nav=useNavigate();
  const verify=async e=>{e.preventDefault();setBusy(true);try{const r=await api("/auth/verify-email",{method:"POST",body:{email,otp}});setMessage(r.message);setError(false);setTimeout(()=>nav("/login"),900);}catch(err){setMessage(err.message);setError(true);}finally{setBusy(false);}};
  const resend=async()=>{try{const r=await api("/auth/resend-otp",{method:"POST",body:{email,purpose:"verify_email"}});setMessage(r.message);setError(false);}catch(err){setMessage(err.message);setError(true);}};
  return <AuthShell eyebrow="One last step" title={<>Verify<br/>email.</>} description="We sent a six-digit verification code to your email. The code expires after 10 minutes.">
    <form onSubmit={verify} className="space-y-4"><Field label="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/><Field label="Six-digit OTP" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} required/><Status error={error}>{message}</Status><button disabled={busy} className="btn-primary w-full">Verify email <ShieldCheck size={17}/></button></form>
    <button onClick={resend} className="mt-4 w-full rounded-full border border-black/20 py-3 text-sm font-bold hover:bg-black hover:text-white">Resend verification code</button>
  </AuthShell>;
}

export function ForgotPassword() {
  const [email,setEmail]=useState("");const [message,setMessage]=useState("");const [error,setError]=useState(false);const nav=useNavigate();
  const submit=async e=>{e.preventDefault();try{const r=await api("/auth/forgot-password",{method:"POST",body:{email}});setMessage(r.message);setError(false);nav(`/reset-password?email=${encodeURIComponent(email)}`);}catch(err){setMessage(err.message);setError(true);}};
  return <AuthShell eyebrow="Account recovery" title={<>Reset<br/>access.</>} description="Enter your email address. If an eligible account exists, we will send a password reset code.">
    <form onSubmit={submit} className="space-y-4"><Field label="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/><Status error={error}>{message}</Status><button className="btn-primary w-full">Send reset code <ArrowRight size={17}/></button></form>
  </AuthShell>;
}

export function ResetPassword() {
  const [params]=useSearchParams();const [form,setForm]=useState({email:params.get("email")||"",otp:"",newPassword:""});const [message,setMessage]=useState("");const [error,setError]=useState(false);const nav=useNavigate();
  const submit=async e=>{e.preventDefault();try{const r=await api("/auth/reset-password",{method:"POST",body:form});setMessage(r.message);setError(false);setTimeout(()=>nav("/login"),900);}catch(err){setMessage(err.message);setError(true);}};
  return <AuthShell eyebrow="Secure your account" title={<>New<br/>password.</>} description="Use the six-digit reset code sent to your email and choose a new password.">
    <form onSubmit={submit} className="space-y-4"><Field label="Email address" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/><Field label="Reset code" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={form.otp} onChange={e=>setForm({...form,otp:e.target.value.replace(/\D/g,"").slice(0,6)})} required/><Field label="New password" type="password" minLength="8" maxLength="72" value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})} required/><Status error={error}>{message}</Status><button className="btn-primary w-full">Update password <ArrowRight size={17}/></button></form>
  </AuthShell>;
}
