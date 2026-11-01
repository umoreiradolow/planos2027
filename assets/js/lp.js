// Página de vendas — Método dos 4 Ciclos para 2027

// Link do checkout. Enquanto estiver vazio, os botões de compra ficam em "#checkout".
const CHECKOUT_URL = '';
// Preço exibido na página (bloco da oferta e barra fixa).
const PRECO = '19,90';

const params = new URLSearchParams(location.search);

// 1. Preço em um lugar só
document.querySelectorAll('.js-valor').forEach(el => { el.textContent = PRECO; });

// 2. Botões de compra: levam ao checkout repassando os parâmetros do anúncio (UTMs, fbclid).
if (CHECKOUT_URL) {
  const url = new URL(CHECKOUT_URL);
  params.forEach((v, k) => { if (!url.searchParams.has(k)) url.searchParams.set(k, v); });
  document.querySelectorAll('.js-checkout').forEach(a => { a.href = url.toString(); });
}

// 3. Contagem real até o próximo começo de ciclo (sem números inventados).
//    Antes de 2027: dias até 1º de janeiro. Durante 2027: o próximo recomeço (abr, jul, out).
(function contagem() {
  const el = document.getElementById('contagem');
  if (!el) return;
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const dia = 864e5;
  const ano = new Date(2027, 0, 1);
  if (hoje < ano) {
    const n = Math.round((ano - hoje) / dia);
    el.innerHTML = n === 1
      ? 'Falta <b>1 dia</b> para 2027. Imprima hoje e comece amanhã.'
      : `Faltam <b>${n} dias</b> para 2027. Dá tempo de imprimir e preencher com calma.`;
    return;
  }
  const inicios = [[3, 'Ciclo 2'], [6, 'Ciclo 3'], [9, 'Ciclo 4']].map(([m, c]) => [new Date(2027, m, 1), c]);
  const prox = inicios.find(([d]) => d > hoje);
  if (hoje.getFullYear() === 2027 && prox) {
    const n = Math.round((prox[0] - hoje) / dia);
    el.innerHTML = `Ainda dá tempo: o <b>${prox[1]}</b> começa em ${n === 1 ? '1 dia' : n + ' dias'}. Ou comece hoje, pelo quadradinho do dia.`;
  }
})();

// 4. Animação de entrada ao rolar
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// 5. Barra fixa: aparece depois do botão do topo e some enquanto a oferta ou o rodapé estiver na tela.
const sticky = document.getElementById('sticky');
const heroBtn = document.querySelector('.hero .btn');
const hideZones = [document.querySelector('.js-preco'), document.querySelector('.final'), document.querySelector('.footer')];
const visible = new Set();
let passedHero = false;

new IntersectionObserver(([e]) => {
  passedHero = !e.isIntersecting && e.boundingClientRect.top < 0;
  updateSticky();
}).observe(heroBtn);

const zoneObserver = new IntersectionObserver(entries => {
  entries.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
  updateSticky();
}, { threshold: 0.1 });
hideZones.forEach(z => z && zoneObserver.observe(z));

function updateSticky() {
  const on = passedHero && visible.size === 0;
  sticky.classList.toggle('is-on', on);
  sticky.setAttribute('aria-hidden', String(!on));
  sticky.querySelector('a').tabIndex = on ? 0 : -1;
}

// 6. FAQ em sanfona: abrir uma pergunta fecha as outras.
document.querySelectorAll('.faq').forEach(group => {
  group.addEventListener('toggle', ev => {
    if (!ev.target.open) return;
    group.querySelectorAll('details[open]').forEach(d => { if (d !== ev.target) d.open = false; });
  }, true);
});

// 7. Página ampliada: toque numa página do carrossel para ver em tela cheia.
const zoom = document.getElementById('zoom');
const zoomImg = zoom.querySelector('img');
document.addEventListener('click', ev => {
  const alvo = ev.target.closest('.js-zoom');
  if (!alvo) return;
  zoomImg.src = alvo.dataset.src;
  zoomImg.alt = alvo.querySelector('img')?.alt || '';
  zoom.showModal();
});
// fecha no X, tocando fora da página ou com Esc (nativo do <dialog>)
zoom.addEventListener('click', ev => { if (ev.target !== zoomImg) zoom.close(); });

// 8. Carrossel: a bolinha acompanha a página do centro.
const carrossel = document.getElementById('carrossel');
const dots = [...document.querySelectorAll('#carrossel-dots i')];
const itens = [...carrossel.children];
carrossel.addEventListener('scroll', () => requestAnimationFrame(() => {
  const meio = carrossel.scrollLeft + carrossel.clientWidth / 2;
  let atual = 0;
  itens.forEach((it, k) => {
    const d = Math.abs(it.offsetLeft + it.offsetWidth / 2 - meio);
    if (d < Math.abs(itens[atual].offsetLeft + itens[atual].offsetWidth / 2 - meio)) atual = k;
  });
  dots.forEach((d, k) => d.classList.toggle('is-on', k === atual));
}), { passive: true });

// 9. VSL: a prévia sem som roda em loop; ao tocar, entra o player do Vimeo tocando com som, do começo
//    (o toque libera o áudio). Depois disso, tocar no vídeo pausa e retoma (comportamento do próprio player).
//    O vídeo não está listado, então o parâmetro h= é obrigatório.
const VSL_SRC = 'https://player.vimeo.com/video/1241905943?h=098860d5dc&autoplay=1&title=0&byline=0&portrait=0&dnt=1';
const vsl = document.getElementById('vsl');
function abreVsl() {
  if (vsl.querySelector('iframe')) return;
  const f = document.createElement('iframe');
  f.src = VSL_SRC; f.title = 'Vídeo do Método dos 4 Ciclos';
  f.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
  f.allowFullscreen = true; f.referrerPolicy = 'strict-origin-when-cross-origin';
  vsl.replaceChildren(f); vsl.style.cursor = 'default'; vsl.removeAttribute('role'); vsl.removeAttribute('tabindex');
}
if (vsl) {
  vsl.addEventListener('click', abreVsl);
  vsl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abreVsl(); } });
}
