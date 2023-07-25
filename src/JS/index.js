
class MainMenu {
    constructor() {
        this.menu = document.querySelector('.main-menu');
        this.body = document.body;
        this.menuBtn = document.querySelectorAll('.main-menu-btn');
    }

    openMenu = (e) => {
        this.menu.classList.add('show');
        this.body.classList.add('lock');
        this.menuBtn.forEach(el => el.classList.add("collapsed"));
    }

    closeMenu = (e) => {
        this.menu.classList.remove('show');
        this.body.classList.remove('lock');
        this.menuBtn.forEach(el => el.classList.remove("collapsed"));
    }

    render() {
        this.menuBtn.forEach(element => {
            element.addEventListener('click', (e) => {
                console.log(e.target);
                if (this.menu.classList.contains('show')) {
                    this.closeMenu(e);
                } else {
                    this.openMenu(e);
                }
            })
        })
    }
}

document.addEventListener('DOMContentLoaded', function () {

    // Burger menu (Header)
    const headerMenu = new MainMenu();
    const forms = document.querySelectorAll("form");
    const thanksModal = document.querySelector(".modal-thanks-wrapper");
    const allModalsClose = document.querySelectorAll(".modal-close");
    const allModals = document.querySelectorAll(".modal-wrapper");
    const popLoad = document.querySelector(".popup-load");
    const popError =document.querySelector(".modal-error-wrapper");

    
    $("[type='phone'").mask("+7 (999) 999-99-99");

    allModalsClose.forEach(el => {
        el.addEventListener("click", () => {
            allModals.forEach(el => el.classList.remove("show"));
        })
    })

    $("form").each(function ()  {
        $(this).submit(function(e) { //устанавливаем событие отправки для формы с id=form
            popLoad.classList.add("show");
            let form_data = $(this).serialize(); //собераем все данные из формы
            e.preventDefault();
            $.ajax({
                type: "POST", //Метод отправки
                url: "send.php", //путь до php фаила отправителя
                data: form_data,
                success: function() {
                    popLoad.classList.remove("show");
                    thanksModal.classList.add("show");
                },
                error: function() {
                    popError.classList.add("show");
                    popLoad.classList.remove("show");
                }
            });
        });
    })
    if (window.innerWidth < 992) {
        headerMenu.render();
    }

    if (document.querySelector(".offer__slider")) {
        $(".offer__slider").slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true,
            arrows: false,
            autoplay: true,
            fade: true,
            dotsClass: "offer__slider-dots",
            autoplaySpeed: 3000,
            adaptiveHeight: true,
            pauseOnHover: false
        })
    }

    if (window.innerWidth < 768) {
        if (document.querySelector(".services__tab-content")) {
            $(".services__tab-content").each(function () {
                $(this).slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: true,
                    arrows: window.innerWidth < 572 ? false : true,
                    dotsClass: "services__tab-content-dots"
                })
            })
        }
    }

    if (document.querySelector("[data-tab-title]")) {
        const tabTitles = document.querySelectorAll("[data-tab-title]");
        const tabContents = document.querySelectorAll("[data-tab-content]");
        const tabItems = document.querySelectorAll(".services__tab-content-item");
        const tabModal = document.querySelector(".modal-tab-wrapper");

        tabTitles.forEach((elem, i) => {
            tabContents.forEach(content => {
                if (content.classList.contains("active") && content.getAttribute("data-tab-content") == elem.getAttribute("data-tab-title")) {
                    elem.classList.add("active");
                }
            });

            elem.addEventListener("click", () => {
                const tabTitle = document.querySelectorAll(`[data-tab-title="${elem.getAttribute('data-tab-title')}"]`);
                const tabContent = document.querySelector(`[data-tab-content="${elem.getAttribute('data-tab-title')}"]`);

                headerMenu.closeMenu();

                tabTitles.forEach((elem2, n) => {
                    elem2.classList.remove("active");
                });

                tabContents.forEach(elem3 => {
                    elem3.classList.remove("active");
                })

                elem.classList.add("active");
                tabContent.classList.add("active");

                tabTitle.forEach((elem4, i) => {
                    elem4.classList.add("active");
                    if (elem4.parentNode.classList.contains("services__tab-titles")) {
                        document.querySelector(".services__tab-titles").scrollTo(elem4.offsetLeft,0);
                    }
                })

                $(".services__tab-content").each(function () {
                    $(this).slick('refresh')
                })

            })
        });

        tabItems.forEach(el => {
            el.querySelector(".services__tab-content-item-btn--more").addEventListener("click", () => {

                const itemText = el.querySelector(".services__tab-content-full-text");
                const itemType = el.querySelector(".services__tab-content-full-type");
                const itemPrice = el.querySelector(".services__tab-content-full-price");
                const itemName = el.querySelector(".services__tab-content-item-title");
                const itemImg = el.querySelector(".services__tab-content-full-img").getAttribute("data-src");
                const modalText = tabModal.querySelector(".modal-tab__text");
                const modalName = tabModal.querySelector(".modal-tab__title");
                const modalBtn = tabModal.querySelector(".modal-tab__btn");
                const modalClose = tabModal.querySelector(".modal-close");
                const modalImg = tabModal.querySelector(".modal-tab__img img");

                modalText.textContent = itemText.innerText;
                modalBtn.textContent = `Заказать ${itemType.innerText} от ${itemPrice.innerText}`;
                modalName.textContent = itemName.innerText;
                modalImg.setAttribute("src", itemImg);
                modalBtn.setAttribute("data-service-name", modalName.textContent);
                modalClose.addEventListener("click", () => {
                    tabModal.classList.remove("show");
                })
                tabModal.classList.add("show");
            })
        })
    }

    const modalForm = document.querySelector(".modal-form-wrapper");
    const modalFormClose = modalForm.querySelector(".modal-close");
    const modalFormName = modalForm.querySelector(".modal-form__name")
    const modalFormBtns = document.querySelectorAll(".modal-form-btn");
    modalFormClose.addEventListener("click", () => {
        modalForm.classList.remove("show");
    })
    modalFormBtns.forEach(el => {
        el.addEventListener("click", () => {
            modalForm.classList.add("show");
            const modalFormFromName = el.getAttribute("data-service-name") ? el.getAttribute("data-service-name") : "";
            modalFormName.innerText = modalFormFromName;
        })
    });

    const reviewsMoreBtn = document.querySelector(".reviews__more-btn");
    const reviewsMoreItems = document.querySelector(".reviews__more-items");

    reviewsMoreBtn.addEventListener("click", () => {
        reviewsMoreBtn.style.display = "none";
        reviewsMoreItems.classList.add("show");
    })

});