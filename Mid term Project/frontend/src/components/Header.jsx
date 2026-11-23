import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowUpRight, ShoppingBag, UserRound, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const count = cart.items.reduce((n, item) => n + item.quantity, 0);
  const signOut = async () => { await logout(); navigate("/login"); };

  return <header className="sticky top-0 z-40 border-b border-black/10 bg-turbo-paper/95 backdrop-blur">
    <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 md:px-10">
      <Link to="/home" className="font-display text-[38px] font-black leading-none tracking-[-2px]">TURBO<span className="text-lime-600">.</span></Link>
      <nav className="hidden items-center gap-9 md:flex">
        <NavLink className="nav-link" to="/home">Home</NavLink>
        <NavLink className="nav-link" to="/shop">Shop</NavLink>
        <a className="nav-link" href="/home#story">Our story</a>
      </nav>
      <div className="hidden items-center gap-5 md:flex">
        <Link to="/cart" className="relative p-2" aria-label="Shopping cart"><ShoppingBag size={20}/>{count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-turbo-lime px-1 text-[10px] font-bold">{count}</span>}</Link>
        {user ? <><Link to="/account" className="flex items-center gap-2 text-sm font-semibold"><UserRound size={18}/> My account</Link><button onClick={signOut} className="text-sm font-semibold text-neutral-500 hover:text-black"><LogOut size={17}/></button></> : <Link to="/login" className="text-sm font-semibold">Sign in <ArrowUpRight className="inline" size={15}/></Link>}
      </div>
      <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X/> : <Menu/>}</button>
    </div>
    {open && <div className="grid gap-4 border-t border-black/10 bg-turbo-paper px-6 py-5 md:hidden">
      <Link onClick={() => setOpen(false)} to="/home">Home</Link><Link onClick={() => setOpen(false)} to="/shop">Shop</Link><Link onClick={() => setOpen(false)} to="/cart">Cart ({count})</Link>
      {user ? <Link onClick={() => setOpen(false)} to="/account">My account</Link> : <Link to="/login">Sign in</Link>}
    </div>}
  </header>;
}
