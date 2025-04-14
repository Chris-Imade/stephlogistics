exports.getServicesPage = (req, res) => {
  res.render("service/index", {
    title: "Our Services - Steph Logistics",
    layout: "layouts/main",
  });
};

exports.getServiceDetailsPage = (req, res) => {
  const serviceId = req.params.id;

  // Mock service data - in a real app, this would come from the database
  const services = {
    "parcel-delivery": {
      id: "parcel-delivery",
      title: "UK Parcel Delivery",
      description: "Fast, trackable services with same-day or next-day options",
      icon: "fa-box",
      details:
        "Our UK parcel delivery service offers fast, reliable delivery across the United Kingdom. With same-day and next-day options available, we ensure your parcels arrive on time and in perfect condition.",
    },
    "worldwide-shipping": {
      id: "worldwide-shipping",
      title: "Worldwide Shipping",
      description: "Door-to-door delivery in over 220 countries",
      icon: "fa-globe",
      details:
        "Our worldwide shipping service provides door-to-door delivery in over 220 countries. With our global network of trusted carriers, we ensure your shipments reach their destination safely and on time, no matter where in the world they're going.",
    },
    "freight-shipping": {
      id: "freight-shipping",
      title: "Freight & Pallet Shipping",
      description: "For oversized, bulk, or business-to-business shipments",
      icon: "fa-truck",
      details:
        "Our freight and pallet shipping service is designed for oversized, bulk, or business-to-business shipments. We handle everything from collection to delivery, ensuring your goods arrive at their destination safely and on time.",
    },
    "ecommerce-fulfillment": {
      id: "ecommerce-fulfillment",
      title: "E-Commerce Fulfillment",
      description:
        "Effortless plug-ins for Shopify, Etsy, WooCommerce, and more",
      icon: "fa-shopping-cart",
      details:
        "Our e-commerce fulfillment service offers effortless integration with popular platforms like Shopify, Etsy, WooCommerce, and more. We handle storage, picking, packing, and shipping, so you can focus on growing your online business.",
    },
    "tracked-delivery": {
      id: "tracked-delivery",
      title: "Tracked & Signed Deliveries",
      description: "Track every order and provide proof of delivery",
      icon: "fa-map-marker-alt",
      details:
        "Our tracked and signed delivery service allows you to monitor every order and provide proof of delivery to your customers. With real-time tracking updates and signature confirmation, you can ensure complete transparency throughout the delivery process.",
    },
    "logistics-strategy": {
      id: "logistics-strategy",
      title: "Logistics Strategy",
      description: "Optimise your supply chain with help from our experts",
      icon: "fa-chart-line",
      details:
        "Our logistics strategy service helps you optimise your supply chain with expert guidance. We analyze your current operations and develop a comprehensive strategy to improve efficiency, reduce costs, and enhance customer satisfaction.",
    },
  };

  const service = services[serviceId];

  if (!service) {
    return res.status(404).render("404", {
      title: "Service Not Found",
      layout: "layouts/main",
    });
  }

  res.render("service/details", {
    title: `${service.title} - Steph Logistics`,
    layout: "layouts/main",
    service: service,
  });
};

exports.getEcommerceIntegrationPage = (req, res) => {
  res.render("service/ecommerce-integration", {
    title: "E-Commerce Integration - Steph Logistics",
    layout: "layouts/main",
  });
};

exports.getDxpressJournalPage = (req, res) => {
  res.render("service/dxpress-journal", {
    title: "Dxpress Journal - Steph Logistics",
    layout: "layouts/main",
  });
};

exports.getInternationalShippingPage = (req, res) => {
  res.render("service/international-shipping", {
    title: "International Shipping - Steph Logistics",
    layout: "layouts/main",
  });
};
