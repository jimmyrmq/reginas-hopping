document.addEventListener("DOMContentLoaded", () => {

    const telefono = "5491127824001";

    /* =========================
       🧠 ESTADO GLOBAL
    ========================= */
    let productos = [];
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let filtroActual = localStorage.getItem("filtro") || "todos";
    let searchTerm = "";

    /* =========================
       💰 FORMATO PRECIO
    ========================= */
    function formatPrice(value) {
        return new Intl.NumberFormat("es-AR").format(value);
    }

    /* =========================
       📦 CARGAR PRODUCTOS (JSON)
    ========================= */
    async function loadProducts() {
        const res = await fetch("products.json");
        productos = await res.json();
        init();
    }

    /* =========================
       🧠 RENDER PRINCIPAL
    ========================= */
    function renderUI() {

        let lista = productos;

        // filtro
        if (filtroActual !== "todos") {
            lista = lista.filter(p => p.categoria === filtroActual);
        }

        // búsqueda
        if (searchTerm.trim() !== "") {
            lista = lista.filter(p =>
                p.nombre.toLowerCase().includes(searchTerm)
            );
        }

        renderProductos(lista);
    }

    /* =========================
       🖼️ PRODUCTOS
    ========================= */
    function renderProductos(list) {
        const cont = document.getElementById("productos");
        cont.innerHTML = "";

        list.forEach(p => {

            let item = carrito.find(c => c.id === p.id);
            let cantidad = item ? item.cantidad : 0;

            cont.innerHTML += `
        <div class="card">
            <img src="${p.imagen}">
            <div class="card-body">
                <h3>${p.nombre}</h3>
                <p class="price">$${formatPrice(p.precio)}</p>

                <div class="actions">
                    <button onclick="changeQty(${p.id}, -1)">−</button>

                    <button onclick="add(${p.id})">
                        ${cantidad > 0 ? `✔ ${cantidad}` : "Agregar"}
                    </button>

                    <button onclick="changeQty(${p.id}, 1)">+</button>
                </div>
            </div>
        </div>
        `;
        });
    }

    /* =========================
       🛒 CARRITO
    ========================= */
    function saveCart() {
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }

    function renderCart() {

        const cont = document.getElementById("cartItems");
        cont.innerHTML = "";

        let total = 0;

        carrito.forEach(p => {

            total += p.precio * p.cantidad;

            cont.innerHTML += `
        <div class="cart-item">
            <div class="cart-left">
                <p class="name">${p.nombre}</p>

                <div class="qty">
                    <button onclick="changeQty(${p.id}, -1)">−</button>
                    <span>${p.cantidad}</span>
                    <button onclick="changeQty(${p.id}, 1)">+</button>
                </div>
            </div>

            <div class="cart-right">
                <p>$${formatPrice(p.precio * p.cantidad)}</p>
            </div>
        </div>
        `;
        });

        document.getElementById("total").innerText = formatPrice(total);
    }

    /* =========================
       ➕➖ CANTIDAD
    ========================= */
    window.add = function (id) {

        let item = carrito.find(p => p.id === id);
        let prod = productos.find(p => p.id === id);

        if (item) {
            item.cantidad++;
        } else {
            carrito.push({ ...prod, cantidad: 1 });
        }

        saveCart();
        renderCart();
        renderUI();
    };

    window.changeQty = function (id, delta) {

        let item = carrito.find(p => p.id === id);

        if (!item && delta > 0) {
            let prod = productos.find(p => p.id === id);
            carrito.push({ ...prod, cantidad: 1 });
        } else if (item) {
            item.cantidad += delta;

            if (item.cantidad <= 0) {
                carrito = carrito.filter(p => p.id !== id);
            }
        }

        saveCart();
        renderCart();
        renderUI();
    };

    /* =========================
       🔎 BUSCADOR
    ========================= */
    document.getElementById("search").addEventListener("input", (e) => {
        searchTerm = e.target.value.toLowerCase();
        renderUI();
    });

    /* =========================
       🎯 FILTROS
    ========================= */
    window.filtrar = function (cat, btn) {

        filtroActual = cat;
        localStorage.setItem("filtro", cat);

        document.querySelectorAll("nav button").forEach(b => {
            b.classList.remove("active");
        });

        btn.classList.add("active");

        renderUI();
    };

    /* =========================
       📲 WHATSAPP
    ========================= */
    window.enviarWhatsApp = function () {

        if (carrito.length === 0) {
            alert("Carrito vacío");
            return;
        }

        let msg = "Hola Cocodite 👟%0A%0A";
        let total = 0;

        carrito.forEach(p => {
            let sub = p.precio * p.cantidad;
            total += sub;

            msg += `- ${p.nombre} x${p.cantidad} = $${formatPrice(sub)}%0A`;
        });

        msg += `%0A*TOTAL:* $${formatPrice(total)}`;

        window.open(
            `https://wa.me/${telefono}?text=${msg}`,
            "_blank"
        );
    };

    /* =========================
       🚀 INIT
    ========================= */
    function init() {

        const btns = document.querySelectorAll("nav button");

        btns.forEach(b => {
            if (b.textContent.toLowerCase().includes(filtroActual)) {
                b.classList.add("active");
            }
        });

        renderUI();
        renderCart();
    }

    loadProducts();

});