// src/pages/api/analyze-plant.js
import Cors from 'cors';
import { nanoid } from 'nanoid';

// Configuration pour augmenter la limite de taille
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Augmentation de la limite à 10MB
    },
  },
};

// Initialisation du middleware CORS
const cors = Cors({
  methods: ['POST'],
  origin: '*',
});

// Helper pour exécuter les middlewares
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// Validation des images
const validateImage = (base64Image) => {
  // Vérifier si l'image est bien en base64
  if (!base64Image || typeof base64Image !== 'string') {
    return { valid: false, message: 'Format d\'image invalide' };
  }

  // Vérifier le type MIME de l'image
  const mimeTypeMatch = base64Image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  if (!mimeTypeMatch) {
    return { valid: false, message: 'Format d\'image non reconnu' };
  }

  const mimeType = mimeTypeMatch[1];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  
  if (!allowedMimeTypes.includes(mimeType)) {
    return { valid: false, message: 'Type d\'image non autorisé. Utilisez JPG, PNG, WEBP, HEIC ou HEIF' };
  }

  // Vérifier la taille de l'image (max 8MB)
  const base64Data = base64Image.replace(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/, '');
  const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
  const maxSize = 8 * 1024 * 1024; // 8MB
  
  if (sizeInBytes > maxSize) {
    return { valid: false, message: 'Image trop volumineuse (max 8MB)' };
  }

  return { valid: true };
};

// Handler principal
export default async function handler(req, res) {
  console.log("API appelée: /api/analyze-plant");
  
  // Exécution des middlewares
  await runMiddleware(req, res, cors);
  
  // Vérification de la méthode
  if (req.method !== 'POST') {
    console.log("Méthode non autorisée:", req.method);
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    console.log("Début du traitement de la requête");
    
    // Vérification que la clé API est définie
    if (!process.env.OPENAI_API_KEY) {
      console.error("Erreur critique: Clé API OpenAI non définie");
      return res.status(500).json({ error: 'Configuration du serveur incomplète: clé API manquante' });
    }
    
    // Vérification de la présence de l'image
    if (!req.body || !req.body.image) {
      console.log("Erreur: Image manquante dans la requête");
      return res.status(400).json({ error: 'Image manquante dans la requête' });
    }
    
    // Extraction de l'image du corps de la requête
    const { image } = req.body;
    console.log("Image extraite, taille:", image.length);
    
    // Validation de l'image
    const validationResult = validateImage(image);
    if (!validationResult.valid) {
      console.log("Validation de l'image échouée:", validationResult.message);
      return res.status(400).json({ error: validationResult.message });
    }
    
    console.log("Image validée avec succès");

    // Prompt modifié avec identification de plante
    const prompt = `Tu es un expert en botanique et en identification de plantes. Voici une photo d'une plante montrant des signes de souffrance.

1. D'abord, essaie d'identifier l'espèce de plante. Si tu peux l'identifier avec une confiance d'au moins 30%, indique son nom commun et son nom scientifique (latin). Sinon, indique que tu n'arrives pas à identifier cette plante avec suffisamment de certitude.

2. Ensuite, analyse les feuilles, tiges et l'état général pour identifier d'éventuelles anomalies.

3. Puis propose:
   - Une hypothèse de diagnostic
   - Un ou plusieurs traitements adaptés
   - Une action de suivi simple si nécessaire

Formate ta réponse comme suit:
IDENTIFICATION: [Nom de la plante ou message d'incertitude]
DIAGNOSTIC: [Ton diagnostic]
TRAITEMENT: [Tes recommandations de traitement]
SUIVI: [Tes conseils de suivi]

Sois concis, clair et pédagogique.`;

    // Génération d'un ID unique pour cette analyse (pour logging/debugging)
    const analysisId = nanoid(10);
    console.log(`Traitement de l'analyse ${analysisId} - Appel API OpenAI en cours`);

    // Appel à l'API OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: prompt
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Voici ma plante qui montre des signes de souffrance:" },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    });

    console.log(`Réponse reçue de l'API OpenAI, statut: ${openaiResponse.status}`);
    
    // Si la réponse n'est pas OK, logger et renvoyer l'erreur
    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error(`Erreur API OpenAI pour l'analyse ${analysisId}:`, openaiResponse.status, errorText);
      return res.status(openaiResponse.status).json({ 
        error: `Erreur lors de l'analyse par l'IA: ${openaiResponse.status}`,
        details: errorText
      });
    }

    // Traitement de la réponse
    const result = await openaiResponse.json();
    console.log(`Réponse JSON analysée pour l'analyse ${analysisId}`);
    
    if (result.error) {
      console.error(`Erreur OpenAI pour l'analyse ${analysisId}:`, result.error);
      return res.status(500).json({ 
        error: 'Erreur de l\'API OpenAI',
        details: result.error 
      });
    }
    
    // Extraction du contenu
    const content = result.choices[0].message.content;
    console.log(`Contenu extrait de la réponse pour l'analyse ${analysisId}`);
    
    // Parsing du texte pour extraire les sections avec le nouveau format
    const identificationMatch = content.match(/IDENTIFICATION:(.+?)(?=DIAGNOSTIC:|$)/is);
    const diagnosisMatch = content.match(/DIAGNOSTIC:(.+?)(?=TRAITEMENT:|$)/is);
    const treatmentMatch = content.match(/TRAITEMENT:(.+?)(?=SUIVI:|$)/is);
    const followUpMatch = content.match(/SUIVI:(.+?)$/is);
    
    const parsedResponse = {
      identification: identificationMatch ? identificationMatch[1].trim() : "Identification non disponible",
      diagnosis: diagnosisMatch ? diagnosisMatch[1].trim() : "Diagnostic non disponible",
      treatment: treatmentMatch ? treatmentMatch[1].trim() : "Traitement non disponible",
      followUp: followUpMatch ? followUpMatch[1].trim() : "Suivi non disponible"
    };
    
    console.log(`Analyse ${analysisId} terminée avec succès, réponse formatée`);
    
    // Envoi de la réponse formatée
    return res.status(200).json(parsedResponse);
    
  } catch (error) {
    console.error('Erreur serveur détaillée:', error.message, error.stack);
    return res.status(500).json({ 
      error: 'Erreur interne du serveur',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
