/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const WHATSAPP_NUMBER = "5547997560445";

function openWhatsApp(message) {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
}


/* =========================================================
   PRELOADER
========================================================= */

window.addEventListener("load", () => {

    const preloader = document.getElementById("preloader");

    if (!preloader) return;

    setTimeout(() => {
        preloader.classList.add("hide");
    }, 700);

});


/* =========================================================
   MENU MOBILE
========================================================= */

const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

if (menuToggle && nav) {

    menuToggle.addEventListener("click", () => {

        nav.classList.toggle("active");
        menuToggle.classList.toggle("active");

    });


    /* Fechar menu ao clicar em um link */

    document.querySelectorAll(".nav a").forEach(link => {

        link.addEventListener("click", () => {

            nav.classList.remove("active");
            menuToggle.classList.remove("active");

        });

    });

}


/* =========================================================
   HEADER SCROLL
========================================================= */

const header = document.getElementById("header");

window.addEventListener("scroll", () => {

    if (!header) return;

    if (window.scrollY > 50) {

        header.classList.add("scrolled");

    } else {

        header.classList.remove("scrolled");

    }

});


/* =========================================================
   ANIMAÇÃO AO ROLAR
========================================================= */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {

    const revealObserver = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    revealObserver.unobserve(entry.target);

                }

            });

        },
        {
            threshold: 0.12
        }
    );


    revealElements.forEach(element => {

        revealObserver.observe(element);

    });

} else {

    /* Fallback para navegadores antigos */

    revealElements.forEach(element => {

        element.classList.add("visible");

    });

}


/* =========================================================
   CONTADORES
========================================================= */

const counters = document.querySelectorAll(".counter");
let countersStarted = false;


function startCounters() {

    if (countersStarted) return;

    countersStarted = true;


    counters.forEach(counter => {

        const target = Number(counter.dataset.target);

        let current = 0;

        const increment = Math.max(
            1,
            Math.ceil(target / 50)
        );


        const updateCounter = () => {

            current += increment;


            if (current >= target) {

                counter.textContent = target;

                return;

            }


            counter.textContent = current;

            requestAnimationFrame(updateCounter);

        };


        updateCounter();

    });

}


const heroInfo = document.querySelector(".hero-info");


if (heroInfo && "IntersectionObserver" in window) {

    const counterObserver = new IntersectionObserver(
        entries => {

            if (entries[0].isIntersecting) {

                startCounters();

                counterObserver.disconnect();

            }

        },
        {
            threshold: 0.5
        }
    );


    counterObserver.observe(heroInfo);

} else {

    startCounters();

}


/* =========================================================
   FILTROS DOS PRODUTOS
========================================================= */

const filters = document.querySelectorAll(".filter");
const products = document.querySelectorAll(".product-card");


filters.forEach(filter => {

    filter.addEventListener("click", () => {

        /* Remove active de todos */

        filters.forEach(button => {

            button.classList.remove("active");

        });


        /* Ativa o botão selecionado */

        filter.classList.add("active");


        const category = filter.dataset.filter;


        /* Filtra os produtos */

        products.forEach(product => {

            const productCategory =
                product.dataset.category;


            if (
                category === "todos" ||
                productCategory === category
            ) {

                product.classList.remove("hidden");

            } else {

                product.classList.add("hidden");

            }

        });

    });

});


/* =========================================================
   MODAL DE PRODUTO
========================================================= */

const modal = document.getElementById("productModal");
const modalClose = document.getElementById("modalClose");
const modalName = document.getElementById("modalName");
const modalPrice = document.getElementById("modalPrice");
const modalDescription = document.getElementById("modalDescription");
const modalBuy = document.getElementById("modalBuy");
const modalOverlay = document.querySelector(".modal-overlay");


/* Abrir modal */

function openModal(product) {

    if (!product || !modal) return;


    const name = product.dataset.name || "Produto";
    const price = product.dataset.price || "0,00";
    const description =
        product.dataset.description || "Descrição do produto.";


    /* Atualiza informações */

    modalName.textContent = name;

    modalPrice.textContent = `R$ ${price}`;

    modalDescription.textContent = description;


    /* Mensagem do WhatsApp */

    const message =
        `Olá Lili! Tenho interesse no piercing "${name}", no valor de R$ ${price}. Gostaria de saber mais informações.`;


    /* Atualiza botão */

    if (modalBuy) {

        modalBuy.href =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    }


    /* Abre modal */

    modal.classList.add("active");

    document.body.classList.add("modal-open");

}


/* Fechar modal */

function closeModal() {

    if (!modal) return;

    modal.classList.remove("active");

    document.body.classList.remove("modal-open");

}


/* =========================================================
   BOTÃO VER PRODUTO
========================================================= */

document.querySelectorAll(".quick-view").forEach(button => {

    button.addEventListener("click", event => {

        const product =
            event.currentTarget.closest(".product-card");


        if (product) {

            openModal(product);

        }

    });

});


/* =========================================================
   BOTÃO COMPRAR
========================================================= */

document.querySelectorAll(".buy-btn").forEach(button => {

    button.addEventListener("click", event => {

        const product =
            event.currentTarget.closest(".product-card");


        if (!product) return;


        const name =
            product.dataset.name || "Produto";


        const price =
            product.dataset.price || "0,00";


        const message =
            `Olá Lili! Tenho interesse no piercing "${name}", no valor de R$ ${price}. Gostaria de saber mais informações.`;


        openWhatsApp(message);

    });

});


/* =========================================================
   FECHAR MODAL
========================================================= */

if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeModal
    );

}


if (modalOverlay) {

    modalOverlay.addEventListener(
        "click",
        closeModal
    );

}


/* Fechar com ESC */

document.addEventListener("keydown", event => {

    if (
        event.key === "Escape" &&
        modal &&
        modal.classList.contains("active")
    ) {

        closeModal();

    }

});


/* =========================================================
   VOLTAR AO TOPO
========================================================= */

const backTop = document.getElementById("backTop");


window.addEventListener("scroll", () => {

    if (!backTop) return;


    if (window.scrollY > 500) {

        backTop.classList.add("show");

    } else {

        backTop.classList.remove("show");

    }

});


if (backTop) {

    backTop.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}