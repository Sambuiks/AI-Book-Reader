import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AIVoiceProfile } from '../types';

async function fetchElevenLabsAudio(text: string, voiceId: string, apiKey: string): Promise<Blob> {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const headers = {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
    };
    const body = JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
        },
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail.message || 'ElevenLabs API request failed');
    }

    return response.blob();
}


export const useSpeech = (onEnd: () => void, apiKey: string) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const sentencesRef = useRef<string[]>([]);
  const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([]);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentProvider = useRef<'browser' | 'elevenlabs' | null>(null);
  const onPlaybackEndRef = useRef<(() => void) | null>(null);
  const defaultOnEndRef = useRef(onEnd);

  useEffect(() => {
      defaultOnEndRef.current = onEnd;
  }, [onEnd]);

  const populateVoiceList = useCallback(() => {
    const availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length > 0) {
      setVoices(availableVoices);
    }
  }, []);

  useEffect(() => {
    audioRef.current = new Audio();
    populateVoiceList();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }
    const audio = audioRef.current;
    
    const handlePlaybackFinished = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentSentenceIndex(-1);
        if (onPlaybackEndRef.current) {
            onPlaybackEndRef.current();
            onPlaybackEndRef.current = null;
        } else {
            defaultOnEndRef.current();
        }
    };

    audio.addEventListener('ended', handlePlaybackFinished);
    
    return () => {
        window.speechSynthesis.cancel();
        audio.removeEventListener('ended', handlePlaybackFinished);
    }
  }, [populateVoiceList]);
  
  const setVoice = useCallback((aiProfile: AIVoiceProfile) => {
      if (aiProfile.provider === 'browser') {
        const bestMatch = voices.find(v => v.voiceURI === aiProfile.voiceURI) || voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en')) || null;
        selectedVoiceRef.current = bestMatch;
      }
  }, [voices]);


  const speakNextBrowser = useCallback(() => {
    if (utteranceQueueRef.current.length > 0) {
      const utterance = utteranceQueueRef.current.shift();
      if (utterance) {
        setCurrentSentenceIndex(prevIndex => prevIndex + 1);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      setIsPlaying(false);
      setCurrentSentenceIndex(-1);
       if (onPlaybackEndRef.current) {
            onPlaybackEndRef.current();
            onPlaybackEndRef.current = null;
        } else {
            defaultOnEndRef.current();
        }
    }
  }, []);
  
  const stop = useCallback(() => {
    onPlaybackEndRef.current = null; // Cancel any pending callback
    if (currentProvider.current === 'browser') {
        window.speechSynthesis.cancel();
    } else if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        if(audioRef.current.src.startsWith('blob:')) {
            URL.revokeObjectURL(audioRef.current.src);
        }
    }
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
    setCurrentSentenceIndex(-1);
    utteranceQueueRef.current = [];
  }, []);

  const play = useCallback(async (text: string, profile: AIVoiceProfile, options?: { splitSentences?: boolean, onPlaybackEnd?: () => void }) => {
    stop(); // Stop any current playback
    setError(null);
    currentProvider.current = profile.provider;
    const splitSentences = options?.splitSentences ?? true;
    onPlaybackEndRef.current = options?.onPlaybackEnd || null;

    if (profile.provider === 'browser') {
        const sentences = splitSentences ? (text.match(/[^.!?]+[.!?]*/g) || [text]) : [text];
        sentencesRef.current = sentences;
        setCurrentSentenceIndex(-1);
        
        utteranceQueueRef.current = sentences.map((sentence) => {
            const utterance = new SpeechSynthesisUtterance(sentence.trim());
            utterance.voice = selectedVoiceRef.current;
            utterance.onend = () => speakNextBrowser();
            utterance.onerror = (event) => {
                console.error('SpeechSynthesisUtterance.onerror', event);
                setError('A speech error occurred.');
                speakNextBrowser(); // Try next sentence on error
            };
            return utterance;
        });

        setIsPlaying(true);
        setIsPaused(false);
        speakNextBrowser();
    } else if (profile.provider === 'elevenlabs') {
        if (!apiKey || !profile.voiceId) {
            setError('ElevenLabs API key or Voice ID is missing.');
            return;
        }
        try {
            setIsLoading(true);
            const audioBlob = await fetchElevenLabsAudio(text, profile.voiceId, apiKey);
            const audioUrl = URL.createObjectURL(audioBlob);
            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.play();
                setIsPlaying(true);
                setIsPaused(false);
                // For external audio, we highlight the whole text block
                sentencesRef.current = [text];
                setCurrentSentenceIndex(0);
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'Failed to fetch audio from ElevenLabs.');
        } finally {
            setIsLoading(false);
        }
    }
  }, [apiKey, speakNextBrowser, stop]);

  const pause = useCallback(() => {
    if (currentProvider.current === 'browser') {
        window.speechSynthesis.pause();
    } else if (audioRef.current) {
        audioRef.current.pause();
    }
    setIsPaused(true);
    setIsPlaying(false);
  }, []);
  
  const resume = useCallback(() => {
    if (currentProvider.current === 'browser') {
        window.speechSynthesis.resume();
    } else if (audioRef.current) {
        audioRef.current.play();
    }
    setIsPaused(false);
    setIsPlaying(true);
  }, []);

  return { isPlaying, isPaused, isLoading, error, currentSentenceIndex, play, pause, resume, stop, setVoice, sentences: sentencesRef.current };
};