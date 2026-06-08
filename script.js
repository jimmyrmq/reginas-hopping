document.addEventListener("DOMContentLoaded", () => {
    let selectedSizes = {};
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
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0
        }).format(value);
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

        if (list.length === 0) {
            cont.innerHTML = `
                <div class="empty-products">
                    No se encontraron productos
                </div>
            `;
            return;
        }

        cont.innerHTML = "";

        list.forEach(p => {
            if (!selectedSizes[p.id]) {
                selectedSizes[p.id] = null;
            }

            let item = carrito.find(c => c.id === p.id);
            let cantidad = item ? item.cantidad : 0;

            const tallasHTML = (p.tallas || [])
                .map(t => `
                    <button
                        class="size-btn ${selectedSizes[p.id] === t.numero ? 'selected' : ''} ${t.stock === 0 ? 'agotado' : ''}"
                        ${t.stock === 0 ? 'disabled' : ''}
                        onclick="selectSize(${p.id}, '${t.numero}')"
                    >
                        ${t.numero}
                    </button>
                `)
                .join('');

            const sinTalla = !selectedSizes[p.id];
            cont.innerHTML += `
                <div class="card">
                    <img src="${p.imagen}" alt="${p.nombre}">
                    <div class="card-body">
                        <h3>${p.nombre}</h3>
                        <p class="price">${formatPrice(p.precio)}</p>
                        <div class="sizes">
                            ${tallasHTML}
                        </div>
                        <div class="actions">
                            <!-- ✔ -->
                            <button onclick="changeQty(${p.id}, -1, '${selectedSizes[p.id]}')" ${sinTalla ? 'disabled' : ''} class="${sinTalla ? 'disabled' : ''}">−</button>
                            <span class="qty-display ${cantidad > 0 ? 'has-qty' : (sinTalla ? 'select-size' : 'zero-qty')}">${cantidad > 0 ? `${cantidad}` : (sinTalla ? 'Seleccione la talla' : '0')}</span>
                            <button onclick="changeQty(${p.id}, 1, '${selectedSizes[p.id]}')" ${sinTalla ? 'disabled' : ''} class="${sinTalla ? 'disabled' : ''}">+</button>
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
            <p class="name">
    ${p.nombre}
</p>

<p class="size-cart">
    Talla: ${p.talla}
</p>

            <div class="qty">
                <button onclick="changeQty(${p.id}, -1, '${p.talla}')">−</button>
                <span>${p.cantidad}</span>
                <button onclick="changeQty(${p.id}, 1, '${p.talla}')">+</button>
            </div>
        </div>

        <div class="cart-right">
            <p>${formatPrice(p.precio * p.cantidad)}</p>
        </div>
    </div>
    `;
        });

        document.getElementById("total").innerText = formatPrice(total);

        updateCartCount();
    }

    /* =========================
       ➕➖ CANTIDAD
    ========================= */
    window.add = function (id) {

        const talla = selectedSizes[id];

        if (!talla) {
            alert("Seleccioná una talla antes de agregar al carrito");
            return;
        }

        let prod = productos.find(p => p.id === id);

        let item = carrito.find(
            p => p.id === id && p.talla === talla
        );

        if (item) {
            item.cantidad++;
        } else {
            carrito.push({
                id: prod.id,
                nombre: prod.nombre,
                precio: prod.precio,
                imagen: prod.imagen,
                talla: talla,
                cantidad: 1
            });
        }

        saveCart();
        renderCart();
        renderUI();
    };

    window.changeQty = function (id, delta, talla) {

        let item = carrito.find(
            p => p.id === id && p.talla === talla
        );

        if (!item && delta > 0) {
            let prod = productos.find(p => p.id === id);
            carrito.push({
                id: prod.id,
                nombre: prod.nombre,
                precio: prod.precio,
                imagen: prod.imagen,
                talla: talla,
                cantidad: 1
            });
        } else if (item) {
            item.cantidad += delta;

            if (item.cantidad <= 0) {
                carrito = carrito.filter(
                    p => !(p.id === id && p.talla === talla)
                );
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
            msg += `- ${p.nombre} | Talla ${p.talla} x${p.cantidad}`;
        });

        msg += `%0A*TOTAL:* ${formatPrice(total)}`;

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
        updateCartCount();
    }
    /* =========================
       🛒 CONTADOR CARRITO
    ========================= */
    function updateCartCount() {

        const totalItems = carrito.reduce(
            (sum, item) => sum + item.cantidad,
            0
        );

        const totalPrice = carrito.reduce(
            (sum, item) => sum + (item.precio * item.cantidad),
            0
        );

        const badge = document.getElementById("cartCount");
        const headerTotal = document.getElementById("headerTotal");

        if (badge) {
            badge.innerText = totalItems;
            badge.style.display = totalItems ? "flex" : "none";
        }

        if (headerTotal) {
            headerTotal.innerText = formatPrice(totalPrice);
        }
    }

    /* =========================
       📍 IR AL CARRITO
    ========================= */
    window.scrollToCart = function () {

        document.querySelector(".cart").scrollIntoView({
            behavior: "smooth"
        });

    };

    window.selectSize = function (id, talla) {

        selectedSizes[id] = talla;

        renderUI();
    };

    loadProducts();

});