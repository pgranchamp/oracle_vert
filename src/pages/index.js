import React, { useState } from 'react';
import Head from 'next/head';

// Composants
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageUploader from '../components/ImageUploader';
import ImagePreview from '../components/ImagePreview';
import ErrorMessage from '../components/ErrorMessage';
import DiagnosisResult from '../components/DiagnosisResult';

// Services
import { analyzePlant, readFileAsBase64 } from '../services/plantAnalyzerService';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Gestion de la sélection d'image
  const handleImageSelect = (file, errorMessage, preview) => {
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    
    setSelectedImage(file);
    setImagePreview(preview);
    setDiagnosis(null);
    setError(null);
  };
  
  // Fonction pour réessayer en cas d'erreur
  const handleRetry = () => {
    setError(null);
    setUploadProgress(0);
  };
  
  // Fonction d'analyse de plante
  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError("Veuillez sélectionner une image à analyser.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      // Préparation de l'image (lecture en base64)
      setUploadProgress(10);
      const base64Image = await readFileAsBase64(selectedImage);
      setUploadProgress(40);
      
      // Appel à l'API pour analyse
      const result = await analyzePlant(base64Image, (progress) => {
        setUploadProgress(progress);
      });
      
      // Affichage du résultat
      setDiagnosis(result);
      setIsLoading(false);
      
    } catch (err) {
      setError(`Erreur lors de l'analyse: ${err.message}`);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      <Head>
        <title>L'Oracle du Vert Château - Diagnostic de plantes par IA</title>
        <meta name="description" content="Application de diagnostic botanique par intelligence artificielle" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Header />
      
      <main className="flex-grow container mx-auto p-4 flex flex-col items-center">
        <ImageUploader 
          onImageSelect={handleImageSelect}
          isLoading={isLoading}
        />
        
        <ImagePreview 
          imagePreview={imagePreview}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          uploadProgress={uploadProgress}
        />
        
        <ErrorMessage 
          message={error}
          onRetry={handleRetry}
        />
        
        <DiagnosisResult diagnosis={diagnosis} />
      </main>
      
      <Footer />
    </div>
  );
}
