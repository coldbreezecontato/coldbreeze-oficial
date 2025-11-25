import { Instagram, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-zinc-950 text-zinc-400 border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
        {/* Logo + Texto */}
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-xl font-semibold tracking-wide text-white">Cold Breeze</h2>
          <p className="text-xs">Streetwear com atitude e autenticidade.</p>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <a
                href="https://www.instagram.com/coldbreeze_outlet"
                target="_blank"
                className="flex items-center md:justify-end gap-2 hover:text-white hover:drop-shadow-[0_0_6px_rgba(56,189,248,0.45)] transition"
              >
                <Instagram size={17} />
                Instagram
              </a>

              <a
                href="https://wa.me/5511992656960"
                target="_blank"
                className="flex items-center md:justify-end gap-2 hover:text-white hover:drop-shadow-[0_0_6px_rgba(56,189,248,0.45)] transition"
              >
                <Phone size={17} />
                WhatsApp
              </a>

              <a
                href="mailto:contato@coldbreeze.com.br"
                className="flex items-center md:justify-end gap-2 hover:text-white hover:drop-shadow-[0_0_6px_rgba(56,189,248,0.45)] transition"
              >
                <Mail size={17} />
                E-mail
              </a>
        </nav>

        {/* Créditos */}
        <div className="text-xs text-center md:text-right space-y-1">
          <p>© 2025 Cold Breeze. Todos os direitos reservados.</p>
          <p>
            Desenvolvido por
            <span className="ml-1 font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              <a href="https://www.instagram.com/renan.devbarros" className="target-blank">Renan Barros</a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
