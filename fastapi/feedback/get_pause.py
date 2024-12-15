import os 
import logging
import librosa
import numpy as np
import soundfile as sf
from scipy.signal import butter, filtfilt

logging.basicConfig(level=logging.INFO)

def get_pause_count(audio_path, threshold_seconds=1.2, amplitude_threshold=0.02):
    """
    Analyze audio file for pauses/silences.
    """
    try:
        # Try loading with soundfile first
        try:
            audio, sample_rate = sf.read(audio_path)
        except:
            audio, sample_rate = librosa.load(audio_path, sr=None)

        logging.info(f"Successfully loaded audio file: {os.path.basename(audio_path)}")
        
        # Calculate the time resolution
        hop_length = 512
        
        # Extract the envelope with noise reduction
        audio_envelope = librosa.onset.onset_strength(
            y=audio, 
            sr=sample_rate,
            hop_length=hop_length,
            feature=librosa.feature.melspectrogram
        )
        
        # Convert envelope to time in seconds
        times = librosa.times_like(audio_envelope, sr=sample_rate, hop_length=hop_length)
        
        # Detect periods of silence
        pauses = []
        in_pause = False
        pause_start = 0
        
        # Reduce logging frequency
        for i in range(len(audio_envelope)):
            logging.info(f"Time: {times[i]:.2f}, Amplitude: {audio_envelope[i]:.2f}")
            if audio_envelope[i] < amplitude_threshold:
                if not in_pause:
                    pause_start = times[i]
                    in_pause = True
            else:
                if in_pause:
                    pause_duration = times[i] - pause_start
                    if pause_duration >= threshold_seconds:
                        pauses.append({
                            'start': round(pause_start, 2),
                            'end': round(times[i], 2),
                            'duration': round(pause_duration, 2)
                        })
                    in_pause = False
        
        # Handle end of audio pause
        if in_pause:
            pause_duration = times[-1] - pause_start
            if pause_duration >= threshold_seconds:
                pauses.append({
                    'start': round(pause_start, 2),
                    'end': round(times[-1], 2),
                    'duration': round(pause_duration, 2)
                })
        
        return {
            'total_pauses': len(pauses),
            'pause_details': pauses,
            'total_pause_duration': round(sum(pause['duration'] for pause in pauses), 2)
        }
    
    except Exception as e:
        logging.error(f"Error processing audio file: {str(e)}")
        return {
            'error': str(e),
            'total_pauses': 0,
            'pause_details': [],
            'total_pause_duration': 0
        }