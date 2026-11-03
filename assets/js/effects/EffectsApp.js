/**
 * EffectsApp — efeitos complementares da interface organizados em POO.
 * Responsabilidade: decoração não essencial à navegação, como luzes e faíscas.
 * A inicialização preserva acessibilidade: movimento reduzido e ponteiro touch.
 */
export class EffectsApp {
    constructor() {
        // Preferências consultadas uma vez. No mobile, evita o rastro do ponteiro.
        this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        this.finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    }

    /** Aciona os efeitos. Um problema visual não deve impedir o funcionamento do catálogo. */
    init() {
        this.initProgress();
        this.initHero();
        this.initReveal();
        this.initCardSpotlight();
        this.initSparks();
        this.initTrail();
    }

    /* ---------- Barra de progresso de rolagem ---------- */
    initProgress() {
        const bar = document.createElement("div");
        bar.className = "fx-progress";
        bar.setAttribute("aria-hidden", "true");
        document.body.prepend(bar);

        let ticking = false;
        const update = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
            bar.style.setProperty("--fx-p", p.toFixed(4));
            ticking = false;
        };

        window.addEventListener("scroll", () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        }, { passive: true });
        window.addEventListener("resize", update, { passive: true });
        update();
    }

    /* ---------- Entrada dos blocos ao rolar ----------
       Só esconde o que ainda está abaixo da tela. Se o JS falhar, nada
       fica invisível. */
    initReveal() {
        const targets = [...document.querySelectorAll(
            ".reveal, .product-grid > .product-card, .testimonial-grid > .testimonial"
        )];
        if (this.reduceMotion || !("IntersectionObserver" in window)) {
            targets.forEach(element => element.classList.add("visible"));
            return;
        }

        const viewportH = window.innerHeight;
        const pending = targets.filter(el => el.getBoundingClientRect().top > viewportH * 0.92);

        // Atraso escalonado dentro de cada grade
        pending.forEach(el => {
            const siblings = [...el.parentElement.children].filter(child => pending.includes(child));
            el.style.setProperty("--fx-i", String(Math.min(siblings.indexOf(el), 5)));
            el.classList.add("fx-in");
        });

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                el.classList.add("visible");
                obs.unobserve(el);
                // Depois da entrada, devolve o controle ao hover original dos cards
                window.setTimeout(() => el.classList.remove("fx-in"), 1700);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

        pending.forEach(el => observer.observe(el));

        // Segurança: nada fica escondido para sempre
        window.setTimeout(() => {
            document.querySelectorAll(".fx-in:not(.visible)").forEach(el => {
                if (el.getBoundingClientRect().top < window.innerHeight * 1.2) {
                    el.classList.add("visible");
                }
            });
        }, 4000);
    }

    /* ---------- Luz que acompanha o mouse nos cards ---------- */
    initCardSpotlight() {
        if (!this.finePointer) return;

        document.addEventListener("pointermove", event => {
            const card = event.target.closest?.(".product-card");
            if (!card) return;
            const rect = card.getBoundingClientRect();
            card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
            card.style.setProperty("--my", `${event.clientY - rect.top}px`);
        }, { passive: true });
    }

    /* ---------- Faíscas ✦ nas seções CTA e Instagram ---------- */
    initSparks() {
        if (this.reduceMotion) return;

        const hosts = document.querySelectorAll(".cta, .instagram");
        hosts.forEach(host => {
            if (getComputedStyle(host).position === "static") host.style.position = "relative";
            host.style.overflow = "hidden";

            const count = window.innerWidth < 700 ? 7 : 14;
            for (let i = 0; i < count; i++) {
                const spark = document.createElement("span");
                spark.className = "fx-spark";
                spark.setAttribute("aria-hidden", "true");
                spark.textContent = "✦";
                spark.style.left = `${Math.random() * 96}%`;
                spark.style.top = `${Math.random() * 90}%`;
                spark.style.fontSize = `${10 + Math.random() * 18}px`;
                spark.style.setProperty("--fx-dur", `${3 + Math.random() * 3.5}s`);
                spark.style.setProperty("--fx-delay", `${(Math.random() * 5).toFixed(2)}s`);
                host.append(spark);
            }
        });
    }

    /* ---------- Rastro de faíscas do mouse (somente desktop) ---------- */
    initTrail() {
        if (this.reduceMotion || !this.finePointer) return;

        let last = 0;
        let lastX = 0;
        let lastY = 0;

        document.addEventListener("pointermove", event => {
            const now = performance.now();
            const dist = Math.hypot(event.clientX - lastX, event.clientY - lastY);
            if (now - last < 70 || dist < 26) return;

            last = now;
            lastX = event.clientX;
            lastY = event.clientY;

            const spark = document.createElement("span");
            spark.className = "fx-trail";
            spark.setAttribute("aria-hidden", "true");
            spark.textContent = Math.random() > 0.5 ? "✦" : "✧";
            spark.style.left = `${event.clientX + (Math.random() * 10 - 5)}px`;
            spark.style.top = `${event.clientY + (Math.random() * 10 - 5)}px`;
            spark.style.fontSize = `${9 + Math.random() * 11}px`;
            document.body.append(spark);
            window.setTimeout(() => spark.remove(), 950);
        }, { passive: true });
    }

    /* ---------- Destaque do topo: título em linhas, contador, bokeh e parallax ---------- */
    initHero() {
        const hero = document.querySelector(".hero-carousel");
        if (!hero) return;
        const slides = [...hero.querySelectorAll(".carousel-slide")];

        // Título separado por linhas (o texto continua o mesmo para leitores de tela)
        hero.querySelectorAll(".carousel-content h2").forEach(h2 => {
            const lines = h2.innerHTML.split(/<br\s*\/?>/i).map(t => t.trim()).filter(Boolean);
            if (lines.length < 1) return;
            h2.setAttribute("aria-label", h2.textContent.replace(/\s+/g, " ").trim());
            h2.innerHTML = lines
                .map((text, i) => `<span class="fx-line" aria-hidden="true"><span style="--l:${i}">${text}</span></span>`)
                .join("");
            h2.classList.add("fx-split");
        });

        // Contador 01 / 03
        const counter = document.createElement("div");
        counter.className = "fx-counter";
        counter.setAttribute("aria-hidden", "true");
        const pad = n => String(n).padStart(2, "0");
        const render = () => {
            const index = Math.max(0, slides.findIndex(s => s.classList.contains("active")));
            counter.innerHTML = `<b>${pad(index + 1)}</b><span>/ ${pad(slides.length)}</span>`;
        };
        hero.append(counter);
        render();
        slides.forEach(slide => {
            new MutationObserver(render).observe(slide, { attributes: true, attributeFilter: ["class"] });
        });

        if (this.reduceMotion) return;

        // Partículas de luz subindo
        const count = window.innerWidth < 700 ? 8 : 16;
        for (let i = 0; i < count; i++) {
            const dot = document.createElement("span");
            const size = 4 + Math.random() * 12;
            dot.className = "fx-bokeh";
            dot.setAttribute("aria-hidden", "true");
            dot.style.width = dot.style.height = `${size}px`;
            dot.style.left = `${Math.random() * 100}%`;
            dot.style.filter = `blur(${size > 10 ? 1.5 : 0}px)`;
            dot.style.setProperty("--fx-dur", `${8 + Math.random() * 8}s`);
            dot.style.setProperty("--fx-delay", `${(Math.random() * -12).toFixed(2)}s`);
            dot.style.setProperty("--fx-dx", `${Math.round(Math.random() * 80 - 40)}px`);
            dot.style.setProperty("--fx-o", (0.35 + Math.random() * 0.5).toFixed(2));
            hero.append(dot);
        }

        // Parallax suave com o mouse (somente desktop)
        if (!this.finePointer) return;
        hero.addEventListener("pointermove", event => {
            const r = hero.getBoundingClientRect();
            hero.style.setProperty("--px", (((event.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
            hero.style.setProperty("--py", (((event.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
        }, { passive: true });
        hero.addEventListener("pointerleave", () => {
            hero.style.setProperty("--px", "0");
            hero.style.setProperty("--py", "0");
        });
    }

}
