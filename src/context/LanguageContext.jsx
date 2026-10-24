import { createContext, useContext, useState, useEffect } from "react";

const translations = {
  en: {
    // Brand & Header
    brandTitle: "The Thrift-flip Store",
    brandSubtitle: "Big Sales & Curated Fashion",
    searchPlaceholder: "Search products...",
    searching: "Searching products...",
    noItemsFound: "No products found",
    cartTitle: "Cart",
    signIn: "Sign In",
    register: "Register",
    signOut: "Sign Out",
    myOrders: "My Orders",
    adminDashboard: "Admin Dashboard",
    hi: "Hi",
    account: "Account",
    
    // Categories & Nav
    all: "All",
    men: "Men",
    women: "Women",
    kids: "Kids",
    accessories: "Accessories",

    // Hero Banner
    heroBadge: "Special Promotion • Ethiopia",
    heroHeading: "Discover Curated Fashion with Fast Local Delivery",
    heroDesc: "Shop sustainable thrift and premium fashion items in Addis Ababa. Guaranteed secure checkout with Chapa (Telebirr, CBE, Cards).",
    shopNow: "Shop Now",
    viewCatalog: "Explore Collection",

    // Products
    inStock: "in stock",
    outOfStock: "Sold out",
    addToCart: "Add to cart",
    added: "Added!",
    pageOf: "Page {page} of {total}",
    previous: "Previous",
    next: "Next",
    loadingProducts: "Loading products...",
    noProductsCategory: "No products available in this category.",

    // Cart
    shoppingCart: "Shopping Cart",
    emptyCart: "Your cart is empty",
    startShopping: "Start Shopping",
    subtotal: "Subtotal",
    orderSubtotal: "Order Subtotal",
    proceedToCheckout: "Proceed to Checkout",
    clearCart: "Clear Cart",
    remove: "Remove",

    // Checkout
    checkout: "Checkout",
    shippingDetails: "Shipping Details",
    fullName: "Full Name",
    emailAddress: "Email Address",
    phone: "Phone Number",
    streetAddress: "Street Address / Sub-City",
    city: "City",
    payWithChapa: "Pay with Chapa",
    freeDelivery: "Free local delivery in Addis Ababa",
    orderSummary: "Order Summary",
    totalAmount: "Total Amount",

    // Auth
    welcomeTitle: "Welcome Back",
    createAccountTitle: "Create Your Account",
    authSubtitle: "Sign in or register to track your orders and enjoy seamless checkout.",
    password: "Password",
    confirmPassword: "Confirm Password",
    passwordsMismatch: "Passwords do not match",
    alreadyHaveAccount: "Already have an account? Sign In",
    dontHaveAccount: "Don't have an account? Register",

    // Footer
    contact: "Contact",
    contactSubtitle: "Questions? We'd love to hear from you.",
    send: "Send Message",
    name: "Name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    aboutUs: "About Us",
    hiring: "We're Hiring",
    support: "Support",
    findStore: "Find Store",
    shipment: "Shipment",
    payment: "Payment",
    giftCard: "Gift Card",
    returns: "Returns",
    help: "Help",
    weAccept: "We Accept",
    followUs: "Follow Us",
    poweredBy: "Powered by Peter Bekana • The Thrift-flip Store, Addis Ababa",
  },

  es: {
    // Brand & Header
    brandTitle: "The Thrift-flip Store",
    brandSubtitle: "Grandes Ofertas y Moda Curada",
    searchPlaceholder: "Buscar productos...",
    searching: "Buscando productos...",
    noItemsFound: "No se encontraron productos",
    cartTitle: "Carrito",
    signIn: "Iniciar Sesión",
    register: "Registrarse",
    signOut: "Cerrar Sesión",
    myOrders: "Mis Pedidos",
    adminDashboard: "Panel de Administración",
    hi: "Hola",
    account: "Cuenta",

    // Categories & Nav
    all: "Todos",
    men: "Hombres",
    women: "Mujeres",
    kids: "Niños",
    accessories: "Accesorios",

    // Hero Banner
    heroBadge: "Promoción Especial • Etiopía",
    heroHeading: "Descubre Moda Exclusiva con Entrega Local Rápida",
    heroDesc: "Compra moda sostenible y de calidad en Adís Abeba. Pago 100% seguro con Chapa (Telebirr, CBE, Tarjetas).",
    shopNow: "Comprar Ahora",
    viewCatalog: "Explorar Colección",

    // Products
    inStock: "en stock",
    outOfStock: "Agotado",
    addToCart: "Añadir al carrito",
    added: "¡Añadido!",
    pageOf: "Página {page} de {total}",
    previous: "Anterior",
    next: "Siguiente",
    loadingProducts: "Cargando productos...",
    noProductsCategory: "No hay productos en esta categoría.",

    // Cart
    shoppingCart: "Carrito de Compras",
    emptyCart: "Tu carrito está vacío",
    startShopping: "Empezar a Comprar",
    subtotal: "Subtotal",
    orderSubtotal: "Subtotal del Pedido",
    proceedToCheckout: "Continuar al Pago",
    clearCart: "Vaciar Carrito",
    remove: "Eliminar",

    // Checkout
    checkout: "Finalizar Compra",
    shippingDetails: "Datos de Envío",
    fullName: "Nombre Completo",
    emailAddress: "Correo Electrónico",
    phone: "Teléfono",
    streetAddress: "Dirección / Subdistrito",
    city: "Ciudad",
    payWithChapa: "Pagar con Chapa",
    freeDelivery: "Envío local gratis en Adís Abeba",
    orderSummary: "Resumen del Pedido",
    totalAmount: "Monto Total",

    // Auth
    welcomeTitle: "Bienvenido de Nuevo",
    createAccountTitle: "Crear Cuenta",
    authSubtitle: "Inicia sesión o regístrate para rastrear tus compras fácilmente.",
    password: "Contraseña",
    confirmPassword: "Confirmar Contraseña",
    passwordsMismatch: "Las contraseñas no coinciden",
    alreadyHaveAccount: "¿Ya tienes cuenta? Iniciar Sesión",
    dontHaveAccount: "¿No tienes cuenta? Regístrate",

    // Footer
    contact: "Contacto",
    contactSubtitle: "¿Preguntas? Estamos a tu disposición.",
    send: "Enviar Mensaje",
    name: "Nombre",
    email: "Correo",
    subject: "Asunto",
    message: "Mensaje",
    aboutUs: "Sobre Nosotros",
    hiring: "Trabaja con Nosotros",
    support: "Soporte",
    findStore: "Ubicar Tienda",
    shipment: "Envíos",
    payment: "Métodos de Pago",
    giftCard: "Tarjeta de Regalo",
    returns: "Devoluciones",
    help: "Ayuda",
    weAccept: "Aceptamos",
    followUs: "Síguenos",
    poweredBy: "Desarrollado por Peter Bekana • The Thrift-flip Store, Adís Abeba",
  },

  fr: {
    // Brand & Header
    brandTitle: "The Thrift-flip Store",
    brandSubtitle: "Grandes Ventes & Mode Sélecte",
    searchPlaceholder: "Rechercher des produits...",
    searching: "Recherche de produits...",
    noItemsFound: "Aucun produit trouvé",
    cartTitle: "Panier",
    signIn: "Connexion",
    register: "S'inscrire",
    signOut: "Déconnexion",
    myOrders: "Mes Commandes",
    adminDashboard: "Tableau de Bord Admin",
    hi: "Bonjour",
    account: "Compte",

    // Categories & Nav
    all: "Tous",
    men: "Hommes",
    women: "Femmes",
    kids: "Enfants",
    accessories: "Accessoires",

    // Hero Banner
    heroBadge: "Promotion Spéciale • Éthiopie",
    heroHeading: "Découvrez une Mode Unique avec Livraison Locale Rapide",
    heroDesc: "Achetez de la mode écoresponsable à Addis-Abeba. Paiement garanti sécurisé avec Chapa (Telebirr, CBE, Cartes).",
    shopNow: "Acheter Maintenant",
    viewCatalog: "Explorer la Collection",

    // Products
    inStock: "en stock",
    outOfStock: "Épuisé",
    addToCart: "Ajouter au panier",
    added: "Ajouté !",
    pageOf: "Page {page} sur {total}",
    previous: "Précédent",
    next: "Suivant",
    loadingProducts: "Chargement des articles...",
    noProductsCategory: "Aucun produit dans cette catégorie.",

    // Cart
    shoppingCart: "Panier d'Achats",
    emptyCart: "Votre panier est vide",
    startShopping: "Commencer vos Achats",
    subtotal: "Sous-total",
    orderSubtotal: "Sous-total de la Commande",
    proceedToCheckout: "Passer à la Caisse",
    clearCart: "Vider le Panier",
    remove: "Supprimer",

    // Checkout
    checkout: "Commande",
    shippingDetails: "Informations de Livraison",
    fullName: "Nom Complet",
    emailAddress: "Adresse E-mail",
    phone: "Numéro de Téléphone",
    streetAddress: "Adresse / Quartier",
    city: "Ville",
    payWithChapa: "Payer avec Chapa",
    freeDelivery: "Livraison locale gratuite à Addis-Abeba",
    orderSummary: "Récapitulatif de Commande",
    totalAmount: "Montant Total",

    // Auth
    welcomeTitle: "Bon Retour",
    createAccountTitle: "Créer un Compte",
    authSubtitle: "Connectez-vous ou inscrivez-vous pour suivre vos commandes en toute simplicité.",
    password: "Mot de Passe",
    confirmPassword: "Confirmer le Mot de Passe",
    passwordsMismatch: "Les mots de passe ne correspondent pas",
    alreadyHaveAccount: "Vous avez déjà un compte ? Connexion",
    dontHaveAccount: "Vous n'avez pas de compte ? S'inscrire",

    // Footer
    contact: "Contact",
    contactSubtitle: "Des questions ? Nous sommes là pour vous aider.",
    send: "Envoyer le Message",
    name: "Nom",
    email: "E-mail",
    subject: "Sujet",
    message: "Message",
    aboutUs: "À Propos",
    hiring: "Recrutement",
    support: "Assistance",
    findStore: "Trouver un Magasin",
    shipment: "Expéditions",
    payment: "Paiements",
    giftCard: "Cartes Cadeaux",
    returns: "Retours",
    help: "Aide",
    weAccept: "Nous Acceptons",
    followUs: "Suivez-nous",
    poweredBy: "Propulsé par Peter Bekana • The Thrift-flip Store, Addis-Abeba",
  },

  it: {
    // Brand & Header
    brandTitle: "The Thrift-flip Store",
    brandSubtitle: "Grandi Saldi & Moda Selezionata",
    searchPlaceholder: "Cerca prodotti...",
    searching: "Ricerca prodotti...",
    noItemsFound: "Nessun prodotto trovato",
    cartTitle: "Carrello",
    signIn: "Accedi",
    register: "Registrati",
    signOut: "Disconnetti",
    myOrders: "I Miei Ordini",
    adminDashboard: "Dashboard Admin",
    hi: "Ciao",
    account: "Account",

    // Categories & Nav
    all: "Tutti",
    men: "Uomo",
    women: "Donna",
    kids: "Bambini",
    accessories: "Accessori",

    // Hero Banner
    heroBadge: "Promozione Speciale • Etiopia",
    heroHeading: "Scopri la Moda Esclusiva con Consegna Rapida Locale",
    heroDesc: "Acquista abbigliamento curato e sostenibile ad Addis Abeba. Pagamento sicuro garantito con Chapa (Telebirr, CBE, Carte).",
    shopNow: "Acquista Ora",
    viewCatalog: "Esplora Collezione",

    // Products
    inStock: "disponibili",
    outOfStock: "Esaurito",
    addToCart: "Aggiungi al carrello",
    added: "Aggiunto!",
    pageOf: "Pagina {page} di {total}",
    previous: "Precedente",
    next: "Successivo",
    loadingProducts: "Caricamento prodotti...",
    noProductsCategory: "Nessun prodotto disponibile in questa categoria.",

    // Cart
    shoppingCart: "Carrello Acquisti",
    emptyCart: "Il tuo carrello è vuoto",
    startShopping: "Inizia lo Shopping",
    subtotal: "Subtotale",
    orderSubtotal: "Subtotale Ordine",
    proceedToCheckout: "Procedi al Checkout",
    clearCart: "Svuota Carrello",
    remove: "Rimuovi",

    // Checkout
    checkout: "Cassa",
    shippingDetails: "Dettagli di Spedizione",
    fullName: "Nome Completo",
    emailAddress: "Indirizzo Email",
    phone: "Numero di Telefono",
    streetAddress: "Indirizzo / Quartiere",
    city: "Città",
    payWithChapa: "Paga con Chapa",
    freeDelivery: "Consegna locale gratuita ad Addis Abeba",
    orderSummary: "Riepilogo Ordine",
    totalAmount: "Totale Ordine",

    // Auth
    welcomeTitle: "Bentornato",
    createAccountTitle: "Crea il Tuo Account",
    authSubtitle: "Accedi o registrati per gestire i tuoi ordini e fare acquisti in comodità.",
    password: "Password",
    confirmPassword: "Conferma Password",
    passwordsMismatch: "Le password non coincidono",
    alreadyHaveAccount: "Hai già un account? Accedi",
    dontHaveAccount: "Non hai un account? Registrati",

    // Footer
    contact: "Contattaci",
    contactSubtitle: "Hai domande? Scrivici subito.",
    send: "Invia Messaggio",
    name: "Nome",
    email: "Email",
    subject: "Oggetto",
    message: "Messaggio",
    aboutUs: "Chi Siamo",
    hiring: "Lavora con Noi",
    support: "Assistenza",
    findStore: "I Nostri Negozi",
    shipment: "Spedizioni",
    payment: "Metodi di Pagamento",
    giftCard: "Buoni Regalo",
    returns: "Resi",
    help: "Aiuto",
    weAccept: "Accettiamo",
    followUs: "Seguici",
    poweredBy: "Realizzato da Peter Bekana • The Thrift-flip Store, Addis Abeba",
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("preferred_lang") || "en";
  });

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem("preferred_lang", lang);
    }
  };

  const t = (key, params = {}) => {
    const dict = translations[language] || translations.en;
    let text = dict[key] || translations.en[key] || key;
    Object.keys(params).forEach((paramKey) => {
      text = text.replace(`{${paramKey}}`, params[paramKey]);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: Object.keys(translations) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
