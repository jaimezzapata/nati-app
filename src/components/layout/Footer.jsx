function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">NatiApp</h3>
            <p className="text-sm">
              La forma más fácil y transparente de gestionar tus natilleras.
              Digitaliza la confianza y ahorra con tu comunidad.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Términos y condiciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Privacidad
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contacto</h3>
            <p className="text-sm">
              ¿Tienes preguntas? Contáctanos en:
            </p>
            <a
              href="mailto:soporte@natiapp.com"
              className="text-emerald-400 hover:text-emerald-300 text-sm"
            >
              soporte@natiapp.com
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} NatiApp. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
