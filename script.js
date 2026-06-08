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
    const aliasTransferencia = "Cocodite.Shoes"; // Alias para transferencia/depósito

    window.enviarWhatsApp = function () {

        if (carrito.length === 0) {
            alert("Carrito vacío");
            return;
        }

        // Mostrar modal para datos de envío
        document.getElementById("orderModal").style.display = "block";
    };

    window.closeOrderModal = function () {
        document.getElementById("orderModal").style.display = "none";
    };

    // Cerrar modal cuando se haga click fuera del contenido
    window.onclick = function (event) {
        const modal = document.getElementById("orderModal");
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    // Manejar envío del formulario
    const orderForm = document.getElementById("orderForm");
    if (orderForm) {
        orderForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const nombre = document.getElementById("customerName").value;
            const direccion = document.getElementById("customerAddress").value;
            let telefono_cliente = document.getElementById("customerPhone").value;
            const detalles = document.getElementById("customerDetails").value;

            // Validar teléfono: solo números, sin espacios ni caracteres especiales
            if (!/^\d+$/.test(telefono_cliente)) {
                alert("❌ El teléfono debe contener solo números, sin espacios ni caracteres especiales");
                return;
            }

            // Limpiar prefijos internacionales si existen
            let telefono_limpio = telefono_cliente;
            if (telefono_limpio.startsWith("549")) {
                telefono_limpio = telefono_limpio.substring(3); // Remover "549"
            }
            else if (telefono_limpio.startsWith("54")) {
                // Si es "54" sin el "9", solo remover "54"
                telefono_limpio = telefono_limpio.substring(2);
            }

            // Validar longitud: debe ser 8 o 10 dígitos
            if (telefono_limpio.length !== 8 && telefono_limpio.length !== 10) {
                alert(`❌ El teléfono debe tener 8 o 10 dígitos. Ingresaste: ${telefono_limpio.length}`);
                return;
            }

            // Si tiene 8 dígitos, agregar "11" al inicio (número local de Buenos Aires)
            if (telefono_limpio.length === 8) {
                telefono_limpio = "11" + telefono_limpio;
            }

            // Agregar prefijo internacional "549"
            telefono_cliente = "549" + telefono_limpio;

            // Calcular total
            let total = 0;
            let productosTexto = "";
            carrito.forEach(p => {
                let sub = p.precio * p.cantidad;
                total += sub;
                productosTexto += `- ${p.nombre} | Talle ${p.talla} x${p.cantidad}%0A`;
            });

            // MENSAJE PARA EL NEGOCIO
            let msgNegocio = "Hola Regina - Pedido 👟%0A%0A";
            msgNegocio += `*CLIENTE:* ${nombre}%0A`;
            msgNegocio += `*TELÉFONO:* ${telefono_cliente}%0A`;
            msgNegocio += `*DIRECCIÓN:* ${direccion}%0A`;
            if (detalles) {
                msgNegocio += `*OBSERVACIONES:* ${detalles}%0A`;
            }
            msgNegocio += `%0A*PRODUCTOS:*%0A`;
            msgNegocio += productosTexto;
            msgNegocio += `%0A*TOTAL:* ${formatPrice(total)}`;

            // MENSAJE PARA EL CLIENTE
            let msgCliente = "¡Hola! 👟 Tu pedido en ReginaShop%0A%0A";
            msgCliente += `*RESUMEN DE TU PEDIDO*%0A`;
            msgCliente += `%0A*DATOS DE ENVÍO:*%0A`;
            msgCliente += `📍 Dirección: ${direccion}%0A`;
            msgCliente += `📞 Teléfono: ${telefono_cliente}%0A`;
            msgCliente += `%0A*PRODUCTOS ORDENADOS:*%0A`;
            msgCliente += productosTexto;
            msgCliente += `*TOTAL A PAGAR:* ${formatPrice(total)}%0A`;
            msgCliente += `%0A*DATOS PARA DEPOSITAR/TRANSFERIR:*%0A`;
            msgCliente += `💳 Alias: *${aliasTransferencia}*%0A`;
            msgCliente += `%0A¡Gracias por tu compra! 🎉`;

            // Cerrar modal
            document.getElementById("orderModal").style.display = "none";

            // Limpiar formulario
            orderForm.reset();

            // Enviar mensaje al negocio
            window.open(
                `https://wa.me/${telefono}?text=${msgNegocio}`,
                "_blank"
            );

            // Enviar copia del pedido al cliente (después de 500ms)
            setTimeout(() => {
                window.open(
                    `https://wa.me/${telefono_cliente}?text=${msgCliente}`,
                    "_blank"
                );
            }, 500);

            // Limpiar carrito y recargar página (después de 1500ms)
            setTimeout(() => {
                localStorage.removeItem("carrito");
                localStorage.removeItem("filtro");
                location.reload();
            }, 1500);
        });
    }

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