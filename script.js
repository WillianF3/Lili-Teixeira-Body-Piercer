/* ================= PRELOADER ================= */

window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");

    if (preloader) {
        setTimeout(() => {
            preloader.classList.add("hide");
        }, 700);
    }
});


/* ================= MENU MOBILE ================= */

const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.querySelector(".nav");

if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
        menuToggle.classList.toggle("active");
        navMenu.classList.toggle("active");
    });

    // Fecha o menu ao clicar em um link
    document.querySelectorAll(".nav a").forEach(link => {
        link.addEventListener("click", () => {
            menuToggle.classList.remove("active");
            navMenu.classList.remove("active");
        });
    });
}


/* ================= HEADER AO ROLAR ================= */

const header = document.querySelector("header");

window.addEventListener("scroll", () => {
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }
});


/* ================= CARROSSEL ================= */

const slides = document.querySelectorAll(".carousel-slide");
const dots = document.querySelectorAll(".carousel-dot");
const prevButton = document.querySelector(".carousel-prev");
const nextButton = document.querySelector(".carousel-next");

let currentSlide = 0;
let carouselInterval;
let carouselPaused = false;


/* Mostrar slide */

function showSlide(index) {
    if (!slides.length) return;

    // Volta para o primeiro slide
    if (index >= slides.length) {
        currentSlide = 0;
    }

    // Vai para o último slide
    else if (index < 0) {
        currentSlide = slides.length - 1;
    }

    else {
        currentSlide = index;
    }

    // Remove o slide ativo
    slides.forEach(slide => {
        slide.classList.remove("active");
    });

    // Remove o dot ativo
    dots.forEach(dot => {
        dot.classList.remove("active");
    });

    // Ativa o slide atual
    slides[currentSlide].classList.add("active");

    // Ativa o dot atual
    if (dots[currentSlide]) {
        dots[currentSlide].classList.add("active");
    }
}


/* Próximo slide */

function nextSlide() {
    showSlide(currentSlide + 1);
}


/* Slide anterior */

function prevSlide() {
    showSlide(currentSlide - 1);
}


/* Iniciar carrossel automático */

function startCarousel() {
    if (!slides.length) return;

    clearInterval(carouselInterval);

    carouselInterval = setInterval(() => {
        if (!carouselPaused) {
            nextSlide();
        }
    }, 5000);
}


/* Botão próximo */

if (nextButton) {
    nextButton.addEventListener("click", () => {
        nextSlide();
        startCarousel();
    });
}


/* Botão anterior */

if (prevButton) {
    prevButton.addEventListener("click", () => {
        prevSlide();
        startCarousel();
    });
}


/* Bolinhas do carrossel */

dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        showSlide(index);
        startCarousel();
    });
});


/* Pausar ao passar o mouse */

const carousel = document.querySelector(".hero-carousel");

if (carousel) {

    carousel.addEventListener("mouseenter", () => {
        carouselPaused = true;
    });

    carousel.addEventListener("mouseleave", () => {
        carouselPaused = false;
    });

    // Pausa no toque em dispositivos móveis
    carousel.addEventListener("touchstart", () => {
        carouselPaused = true;
    });

    carousel.addEventListener("touchend", () => {
        setTimeout(() => {
            carouselPaused = false;
        }, 3000);
    });
}


/* ================= SWIPE NO CELULAR ================= */

let touchStartX = 0;
let touchEndX = 0;

if (carousel) {

    carousel.addEventListener("touchstart", (event) => {
        touchStartX = event.changedTouches[0].screenX;
    });

    carousel.addEventListener("touchend", (event) => {
        touchEndX = event.changedTouches[0].screenX;

        handleSwipe();
    });
}


function handleSwipe() {

    const difference = touchStartX - touchEndX;

    // Arrastar para esquerda
    if (difference > 50) {
        nextSlide();
        startCarousel();
    }

    // Arrastar para direita
    if (difference < -50) {
        prevSlide();
        startCarousel();
    }
}


/* Inicia o carrossel */

if (slides.length) {
    showSlide(0);
    startCarousel();
}


/* ================= ANIMAÇÃO AO ROLAR ================= */

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
    (entries, observer) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

                observer.unobserve(entry.target);
            }

        });

    },
    {
        threshold: 0.15
    }
);


revealElements.forEach(element => {
    revealObserver.observe(element);
});


/* ================= CONTADORES ================= */

const counters = document.querySelectorAll(".counter");

function animateCounter(counter) {

    const target = Number(counter.getAttribute("data-target"));

    if (isNaN(target)) return;

    let current = 0;

    const increment = target / 100;

    const updateCounter = () => {

        current += increment;

        if (current < target) {

            counter.innerText = Math.ceil(current);

            requestAnimationFrame(updateCounter);

        } else {

            counter.innerText = target;

        }
    };

    updateCounter();
}


const counterObserver = new IntersectionObserver(
    (entries, observer) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                animateCounter(entry.target);

                observer.unobserve(entry.target);
            }

        });

    },
    {
        threshold: 0.5
    }
);


counters.forEach(counter => {
    counterObserver.observe(counter);
});


