import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { money } from "../lib/api";

export default function ProductCard({ product }) {
  return <Link to={`/product/${product.slug}`} className="group block">
    <div className="relative aspect-[4/5] overflow-hidden bg-[#e7e5df]">
      <img src={product.images?.[0]} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"/>
      {product.featured && <span className="absolute left-3 top-3 bg-turbo-lime px-3 py-1 text-[10px] font-black uppercase tracking-widest">Featured</span>}
      <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-white opacity-0 transition group-hover:opacity-100"><ArrowUpRight size={18}/></span>
    </div>
    <div className="flex items-start justify-between gap-3 pt-4">
      <div><h3 className="text-sm font-bold">{product.name}</h3><p className="mt-1 text-xs text-neutral-500">{product.category}</p></div>
      <p className="whitespace-nowrap text-sm font-bold">{money(product.price)}</p>
    </div>
  </Link>;
}
