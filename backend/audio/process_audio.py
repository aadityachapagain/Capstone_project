import io
import speech_recognition as sr
import os
from loguru import logger
from pydub import AudioSegment, playback
from deepmultilingualpunctuation import PunctuationModel

model = PunctuationModel()


class processAudio:
    def __init__(self):
        pass

    def generate_wav(self, **kwargs):
        audio_data = io.BytesIO(kwargs.get("data"))
        file_name = kwargs.get("filepath").split(".")[0]
        audio_file = os.path.join("./tmp_audio", file_name + ".wav")
        if not os.path.exists("./tmp_audio"):
            os.mkdir("./tmp_audio")
        AudioSegment.from_file(audio_data).export(audio_file, format="wav")
        return audio_file

    def generate_text(self, wav_file):
        # use the audio file as the audio source
        r = sr.Recognizer()
        with sr.AudioFile(wav_file) as source:
            audio = r.record(source)  # read the entire audio file
            text = r.recognize_google(audio)
            result = model.restore_punctuation(text)
        os.remove(wav_file)
        return result

    def play(self, byte_data):
        obj = AudioSegment.from_file(io.BytesIO(byte_data))
        playback.play(obj)
