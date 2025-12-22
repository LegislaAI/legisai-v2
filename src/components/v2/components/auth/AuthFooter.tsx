export const AuthFooter = () => {
  return (
    <footer className="mt-8 py-6 text-center text-sm text-light-dark">
      <p>
        &copy; {new Date().getFullYear()} LegisAi. Todos os direitos reservados.
      </p>
      <div className="mt-2 flex justify-center gap-4 text-xs">
        <a href="#" className="hover:text-secondary hover:underline">Termos de Uso</a>
        <a href="#" className="hover:text-secondary hover:underline">Política de Privacidade</a>
      </div>
    </footer>
  );
};
