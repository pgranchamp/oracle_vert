// src/pages/api/debug-response.js
// Ce point d'entrée API sert à déboguer le format de réponse d'OpenAI

export default function handler(req, res) {
  // Simuler le format de réponse souhaité pour le test
  const exampleResponse = {
    identification: "Cette plante semble être un Dracaena marginata (Dragonnier de Madagascar)",
    diagnosis: "Les pointes brunes sur les feuilles indiquent un stress hydrique, soit par excès soit par manque d'eau.",
    treatment: "Vérifiez l'humidité du sol avant d'arroser. Arrosez lorsque le sol est sec à environ 2-3 cm de profondeur.",
    followUp: "Surveillez l'évolution des feuilles et ajustez l'arrosage en conséquence."
  };
  
  return res.status(200).json(exampleResponse);
}
