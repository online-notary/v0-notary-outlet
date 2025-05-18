import Link from "next/link"
import { PriceBadge } from "./price-badge"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">NotaryOutlet</h3>
            <p className="mb-4">Professional $5 notary services nationwide.</p>
            <PriceBadge size="sm" />
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#find-notary" className="hover:text-amber-500">
                  Find a Notary
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-amber-500">
                  Mobile Notary
                </Link>
              </li>
              <li>
                <Link href="/notary/register" className="hover:text-amber-500">
                  Become a Notary
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-amber-500">
                  Business Services
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-amber-500">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-amber-500">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-amber-500">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-amber-500">
                  Press
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-amber-500">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-amber-500">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-amber-500">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} NotaryOutlet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
