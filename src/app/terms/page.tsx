export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 prose dark:prose-invert">
      <h1>Termos de Serviço - EloX</h1>
      <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
      <h2>1. Objetivo da Plataforma</h2>
      <p>A EloX oferece um ecossistema para clipadores enviarem, acompanharem desempenho e monetizarem vídeos curtos, além de participarem de rankings e competições.</p>
      <h2>2. Elegibilidade</h2>
      <p>Você deve fornecer informações verdadeiras e manter sua conta segura. Podemos suspender contas fraudulentas ou que violem estes termos.</p>
      <h2>3. Conteúdo e Responsabilidade</h2>
      <p>Ao enviar vídeos você declara ter direitos ou autorização sobre o conteúdo. Conteúdos que violem direitos autorais, incentivem ódio, violência ou spam serão removidos.</p>
      <h2>4. Monetização e Pagamentos</h2>
      <p>Ganhos são calculados com base em métricas internas e regras de competições. Pagamentos via PIX podem exigir verificação adicional. Erros ou suspeitas de fraude podem atrasar ou bloquear transferências.</p>
      <h2>5. Competidores e Rankings</h2>
      <p>Manipulação artificial de métricas (bots, farms, automações indevidas) resulta em suspensão e perda de valores acumulados.</p>
      <h2>6. Privacidade</h2>
      <p>Dados são usados para operação da plataforma e não serão vendidos. Poderemos enviar comunicações transacionais (alertas de pagamento, competições, segurança).</p>
      <h2>7. Suspensão e Encerramento</h2>
      <p>Violação de regras pode resultar em suspensão ou banimento, com perda de acesso a competições e pagamentos pendentes investigativos.</p>
      <h2>8. Alterações</h2>
      <p>Podemos atualizar estes termos. Alterações materiais serão informadas. Uso continuado implica aceite.</p>
      <h2>9. Contato</h2>
      <p>Dúvidas: suporte@elox.dev (canal oficial de suporte).</p>
      <p>Ao marcar a caixa de aceite no cadastro você confirma ter lido e concordado com estes Termos.</p>
    </main>
  );
}