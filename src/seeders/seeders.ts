
// const StripePricing = require("../models/stripePricing");

// const dataToInsert = [{
//     planName: "Bronze-Plan",
//     priceId: "price_1RGbFUJxt6qzlQZa5PXyBS2L",
//     productId: "prod_SAx9UZIho5rH8x",
//     price: 480,
//     planType: "Monthly",
//     credits: 4,
//     value: "Equivalent to 2 one-hour sessions (or 4 half-hour sessions)",
//     features: ["Access to a curated list of advisors", "Email support for Option to receive email support for follow-up questions (up to 3 per month)follow-up questions "],
//     isActive: true,
//     createdAt: new Date(),
// }, {
//     planName: "Gold-Plan",
//     priceId: "price_1RGbH5Jxt6qzlQZaDmlez3YS",
//     productId: "prod_SAxBmkSsK08vU4",
//     price: 1680,
//     planType: "Monthly",
//     credits: 16,
//     value: "Equivalent to 8 one-hour sessions (or 16 half-hour sessions)",
//     features: ["Unlimited flexibility to book with multiple Advisors across specialties", "Priority access to top-tier Advisors","Dedicated Account Manager for a seamless experience","Unlimited email and chat support for follow-ups","Exclusive access to quarterly strategy workshops or mastermind sessions"],
//     isActive: true,
//     createdAt: new Date(),
// }, {
//     planName: "Silver-Plan",
//     priceId: "price_1RGbI0Jxt6qzlQZaIZX9T1mB",
//     productId: "prod_SAxCHw61mjzCzQ",
//     price: 900,
//     planType: "Monthly",
//     credits: 8,
//     value: "Equivalent to 4 one-hour sessions (or 8 half-hour sessions)",
//     features: ["Flexibility to book multiple Advisors or focus on one", "Priority scheduling for Advisor sessions", "Email and chat support for follow-ups (up to 5 questions per month)"],
//     isActive: true,
//     createdAt: new Date(),
// }];
// const addSubscriptionData = async () => {
//   try {
//     const data=await StripePricing.insertMany(dataToInsert);
//     return console.log("Data inserted successfully",data);
//   } catch (error) {
//     console.error("Error creating subscription:", error);
//     return console.log("Error creating subscription:", error);
//   }
// };
// module.exports = {
//     addSubscriptionData
// }
