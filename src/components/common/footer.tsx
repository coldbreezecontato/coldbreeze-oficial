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
          <a href="/sobre" className="hover:text-white transition-colors">Sobre</a>
          <a href="/contato" className="hover:text-white transition-colors">Contato</a>
          <a href="/privacidade" className="hover:text-white transition-colors">Privacidade</a>
          <a href="/termos" className="hover:text-white transition-colors">Termos</a>
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
