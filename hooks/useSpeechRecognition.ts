import { useState, useEffect, useRef, useCallback } from 'react';

// TypeScript definitions for the SpeechRecognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionOptions {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  onEnd?: () => void;
}

export const useSpeechRecognition = (options: SpeechRecognitionOptions) => {
  const { onResult, onError, onEnd } = options;
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      console.warn("Speech Recognition API is not supported in this browser.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleResult = useCallback((event: any) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    if (finalTranscript) {
      onResult(finalTranscript);
    }
  }, [onResult]);

  const handleError = useCallback((event: any) => {
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      onError('Microphone access was denied. Please enable it in your browser settings.');
    } else {
      onError(`Speech recognition error: ${event.error}`);
    }
    setIsListening(false);
    if(onEnd) onEnd();
  }, [onError, onEnd]);
  
  const handleEnd = useCallback(() => {
    setIsListening(false);
    if(onEnd) onEnd();
  }, [onEnd]);


  const startListening = useCallback(() => {
    if (isListening || !recognitionRef.current) return;
    try {
      recognitionRef.current.onresult = handleResult;
      recognitionRef.current.onerror = handleError;
      recognitionRef.current.onend = handleEnd;
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e: any) {
      onError(`Could not start recognition: ${e.message}`);
    }
  }, [isListening, handleResult, handleError, handleEnd]);

  const stopListening = useCallback(() => {
    if (!isListening || !recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, [isListening]);

  return { isListening, isSupported, startListening, stopListening };
};