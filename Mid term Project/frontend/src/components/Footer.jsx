import { Link } from "react-router-dom";
export default function Footer() {
  return <footer className="bg-turbo-black text-white">
    <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-14 md:grid-cols-[1.5fr_1fr_1fr] md:px-10">
      <div><div className="font-display text-5xl font-black tracking-[-2px]">TURBO<span className="text-turbo-lime">.</span></div><p className="mt-4 max-w-sm text-sm leading-6 text-white/55">Modern menswear made for movement. Designed for the everyday pace of Pakistan.</p></div>
      <div><p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-white/40">Explore</p><div className="grid gap-3 text-sm"><Link to="/shop">Shop all</Link><Link to="/account">My account</Link><Link to="/cart">Shopping bag</Link><Link to="/policies">Shipping & returns</Link></div></div>
      <div><p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-white/40">Customer care</p><div className="grid gap-3 text-sm text-white/75"><span>Cash on Delivery available</span><span>Size guide & easy support</span><span>Pakistan-wide delivery</span></div></div>
    </div>
    <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-white/40">© {new Date().getFullYear()} TURBO. Built to move.</div>
  </footer>;
}
