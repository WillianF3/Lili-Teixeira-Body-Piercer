/**
 * Animação progressiva de conteúdo, imagens, números e carregamento.
 * POO: cada classe encapsula seus dados (constructor) e suas ações (métodos).
 * Arquivo ES module; exportações são importadas pelo SiteApp.
 */

/**
 * Controla a tela de carregamento inicial do site.
 * Remove o preloader assim que a página estiver pronta e também possui
 * um tempo limite de segurança para evitar que ele fique preso na tela.
 */
export class Preloader {
    constructor(selector = "#preloader") {
        this.element = document.querySelector(selector);
        this.fallbackTimer = null;
    }

    // Esconde o preloader e depois o remove do HTML.
    hide() {
        if (!this.element || this.element.classList.contains("hide")) return;

        this.element.classList.add("hide");
        window.setTimeout(() => this.element?.remove(), 220);
    }

    // Inicializa o preloader assim que o DOM estiver disponível.
    init() {
        if (!this.element) return;

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => this.hide(), { once: true });
        } else {
            this.hide();
        }

        this.fallbackTimer = window.setTimeout(() => this.hide(), 900);
    }
}

/**
 * Anima números de elementos com a classe .counter quando aparecem na tela.
 * O valor final é informado pelo atributo data-target do elemento.
 */
export class CounterAnimator {
    constructor(selector = ".counter") {
        this.counters = [...document.querySelectorAll(selector)];
        this.observer = null;
    }

    // Incrementa o número gradualmente até alcançar o valor definido em data-target.
    animate(counter) {
        const target = Number(counter.dataset.target);
        if (!Number.isFinite(target)) return;

        let current = 0;
        const increment = target / 100;

        const update = () => {
            current += increment;
            if (current < target) {
                counter.textContent = String(Math.ceil(current));
                requestAnimationFrame(update);
                return;
            }
            counter.textContent = String(target);
        };

        update();
    }

    init() {
        if (!this.counters.length) return;

        if (!("IntersectionObserver" in window)) {
            this.counters.forEach(counter => this.animate(counter));
            return;
        }

        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                this.animate(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.5 });

        this.counters.forEach(counter => this.observer.observe(counter));
    }
}

/**
 * Marca as imagens dos cards como carregadas.
 * A classe CSS "loaded" permite controlar transições e efeitos visuais.
 */
export class CardImageLoader {
    constructor(selector = ".card-photo") {
        this.images = [...document.querySelectorAll(selector)];
    }

    // Adiciona a classe loaded quando a imagem foi carregada corretamente.
    markAsLoaded(image) {
        if (image.naturalWidth > 0) image.classList.add("loaded");
    }

    init() {
        this.images.forEach(image => {
            image.addEventListener("load", () => this.markAsLoaded(image));
            if (image.complete) this.markAsLoaded(image);
        });
    }
}
