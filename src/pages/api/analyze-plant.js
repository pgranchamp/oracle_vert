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

// Fonction améliorée pour analyser le contenu de la réponse
const parseResponseContent = (content) => {
  console.log("Contenu à analyser:", content);
  
  // Essai avec le format attendu IDENTIFICATION, DIAGNOSTIC, etc.
  const identificationMatch = content.match(/IDENTIFICATION:(.+?)(?=DIAGNOSTIC:|$)/is);
  const diagnosisMatch = content.match(/DIAGNOSTIC:(.+?)(?=TRAITEMENT:|$)/is);
  const treatmentMatch = content.match(/TRAITEMENT:(.+?)(?=SUIVI:|$)/is);
  const followUpMatch = content.match(/SUIVI:(.+?)$/is);
  
  // Si le format attendu n'est pas trouvé, essayer l'ancien format
  if (!identificationMatch && !diagnosisMatch) {
    console.log("Format attendu non trouvé, essai avec l'ancien format...");
    
    // Essai avec l'ancien format (hypothèse de diagnostic, traitement recommandé, etc.)
    const oldDiagnosisMatch = content.match(/diagnostic.*?:(.+?)(?=traitement|\n\d|\n$)/is) || 
                              content.match(/problème.*?:(.+?)(?=traitement|\n\d|\n$)/is) ||
                              content.match(/1\.?(.+?)(?=2\.?|traitement|\n\d|\n$)/is);
                              
    const oldTreatmentMatch = content.match(/traitement.*?:(.+?)(?=suivi|\n\d|\n$)/is) ||
                              content.match(/2\.?(.+?)(?=3\.?|suivi|\n\d|\n$)/is);
                              
    const oldFollowUpMatch = content.match(/suivi.*?:(.+?)$/is) ||
                             content.match(/3\.?(.+?)$/is);
    
    return {
      identification: "Je n'arrive pas à identifier cette plante avec suffisamment de certitude. Voici néanmoins mes recommandations basées sur les symptômes visibles.",
      diagnosis: oldDiagnosisMatch ? oldDiagnosisMatch[1].trim() : "Diagnostic non disponible",
      treatment: oldTreatmentMatch ? oldTreatmentMatch[1].trim() : "Traitement non disponible",
      followUp: oldFollowUpMatch ? oldFollowUpMatch[1].trim() : "Suivi non disponible"
    };
  }
  
  // Retourner la réponse avec le nouveau format
  return {
    identification: identificationMatch ? identificationMatch[1].trim() : "Identification non disponible",
    diagnosis: diagnosisMatch ? diagnosisMatch[1].trim() : "Diagnostic non disponible",
    treatment: treatmentMatch ? treatmentMatch[1].trim() : "Traitement non disponible",
    followUp: followUpMatch ? followUpMatch[1].trim() : "Suivi non disponible"
  };
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

    // Prompt modifié avec identification de plante - AVEC EMPHASE SUR LE FORMAT
    const prompt = `Tu es un expert en botanique et en identification de plantes. Voici une photo d'une plante montrant des signes de souffrance.

1. D'abord, essaie d'identifier l'espèce de plante. Si tu peux l'identifier avec une confiance d'au moins 30%, indique son nom commun et son nom scientifique (latin). Sinon, indique que tu n'arrives pas à identifier cette plante avec suffisamment de certitude.

2. Ensuite, analyse les feuilles, tiges et l'état général pour identifier d'éventuelles anomalies.

3. Puis propose:
   - Une hypothèse de diagnostic
   - Un ou plusieurs traitements adaptés
   - Une action de suivi simple si nécessaire en conseillant le recours aux experts de la CAPL 

TRÈS IMPORTANT: Tu DOIS impérativement formatter ta réponse EXACTEMENT comme ceci, en conservant les mots-clés IDENTIFICATION, DIAGNOSTIC, TRAITEMENT et SUIVI en majuscules suivis de deux points:

IDENTIFICATION: [Nom de la plante ou message d'incertitude]
DIAGNOSTIC: [Ton diagnostic]
TRAITEMENT: [Tes recommandations de traitement]
SUIVI: [Tes conseils de suivi]

Ne dévie PAS de ce format, n'ajoute PAS de numéros ou d'autres balises. Sois concis, clair et pédagogique.`;

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
    
    // Utilisation de la fonction améliorée de parsing
    const parsedResponse = parseResponseContent(content);
    
    console.log(`Analyse ${analysisId} terminée avec succès, réponse formatée:`, parsedResponse);
    
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
