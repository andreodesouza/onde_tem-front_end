function iniciarMenu() {
  const botaoMenu = document.getElementById("menu-btn");
  const menu = document.getElementById("menu-principal");
  if (!botaoMenu || !menu) return;

  botaoMenu.addEventListener("click", () => {
    const aberto = menu.classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded", String(aberto));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("aberto");
      botaoMenu.setAttribute("aria-expanded", "false");
    });
  });
}

function iniciarFormulario() {
  const formSalao = document.getElementById("form-salao");
  if (!formSalao) return;

  formSalao.addEventListener("submit", (event) => {
    event.preventDefault();

    const params = new URLSearchParams({
      tipo: "empresa",
      fantasia: document.getElementById("salao-nome").value.trim(),
      responsavel: document.getElementById("salao-responsavel").value.trim(),
      email: document.getElementById("salao-email").value.trim(),
    });

    window.location.href = `../cadastro.html?${params.toString()}`;
  });
}

function iniciarAnimacoes() {
  const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduzido || typeof gsap === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const entrada = gsap.timeline({ defaults: { ease: "power3.out" } });

  entrada
    .from(".topo", { y: -18, autoAlpha: 0, duration: 0.45 })
    .from(".hero-texto .selo", { y: 18, autoAlpha: 0, duration: 0.4 }, "-=0.2")
    .from(".hero-texto h1", { y: 32, autoAlpha: 0, duration: 0.7 }, "-=0.25")
    .from(".hero-lead", { y: 20, autoAlpha: 0, duration: 0.5 }, "-=0.4")
    .from(".hero-texto .hero-acoes .btn", {
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.4,
    }, "-=0.3")
    .from(".hero-servicos li", { y: 14, autoAlpha: 0, stagger: 0.06, duration: 0.35 }, "-=0.25")
    .from(".preview", { y: 46, autoAlpha: 0, scale: 0.96, duration: 0.8 }, "-=0.65")
    .from(".flutuante", { y: 18, autoAlpha: 0, stagger: 0.12, duration: 0.45 }, "-=0.4");

  entrada.eventCallback("onComplete", () => {
    gsap.set(".hero-texto .hero-acoes .btn", { autoAlpha: 1 });

    gsap.to(".flutuante-a", {
      y: -10,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(".flutuante-b", {
      y: 8,
      duration: 2.6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  });

  gsap.to(".mancha-rosa", {
    x: 16,
    y: -12,
    duration: 4.2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.to(".mancha-lilas", {
    x: -14,
    y: 14,
    duration: 5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.from(".faixa-prova p", {
    scrollTrigger: { trigger: ".faixa-prova", start: "top 90%" },
    y: 20,
    autoAlpha: 0,
    duration: 0.5,
    ease: "power2.out",
  });

  gsap.utils.toArray(".bloco-cabeca, .cartao, .b2b-texto, .passos li").forEach((item) => {
    gsap.from(item, {
      scrollTrigger: { trigger: item, start: "top 88%" },
      y: 28,
      autoAlpha: 0,
      duration: 0.6,
      ease: "power2.out",
    });
  });

  gsap.from(".form-lead", {
    scrollTrigger: { trigger: ".form-lead", start: "top 86%" },
    y: 36,
    autoAlpha: 0,
    duration: 0.7,
    ease: "power2.out",
  });

  gsap.from(".convite-caixa", {
    scrollTrigger: { trigger: ".convite-caixa", start: "top 88%" },
    y: 32,
    autoAlpha: 0,
    duration: 0.7,
    ease: "power2.out",
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}

iniciarMenu();
iniciarFormulario();
iniciarAnimacoes();
