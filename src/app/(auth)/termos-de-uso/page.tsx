export default function TermsOfUsePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-3xl rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-sm">
        <h1 className="mb-6 text-center text-3xl font-bold text-black">
          Termos de Uso
        </h1>

        <div className="space-y-4 text-sm leading-relaxed text-black">
          <div>
            <h2 className="mb-2 text-xl font-semibold text-black">1. Termos</h2>
            <p>
              Ao acessar ao site Legis AI, concorda em cumprir estes termos de
              serviço, todas as leis e regulamentos aplicáveis ​​e concorda que
              é responsável pelo cumprimento de todas as leis locais aplicáveis.
              Se você não concordar com algum desses termos, está proibido de
              usar ou acessar este site. Os materiais contidos neste site são
              protegidos pelas leis de direitos autorais e marcas comerciais
              aplicáveis.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-black">
              2. Uso de Licença
            </h2>
            <p className="mb-2">
              É concedida permissão para baixar temporariamente uma cópia dos
              materiais (informações ou software) no site Legis AI , apenas para
              visualização transitória pessoal e não comercial. Esta é a
              concessão de uma licença, não uma transferência de título e, sob
              esta licença, você não pode:
            </p>
            <ol className="ml-4 list-inside list-decimal space-y-1">
              <li>modificar ou copiar os materiais;</li>
              <li>
                usar os materiais para qualquer finalidade comercial ou para
                exibição pública (comercial ou não comercial);
              </li>
              <li>
                tentar descompilar ou fazer engenharia reversa de qualquer
                software contido no site Legis AI;
              </li>
              <li>
                remover quaisquer direitos autorais ou outras notações de
                propriedade dos materiais; ou
              </li>
              <li>
                transferir os materiais para outra pessoa ou 'espelhe' os
                materiais em qualquer outro servidor.
              </li>
            </ol>
            <p className="mt-2">
              Esta licença será automaticamente rescindida se você violar alguma
              dessas restrições e poderá ser rescindida por Legis AI a qualquer
              momento. Ao encerrar a visualização desses materiais ou após o
              término desta licença, você deve apagar todos os materiais
              baixados em sua posse, seja em formato eletrónico ou impresso.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-black">
              3. Isenção de responsabilidade
            </h2>
            <ol className="ml-4 list-inside list-decimal space-y-1">
              <li>
                Os materiais no site da Legis AI são fornecidos 'como estão'.
                Legis AI não oferece garantias, expressas ou implícitas, e, por
                este meio, isenta e nega todas as outras garantias, incluindo,
                sem limitação, garantias implícitas ou condições de
                comercialização, adequação a um fim específico ou não violação
                de propriedade intelectual ou outra violação de direitos.
              </li>
              <li>
                Além disso, o Legis AI não garante ou faz qualquer representação
                relativa à precisão, aos resultados prováveis ​​ou à
                confiabilidade do uso dos materiais em seu site ou de outra
                forma relacionado a esses materiais ou em sites vinculados a
                este site.
              </li>
            </ol>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-black">
              4. Limitações
            </h2>
            <p>
              Em nenhum caso o Legis AI ou seus fornecedores serão responsáveis
              ​​por quaisquer danos (incluindo, sem limitação, danos por perda
              de dados ou lucro ou devido a interrupção dos negócios)
              decorrentes do uso ou da incapacidade de usar os materiais em
              Legis AI, mesmo que Legis AI ou um representante autorizado da
              Legis AI tenha sido notificado oralmente ou por escrito da
              possibilidade de tais danos. Como algumas jurisdições não permitem
              limitações em garantias implícitas, ou limitações de
              responsabilidade por danos conseqüentes ou incidentais, essas
              limitações podem não se aplicar a você.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-black">
              5. Precisão dos materiais
            </h2>
            <p>
              Os materiais exibidos no site da Legis AI podem incluir erros
              técnicos, tipográficos ou fotográficos. Legis AI não garante que
              qualquer material em seu site seja preciso, completo ou atual.
              Legis AI pode fazer alterações nos materiais contidos em seu site
              a qualquer momento, sem aviso prévio. No entanto, Legis AI não se
              compromete a atualizar os materiais.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-black">6. Links</h2>
            <p>
              O Legis AI não analisou todos os sites vinculados ao seu site e
              não é responsável pelo conteúdo de nenhum site vinculado. A
              inclusão de qualquer link não implica endosso por Legis AI do
              site. O uso de qualquer site vinculado é por conta e risco do
              usuário.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold text-black">
              Modificações
            </h3>
            <p>
              O Legis AI pode revisar estes termos de serviço do site a qualquer
              momento, sem aviso prévio. Ao usar este site, você concorda em
              ficar vinculado à versão atual desses termos de serviço.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold text-black">
              Lei aplicável
            </h3>
            <p>
              Estes termos e condições são regidos e interpretados de acordo com
              as leis do Legis AI e você se submete irrevogavelmente à
              jurisdição exclusiva dos tribunais naquele estado ou localidade.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/login"
            className="bg-secondary hover:bg-secondary/80 inline-block rounded-lg px-6 py-2 text-white transition-colors"
          >
            Voltar
          </a>
        </div>
      </div>
    </div>
  );
}
