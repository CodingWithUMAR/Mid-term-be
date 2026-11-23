import { Link } from "react-router-dom";

export default function Policies() {
  return <div className="mx-auto min-h-[65vh] max-w-[900px] px-6 py-14 md:px-10 md:py-20">
    <p className="eyebrow">Customer information</p>
    <h1 className="section-title">Shipping & returns<span className="text-lime-600">.</span></h1>
    <div className="mt-10 space-y-8 text-sm leading-7 text-neutral-600">
      <section><h2 className="mb-2 font-display text-3xl font-black uppercase text-black">Delivery</h2><p>Pakistan-wide delivery is planned. The checkout displays the delivery fee before an order is placed: PKR 250 below PKR 8,000 and free delivery on orders of PKR 8,000 or more. The current storefront shows a 1–2 business day dispatch target after confirmation; courier transit time depends on destination and courier operations.</p></section>
      <section><h2 className="mb-2 font-display text-3xl font-black uppercase text-black">Returns & exchanges — draft</h2><p>This is a suggested policy template, not a final business commitment. Before launch, TURBO must confirm the actual return window, eligible product condition, sale-item rules, return shipping responsibility, refund method and customer support contact. Do not accept orders until the final policy has been reviewed and published.</p><ul className="mt-3 list-disc space-y-1 pl-5"><li>Suggested request window: contact support within 7 days of delivery.</li><li>Suggested condition: unworn, unwashed, with original tags and packaging.</li><li>Items with hygiene restrictions or signs of wear may be excluded, subject to applicable law.</li><li>Damaged, incorrect or missing items should be reported promptly with order details and photographs.</li></ul></section>
      <section><h2 className="mb-2 font-display text-3xl font-black uppercase text-black">Payments</h2><p>Cash on Delivery is available. Bank transfer orders remain pending until TURBO verifies the funds manually. A customer should never be asked to share their banking password, PIN or one-time banking code.</p></section>
      <p className="border-t border-black/10 pt-6 text-xs text-neutral-500">Replace this draft with your approved business policy and support details before production launch.</p>
    </div>
    <Link to="/shop" className="btn-dark mt-8">Continue shopping</Link>
  </div>;
}
