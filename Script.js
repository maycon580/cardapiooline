class RestaurantCart {
   constructor() {
     this.elements = {
       menu: document.getElementById("menu"),
       cartBtn: document.getElementById("cart-btn"),
       cartModal: document.getElementById("cart-modal"),
       cartItemsContainer: document.getElementById("cart-items"),
       cartTotal: document.getElementById("cart-total"),
       checkoutBtn: document.getElementById("checkout-btn"),
       closeModalBtn: document.getElementById("class-modal-btn"),
       cartCounter: document.getElementById("cart-count"),
       addressInput: document.getElementById("addres"),
       addressWarn: document.getElementById("addres-warn"),
       dateSpan: document.getElementById("date-span")
     };
 
     // Configurar o estilo do container do carrinho
     this.setupCartContainer();
 
     this.cart = [];
     this.whatsappPhone = "19991303280";
     this.businessHours = {
       open: 18,
       close: 22
     };
 
     this.initializeEventListeners();
     this.updateRestaurantStatus();
   }
 
   setupCartContainer() {
     // Aplicar estilos ao container do carrinho
     this.elements.cartItemsContainer.style.maxHeight = "400px";
     this.elements.cartItemsContainer.style.overflowY = "auto";
     this.elements.cartItemsContainer.style.paddingRight = "10px";
     // Adicionar estilo para scroll suave
     this.elements.cartItemsContainer.style.scrollBehavior = "smooth";
   }
 
   initializeEventListeners() {
     // Cart modal controls
     this.elements.cartBtn.addEventListener("click", () => this.openCartModal());
     this.elements.cartModal.addEventListener("click", (e) => this.handleModalClick(e));
     this.elements.closeModalBtn.addEventListener("click", () => this.closeCartModal());
 
     // Menu and cart interactions
     this.elements.menu.addEventListener("click", (e) => this.handleMenuClick(e));
     this.elements.cartItemsContainer.addEventListener("click", (e) => this.handleCartItemClick(e));
     
     // Checkout process
     this.elements.addressInput.addEventListener("input", (e) => this.handleAddressInput(e));
     this.elements.checkoutBtn.addEventListener("click", () => this.handleCheckout());
   }
 
   // Cart operations
   addToCart(name, price) {
     const existingItem = this.cart.find(item => item.name === name);
     
     if (existingItem) {
       existingItem.quantity += 1;
     } else {
       this.cart.push({ name, price, quantity: 1 });
     }
     
     this.updateCartModal();
   }
 
   removeFromCart(name) {
     const index = this.cart.findIndex(item => item.name === name);
     if (index !== -1) {
       const item = this.cart[index];
       if (item.quantity > 1) {
         item.quantity -= 1;
       } else {
         this.cart.splice(index, 1);
       }
       this.updateCartModal();
     }
   }
 
   // UI updates
   updateCartModal() {
     this.elements.cartItemsContainer.innerHTML = "";
     const total = this.cart.reduce((sum, item) => {
       const subtotal = item.price * item.quantity;
       
       const cartItemElement = document.createElement("div");
       cartItemElement.classList.add(
         "flex",
         "justify-between",
         "mb-4",
         "flex-col",
         "bg-white",
         "p-4",
         "rounded-lg",
         "shadow-sm"
       );
 
       cartItemElement.innerHTML = `
         <div class="flex items-center justify-between">
           <div>
             <p class="font-bold">${item.name}</p>
             <p class="font-medium mt-1">R$ ${item.price.toFixed(2)} reais</p>
             <p class="mt-1">Quantidade: ${item.quantity}</p>
             <p class="mt-1">Subtotal: R$ ${subtotal.toFixed(2)}</p>
           </div>
           <button class="remove-item-btn bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors" data-name="${item.name}">
             Remover
           </button>
         </div>
       `;
       
       this.elements.cartItemsContainer.appendChild(cartItemElement);
       return sum + subtotal;
     }, 0);
 
     this.updateTotalAndCounter(total);
   }
 
   updateTotalAndCounter(total) {
     this.elements.cartTotal.textContent = total.toLocaleString("pt-BR", {
       style: "currency",
       currency: "BRL"
     });
     
     this.elements.cartCounter.textContent = this.cart.reduce(
       (sum, item) => sum + item.quantity, 
       0
     );
   }
 
   // Restaurant status
   checkRestaurantOpen() {
     const currentHour = new Date().getHours();
     return currentHour >= this.businessHours.open && 
            currentHour < this.businessHours.close;
   }
 
   updateRestaurantStatus() {
     const isOpen = this.checkRestaurantOpen();
     this.elements.dateSpan.classList.remove(
       isOpen ? "bg-red-500" : "bg-green-600"
     );
     this.elements.dateSpan.classList.add(
       isOpen ? "bg-green-600" : "bg-red-500"
     );
   }
 
   // Event handlers
   handleMenuClick(event) {
     const parentButton = event.target.closest(".add-to-cart-btn");
     if (parentButton) {
       const name = parentButton.getAttribute("data-name");
       const price = parseFloat(parentButton.getAttribute("data-price"));
       this.addToCart(name, price);
     }
   }
 
   handleCartItemClick(event) {
     if (event.target.classList.contains("remove-item-btn")) {
       const name = event.target.getAttribute("data-name");
       this.removeFromCart(name);
     }
   }
 
   handleAddressInput(event) {
     const hasValue = event.target.value !== "";
     this.elements.addressInput.classList.toggle("border-red-500", !hasValue);
     this.elements.addressWarn.classList.toggle("hidden", hasValue);
   }
   handleCheckout() {
    if (!this.validateCheckout()) return;
  
    const cartItems = this.cart
      .map(item => 
        `${item.name} Quantidade: (${item.quantity}) Preço: R$ ${item.price} | `
      )
      .join("");
  
    const message = encodeURIComponent(cartItems);
    const address = encodeURIComponent(this.elements.addressInput.value);
    
    // Limpa o campo de endereço após finalizar o pedido
    this.elements.addressInput.value = "";
    this.elements.addressWarn.classList.add("hidden"); // Esconde o aviso
    this.elements.addressInput.classList.remove("border-red-500"); // Remove o estilo de erro
  
    // Envia a mensagem para o WhatsApp
    window.open(
      `https://wa.me/${this.whatsappPhone}?text=${message} Endereço: ${address}`,
      "_blank"
    );
  
    // Limpa o carrinho
    this.cart = [];
    this.updateCartModal();
  }
  
 
   validateCheckout() {
    if (!this.checkRestaurantOpen()) {
      this.showToast("Ops, o restaurante está fechado", "error");
      return false;
    }
  
    if (this.cart.length === 0) {
      this.showToast("O seu carrinho está vazio", "error");
      return false;
    }
  
    if (this.elements.addressInput.value === "") {
      // Exibe um aviso caso o endereço não tenha sido preenchido
      this.showToast("Ops, você esqueceu de preencher seu endereço", "error");
      this.elements.addressWarn.classList.remove("hidden"); // Exibe o aviso visualmente
      this.elements.addressInput.classList.add("border-red-500"); // Altera o estilo para destacar o campo
      return false;
    }
  
    return true;
  }
   

   // Modal controls
   openCartModal() {
     this.elements.cartModal.style.display = "flex"; // Exibe o modal
     
     // Adiciona a classe para fixar o fundo
     document.body.classList.add("modal-open");
 
     // Cria o fundo escurecido
     const backdrop = document.createElement("div");
     backdrop.classList.add("modal-backdrop");
     document.body.appendChild(backdrop);
 
     // Desabilita a interação com o conteúdo da página
     document.body.style.overflow = "hidden"; 
 
     this.updateCartModal();
   }
 
   closeCartModal() {
     this.elements.cartModal.style.display = "none"; // Esconde o modal
     
     // Remove a classe para permitir o scroll novamente
     document.body.classList.remove("modal-open");
 
     // Remove o fundo escurecido
     const backdrop = document.querySelector(".modal-backdrop");
     if (backdrop) {
       backdrop.remove();
     }
 
     // Habilita a interação com o conteúdo da página novamente
     document.body.style.overflow = "auto"; 
   }
 
   handleModalClick(event) {
     if (event.target === this.elements.cartModal) {
       this.closeCartModal();
     }
   }
 
   // Utility functions
   showToast(message, type) {
     Toastify({
       text: message,
       duration: 3000,
       close: true,
       gravity: "top",
       position: "right",
       stopOnFocus: true,
       style: {
         background: type === "error" ? "#ef4444" : "#22c55e"
       }
     }).showToast();
   }
 }
 
 // Inicializar o sistema do carrinho
 const restaurantCart = new RestaurantCart();
 