/* ================= FILTRO DE PRODUTOS ================= */

const filterButtons = document.querySelectorAll(".filter-btn");
const productCards = document.querySelectorAll("#productGrid .product-card");


filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        // Remove ativo dos botões
        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        // Ativa botão selecionado
        button.classList.add("active");

        const filter = button.getAttribute("data-filter");

        productCards.forEach(card => {

            const category = card.getAttribute("data-category");

            if (filter === "todos" || filter === category) {

                card.style.display = "";

                setTimeout(() => {
                    card.classList.add("show");
                }, 10);

            } else {

                card.classList.remove("show");
                card.style.display = "none";

            }

        });

    });

});


/* Exibe a foto quando o arquivo existe; mantém o ícone caso contrário. */
document.querySelectorAll(".card-photo").forEach(photo => {
    const showIfLoaded = () => {
        if (photo.naturalWidth > 0) photo.classList.add("loaded");
    };
    photo.addEventListener("load", showIfLoaded);
    if (photo.complete) showIfLoaded();
});

/* ================= MODAL DE PRODUTO ================= */

const productModal = document.getElementById("product-modal");

const modalImage = document.getElementById("modal-image");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modalDescription");
const modalPrice = document.getElementById("modalPrice");
const modalBuy = document.getElementById("modalBuy");

const modalClose = document.querySelector(".modal-close");


/* Abrir produto */

productCards.forEach(card => {

    card.addEventListener("click", () => {

        const title = card.querySelector("h3");
        const description = card.dataset.description || card.querySelector("p")?.textContent;
        const price = card.dataset.price;

        if (modalImage) {
            modalImage.innerHTML = "";
            const photo = card.querySelector(".card-photo.loaded");
            const jewel = card.querySelector(".jewel");
            if (photo) {
                const modalPhoto = document.createElement("img");
                modalPhoto.className = "modal-photo";
                modalPhoto.src = photo.src;
                modalPhoto.alt = photo.alt;
                modalImage.appendChild(modalPhoto);
            } else if (jewel) {
                modalImage.appendChild(jewel.cloneNode(true));
            }
            modalImage.className = `modal-image ${[...card.querySelector(".product-image").classList].filter(name => name.startsWith("image-")).join(" ")}`;
        }

        if (modalTitle && title) {
            modalTitle.textContent = title.textContent;
        }

        if (modalDescription && description) {
            modalDescription.textContent = description.trim();
        }

        if (modalPrice && price) {
            modalPrice.textContent = `R$ ${price}`;
        }
        if (modalBuy) modalBuy.href = `https://wa.me/5547997560445?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre ${title?.textContent.trim() || "essa joia"}.`)}`;

        if (productModal) {
            productModal.classList.add("active");
            document.body.classList.add("modal-open");
        }

    });

});


/* Fechar modal */

if (modalClose) {

    modalClose.addEventListener("click", () => {

        productModal.classList.remove("active");

        document.body.classList.remove("modal-open");

    });

}


/* Fechar clicando fora */

if (productModal) {

    productModal.addEventListener("click", event => {

        if (event.target === productModal) {

            productModal.classList.remove("active");

            document.body.classList.remove("modal-open");

        }

    });

}


/* ================= BOTÕES WHATSAPP ================= */

const whatsappNumber = "5547997560445";


function openWhatsApp(message = "") {

    const encodedMessage = encodeURIComponent(message);

    const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(url, "_blank");

}


/* Botões de compra */

document.querySelectorAll(".buy-btn").forEach(button => {

    button.addEventListener("click", event => {

        event.preventDefault();
        event.stopPropagation();

        const card = button.closest(".product-card");

        if (!card) return;

        const title = card.querySelector("h3");

        const productName = title
            ? title.textContent.trim()
            : "produto";

        const message =
            `Olá! Gostaria de saber mais sobre o ${productName}.`;

        openWhatsApp(message);

    });

});


/* Links para WhatsApp */

document.querySelectorAll('a[href="#contato"]').forEach(link => {

    link.addEventListener("click", event => {

        event.preventDefault();

        openWhatsApp(
            "Olá! Gostaria de saber mais sobre os produtos e serviços."
        );

    });

});


/* ================= INSTAGRAM ================= */

const instagramURL = "https://www.instagram.com/bodylili/";


document.querySelectorAll(".instagram-link").forEach(element => {

    element.addEventListener("click", event => {

        event.preventDefault();

        window.open(instagramURL, "_blank");

    });

});


/* ================= BOTÃO VOLTAR AO TOPO ================= */

const backToTop = document.querySelector(".back-top");


if (backToTop) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 500) {

            backToTop.classList.add("show");

        } else {

            backToTop.classList.remove("show");

        }

    });


    backToTop.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}


/* ================= ESC PARA FECHAR MODAL ================= */

document.addEventListener("keydown", event => {

    if (event.key === "Escape" && productModal) {

        productModal.classList.remove("active");

        document.body.classList.remove("modal-open");

    }

});


/* ================= ANO AUTOMÁTICO ================= */

const currentYear = document.getElementById("current-year");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}
