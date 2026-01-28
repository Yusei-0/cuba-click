export function Footer() {
  return (
    <footer className="footer p-10 bg-neutral text-neutral-content">
      <nav>
        <header className="footer-title">Servicios</header>
        <a className="link link-hover">Catálogo</a>
        <a className="link link-hover">Envíos</a>
        <a className="link link-hover">Garantía</a>
      </nav>
      <nav>
        <header className="footer-title">Compañía</header>
        <a className="link link-hover">Sobre nosotros</a>
        <a className="link link-hover">Contacto</a>
      </nav>
      <nav>
        <header className="footer-title">Legal</header>
        <a className="link link-hover">Términos de uso</a>
        <a className="link link-hover">Política de privacidad</a>
      </nav>
    </footer>
  );
}
