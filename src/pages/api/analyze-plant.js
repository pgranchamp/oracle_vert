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
  // Exécution des middlewares
  await runMiddleware(req, res, cors);
  
  // Vérification de la méthode
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Extraction de l'image du corps de la requête
    const { image } = req.body;
    
    // Validation de l'image
    const validationResult = validateImage(image);
    if (!validationResult.valid) {
      return res.status(400).json({ error: validationResult.message });
    }

    // Préparation des données pour OpenAI
    const prompt = `Tu es un expert en botanique. Voici une photo d'une plante montrant des signes de souffrance.
Analyse les feuilles, tiges et l'état général pour identifier d'éventuelles anomalies.
Puis propose :
1. Une hypothèse de diagnostic
2. Un ou plusieurs traitements adaptés
3. Une action de suivi simple si nécessaire
Sois concis, clair et pédagogique.`;

    // Génération d'un ID unique pour cette analyse (pour logging/debugging)
    const analysisId = nanoid(10);
    console.log(`Traitement de l'analyse ${analysisId}`);

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
              { type: "text", text: "Voici ma plante qui a des problèmes:" },
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

    // Traitement de la réponse
    const result = await openaiResponse.json();
    
    if (result.error) {
      console.error(`Erreur API OpenAI pour l'analyse ${analysisId}:`, result.error);
      return res.status(500).json({ error: 'Erreur lors de l\'analyse par l\'IA' });
    }
    
    // Extraction du contenu
    const content = result.choices[0].message.content;
    
    // Parsing simple du texte pour extraire les sections
    const diagnosisMatch = content.match(/diagnostic.*?:(.+?)(?=traitement|\n\d|\n$)/is);
    const treatmentMatch = content.match(/traitement.*?:(.+?)(?=suivi|\n\d|\n$)/is);
    const followUpMatch = content.match(/suivi.*?:(.+?)$/is);
    
    const parsedResponse = {
      diagnosis: diagnosisMatch ? diagnosisMatch[1].trim() : "Diagnostic non disponible",
      treatment: treatmentMatch ? treatmentMatch[1].trim() : "Traitement non disponible",
      followUp: followUpMatch ? followUpMatch[1].trim() : "Suivi non disponible"
    };
    
    // Envoi de la réponse formatée
    return res.status(200).json(parsedResponse);
    
  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}
