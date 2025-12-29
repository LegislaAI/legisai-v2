export const AuthFooter = () => {
  return (
    <footer className="text-light-dark mt-8 py-6 text-center text-sm">
      <p>
        &copy; {new Date().getFullYear()} LegisAI. Todos os direitos reservados.
      </p>
      <div className="mt-2 flex justify-center gap-4 text-xs">
        <a
          href="/termos-de-uso"
          className="hover:text-secondary hover:underline"
        >
          Termos de Uso
        </a>
        <a
          href="/politica-de-privacidade"
          className="hover:text-secondary hover:underline"
        >
          Política de Privacidade
        </a>
      </div>
    </footer>
  );
};
