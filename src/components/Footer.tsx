import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-section-gap pb-12">
      <div className="px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">

        {/* Brand */}
        <div className="md:col-span-1">
          <h3 className="font-display font-bold text-3xl uppercase tracking-tighter mb-8">
            KEMUT.STORE
          </h3>
          <p className="text-[#e4e2df] text-sm leading-relaxed mb-8">
            Unspoken Luxury. Curation over volume.
          </p>
          <div className="flex space-x-6">
            {["IG", "TK", "WA"].map((s) => (
              <a key={s} href="#" className="label-caps hover:text-[#d4af37] transition-colors">
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="label-caps text-[#d4af37] tracking-widest mb-8">Shop</h4>
          <ul className="space-y-4 text-[#e4e2df] text-sm">
            {[
              ["New Arrivals", "/search?sort=newest"],
              ["Apparel", "/search?category=apparel"],
              ["Footwear", "/search?category=footwear"],
              ["Accessories", "/search?category=accessories"],
              ["Sale", "/search?sale=true"],
            ].map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <h4 className="label-caps text-[#d4af37] tracking-widest mb-8">Information</h4>
          <ul className="space-y-4 text-[#e4e2df] text-sm">
            {[
              ["Shipping & Returns", "#"],
              ["Privacy Policy", "#"],
              ["Terms of Service", "#"],
              ["Sell With Us", "/sell"],
              ["Contact", "#"],
            ].map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="label-caps text-[#d4af37] tracking-widest mb-8">Newsletter</h4>
          <p className="text-[#e4e2df] text-sm mb-6 leading-relaxed">
            Join our private list for exclusive drops and editorial insights.
          </p>
          <div className="relative">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-transparent border-b border-[#e4e2df]/30 py-3 text-white focus:outline-none focus:border-white transition-colors text-sm placeholder:text-[#e4e2df]/50"
            />
            <button className="absolute right-0 top-1/2 -translate-y-1/2 label-caps hover:text-[#d4af37] transition-colors">
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-margin-mobile md:px-margin-desktop pt-12 border-t border-[#e4e2df]/10 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest opacity-50">
        <p>© {new Date().getFullYear()} KEMUT.STORE. All Rights Reserved.</p>
        <div className="flex space-x-8 mt-6 md:mt-0">
          <span>Designed for the Discerning</span>
          <span>Jakarta / Global</span>
        </div>
      </div>
    </footer>
  );
}