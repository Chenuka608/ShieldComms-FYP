export default function Footer() {
  return (
    <footer className="py-6">
      <div className="container mx-auto px-6 text-center md:text-left">
        {/* Links Section */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
          {/* Left Section */}
          <div className="mb-4 md:mb-0 flex items-center space-x-2">
            <img src="/Assets/logo.png" alt="ShieldComms Logo" className="h-8 w-8" />
            <h2 className="text-xl font-bold">ShieldComms®</h2>
          </div>

          {/* Center Links */}
          <div className="flex space-x-6 text-gray-600">
            <a href="/pricing" className="hover:text-blue-400 transition">Pricing</a>
            <a href="/features" className="hover:text-blue-400 transition">Features</a>
            <a href="/support" className="hover:text-blue-400 transition">Support</a>
          </div>

          {/* Right Links */}
          <div className="flex space-x-6 text-gray-600">
            <a href="/terms" className="hover:text-blue-400 transition">Terms & Conditions</a>
            <a href="/privacy" className="hover:text-blue-400 transition">Privacy Policy</a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 text-gray-600 text-sm text-center md:text-left">
          © {new Date().getFullYear()} ShieldComms®. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
